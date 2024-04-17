import OpenAI from "openai";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

const s3 = new S3Client({ region: "us-west-1" });

export async function handler(event) {
  const httpMethod = event.httpMethod;

  if (httpMethod === "POST") {
    const body = JSON.parse(event.body);

    const workflow_id = body.workflow_id;
    const output_files = body.output_files;

    if (!workflow_id || !output_files || !output_files.length)
      throw new Error("Invalid request.");

    // // 0. Get workflow file on s3
    // const s3BucketName = "ai-pipeline-builder-sandbox";
    // const workflowFilePath = `${workflow_id}/workflow.yml`;
    // let workflowDoc;

    // try {
    //   const s3Response = await s3.send(
    //     new GetObjectCommand({
    //       Bucket: s3BucketName,
    //       Key: workflowFilePath,
    //     })
    //   );
    //   const yamlData = await streamToString(s3Response.Body);
    //   workflowDoc = yaml.load(yamlData);
    //   console.log(workflowDoc);
    // } catch (e) {
    //   console.error("Error loading workflow YAML:", e);
    //   return {
    //     statusCode: 500,
    //     body: JSON.stringify({
    //       message: "Failed to load workflow configuration.",
    //     }),
    //   };
    // }

    // 1. OpenAI API configurable parameters
    const messages = body.messages;
    const response_in_json = body.response_in_json;

    // 2. Replace placeholders in messages with actual data
    const regex = /\{\{\s*(\w+)\s*\}\}/g;
    for (let message of messages) {
      message.content = await replacePlaceholders(
        message.content,
        workflow_id,
        "ai-pipeline-builder-sandbox",
        regex
      );
    }

    // 3. Call openai api
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4-turbo",
      response_in_json: response_in_json,
    });

    // 3. save output data to s3
    await saveOutputToS3(
      completion.choices[0].message.content,
      response_in_json,
      output_files[0]
    );

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

async function saveOutputToS3(content, responseInJson, outputFilePath) {
  try {
    // Determine the content to save based on `responseInJson`
    if (responseInJson) {
      // Parse the JSON content and convert it back to string for S3 storage
      content = JSON.stringify(JSON.parse(content));
    }

    // Prepare the parameters for the PutObjectCommand
    const params = {
      Bucket: "ai-pipeline-builder-sandbox", // S3 bucket name
      Key: outputFilePath, // File path in S3
      Body: content, // Data to be saved
      ContentType: responseInJson ? "application/json" : "application/text", // Assuming JSON, change as necessary
    };

    // Create and send a PutObjectCommand to save the file in S3
    const command = new PutObjectCommand(params);
    const result = await s3.send(command);
    console.log("Successfully saved to S3:", result);
    return result;
  } catch (error) {
    console.error("Error saving to S3:", error);
    throw error;
  }
}

async function replacePlaceholders(text, workflowId, bucketName, regex) {
  return text.replace(regex, async (match, dataId) => {
    try {
      const dataResponse = await s3.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: `${workflowId}/${dataId}.txt`,
        })
      );
      const fileContent = await streamToString(dataResponse.Body);
      return fileContent;
    } catch (e) {
      console.error(`Error retrieving data for ${dataId}:`, e);
      return match; // return the original placeholder if there's an error
    }
  });
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
