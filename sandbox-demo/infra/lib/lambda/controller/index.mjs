import { SQS, DeleteMessageCommand } from "@aws-sdk/client-sqs"; // for SQS client
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; // for S3 client

const s3 = new S3Client({ region: "us-west-1" }); // Ensure the region is correct
const sqs = new SQS({ region: "us-west-1" }); // Ensure the region is correct

export async function handler(event) {
  for (const record of event.Records) {
    console.log("Processing record:", record);
    const { workflowId } = JSON.parse(record.body);

    try {
      // 1. Download workflow.yml from the S3 bucket
      const s3Params = {
        Bucket: "ai-pipeline-builder-sandbox", // Ensure the bucket name is correct
        Key: `${workflowId}/workflow.yml`,
      };

      const data = await s3.send(new GetObjectCommand(s3Params));

      // Assuming the workflow.yml is a text file, read its content
      const workflowContent = await streamToString(data.Body);

      console.log("Downloaded workflow content:", workflowContent);

      // 2. Custom logic to be defined
      // 2.1 Check if any

      // 3. Delete the message from the SQS queue
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: process.env.TASK_QUEUE_URL,
          ReceiptHandle: record.receiptHandle,
        })
      );

      console.log("Deleted message:", record.messageId);
    } catch (error) {
      console.error("Error processing the record:", error);
      // Handle errors appropriately, possibly re-queue or log for later processing
    }
  }
}

async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
/*

// send message
await sqs.sendMessage({
  MessageBody: JSON.stringify({
    message: "temp",
  }),
  QueueUrl: process.env.SEND_QUEUE_URL,
});

// send batch message
messages.push({
  Id: customId,
  MessageBody: JSON.stringify({ message: "temp" }),
});

// Batch Send message
for (let i = 0; i < messages.length; i += 10) {
  const batch = messages.slice(i, i + 10);
  messageBatches.push(batch);
}

// send each batch of messages
for (const batch of messageBatches) {
  try {
    const result = await sqs.sendMessageBatch({
      Entries: batch, // Maximum size = 10
      QueueUrl: process.env.ACTION_RECORD_QUEUE_URL,
    });
    console.log(`Sent ${result.Successful.length} messages.`);
  } catch (error) {
    console.log("Error: ", error);
  }
}

*/
