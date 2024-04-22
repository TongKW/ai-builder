/**
 * This function validate if a to-be created edge is valid, i.e. I/O data type matched
 */
export function validateEdge(
  nodes: any[],
  edges: any[],
  edgeParams: any
): boolean {
  // Extract source and target node IDs from edgeParams
  const { source, target, sourceHandle, targetHandle } = edgeParams;

  // console.log(`[validateEdge] source = ${source} `);
  // console.log(`[validateEdge] target = ${target} `);
  // console.log(`[validateEdge] sourceHandle = ${sourceHandle} `);
  // console.log(`[validateEdge] targetHandle = ${targetHandle} `);
  // console.log(`[validateEdge] nodes: `);
  // console.log(nodes);

  // Find the source and target node objects using their IDs
  const sourceNode = nodes.find((node: any) => node.id === source);
  const targetNode = nodes.find((node: any) => node.id === target);

  // If either node is not found, the edge is invalid
  if (!sourceNode || !targetNode) {
    return false;
  }

  // If the target node is already connected with existing input, the edge is invalid
  if (
    edges.some(
      (edge) => targetHandle === edge.targetHandle && target === edge.target
    )
  ) {
    return false;
  }

  // console.log(`[validateEdge] sourceNode = `);
  // console.log(sourceNode);
  // console.log(`[validateEdge] targetNode = `);
  // console.log(targetNode);

  // Extract the output index from the source handle and the input index from the target handle
  const sourceOutputIndex = parseInt(sourceHandle.split(".")[1], 10);
  const targetInputIndex = parseInt(targetHandle.split(".")[1], 10);

  // Get the output type of the source node and the input type of the target node
  const sourceOutputType = sourceNode.data.output[sourceOutputIndex]?.type;
  const targetInputType = targetNode.data.input[targetInputIndex]?.type;

  // console.log(`[validateEdge] sourceOutputType = ${sourceOutputType}`);
  // console.log(`[validateEdge] targetInputType = ${targetInputType}`);

  // Validate if the types match
  return sourceOutputType === targetInputType;
}
