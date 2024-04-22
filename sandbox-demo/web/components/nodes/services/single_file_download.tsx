import clsx from "clsx";
import { Download, MoveDown } from "lucide-react";
import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dataBlockBgColorMap } from "@/lib/constants/data-io-property";
import { NodeData } from "../data";
import { getS3PresignedUrl } from "@/lib/nodes/infra/s3-data-io";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";
import { toast } from "@/components/ui/use-toast";

function SingleFileDownloadNode({ data }: NodeData) {
  const { workflowId } = useWorkflowContext();

  const onDownload = async () => {
    if (!data.input[0].key) {
      toast({
        title: "Failed to download file.",
        description: "File doesn't exist.",
      });
      return;
    }

    try {
      toast({
        title: "Downloading file...",
        description: "The process will be finished in few seconds.",
      });

      // 1. Get the pre-signed URL
      const presignedUrl = await getS3PresignedUrl(
        workflowId,
        data.input[0].key,
        "getObject" // Changed from putObject to getObject
      );
      console.log(`presignedUrl = ${presignedUrl}`);

      // 2. Fetch the object from S3 using the pre-signed URL
      const response = await fetch(presignedUrl);

      console.log(response);
      if (!response.ok) throw new Error("Failed to fetch the file from S3.");
      const blob = await response.blob();

      // 3. Automatically download the file to the client's PC
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.input[0].key.split("/").pop() ?? ""; // Suggesting a filename from the key
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "File has been downloaded successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the file. Please try again later.",
      });
    }
  };
  return (
    <div
      className="shadow-md rounded-md border-2 border-stone-400 w-40 h-40 relative"
      onClick={onDownload}
    >
      <p
        className="text-center absolute pb-2 whitespace-nowrap pointer-events-none"
        style={{
          transform: "translateX(80px) translateX(-50%) translateY(-100%)",
        }}
      >
        {data.title}
      </p>

      <SingleFileDownloadNodeUi
        status={data.status ?? "idle"}
        description={data.description}
      />

      <Handle
        id="input.0"
        type="target"
        position={Position.Top}
        className="w-6 h-6 border-2 border-stone-400 flex items-center justify-center"
        style={{
          backgroundColor: dataBlockBgColorMap[data.input[0]?.type ?? "txt"],
          animation:
            data.input[0].status === "ready" ? "pulse 1s infinite" : undefined,
          boxShadow:
            data.input[0].status === "ready"
              ? "0 0 20px rgba(252, 211, 77, 1.0)"
              : undefined,
        }}
      >
        <MoveDown className="pointer-events-none w-4 h-4" />
      </Handle>
    </div>
  );
}

export function SingleFileDownloadNodeUi({
  status,
  description,
  size = 60,
}: {
  status: string;
  description?: string;
  size?: number;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={clsx(
              "flex justify-center items-center relative w-full h-full rounded-md hover:bg-gray-100",
              {
                "bg-white": status === "idle",
                "bg-green-100": status === "ready",
                "bg-gray-100 animate-pulse": status === "pending",
              }
            )}
          >
            <Download
              style={{
                width: size,
                height: size,
                color: "black",
              }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SingleFileDownloadNodeSelect({
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
        <SingleFileDownloadNodeUi status="idle" size={30} />
      </div>
      <p className="text-[10px] max-w-20 text-center">{title}</p>
    </div>
  );
}

export default memo(SingleFileDownloadNode);
