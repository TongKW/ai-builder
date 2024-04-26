"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { CloudUpload } from "lucide-react";
import { toast } from "../ui/use-toast";
import { Spinner } from "../icons/spinner";

export function WorkflowSavePanel({
  isRunning,
  isEdited,
  setEdited,
  onWorkflowSave,
}: {
  isRunning: boolean;
  isEdited: boolean;
  setEdited: (edited: boolean) => void;
  onWorkflowSave: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!isEdited || loading || isRunning) return;

    try {
      setLoading(true);
      await onWorkflowSave();

      // Success
      toast({
        title: "Successfully saved.",
        description: "The workflow has been sync to cloud.",
      });
      setEdited(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please try to save workflow later.",
      });
    }
  };
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[80px] right-[30px] shadow-lg"
        onClick={onSave}
        disabled={!isEdited || loading || isRunning}
      >
        <CloudUpload className="h-4 w-4" />
        {loading ? (
          <Spinner classes="absolute top-1 right-1" />
        ) : (
          isEdited && (
            <span
              style={{
                height: "8px",
                width: "8px",
                backgroundColor: "red",
                borderRadius: "50%",
                position: "absolute",
                top: 4,
                right: 4,
              }}
            ></span>
          )
        )}
      </Button>
    </>
  );
}
