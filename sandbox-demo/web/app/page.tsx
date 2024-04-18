"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  updateEdge,
  ConnectionLineType,
} from "reactflow";

import "reactflow/dist/base.css";

import Gpt4TurboNode from "@/components/nodes/services/gpt_4_turbo";
import SingleFileUploadNode from "@/components/nodes/services/single_file_upload";
import SingleFileDownloadNode from "@/components/nodes/services/single_file_download";

const nodeTypes = {
  gpt_4_turbo: Gpt4TurboNode,
  single_file_upload: SingleFileUploadNode,
  single_file_download: SingleFileDownloadNode,
};

export default function App() {
  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
  };

  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "gpt_4_turbo",
      data: {
        title: "Translation (English -> Traditional Chinese)",
        description: "Translate text from English to Traditional Chinese.",
        category: "Text Processing",
        status: "idle",
      },
      position: { x: 0, y: 0 },
    },
    {
      id: "2",
      type: "gpt_4_turbo",
      data: {
        title: "Translation (English -> Traditional Chinese)",
        description: "Translate text from English to Traditional Chinese.",
        category: "Text Processing",
        status: "pending",
      },
      position: { x: 50, y: 10 },
    },
    {
      id: "3",
      type: "single_file_upload",
      data: {
        title: "File Upload",
        description: "Upload and store a file.",
        category: "Data Input/Ouput",
        status: "ready",
      },
      position: { x: 23, y: 49 },
    },
    {
      id: "4",
      type: "single_file_download",
      data: {
        title: "File Download",
        description: "Download the file.",
        category: "Data Input/Ouput",
        status: "idle",
      },
      position: { x: 30, y: 30 },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge: any, newConnection: any) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_: any, edge: any) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  return (
    <main className="flex max-h-screen max-w-screen flex-col items-center justify-between">
      <div className="flex flex-col w-screen h-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          // fitView
          // contentEditable={} // turn to false when workflow is running
          className="bg-teal-50 h-100 w-100"
        >
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
