import { useState } from "react";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { RotateCcw } from "lucide-react";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";

export function WorkflowStatusResetPanel({
  isRunning,
  setEdited,
}: {
  isRunning: boolean;
  setEdited: (edited: boolean) => void;
}) {
  const { setNodes } = useWorkflowContext();

  const onReset = async () => {
    if (isRunning) return;

    setNodes((nodes: any[]) => {
      return nodes.map((node) => {
        if (node.data.locked) {
          return node; // If node is locked, return it as is without changing the status.
        }

        // Update node's main status if not locked
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            status: "idle",
            input: node.data.input.map((input: any) => {
              if (input.locked) return input;
              return { ...input, status: "idle" };
            }),
            output: node.data.output.map((output: any) => {
              if (output.locked) return output;
              return { ...output, status: "idle" };
            }),
          },
        };
        return updatedNode;
      });
    });

    setEdited(true);

    // Success
    toast({
      title: "Successfully reset data status.",
      description:
        "All non-locked data status has been reset. Please save to cloud if you confirm the changes.",
    });
  };
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[180px] right-[30px] shadow-lg"
        onClick={onReset}
        disabled={isRunning}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </>
  );
}
