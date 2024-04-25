import { NodeData } from ".";

/**
 * Node data block text description and intput/output types definition
 */
export const reactFlowData: { [key: string]: NodeData } = {
  gpt_4_turbo: {
    id: "",
    data: {
      title: "GPT 4 Turbo",
      description: "A generic LLM block.",
      category: "Base Model",
      status: "idle",
      input: [
        {
          type: "txt",
          order: 0,
          title: "input 1",
          description: "pass input text to form a custom prompt",
        },
      ],
      output: [
        {
          type: "txt",
          order: 0,
          title: "response",
          description: "gpt-4-turbo response from chat completion",
        },
      ],
    },
  },

  single_file_upload_txt: {
    id: "",
    data: {
      title: "File Upload (TXT)",
      description: "Upload and store a text file.",
      category: "Data Input/Output",
      status: "idle",
      input: [],
      output: [
        {
          type: "txt",
          order: 0,
          title: "file output",
          description: "uploaded text file will output from here",
        },
      ],
    },
  },

  single_file_upload_pdf: {
    id: "",
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
          title: "file output",
          description: "uploaded pdf file will output from here",
        },
      ],
    },
  },

  single_file_upload_csv: {
    id: "",
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
          title: "file output",
          description: "uploaded csv file will output from here",
        },
      ],
    },
  },

  single_file_download_txt: {
    id: "",
    data: {
      title: "File Download (TXT)",
      description: "Download a text file.",
      category: "Data Input/Output",
      status: "idle",
      input: [
        {
          type: "txt",
          order: 0,
          title: "file input",
          description: "right click this block to download the text file",
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
