import { NodeData } from ".";

/**
 * Node data block text description and intput/output types definition
 */
export const reactFlowData: { [key: string]: NodeData } = {
  gpt_4_turbo: {
    id: "",
    data: {
      service: "gpt_4_turbo",
      title: "GPT 4 Turbo",
      description: "A generic LLM block.",
      category: "Base Model",
      status: "idle",
      input: [
        {
          type: "txt",
          order: 0,
          title: "input",
          description: "pass input text to form a custom prompt",
        },
      ],
      output: [
        {
          type: "txt",
          order: 0,
          title: "output",
          description: "gpt-4-turbo response from chat completion",
        },
      ],
    },
    parameters: {
      responseFormatType: "text",
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "{{ input.0 }}",
        },
      ],
    },
  },

  gpt_4_turbo_2_inputs: {
    id: "",
    data: {
      service: "gpt_4_turbo",
      title: "GPT 4 Turbo (2 inputs)",
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
        {
          type: "txt",
          order: 1,
          title: "input 2",
          description: "pass input text to form a custom prompt",
        },
      ],
      output: [
        {
          type: "txt",
          order: 0,
          title: "output",
          description: "gpt-4-turbo response from chat completion",
        },
      ],
    },
    parameters: {
      responseFormatType: "text",
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: "{{ input.0 }}",
        },
      ],
    },
  },

  single_file_upload_txt: {
    id: "",
    data: {
      service: "single_file_upload",
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
      service: "single_file_upload",
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
      service: "single_file_upload",
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
      service: "single_file_download",
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

  sandbox_email: {
    id: "",
    data: {
      service: "sandbox_email",
      title: "Sandbox Email",
      description: "Send text content to a given recipient email.",
      category: "Trigger",
      status: "idle",
      input: [
        {
          type: "txt",
          order: 0,
          title: "recipient",
          description: "recipient email",
        },
        {
          type: "txt",
          order: 1,
          title: "content",
          description: "text content in the email",
        },
      ],
      output: [],
    },
  },

  inline_text_input: {
    id: "",
    data: {
      service: "single_file_upload",
      title: "Text input",
      description: "Inline text input.",
      category: "Data Input/Output",
      status: "idle",
      input: [],
      output: [
        {
          type: "txt",
          order: 0,
          title: "text output",
          description: "input text will output from here",
        },
      ],
    },
  },
};

export const reactFlowDataTypeMap: { [key: string]: string } = {
  single_file_upload_txt: "single_file_upload",
  single_file_upload_pdf: "single_file_upload",
  single_file_upload_csv: "single_file_upload",
  single_file_download_txt: "single_file_download",
};
