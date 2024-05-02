"use client";

import { createContext, useContext } from "react";

const WorkflowContext = createContext<{
  workflowId: string;
  setWorkflowSrc: React.Dispatch<React.SetStateAction<string>>;
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<any>>;
  editingNodeId: string;
  setEditingNodeId: (nodeId: string) => void;
  isRunning: boolean;
  unsavedInlineTextInputIds: string[];
  setUnsavedInlineTextInputIds: React.Dispatch<React.SetStateAction<string[]>>;
}>({
  workflowId: "",
  isRunning: false,
  setWorkflowSrc: (value: React.SetStateAction<string>) => {
    // Handle both direct values and functional updates
    if (typeof value === "function") {
      const result = (value as Function)(""); // This is just for the default context, adjust as necessary
      return result;
    }
    return value; // Direct string assignment
  },
  nodes: [],
  setNodes: (nodes: any[]) => {
    console.log(nodes);
  },
  editingNodeId: "",
  setEditingNodeId: (nodeId: string) => {
    console.log(nodeId);
  },
  unsavedInlineTextInputIds: [],
  setUnsavedInlineTextInputIds: (ids: React.SetStateAction<string[]>) => {
    console.log(ids);
  },
});

export const useWorkflowContext = () => useContext(WorkflowContext);

export default WorkflowContext;
