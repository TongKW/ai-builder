import { v4 as uuidv4 } from "uuid";

import Gpt4TurboNode from "@/components/nodes/services/gpt_4_turbo";
import SingleFileUploadNode from "@/components/nodes/services/single_file_upload";
import SingleFileDownloadNode from "@/components/nodes/services/single_file_download";
import { MemoExoticComponent } from "react";

interface ReactFlowNodeData extends NodeData {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

export interface NodeData {
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

/**
 * Node data block text description and intput/output types definition
 */
export const reactFlowData: { [key: string]: NodeData } = {
  gpt_4_turbo: {
    data: {
      title: "GPT 4 Turbo",
      description: "GPT 4 Turbo LLM developed by OpenAI.",
      category: "Base Model",
      status: "idle",
      input: [
        {
          type: "text",
          order: 0,
        },
      ],
      output: [
        {
          type: "text",
          order: 0,
        },
      ],
    },
  },
  single_file_upload_txt: {
    data: {
      title: "File Upload (TXT)",
      description: "Upload and store a text file.",
      category: "Data Input/Output",
      status: "idle",
      input: [],
      output: [
        {
          type: "text",
          order: 0,
        },
      ],
    },
  },

  single_file_upload_pdf: {
    data: {
      title: "File Upload (PDF)",
      description: "Upload and store a PDF file.",
      category: "Data Input/Output",
      status: "idle",
      input: [],
      output: [
        {
          type: "pdf",
          order: 0,
        },
      ],
    },
  },

  single_file_upload_csv: {
    data: {
      title: "File Upload (CSV)",
      description: "Upload and store a CSV file.",
      category: "Data Input/Output",
      status: "idle",
      input: [],
      output: [
        {
          type: "csv",
          order: 0,
        },
      ],
    },
  },

  single_file_download_txt: {
    data: {
      title: "File Download (TXT)",
      description: "Download a text file.",
      category: "Data Input/Output",
      status: "idle",
      input: [
        {
          type: "text",
          order: 0,
        },
      ],
      output: [],
    },
  },
};

export const reactFlowDataTypeMap: { [key: string]: string } = {
  single_file_upload_txt: "single_file_upload",
  single_file_upload_pdf: "single_file_upload",
  single_file_upload_csv: "single_file_upload",
  single_file_download_txt: "single_file_download",
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

  // Define the node with the generated properties
  const node: ReactFlowNodeData = {
    ...reactFlowData[key],
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
