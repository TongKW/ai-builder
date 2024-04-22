import { NodeData } from ".";

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
