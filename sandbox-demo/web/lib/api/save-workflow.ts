"use server";

export async function saveWorkflow(args: {
  workflowId: string;
  workflowSrc: string;
  nodes: any[];
  edges: any[];
}) {
  await fetch(`${process.env.SANDBOX_API}/handler`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
}
