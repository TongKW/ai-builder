import { dataIOTypeToExtension } from "@/lib/constants/data-io-property";
import { v4 as uuidv4 } from "uuid";

export function assignNodesDataIO(nodes: any[], edgeParams: any) {
  const generateId = () => uuidv4().replace(/-/g, "");

  // Destructure edgeParams to get source and target node details
  const { source, target, sourceHandle, targetHandle } = edgeParams;
  const sourceOutputIndex = parseInt(sourceHandle.split(".")[1], 10);
  const targetInputIndex = parseInt(targetHandle.split(".")[1], 10);

  // Find the source and target node objects
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  // Check if the needed nodes and index positions are valid
  if (
    !sourceNode ||
    !targetNode ||
    sourceOutputIndex < 0 ||
    targetInputIndex < 0
  ) {
    return nodes; // Return unchanged nodes if any checks fail
  }

  // Generate a unique key for the data connection
  const sourceOutputType = sourceNode.data.output[sourceOutputIndex]?.type;
  let dataKey =
    generateId() + `.${dataIOTypeToExtension[sourceOutputType] ?? "txt"}`;
  const sourceOutputData = sourceNode.data.output[sourceOutputIndex];
  if (sourceOutputData && sourceOutputData.hasOwnProperty("key")) {
    dataKey = sourceOutputData["key"];
  }

  // Update source's output
  if (!sourceNode.data.output[sourceOutputIndex].hasOwnProperty("key")) {
    sourceNode.data.output[sourceOutputIndex].key = dataKey;
  }
  sourceNode.data.output[sourceOutputIndex].status = "idle";

  // Update target's input
  if (!targetNode.data.input[targetInputIndex]) {
    targetNode.data.input[targetInputIndex] = {
      type: sourceOutputType,
      order: targetInputIndex,
      key: dataKey,
      status: "idle",
    };
  } else {
    if (!targetNode.data.input[targetInputIndex].hasOwnProperty("key")) {
      targetNode.data.input[targetInputIndex].key = dataKey;
    }
    targetNode.data.input[targetInputIndex].status = "idle";
  }

  return nodes;
}

export function removeNodeDataIO(nodes: any[], edgeParams: any) {
  // TODO: finish
}
