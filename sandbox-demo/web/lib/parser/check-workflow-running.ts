import jsyaml from "js-yaml";
export function checkWorkflowRunning(workflowSrc: string): boolean {
  const workflow: any = jsyaml.load(workflowSrc);
  return workflow.status === "pending";
}
