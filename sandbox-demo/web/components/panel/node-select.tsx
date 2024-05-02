"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Gpt4TurboNodeSelect } from "../nodes/services/gpt_4_turbo/gpt_4_turbo";
import { reactFlowNodeGenerate } from "../nodes/data";
import { SingleFileUploadNodeSelect } from "../nodes/services/single_file_upload";
import { SingleFileDownloadNodeSelect } from "../nodes/services/single_file_download";
import { Gpt4Turbo2InputsNodeSelect } from "../nodes/services/gpt_4_turbo/gpt_4_turbo_2_inputs";
import { SandboxEmailNodeSelect } from "../nodes/services/sandbox_email";
import { InlineTextInputNodeSelect } from "../nodes/services/inline_text_input";
import { TxtToMdNodeSelect } from "../nodes/services/txt_to_md";

import clsx from "clsx";
import { InlineTextOutputNodeSelect } from "../nodes/services/inline_text_output";

type NodeSelectType = ({
  onClick,
  title,
  description,
}: {
  onClick: () => void;
  title?: string | undefined;
  description?: string | undefined;
}) => JSX.Element;

export function NodeSidePanel({
  onNodeCreate,
}: {
  onNodeCreate: (node: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const availableNodeKeys = [
    "gpt_4_turbo",
    "gpt_4_turbo_2_inputs",
    "single_file_upload_txt",
    // "single_file_upload_pdf",
    // "single_file_upload_csv",
    "single_file_download_txt",
    "single_file_download_md",
    "sandbox_email",
    "txt_to_md",
    "inline_text_input",
    "inline_text_output",
  ];

  const nodeSelectMap: { [key: string]: NodeSelectType } = {
    gpt_4_turbo: Gpt4TurboNodeSelect,
    gpt_4_turbo_2_inputs: Gpt4Turbo2InputsNodeSelect,
    single_file_upload_txt: SingleFileUploadNodeSelect,
    single_file_upload_pdf: SingleFileUploadNodeSelect,
    single_file_upload_csv: SingleFileUploadNodeSelect,
    single_file_download_txt: SingleFileDownloadNodeSelect,
    single_file_download_md: SingleFileDownloadNodeSelect,
    sandbox_email: SandboxEmailNodeSelect,
    inline_text_input: InlineTextInputNodeSelect,
    inline_text_output: InlineTextOutputNodeSelect,
    txt_to_md: TxtToMdNodeSelect,
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[30px] left-[30px] shadow-lg"
        onClick={toggleSidebar}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div
        className={clsx(
          `bg-white w-[30%] w-40 h-full p-5 z-[999] fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out shadow-md select-none`,
          {
            "translate-x-0": !isOpen,
            "-translate-x-full": isOpen,
          }
        )}
      >
        <p className="text-sm pb-3">Add nodes</p>
        <div className="flex flex-wrap gap-4">
          {availableNodeKeys.map((key, index) => (
            <NodeSelect key={`${key}_${index}`} nodeKey={key} />
          ))}
        </div>
      </div>
    </>
  );

  function NodeSelect({ nodeKey }: { nodeKey: string }) {
    const node = reactFlowNodeGenerate(nodeKey);

    // Check if the node and the component exists
    if (!node || !nodeSelectMap[nodeKey]) {
      return null; // or return some fallback UI
    }

    const NodeComponent = nodeSelectMap[nodeKey];

    return (
      <NodeComponent
        onClick={() => onNodeCreate(node)}
        title={node.data.title}
        description={node.data.description}
      />
    );
  }
}
