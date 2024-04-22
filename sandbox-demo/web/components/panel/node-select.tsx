"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Gpt4TurboNodeSelect } from "../nodes/services/gpt_4_turbo";
import { reactFlowNodeGenerate } from "../nodes/data";
import { SingleFileUploadNodeSelect } from "../nodes/services/single_file_upload";
import { SingleFileDownloadNodeSelect } from "../nodes/services/single_file_download";

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
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const availableNodeKeys = [
    "gpt_4_turbo",
    "single_file_upload_txt",
    "single_file_upload_pdf",
    "single_file_upload_csv",
    "single_file_download_txt",
  ];

  const nodeSelectMap: { [key: string]: NodeSelectType } = {
    gpt_4_turbo: Gpt4TurboNodeSelect,
    single_file_upload_txt: SingleFileUploadNodeSelect,
    single_file_upload_pdf: SingleFileUploadNodeSelect,
    single_file_upload_csv: SingleFileUploadNodeSelect,
    single_file_download_txt: SingleFileDownloadNodeSelect,
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-10 left-10 shadow-lg"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div
        className={`bg-white w-[30%] w-40 h-full p-5 z-[999] fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-md`}
      >
        <p className="text-sm pb-2">Add node</p>
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
