import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import yaml from "js-yaml";
import { Readable } from "stream";

const s3 = new S3Client({ region: "us-west-1" });
const sqs = new SQSClient({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "GET") {
    const workflowId = event.queryStringParameters.workflowId;
    const initWorkflowSrc = `nodes: []\nedges: []`;

    try {
      const s3Params = {
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/workflow.yml`,
      };

      let workflowSrc;
      try {
        // 1. Try to get the YAML config file from S3
        const { Body } = await s3.send(new GetObjectCommand(s3Params));
        workflowSrc = await streamToString(Body);
      } catch (error) {
        if (error.name === "NoSuchKey") {
          // 2.1: File not found, upload initWorkflowSrc to S3
          workflowSrc = initWorkflowSrc;
          const putParams = {
            ...s3Params,
            Body: workflowSrc,
            ContentType: "text/yaml",
          };
          await s3.send(new PutObjectCommand(putParams));
        } else {
          throw error; // Re-throw error if it's not a missing key error
        }
      }

      // 3. Return the workflowSrc in the API response
      return {
        statusCode: 200,
        body: JSON.stringify({ workflowSrc }),
      };
    } catch (error) {
      console.error("Error handling the GET request:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }
  } else if (httpMethod === "PUT") {
    // Functionality: Update the workflow to s3

    const { workflowSrc, workflowId } = JSON.parse(event.body);
    if (!workflowSrc || !workflowId) {
      throw new Error("Invalid request.");
    }

    const putParams = {
      Bucket: "ai-pipeline-builder-sandbox",
      Key: `${workflowId}/workflow.yml`,
      Body: workflowSrc,
      ContentType: "text/yaml",
    };
    await s3.send(new PutObjectCommand(putParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Successful request." }),
    };
  } else if (httpMethod === "POST") {
    // Functionality: Run the workflow

    const { workflowSrc, workflowId } = JSON.parse(event.body);
    if (!workflowSrc || !workflowId) {
      throw new Error("Invalid request.");
    }

    try {
      // 1. Parse the workflowSrc file. If it is not a valid yaml file, throw error.
      const workflowData = yaml.load(workflowSrc);

      // 2. Add a `status: pending` to the yaml file
      workflowData.status = "pending";

      // Convert the modified object back to YAML
      const updatedWorkflowSrc = yaml.dump(workflowData);

      // Save it to S3
      const s3Params = {
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/workflow.yml`,
        Body: updatedWorkflowSrc,
        ContentType: "text/yaml",
      };

      await s3.send(new PutObjectCommand(s3Params));

      // 3. Push a message {workflowId: workflowId} to the SQS queue
      const sqsParams = {
        QueueUrl: process.env.TASK_QUEUE_URL,
        MessageBody: JSON.stringify({ workflowId: workflowId }),
      };

      await sqs.send(new SendMessageCommand(sqsParams));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Workflow processed and queued successfully.",
        }),
      };
    } catch (error) {
      console.error("Error processing the workflow:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }
}

// Helper function to convert S3 stream to string
async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
