"use client";
import { EditorTextarea } from "@/components/ui/custom/editor-textarea";
import { useState } from "react";

export default function TestPage() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full h-full items-center justify-center">
      {/* <p className="py-10">Test 1</p>
      <p className="py-10">Test 1</p>
      <p className="py-10">Test 1</p> */}
      <div className="flex gap-10 w-full">
        {/* <div className="w-40">text 2</div> */}
        <EditorTextarea
          id="node-config-panel-gpt-4-turbo-system-message"
          placeholder="System message (Optional)"
          value={value}
          onValueChange={setValue}
          // debugMode
          inputs={[
            { index: 0, title: "Resume", type: "txt" },
            { index: 1, title: "Job description", type: "txt" },
          ]}
        />
      </div>

      {/* <p className="py-10">Test 1</p> */}
    </div>
  );
}
