"use client";

import { createContext, useContext } from "react";

const WorkflowContext = createContext<{
  workflowId: string;
  setWorkflowSrc: (src: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<any>>;
}>({
  workflowId: "",
  setWorkflowSrc: (src: string) => {
    console.log(src);
  },
  setNodes: (nodes: any[]) => {
    console.log(nodes);
  },
});

export const useWorkflowContext = () => useContext(WorkflowContext);

export default WorkflowContext;
