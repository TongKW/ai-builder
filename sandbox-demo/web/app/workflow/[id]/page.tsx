import { isValidWorkflowId } from "@/lib/format/uuid";
import Workflow from "./_components/workflow";
import { redirect } from "next/navigation";

export default async function WorkflowPage({
  params,
}: {
  params: { id: string };
}) {
  // 1: get the workflow id from param
  const { id: workflowId } = params;
  if (!isValidWorkflowId(workflowId)) {
    redirect("/404");
  }

  // 2: retrieve the workflow yaml file. if doesn't exists, then generate a new one.
  const result = await fetch(
    `${process.env.SANDBOX_API}/handler?workflowId=${workflowId}`,
    {
      method: "GET",
      cache: "no-store", // This prevents the use of the cache
    }
  );
  const { workflowSrc, nodes, edges } = await result.json();

  return (
    <Workflow
      workflowId={workflowId}
      initWorkflowSrc={workflowSrc}
      initNodes={nodes}
      initEdges={edges}
    />
  );
}
