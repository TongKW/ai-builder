export function updateNode(
  updatedNode: any,
  setNodes: React.Dispatch<React.SetStateAction<any[]>>
) {
  setNodes((nodes) =>
    nodes.map((node) => {
      if (node.id !== updatedNode.id) return node;
      else return updatedNode;
    })
  );
}
