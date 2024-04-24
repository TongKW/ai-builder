import { v4 as uuidv4 } from "uuid";

import Gpt4TurboNode from "@/components/nodes/services/gpt_4_turbo";
import SingleFileUploadNode from "@/components/nodes/services/single_file_upload";
import SingleFileDownloadNode from "@/components/nodes/services/single_file_download";
import { MemoExoticComponent } from "react";
import { reactFlowData, reactFlowDataTypeMap } from "./constants";

interface ReactFlowNodeData extends NodeData {
  type: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

export interface NodeData {
  id: string;
  data: {
    title: string;
    description?: string;
    category: string;
    status?: string;
    input: NodeDataIO[];
    output: NodeDataIO[];
  };
  parameters?: any;
}

export interface NodeDataIO {
  type: string;
  order: number;
  key?: string;
  status?: string;
}

export const reactFlowNodeTypes: {
  [key: string]: MemoExoticComponent<({ data }: NodeData) => JSX.Element>;
} = {
  gpt_4_turbo: Gpt4TurboNode,
  single_file_upload: SingleFileUploadNode,
  single_file_download: SingleFileDownloadNode,
};

export function reactFlowNodeGenerate(
  key: string,
  args?: {
    title?: string;
    description?: string;
    category?: string;
    parameters?: any;
  }
): ReactFlowNodeData | undefined {
  // Generate a UUID and replace hyphens with an empty string
  const generateId = () => key + "_" + uuidv4().replace(/-/g, "");

  // Generate a random number between -20 and 20
  const generateRandomPosition = () => Math.floor(Math.random() * 41) - 20;

  if (reactFlowData[key] === undefined) return undefined;

  // Create a deep copy of the node data to prevent reference issues
  const nodeDataCopy = JSON.parse(JSON.stringify(reactFlowData[key]));

  // Define the node with the generated properties
  const node: ReactFlowNodeData = {
    ...nodeDataCopy,
    id: generateId(), // Generate a UUID for the id
    type: reactFlowDataTypeMap[key] ?? key,
    width: 160,
    height: 160,
    position: {
      x: generateRandomPosition() + 500, // Generate a random x position
      y: generateRandomPosition() + 200, // Generate a random y position
    },
  };

  if (args) {
    if (args.title) node.data.title = args.title;
    if (args.description) node.data.description = args.description;
    if (args.category) node.data.category = args.category;
    if (args.parameters) node.parameters = args.parameters;
  }

  return node;
}
