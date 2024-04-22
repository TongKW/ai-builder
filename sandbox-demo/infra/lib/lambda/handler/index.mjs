import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import yaml from "js-yaml";

const s3 = new S3Client({ region: "us-west-1" });
const sqs = new SQSClient({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "GET") {
    const workflowId = event.queryStringParameters.workflowId;
    const initWorkflowSrc = `nodes: []\nedges: []`;

    const [workflowSrc, nodes, edges] = await Promise.all([
      getContentFromS3(`${workflowId}/workflow.yml`, {
        defaultString: initWorkflowSrc,
        contentType: "text/yaml",
      }),
      getContentFromS3(`${workflowId}/ui/nodes.json`, {
        defaultString: "[]",
        contentType: "application/json",
      }),
      getContentFromS3(`${workflowId}/ui/edges.json`, {
        defaultString: "[]",
        contentType: "application/json",
      }),
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successful request.",
        workflowSrc: workflowSrc,
        nodes: JSON.parse(nodes),
        edges: JSON.parse(edges),
      }),
    };
  } else if (httpMethod === "PUT") {
    // Functionality: Update the workflow to s3
    const { nodes, edges, workflowSrc, workflowId } = JSON.parse(event.body);
    if (!nodes || !edges || !workflowSrc || !workflowId) {
      throw new Error("Invalid request.");
    }

    await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: "ai-pipeline-builder-sandbox",
          Key: `${workflowId}/workflow.yml`,
          Body: workflowSrc,
          ContentType: "text/yaml",
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "ai-pipeline-builder-sandbox",
          Key: `${workflowId}/ui/nodes.json`,
          Body: JSON.stringify(nodes),
          ContentType: "application/json",
        })
      ),
      s3.send(
        new PutObjectCommand({
          Bucket: "ai-pipeline-builder-sandbox",
          Key: `${workflowId}/ui/edges.json`,
          Body: JSON.stringify(edges),
          ContentType: "application/json",
        })
      ),
    ]);

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

async function getContentFromS3(key, params) {
  const { defaultString, contentType } = params;

  let result;

  try {
    // 1. Try to get the YAML config file from S3
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: "ai-pipeline-builder-sandbox",
        Key: key,
      })
    );
    result = await streamToString(Body);
  } catch (error) {
    if (error.name === "NoSuchKey") {
      // 2.1: File not found, upload initWorkflowSrc to S3
      const putParams = {
        Bucket: "ai-pipeline-builder-sandbox",
        Key: key,
        Body: defaultString,
        ContentType: contentType,
      };
      await s3.send(new PutObjectCommand(putParams));
      result = defaultString;
    } else {
      throw error; // Re-throw error if it's not a missing key error
    }
  }

  return result;
}
