import jsyaml from "js-yaml";

export function updateNodesStatus(nodes: any[], workflowSrc: string) {
  // Parse the YAML to get the workflow source object
  const workflow: any = jsyaml.load(workflowSrc);

  // Create a map from the workflow source for quick lookup
  const workflowMap = new Map(
    workflow.nodes.map((node: any) => [node.id, node])
  );

  // Iterate over the nodes array and update the status
  nodes.forEach((node) => {
    const workflowNode: any = workflowMap.get(node.id);
    if (workflowNode) {
      // Update node status
      node.data.status = workflowNode.status;

      // Update the status of each output in the node
      node.data.output.forEach((output: any) => {
        const correspondingOutput = workflowNode.output.find(
          (wfOutput: any) => wfOutput.key === output.key
        );
        if (correspondingOutput) {
          output.status = correspondingOutput.status;
        }
      });
    }
  });

  return nodes;
}
