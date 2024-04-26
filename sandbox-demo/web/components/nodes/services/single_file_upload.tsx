import clsx from "clsx";
import { MoveRight, Upload } from "lucide-react";
import React, { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { NodeData } from "../data";
import { dataBlockBgColorMap } from "@/lib/constants/data-io-property";
import { toast } from "@/components/ui/use-toast";
import { getS3PresignedUrl } from "@/lib/nodes/infra/s3-data-io";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";
import { getFileExtension } from "@/lib/format/file-type";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { ContextMenuItem } from "@radix-ui/react-context-menu";
import { ContextMenuWrapper } from "@/components/ui/context-menu-wrapper";

function SingleFileUploadNode({ id: nodeId, data }: NodeData) {
  const { workflowId, setNodes, setEditingNodeId } = useWorkflowContext();

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (getFileExtension(file) !== data.output[0].type) {
        toast({
          variant: "destructive",
          title: "Failed to upload file.",
          description: `File type didn't match. It must be in .${data.output[0].type}.`,
        });
        return;
      }

      try {
        if (!data.output[0].key) {
          toast({
            title: "Failed to upload file.",
            description: "You must connect to an input first.",
          });
          return;
        }
        toast({
          title: "Uploading your file...",
          description: "This might takes a few seconds.",
        });

        const presignedUrl = await getS3PresignedUrl(
          workflowId,
          data.output[0].key,
          "putObject"
        );

        // Create a new Blob from the file with the correct MIME type
        const blob = new Blob([file], { type: `text/plain; charset=utf-8` });

        await fetch(presignedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": blob.type,
          },
        });

        setNodes((nodes: any[]) =>
          nodes.map((node) => {
            if (node.id === nodeId) {
              const nodeCopy = { ...node };
              nodeCopy.data.status = "ready";
              if (nodeCopy.data?.output[0]?.status) {
                nodeCopy.data.output[0].status = "ready";
              }
              return nodeCopy;
            }
            return node;
          })
        );

        toast({
          title: "File uploaded successfully.",
          description: "File has been successfully uploaded to S3.",
        });
      } catch (error) {
        console.log("Upload file error");
        console.log(error);

        toast({
          variant: "destructive",
          title: "Failed to upload file.",
          description: "Please try to upload file later.",
        });
      }
    },
    [workflowId, nodeId, setNodes, data.output]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files[0];
      handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <ContextMenuWrapper
      triggerElement={
        <div
          className="shadow-md rounded-md border-2 border-stone-400 w-40 h-40 relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <p
            className="text-center absolute min-w-40 pb-2 whitespace-nowrap pointer-events-none"
            style={{
              transform: "translateX(80px) translateX(-50%) translateY(-100%)",
            }}
          >
            {data.title}
          </p>
          <SingleFileUploadNodeUi
            status={data.status ?? "idle"}
            description={data.description}
          />

          <TooltipWrapper
            triggerElement={
              <Handle
                id="output.0"
                type="source"
                position={Position.Right}
                className={clsx(
                  "w-6 h-6 border-2 border-stone-400 flex items-center justify-center relative"
                )}
                style={{
                  backgroundColor:
                    dataBlockBgColorMap[data.output[0]?.type ?? "txt"],
                  animation:
                    data.output[0].status === "ready"
                      ? "pulse 1s infinite"
                      : undefined,
                  boxShadow:
                    data.output[0].status === "ready"
                      ? "0 0 20px rgba(252, 211, 77, 1.0)"
                      : undefined,
                }}
              >
                <p
                  className="text-center text-[8px] absolute top-0 pb-2 whitespace-nowrap pointer-events-none"
                  style={{
                    transform: "translateY(-100%)",
                  }}
                >
                  {data.output[0].title ?? ""}
                </p>
                <MoveRight className="pointer-events-none w-4 h-4" />
              </Handle>
            }
            tooltipElement={<p>{data.output[0].description ?? ""}</p>}
          />
        </div>
      }
      contextMenuElement={
        <ContextMenuItem
          className="cursor-pointer p-1 text-sm hover:bg-gray-100"
          onClick={() => setEditingNodeId(nodeId)}
        >
          Configuration
        </ContextMenuItem>
      }
    />
  );
}
export function SingleFileUploadNodeUi({
  status,
  description,
  size = 60,
}: {
  status: string;
  description?: string;
  size?: number;
}) {
  return (
    <TooltipWrapper
      triggerElement={
        <div
          className={clsx(
            "flex justify-center items-center relative w-full h-full rounded-md select-none",
            {
              "bg-white hover:bg-gray-100": status === "idle",
              "bg-green-100 hover:bg-green-200": status === "ready",
              "bg-gray-100 animate-pulse": status === "pending",
            }
          )}
        >
          <Upload
            style={{
              width: size,
              height: size,
              color: "black",
            }}
          />
        </div>
      }
      tooltipElement={<p>{description}</p>}
    />
  );
}

export function SingleFileUploadNodeSelect({
  onClick,
  title = "",
  description = "",
}: {
  onClick: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="shadow-md rounded-md border-2 border-stone-400 w-20 h-20 relative cursor-pointer"
        onClick={onClick}
      >
        <SingleFileUploadNodeUi status="idle" size={30} />
      </div>
      <p className="text-[10px] max-w-20 text-center">{title}</p>
    </div>
  );
}

export default memo(SingleFileUploadNode);
