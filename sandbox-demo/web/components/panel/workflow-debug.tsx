"use client";

import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";

// Import the theme and mode for YAML from Ace
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-monokai";
import { Button } from "../ui/button";
import { FileCode } from "lucide-react";

const initYaml = `nodes: []\nedges:[]`;

export function WorkflowDebugPanel({
  yamlSrc = initYaml,
}: {
  yamlSrc: string;
}) {
  const [yamlContent, setYamlContent] = useState(initYaml);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    setYamlContent(yamlSrc);
  }, [yamlSrc]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed bottom-[30px] right-[30px] shadow-lg"
        onClick={toggleSidebar}
      >
        <FileCode className="h-4 w-4" />
      </Button>
      <div
        className={`bg-white w-[35%] w-40 h-full p-5 z-[999] fixed inset-y-0 right-0 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-md`}
      >
        <h2 className="text-sm mb-4 font-semibold">configuration file</h2>
        <AceEditor
          mode="yaml"
          theme="monokai"
          name="yamlEditor"
          value={yamlContent}
          fontSize={10}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
          style={{ width: "100%", height: "90%" }}
        />
      </div>
    </>
  );
}
