import clsx from "clsx";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { NodeData } from "../../data";
import { dataBlockBgColorMap } from "@/lib/constants/data-io-property";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { ContextMenuWrapper } from "@/components/ui/context-menu-wrapper";

function Gpt4Turbo2InputsNode({ id: nodeId, data }: NodeData) {
  const { setEditingNodeId } = useWorkflowContext();

  return (
    <ContextMenuWrapper
      triggerElement={
        <div className="rounded-md border-2 border-stone-400 w-40 h-40 relative moving-border">
          <p
            className="text-center absolute top-0 pb-2 whitespace-nowrap pointer-events-none"
            style={{
              transform: "translateX(80px) translateX(-50%) translateY(-100%)",
            }}
          >
            {data.title}
          </p>
          <Gpt4Turbo2InputsNodeUi
            status={data.status ?? "idle"}
            description={data.description}
          />

          {/** Input.0 */}
          <TooltipWrapper
            triggerElement={
              <Handle
                id="input.0"
                type="target"
                position={Position.Left}
                className="w-6 h-6 border-2 border-stone-400 flex items-center justify-center relative"
                style={{
                  transform: "translateY(-30px)",
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
                    transform: "translateY(-70%)",
                  }}
                >
                  {data.input[0].title ?? ""}
                </p>
                <MoveRight className="pointer-events-none w-4 h-4" />
              </Handle>
            }
            tooltipElement={<p> {data.input[0].description ?? ""}</p>}
          />

          {/** Input.1 */}
          <TooltipWrapper
            triggerElement={
              <Handle
                id="input.1"
                type="target"
                position={Position.Left}
                className="w-6 h-6 border-2 border-stone-400 flex items-center justify-center relative bottom-10"
                style={{
                  transform: "translateY(10px)",
                  backgroundColor:
                    dataBlockBgColorMap[data.input[1]?.type ?? "txt"],
                  animation:
                    data.input[1].status === "ready"
                      ? "pulse 1s infinite"
                      : undefined,
                  boxShadow:
                    data.input[1].status === "ready"
                      ? "0 0 20px rgba(252, 211, 77, 1.0)"
                      : undefined,
                }}
              >
                <p
                  className="text-center text-[8px] absolute top-0 pb-2 whitespace-nowrap pointer-events-none"
                  style={{
                    transform: "translateY(-70%)",
                  }}
                >
                  {data.input[1].title ?? ""}
                </p>
                <MoveRight className="pointer-events-none w-4 h-4" />
              </Handle>
            }
            tooltipElement={<p> {data.input[1].description ?? ""}</p>}
          />

          {/** output.0 */}
          <TooltipWrapper
            triggerElement={
              <Handle
                id="output.0"
                type="source"
                position={Position.Right}
                className="w-6 h-6 !bg-white border-2 border-stone-400 flex items-center justify-center relative"
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
            tooltipElement={<p> {data.output[0].description ?? ""}</p>}
          />
        </div>
      }
      contextMenuElement={
        <ContextMenuItem
          className="cursor-pointer"
          onClick={() => {
            console.log(`setEditingNodeId: ${nodeId}`);
            setEditingNodeId(nodeId);
          }}
        >
          Configuration
        </ContextMenuItem>
      }
    />
  );
}

export function Gpt4Turbo2InputsNodeUi({
  status,
  description,
  size = 80,
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
            "flex justify-center items-center relative w-full h-full rounded-md",
            {
              "bg-white hover:bg-gray-100": status === "idle",
              "bg-green-100 hover:bg-green-200": status === "ready",
              "bg-gray-100 animate-pulse": status === "pending",
            }
          )}
        >
          <Image
            width={size}
            height={size}
            src={"/node_icons/gpt_4_turbo.png"}
            alt="gpt_4_turbo"
          />
        </div>
      }
      tooltipElement={<p>{description}</p>}
    />
  );
}

export function Gpt4Turbo2InputsNodeSelect({
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
        <Gpt4Turbo2InputsNodeUi status="idle" size={40} />
      </div>
      <p className="text-[10px] max-w-20 text-center">{title}</p>
    </div>
  );
}

export default memo(Gpt4Turbo2InputsNode);
