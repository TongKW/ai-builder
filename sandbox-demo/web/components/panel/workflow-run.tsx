"use client";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { toast } from "../ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "../ui/input";
import { airtableInsertUser } from "@/lib/api/airtable-insert-user";

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
  const [dialogOpen, setDialogOpen] = useState(false);

  const onClick = () => {
    const userRegistered = localStorage.getItem(
      "pipeline-ai-builder-user-registered"
    );
    if (userRegistered === "true") {
      onRun();
    } else {
      setDialogOpen(true);
    }
  };

  const onRun = async () => {
    if (isRunning) return;

    setRunning(true);

    // airtableInsertUser

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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <UserRegisterDialog
          onSuccess={() => {
            localStorage.setItem("pipeline-ai-builder-user-registered", "true");
            setDialogOpen(false);
            onRun();
          }}
        />
      </Dialog>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[30px] right-[30px] shadow-lg"
        onClick={onClick}
        disabled={isRunning}
      >
        <Play className="h-4 w-4" />
      </Button>
    </>
  );
}

function UserRegisterDialog(props: { onSuccess: () => void }) {
  const { onSuccess } = props;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError("");

    if (!email) {
      setLoading(false);
      setError("Email cannot be empty.");
      return;
    }
    if (!validateEmailFormat(email)) {
      setLoading(false);
      setError("Invalid email format.");
      return;
    }

    try {
      await airtableInsertUser(email, name);
      setLoading(false);
      onSuccess();
      return;
    } catch (error) {
      setLoading(false);
      onSuccess();
      return;
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="mb-4">
            To run ai pipeline in sandbox mode, please let us know your email
            and name :D
          </p>
          <p>Email</p>
          <Input
            placeholder="Your Email"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />

          <p>Name</p>
          <Input
            placeholder="Your Name (Optional)"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />

          <Button
            className="w-[120px] h-[40px] mt-6"
            disabled={loading}
            onClick={onSubmit}
          >
            Submit
          </Button>

          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </DialogHeader>
    </DialogContent>
  );
}

function validateEmailFormat(email: string): boolean {
  const valid = Boolean(
    String(email).match(
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    )
  );

  return valid;
}
