import { SQS, SendMessageCommand } from "@aws-sdk/client-sqs"; // for SQS client
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"; // for S3 client
import yaml from "js-yaml";

const s3 = new S3Client({ region: "us-west-1" }); // Ensure the region is correct
const sqs = new SQS({ region: "us-west-1" }); // Ensure the region is correct

export async function handler(event) {
  for (const record of event.Records) {
    console.log("Processing record:", record);
    const { workflowId } = JSON.parse(record.body);

    try {
      // 1. Download workflow.yml from the S3 bucket
      const s3Params = {
        Bucket: "ai-pipeline-builder-sandbox",
        Key: `${workflowId}/workflow.yml`,
      };

      const data = await s3.send(new GetObjectCommand(s3Params));

      // Assuming the workflow.yml is a text file, read its content
      const workflowSrc = await streamToString(data.Body);
      const workflow = yaml.load(workflowSrc);

      console.log("Downloaded workflow content:", workflow);

      // 2.1 Check if any node that all the input status are ready
      let somethingProcessed = false;
      for (const node of workflow.nodes) {
        console.log("2.1 workflow: ");
        console.log(workflow);

        if (
          node.input &&
          node.input.every((input) => input.status === "ready") &&
          node.status === "idle"
        ) {
          console.log(`Processing node ${node.id} in workflow-${workflowId}`);
          // Call API or process data here
          node.status = "pending"; // Set node status to processing during the operation

          // Update temp state of workflow
          console.log(`update workflow-${workflowId} node pending state`);
          await s3.send(
            new PutObjectCommand({
              Bucket: s3Params.Bucket,
              Key: s3Params.Key,
              Body: yaml.dump(workflow),
            })
          );

          await fetch(`${process.env.SANDBOX_API}/services/${node.service}`, {
            method: "POST",
            body: JSON.stringify({
              workflowId: workflowId,
              inputKeys: (node.input ?? []).map((elem) => elem.key), //
              outputKeys: (node.output ?? []).map((elem) => elem.key),
              parameters: node.parameters,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          // After processing
          if (node.output) {
            node.output.forEach((output) => (output.status = "ready"));
          }
          if (node.input) {
            node.input.forEach((input) => (input.status = "idle"));
          }
          node.status = "ready";

          somethingProcessed = true;

          break;
        }
      }

      // 2.2 If no input-ready nodes found, then check for nodes where all outputs are ready

      if (!somethingProcessed) {
        console.log("2.2 workflow: ");
        console.log(workflow);
        for (const node of workflow.nodes) {
          if (
            node.output &&
            node.output.every((output) => output.status === "ready")
          ) {
            const edges = workflow.edges.filter(
              (edge) => edge.source === node.id
            );

            edges.forEach((edge) => {
              const targetNode = workflow.nodes.find(
                (n) => n.id === edge.target
              );
              const sourceOutput = node.output.find(
                (o) => `output.${o.order}` === edge.sourceHandle
              );
              const targetInput = targetNode.input.find(
                (i) => `input.${i.order}` === edge.targetHandle
              );

              if (sourceOutput && targetInput) {
                targetInput.key = sourceOutput.key; // Transfer data key
                targetInput.status = "ready"; // Set status to ready
              }
            });
            node.output.forEach((output) => (output.status = "idle")); // Reset source node outputs to idle
            somethingProcessed = true;
          }
        }
      }

      if (somethingProcessed) {
        // Save updated workflow back to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: s3Params.Bucket,
            Key: s3Params.Key,
            Body: yaml.dump(workflow),
          })
        );

        // Re-queue the message to process next steps
        await sqs.send(
          new SendMessageCommand({
            MessageBody: JSON.stringify({ workflowId }),
            QueueUrl: process.env.TASK_QUEUE_URL,
          })
        );
      } else {
        workflow.status = "finished";
        // Save updated workflow back to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: s3Params.Bucket,
            Key: s3Params.Key,
            Body: yaml.dump(workflow),
          })
        );
      }
    } catch (error) {
      console.error("Error processing the record:", error);
      // Handle errors appropriately, possibly re-queue or log for later processing

      // current approach: finish the script exit early
      console.log("try updating workflow.yml right now.");
      try {
        // 1. Download workflow.yml from the S3 bucket
        const s3Params = {
          Bucket: "ai-pipeline-builder-sandbox",
          Key: `${workflowId}/workflow.yml`,
        };

        const data = await s3.send(new GetObjectCommand(s3Params));

        // Assuming the workflow.yml is a text file, read its content
        const workflowSrc = await streamToString(data.Body);
        const workflow = yaml.load(workflowSrc);

        workflow.status = "finished";
        // Save updated workflow back to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: s3Params.Bucket,
            Key: s3Params.Key,
            Body: yaml.dump(workflow),
          })
        );
      } catch (error) {}
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

sample yaml file:

status: pending
nodes:
  - id: gpt_4_turbo_803be6ab46f64573950022a7c0081779
    key: gpt_4_turbo
    title: GPT 4 Turbo
    description: A generic LLM block.
    status: idle
    category: Base Model
    input:
      - order: 0
        type: txt
        key: f91e980d916b4622a511e15a543b7230.txt
        status: idle
    output:
      - order: 0
        type: txt
        key: 789c346077e24df68bbcc936707417f5.txt
        status: idle
  - id: single_file_upload_txt_befb4c93627844a29ebbe28bcc4d4ff3
    key: single_file_upload
    title: File Upload (TXT)
    description: Upload and store a text file.
    status: ready
    category: Data Input/Output
    output:
      - order: 0
        type: txt
        key: f91e980d916b4622a511e15a543b7230.txt
        status: ready
  - id: single_file_download_txt_fd6e541e40994350b4c3f84904de5946
    key: single_file_download
    title: File Download (TXT)
    description: Download a text file.
    status: idle
    category: Data Input/Output
    input:
      - order: 0
        type: txt
        key: 789c346077e24df68bbcc936707417f5.txt
        status: idle
edges:
  - source: single_file_upload_txt_befb4c93627844a29ebbe28bcc4d4ff3
    sourceHandle: output.0
    target: gpt_4_turbo_803be6ab46f64573950022a7c0081779
    targetHandle: input.0
    id: reactflow__edge-single_file_upload_txt_befb4c93627844a29ebbe28bcc4d4ff3output.0-gpt_4_turbo_803be6ab46f64573950022a7c0081779input.0
  - source: gpt_4_turbo_803be6ab46f64573950022a7c0081779
    sourceHandle: output.0
    target: single_file_download_txt_fd6e541e40994350b4c3f84904de5946
    targetHandle: input.0
    id: reactflow__edge-gpt_4_turbo_803be6ab46f64573950022a7c0081779output.0-single_file_download_txt_fd6e541e40994350b4c3f84904de5946input.0


*/
