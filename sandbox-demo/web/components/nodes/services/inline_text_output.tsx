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

function InlineTextOutputNode({ id: nodeId, data }: NodeData) {
  const { workflowId, setNodes, setEditingNodeId, isRunning } =
    useWorkflowContext();

  const [textValue, setTextValue] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    (async () => {
      if (data.status === "ready") {
        if (!data.input[0].key || fetched.current) {
          return;
        }
        try {
          fetched.current = true;

          // 1. Get the pre-signed URL
          const presignedUrl = await getS3PresignedUrl(
            workflowId,
            data.input[0].key,
            "getObject" // Changed from putObject to getObject
          );
          console.log(`presignedUrl = ${presignedUrl}`);

          // 2. Fetch the object from S3 using the pre-signed URL
          const response = await fetch(presignedUrl, { cache: "no-store" });

          console.log(response);
          if (!response.ok) {
            fetched.current = false;
            throw new Error("Failed to fetch the file from S3.");
          }
          const blob = await response.blob();

          // 3. Write that blob to text, and update textValue
          const text = await blob.text();

          fetched.current = false;
          setTextValue(text);
        } catch (error) {
          fetched.current = false;
          console.error(error);
        }
      } else {
        fetched.current = false;
        setTextValue("");
      }
    })();
  }, [data.input, data.status, workflowId]);

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
          <InlineTextOutputNodeUi
            nodeId={nodeId}
            status={data.status ?? "idle"}
            description={data.description}
            textValue={textValue}
          />

          <TooltipWrapper
            triggerElement={
              <Handle
                id="input.0"
                type="target"
                position={Position.Left}
                className={clsx(
                  "w-6 h-6 border-2 border-stone-400 flex items-center justify-center relative"
                )}
                style={{
                  backgroundColor:
                    dataBlockBgColorMap[data.input[0]?.type ?? "txt"],
                  animation:
                    data.input[0].status === "ready"
                      ? "pulse 1s infinite"
                      : undefined,
                  boxShadow:
                    data.input[0].status === "ready"
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
                  {data.input[0].title ?? ""}
                </p>
                <MoveRight className="pointer-events-none w-4 h-4" />
              </Handle>
            }
            tooltipElement={<p>{data.input[0].description ?? ""}</p>}
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
export function InlineTextOutputNodeUi({
  nodeId,
  status,
  description,
  textValue,
}: {
  nodeId: string;
  status: string;
  description?: string;
  size?: number;
  textValue: string;
}) {
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
            disabled
            placeholder="Text input here"
            value={textValue}
            className="flex-grow"
          />
          <Button
            className="w-[120px]"
            onClick={() => {
              navigator.clipboard.writeText(textValue);
              toast({
                title: "Copied to textboard",
              });
            }}
          >
            Copy
          </Button>
        </div>
      }
      tooltipElement={<p>{description}</p>}
    />
  );
}

export function InlineTextOutputNodeSelect({
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

export default memo(InlineTextOutputNode);
