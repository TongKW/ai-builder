import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import nodemailer from "nodemailer";

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

    const recipientEmail = await getDataContentFromKey(
      workflowId,
      inputKeys[0]
    );
    const emailContent = await getDataContentFromKey(workflowId, inputKeys[1]);

    // main logic
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "d95508730@gmail.com",
          pass: process.env.EMAIL_APP_PW,
        },
      });

      console.log(`Transporter params: `);
      console.log({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "d95508730@gmail.com",
          pass: process.env.EMAIL_APP_PW,
        },
      });

      const mailOptions = {
        from: "d95508730@gmail.com",
        to: recipientEmail,
        subject: "[Pipeline AI Sandbox] Automated email",
        text: emailContent,
      };

      console.log("Mail options: ");
      console.log({
        from: "d95508730@gmail.com",
        to: recipientEmail,
        subject: "[Pipeline AI Sandbox] Automated email",
        text: emailContent,
      });

      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
            reject(error);
          } else {
            console.log("Email sent: ", info.response);
            resolve(info);
          }
        });
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successful request.",
        }),
      };
    } catch (error) {
      console.error("Error processing:", error);
      throw new Error(`Error processing: ${error.message}`);
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }
}

async function getDataContentFromKey(workflowId, key) {
  const dataResponse = await s3Client.send(
    new GetObjectCommand({
      Bucket: "ai-pipeline-builder-sandbox",
      Key: `${workflowId}/data/${key}`,
    })
  );
  const fileContent = await streamToString(dataResponse.Body);
  return fileContent;
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}
