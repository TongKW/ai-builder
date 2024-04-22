import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "GET") {
    const key = event.queryStringParameters.key;
    const workflowId = event.queryStringParameters.workflowId;

    if (!key || !workflowId) throw new Error("Invalid request.");

    // Return a pre-signed url to the user for file upload with permission
    const objectKey = `${workflowId}/data/${key}`;
    const bucketName = "ai-pipeline-builder-sandbox";

    const command = new GetObjectCommand({
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
  } else if (httpMethod === "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successful request.",
      }),
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }
}
