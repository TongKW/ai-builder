import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import yaml from "js-yaml";

const s3 = new S3Client({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "POST") {
    // Functionality: update data block status in workflow source config file
    const { workflowId, nodeId, nodeHandle } = JSON.parse(event.body); // e.g.: nodeHandle = "input.1"

    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/workflow.yml`,
      })
    );
    let workflowSrc = await streamToString(Body);

    // 1. update config yaml file by changing the status of the data to "ready" [TODO]
    // Parse the YAML content
    let workflow = yaml.load(workflowSrc);

    // Logic to update the status of the specified node and handle
    for (let node of workflow.nodes) {
      if (node.id === nodeId) {
        if (nodeHandle.startsWith("input.")) {
          let index = parseInt(nodeHandle.split(".")[1]);
          if (node.input && node.input.length > index) {
            node.input[index].status = "ready"; // Set status to "ready"
          }
        } else if (nodeHandle.startsWith("output.")) {
          let index = parseInt(nodeHandle.split(".")[1]);
          if (node.output && node.output.length > index) {
            node.output[index].status = "ready"; // Set status to "ready"
          }
        }
      }
    }

    // Convert the updated object back to a YAML string
    workflowSrc = yaml.dump(workflow);

    // 2. update the workflowSrc back to s3
    await s3.send(
      new PutObjectCommand({
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/workflow.yml`,
        Body: workflowSrc,
      })
    );

    // 3. return success message
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded successfully.",
        workflowSrc: workflowSrc,
      }),
    };
  } else if (httpMethod === "GET") {
    // Functionality: get presigned url to upload to s3

    const key = event.queryStringParameters.key;
    const workflowId = event.queryStringParameters.workflowId;

    if (!key || !workflowId) throw new Error("Invalid request.");

    // Return a pre-signed url to the user for file upload with permission
    const objectKey = `${workflowId}/data/${key}`;
    const bucketName = "ai-pipeline-builder-sandbox";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      // Create the presigned URL
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Pre-signed URL generated successfully",
          presignedUrl: url,
        }),
      };
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error generating pre-signed URL",
          error: error.message,
        }),
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
