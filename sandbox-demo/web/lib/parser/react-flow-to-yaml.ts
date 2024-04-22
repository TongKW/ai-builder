import jsyaml from "js-yaml";

export function reactFlowToYaml(nodes: any[], edges: any[]) {
  // Mapping nodes data to the required YAML structure
  const yamlNodes = nodes.map((node) => {
    const { id, data, type } = node;
    const simplifiedNode: any = {
      id,
      key: type,
      title: data.title,
      description: data.description,
      status: data.status,
    };

    // Adding category if present
    if (data.category) {
      simplifiedNode.category = data.category;
    }

    // Handle input and output
    ["input", "output"].forEach((io) => {
      if (data[io] && data[io].length > 0) {
        simplifiedNode[io] = data[io].map((item: any) => ({
          order: item.order,
          type: item.type,
          key: item.key,
          status: item.status,
          ...(item.title ? { title: item.title } : {}),
          ...(item.description ? { description: item.description } : {}),
        }));
      }
    });

    return simplifiedNode;
  });

  const yamlEdges = edges.map((edge) => {
    /*
    "source": "single_file_upload_txt_118d10d7a7d849d6b1b481ea34ba5848",
    "sourceHandle": "output.0",
    "target": "gpt_4_turbo_a8bef929f92a4d95b08f40aafdf1f409",
    "targetHandle": "input.0",
    "id": "reactflow__edge-single_file_upload_txt_118d10d7a7d849d6b1b481ea34ba5848output.0-gpt_4_turbo_a8bef929f92a4d95b08f40aafdf1f409input.0"
    */

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
