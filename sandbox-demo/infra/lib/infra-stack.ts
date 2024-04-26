import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class PipelineAiSandboxInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const openaiApiKeyParam = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "OpenaiApiKeyParameter",
      {
        parameterName: "ai-pipeline-builder-sandbox-openapi-key",
      }
    );
    const sandboxApiEndpointParam = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "SandboxApiEndpointParameter",
      {
        parameterName: "ai-pipeline-builder-sandbox-api-endpoint",
      }
    );

    // This API will
    const servicesApi = new apigateway.RestApi(
      this,
      "PipelineAiSandboxServicesApi",
      {
        restApiName: "PipelineAiSandboxServices",
      }
    );

    const services = servicesApi.root.addResource("services");
    const handler = servicesApi.root.addResource("handler");

    // Part 1: Processor and queue
    // 1.1: sqs task queue
    const sandboxControllerTaskQueue = new sqs.Queue(
      this,
      "SandboxControllerTaskQueue",
      {
        queueName: "pipeline-ai-sandbox-controller-task-queue",
        visibilityTimeout: cdk.Duration.minutes(5),
      }
    );

    // 1.2 lambda function handler
    const sandboxHandler = new lambda.Function(this, "SandboxHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda", "handler", "src.zip")
      ),
      memorySize: 256,
      handler: "index.handler",
      timeout: cdk.Duration.minutes(5),
      environment: {
        TASK_QUEUE_URL: sandboxControllerTaskQueue.queueUrl,
      },
    });
    const sandboxHandlerIntegration = new apigateway.LambdaIntegration(
      sandboxHandler
    );
    handler.addMethod("GET", sandboxHandlerIntegration);
    handler.addMethod("POST", sandboxHandlerIntegration);
    handler.addMethod("PUT", sandboxHandlerIntegration);
    // handler permissions
    lambdaToS3Policy(sandboxHandler, "ai-pipeline-builder-sandbox"); // s3 permission
    lambdaToSqsQueuePolicy(sandboxHandler, sandboxControllerTaskQueue); // send message

    // 1.3 lambda function controller
    const sandboxController = new lambda.Function(this, "SandboxController", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda", "controller", "src.zip")
      ),
      memorySize: 1024,
      handler: "index.handler",
      timeout: cdk.Duration.minutes(5),
      environment: {
        TASK_QUEUE_URL: sandboxControllerTaskQueue.queueUrl,
        SANDBOX_API: sandboxApiEndpointParam.stringValue,
      },
    });
    // controller permissions
    lambdaToS3Policy(sandboxController, "ai-pipeline-builder-sandbox"); // s3 permission
    subscribeLambdaToSqsQueue(sandboxController, sandboxControllerTaskQueue); // receive message
    lambdaToSqsQueuePolicy(sandboxController, sandboxControllerTaskQueue); // send message

    // Part 2: All available sandbox blocks to use:

    // ==========================================================================================
    // block - file upload (single_file_upload)
    // Infra: api intgration <-> lambda function
    // Format: (any) -> <void>
    // Description:
    // POST (body: {id:xxx}): get the pre-signed url for s3 object: ai-pipeline-builder-sandbox/${workflow_id}
    const fileUploadBlock = new lambda.Function(this, "SingleFileUploadBlock", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda", "single_file_upload", "src.zip")
      ),
      memorySize: 128,
      handler: "index.handler",
      timeout: cdk.Duration.minutes(5),
    });
    // lambda integration
    const fileUploadResource = services.addResource("single_file_upload");
    const fileUploadLambdaIntegration = new apigateway.LambdaIntegration(
      fileUploadBlock
    );
    fileUploadResource.addMethod("GET", fileUploadLambdaIntegration);
    fileUploadResource.addMethod("POST", fileUploadLambdaIntegration);
    lambdaToS3Policy(fileUploadBlock, "ai-pipeline-builder-sandbox");

    // ==========================================================================================
    // block - file download (single_file_download)
    // Infra: api intgration <-> lambda function
    // Format: (any) -> <void>
    // Description:
    // POST (body: {id:xxx}): get the pre-signed url for s3 object: ai-pipeline-builder-sandbox/${workflow_id}
    const fileDownloadBlock = new lambda.Function(
      this,
      "SingleFileDownloadBlock",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "lambda", "single_file_download", "src.zip")
        ),
        memorySize: 128,
        handler: "index.handler",
        timeout: cdk.Duration.minutes(5),
      }
    );
    // lambda integration
    const fileDownloadResource = services.addResource("single_file_download");
    const fileDownloadLambdaIntegration = new apigateway.LambdaIntegration(
      fileDownloadBlock
    );
    fileDownloadResource.addMethod("GET", fileDownloadLambdaIntegration);
    lambdaToS3Policy(fileDownloadBlock, "ai-pipeline-builder-sandbox");

    // ==========================================================================================
    // block - GPT 4 (gpt_4_turbo)
    // Infra: api intgration <-> lambda function
    // Format: <text> -> <text>
    // Description:
    // POST:
    const gpt4TurboBlock = new lambda.Function(this, "Gpt4TurboBlock", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda", "gpt_4_turbo", "src.zip")
      ),
      memorySize: 512,
      handler: "index.handler",
      timeout: cdk.Duration.minutes(5),
      environment: {
        OPENAI_API_KEY: openaiApiKeyParam.stringValue,
      },
    });
    // lambda integration
    const gpt4Resource = services.addResource("gpt_4_turbo");
    const gpt4LambdaIntegration = new apigateway.LambdaIntegration(
      gpt4TurboBlock
    );
    gpt4Resource.addMethod("POST", gpt4LambdaIntegration);
    lambdaToS3Policy(gpt4TurboBlock, "ai-pipeline-builder-sandbox");

    // ==========================================================================================
    // block - GPT 4 (pdf_to_txt)
    // Infra: api intgration <-> lambda function
    // Format: <pdf> -> <text>
    // Description: convert pdf file into txt file
    // POST:
    const pdfToTxtBlock = new lambda.Function(this, "PdfToTxtBlock", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "lambda", "pdf_to_txt", "src.zip")
      ),
      memorySize: 1024,
      handler: "index.handler",
      timeout: cdk.Duration.minutes(5),
    });
    // lambda integration
    const pdfToTxtResource = services.addResource("pdf_to_txt");
    const pdfToTxtLambdaIntegration = new apigateway.LambdaIntegration(
      pdfToTxtBlock
    );
    pdfToTxtResource.addMethod("POST", pdfToTxtLambdaIntegration);
    lambdaToS3Policy(pdfToTxtBlock, "ai-pipeline-builder-sandbox");

    // ==========================================================================================
    // block - conditional (conditional)
    // Infra: api intgration <-> lambda function
    // Format: <text> | <JSON> -> <text> | <JSON>
    // Description:
    // POST:
  }
}

// ============================== Utility function ==============================
function lambdaToS3Policy(
  lambda: cdk.aws_lambda.Function,
  s3BucketName: string
) {
  const policyStatement = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["s3:*"],
    resources: [
      `arn:aws:s3:::${s3BucketName}`,
      `arn:aws:s3:::${s3BucketName}/*`,
    ],
  });

  lambda.addToRolePolicy(policyStatement);
}

function subscribeLambdaToSqsQueue(
  lambda: cdk.aws_lambda.Function,
  targetQueue: cdk.aws_sqs.Queue | cdk.aws_sqs.IQueue
) {
  // Create Event source to subscribe lambda to SQS work queue
  lambda.addEventSource(new SqsEventSource(targetQueue));

  // Permission: work queue -> worker
  lambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sqs:ReceiveMessage", "sqs:DeleteMessage"],
      resources: [targetQueue.queueArn],
    })
  );
}

function lambdaToSqsQueuePolicy(
  lambda: cdk.aws_lambda.Function,
  queues: cdk.aws_sqs.IQueue[] | cdk.aws_sqs.IQueue
) {
  const queueArr = Array.isArray(queues) ? queues : [queues];

  lambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sqs:SendMessage"],
      resources: queueArr.map((queue) => queue.queueArn),
    })
  );
}
