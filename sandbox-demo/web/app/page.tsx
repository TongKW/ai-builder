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
  EdgeChange,
  NodeChange,
} from "reactflow";

import "reactflow/dist/base.css";

import { useDebouncedCallback } from "use-debounce";
import { NodeSidePanel } from "@/components/nodes/panel";
import { reactFlowNodeTypes } from "@/components/nodes/data";
import { validateEdge } from "@/components/nodes/utils/validateEdge";
import { assignNodesDataIO } from "@/components/nodes/utils/nodesDataIO";

export default function App() {
  const defaultEdgeOptions = {
    animated: true,
    type: "bazier",
  };

  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create a debounced function that will be called after 1 second of inactivity
  const debouncedUpdate = useDebouncedCallback(
    () => {
      console.log(
        "Debounced function called with latest nodes and edges",
        nodes,
        edges
      );
      // Implement the logic you want to execute after the debounce period here.
      // TODO1: generate yaml and update `unsaved` state
    },
    1000 // delay in milliseconds
  );

  // Effect that triggers the debounced function on changes to nodes or edges
  React.useEffect(() => {
    debouncedUpdate();
  }, [nodes, edges, debouncedUpdate]);

  const onConnect = useCallback(
    (params: any) => {
      if (validateEdge(nodes, params)) {
        // 1. generate and assign a data id corresponding to the two ends of the connection
        setNodes((nodes) => assignNodesDataIO(nodes, params));

        // 2. update edges
        setEdges((eds) => {
          return addEdge(params, eds);
        });
      }
    },
    [nodes, setEdges, setNodes]
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
      // 1. set edge
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));

      // 2.
      console.log(edge);
    }
    edgeUpdateSuccessful.current = true;
  }, []);

  return (
    <main className="flex max-h-screen max-w-screen flex-col items-center justify-between">
      <div className="flex flex-col w-screen h-screen">
        <NodeSidePanel
          onNodeCreate={(node: any) => setNodes((nodes) => [...nodes, node])}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onConnect={onConnect}
          nodeTypes={reactFlowNodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          // fitView
          // contentEditable={} // TODO: turn to false when workflow is running
          className="bg-teal-50 h-100 w-100"
        >
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
