import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";

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

    const api = new apigateway.RestApi(this, "PipelineAiSandboxApi", {
      restApiName: "PipelineAiSandbox",
    });

    const services = api.root.addResource("services");

    // All available sandbox blocks to use:

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
    fileDownloadResource.addMethod("POST", fileDownloadLambdaIntegration);
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
    // 3. block - conditional (conditional)
    // Infra: api intgration <-> lambda function
    // Format: <text> | <JSON> -> <text> | <JSON>
    // Description:
    // POST:
  }
}

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
