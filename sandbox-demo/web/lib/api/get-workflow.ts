"use server";

export async function getWorkflow(workflowId: string) {
  const result = await fetch(
    `${
      process.env.SANDBOX_API
    }/handler?workflowId=${workflowId}&${performance.now()}`,
    {
      method: "GET",
      cache: "no-store", // This prevents the use of the cache
    }
  );
  const { workflowSrc, nodes, edges } = await result.json();
  return { workflowSrc, nodes, edges };
}
