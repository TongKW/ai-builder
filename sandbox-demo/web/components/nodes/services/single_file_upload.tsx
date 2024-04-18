import clsx from "clsx";
import { MoveDown, Upload } from "lucide-react";
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SingleFileUploadNode({
  data,
}: {
  data: {
    title: string;
    description: string;
    category: string;
    status: string;
  };
}) {
  return (
    <div className="shadow-md rounded-md border-2 border-stone-400 w-40 h-40 overflow-hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={clsx(
                "flex justify-center items-center relative w-full h-full",
                {
                  "bg-white": data.status === "idle",
                  "bg-amber-50": data.status === "ready",
                  "bg-gray-200 animate-pulse": data.status === "pending",
                }
              )}
            >
              <Upload className="w-10 h-10" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{data.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-6 h-6 !bg-white border-2 border-stone-400 flex items-center justify-center"
      >
        <MoveDown className="pointer-events-none w-4 h-4" />
      </Handle>
    </div>
  );
}

export default memo(SingleFileUploadNode);
