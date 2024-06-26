import clsx from "clsx";
import { MoveRight, TextCursorInput, Upload } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import { NodeData } from "../data";
import { dataBlockBgColorMap } from "@/components/nodes/data/constants/data-io-property";
import { toast } from "@/components/ui/use-toast";
import { getS3PresignedUrl } from "@/lib/nodes/infra/s3-data-io";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { ContextMenuItem } from "@radix-ui/react-context-menu";
import { ContextMenuWrapper } from "@/components/ui/context-menu-wrapper";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";

function InlineTextInputNode({ id: nodeId, data }: NodeData) {
  const { workflowId, setNodes, setEditingNodeId, isRunning } =
    useWorkflowContext();

  const onSave = async (textValue: string) => {
    try {
      if (!data.output[0].key) {
        toast({
          title: "Failed to save text.",
          description: "You must connect to an input first.",
        });
        return;
      }
      toast({
        title: "Saving your text...",
        description: "This might takes a few seconds.",
      });

      const presignedUrl = await getS3PresignedUrl(
        workflowId,
        data.output[0].key,
        "putObject"
      );

      // Create a new Blob from the file with the correct MIME type
      const blob = new Blob([textValue], { type: `text/plain; charset=utf-8` });

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
  };

  return (
    <ContextMenuWrapper
      triggerElement={
        <div className="shadow-md rounded-md border-2 border-stone-400 w-[400px] h-40 relative">
          <p
            className="text-center absolute min-w-40 pb-2 whitespace-nowrap pointer-events-none"
            style={{
              transform: "translateX(200px) translateX(-50%) translateY(-100%)",
            }}
          >
            {data.title}
          </p>
          <InlineTextInputNodeUi
            nodeId={nodeId}
            status={data.status ?? "idle"}
            description={data.description}
            isRunning={isRunning}
            onSave={onSave}
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
export function InlineTextInputNodeUi({
  nodeId,
  status,
  description,
  isRunning = false,
  onSave,
}: {
  nodeId: string;
  status: string;
  description?: string;
  size?: number;
  isRunning: boolean;
  onSave?: (value: string) => Promise<void>;
}) {
  const { setUnsavedInlineTextInputIds } = useWorkflowContext();

  const [textValue, setTextValue] = useState("");

  const updateUnsavedStates = useDebouncedCallback(
    () => {
      setUnsavedInlineTextInputIds((ids) =>
        Array.from(new Set([...ids, nodeId]))
      );
    },
    200 // delay in milliseconds
  );

  return (
    <TooltipWrapper
      triggerElement={
        <div
          className={clsx(
            "flex flex-col gap-2 relative w-full h-full rounded-md select-none p-4",
            {
              "bg-white hover:bg-gray-100": status === "idle",
              "bg-green-100 hover:bg-green-200": status === "ready",
              "bg-gray-100 animate-pulse": status === "pending",
            }
          )}
        >
          <Textarea
            disabled={isRunning}
            placeholder="Text input here"
            value={textValue}
            onChange={(event) => {
              setTextValue(event.target.value);
              updateUnsavedStates();
            }}
            className="flex-grow"
          />
          <Button
            className="w-[120px]"
            onClick={() => {
              onSave?.(textValue);
              setUnsavedInlineTextInputIds((ids) =>
                ids.filter((id) => id !== nodeId)
              );
            }}
          >
            Save
          </Button>
        </div>
      }
      tooltipElement={<p>{description}</p>}
    />
  );
}

export function InlineTextInputNodeSelect({
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
        <TooltipWrapper
          triggerElement={
            <div className="flex justify-center items-center relative w-full h-full rounded-md select-none bg-white hover:bg-gray-100">
              <TextCursorInput
                style={{
                  width: 30,
                  height: 30,
                  color: "black",
                }}
              />
            </div>
          }
          tooltipElement={<p>{description}</p>}
        />
      </div>
      <p className="text-[10px] max-w-20 text-center">{title}</p>
    </div>
  );
}

export default memo(InlineTextInputNode);
