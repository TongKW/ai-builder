"use client";

import { createContext, useContext } from "react";

const WorkflowContext = createContext({ workflowId: "" });

export const useWorkflowContext = () => useContext(WorkflowContext);

export default WorkflowContext;
