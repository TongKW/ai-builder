"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { CloudUpload } from "lucide-react";
import { saveWorkflow } from "@/lib/api/save-workflow";
import { toast } from "../ui/use-toast";
import { Spinner } from "../icons/spinner";

export function SavePanel({
  isEdited,
  setEdited,
  workflowId,
  workflowSrc,
  nodes,
  edges,
}: {
  isEdited: boolean;
  setEdited: (edited: boolean) => void;
  workflowId: string;
  workflowSrc: string;
  nodes: any[];
  edges: any[];
}) {
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    try {
      setLoading(true);

      await saveWorkflow({ workflowId, workflowSrc, nodes, edges });

      console.log({ workflowId, workflowSrc, nodes, edges });
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
        className="z-[99999] fixed top-[30px] right-[30px] shadow-lg"
        onClick={onSave}
        disabled={!isEdited}
      >
        <CloudUpload className="h-4 w-4" />
        {loading ? (
          <Spinner classes="absolute top-1 right-1" size={3} />
        ) : (
          isEdited && (
            <span
              style={{
                height: "10px",
                width: "10px",
                backgroundColor: "red",
                borderRadius: "50%",
                position: "absolute",
                top: 3,
                right: 3,
              }}
            ></span>
          )
        )}
      </Button>
    </>
  );
}
