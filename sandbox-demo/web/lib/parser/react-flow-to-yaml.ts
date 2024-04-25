import jsyaml from "js-yaml";

export function reactFlowToYaml(
  nodes: any[],
  edges: any[],
  initWorkflowSrc?: string
) {
  // Parse the initial workflow if provided
  let initNodes = [];
  if (initWorkflowSrc) {
    const initWorkflow: any = jsyaml.load(initWorkflowSrc);
    initNodes = initWorkflow.nodes || [];
  }

  // Create a map for quick access to initial node data by node ID
  const initNodeMap = new Map(initNodes.map((node: any) => [node.id, node]));

  // Mapping nodes data to the required YAML structure
  const yamlNodes = nodes.map((node) => {
    const { id, data, type } = node;

    // Retrieve initial node data if available
    const initNode: any = initNodeMap.get(id);

    const simplifiedNode: any = {
      id,
      key: type,
      title: data.title,
      description: data.description,
      parameter: data.parameter,
      status: initNode ? initNode.status : data.status, // Use initial status if available
    };

    // Adding category if present
    if (data.category) {
      simplifiedNode.category = data.category;
    }

    // Handle input and output
    ["input", "output"].forEach((io) => {
      if (data[io] && data[io].length > 0) {
        simplifiedNode[io] = data[io].map((item: any, index: number) => {
          // Check if initial node data has input/output and use its status if available
          const initIoStatus =
            initNode && initNode[io] && initNode[io][index]
              ? initNode[io][index].status
              : item.status;
          return {
            order: item.order,
            type: item.type,
            key: item.key,
            status: initIoStatus, // Use initial io status if available
            ...(item.title ? { title: item.title } : {}),
            ...(item.description ? { description: item.description } : {}),
          };
        });
      }
    });

    return simplifiedNode;
  });

  const yamlEdges = edges.map((edge) => {
    const { source, sourceHandle, target, targetHandle, id } = edge;
    return { source, sourceHandle, target, targetHandle, id };
  });

  const yamlData = {
    nodes: yamlNodes,
    edges: yamlEdges,
  };

  // Convert the JavaScript object to a YAML string
  return jsyaml.dump(yamlData, { lineWidth: -1 });
}
