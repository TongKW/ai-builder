import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "POST") {
    const body = JSON.parse(event.body);
    console.log("Request body: ");
    console.log(body);

    const workflowId = body.workflowId;
    const inputKeys = body.inputKeys;
    const outputKeys = body.outputKeys;

    if (!workflowId || !outputKeys || !inputKeys) {
      throw new Error("Invalid request.");
    }

    // main logic
    try {
      // Get the PDF file from S3
      const getObjectParams = {
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/data/${inputKeys[0]}`,
      };
      const { Body } = await s3Client.send(
        new GetObjectCommand(getObjectParams)
      );
      let content = await streamToBuffer(Body);

      // 2. Replace Markdown code block delimiters
      content = content.toString("utf-8");
      content = content.replace(/^(```markdown|```md)\n/, "");
      content = content.replace(/\n```$/, "");

      // 3. Upload extracted text back to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: "ai-pipeline-builder-sandbox",
          Key: `${workflowId}/data/${outputKeys[0]}`,
          Body: updatedContent,
          ContentType: "text/plain",
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successful request.",
        }),
      };
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Error processing PDF: ${error.message}`);
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }
}

// Helper function to convert a readable stream to a buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
