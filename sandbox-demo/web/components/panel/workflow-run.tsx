"use client";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { toast } from "../ui/use-toast";

export function WorkflowRunPanel({
  isRunning,
  isEdited,
  setEdited,
  setRunning,
  onWorkflowRun,
  onWorkflowSave,
}: {
  isRunning: boolean;
  isEdited: boolean;
  setEdited: (edited: boolean) => void;
  setRunning: (running: boolean) => void;
  onWorkflowRun: () => Promise<void>;
  onWorkflowSave: () => Promise<void>;
}) {
  const onSave = async () => {
    if (isRunning) return;

    setRunning(true);

    // 1. Check if there is any unsaved changes. If so, save it first
    if (isEdited) {
      try {
        await onWorkflowSave();

        // Success
        toast({
          title: "Workflow successfully saved.",
          description: "The workflow is now being ran.",
        });
        setEdited(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Please try to run workflow later.",
        });
        setRunning(false);
      }
    } else {
      toast({
        title: "Workflow started.",
        description: "The workflow is now being ran.",
      });
    }

    // 2. Run the workflow.
    try {
      await onWorkflowRun();

      // Success
      toast({
        title: "Workflow started.",
        description: "The workflow is now being ran.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please try to run workflow later.",
      });
      setRunning(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[30px] right-[30px] shadow-lg"
        onClick={onSave}
        disabled={isRunning}
      >
        <Play className="h-4 w-4" />
      </Button>
    </>
  );
}
