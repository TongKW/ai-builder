"use client";

import { createContext, useContext } from "react";

const WorkflowContext = createContext<{
  workflowId: string;
  setWorkflowSrc: (src: string) => void;
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<any>>;
  editingNodeId: string;
  setEditingNodeId: (nodeId: string) => void;
}>({
  workflowId: "",
  setWorkflowSrc: (src: string) => {
    console.log(src);
  },
  nodes: [],
  setNodes: (nodes: any[]) => {
    console.log(nodes);
  },
  editingNodeId: "",
  setEditingNodeId: (nodeId: string) => {
    console.log(nodeId);
  },
});

export const useWorkflowContext = () => useContext(WorkflowContext);

export default WorkflowContext;
