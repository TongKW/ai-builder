"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  updateEdge,
} from "reactflow";
import "reactflow/dist/base.css";

import { useDebouncedCallback } from "use-debounce";
import { NodeSidePanel } from "@/components/panel/node-select";
import { reactFlowNodeTypes } from "@/components/nodes/data";
import { validateEdge } from "@/lib/nodes/flow-graph/validate-edge";
import { assignNodesDataIO } from "@/lib/nodes/flow-graph/nodes-data-io";
import { reactFlowToYaml } from "@/lib/parser/react-flow-to-yaml";
import { WorkflowDebugPanel } from "@/components/panel/workflow-debug";
import { WorkflowSavePanel } from "@/components/panel/workflow-save";
import { WorkflowRunPanel } from "@/components/panel/workflow-run";
import { saveWorkflow } from "@/lib/api/save-workflow";
import { sleep } from "@/lib/functions/sleep";
import WorkflowContext from "../../../../lib/contexts/workflow-context";
import { getWorkflow } from "@/lib/api/get-workflow";
import { updateNodesStatus } from "@/lib/parser/update-node-status";
import { checkWorkflowRunning } from "@/lib/parser/check-workflow-running";
import { runWorkflow } from "@/lib/api/run-workflow";
import { toast } from "@/components/ui/use-toast";

export default function Workflow({
  workflowId,
  initWorkflowSrc,
  initNodes,
  initEdges,
}: {
  workflowId: string;
  initWorkflowSrc: string;
  initNodes: any[];
  initEdges: any[];
}) {
  const defaultEdgeOptions = {
    animated: true,
    type: "bazier",
  };

  const edgeUpdateSuccessful = useRef(true);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [workflowSrc, setWorkflowSrc] = useState(initWorkflowSrc);

  const [isEdited, setEdited] = useState(false);
  const [isRunning, setRunning] = useState(false);

  const onWorkflowRun = async () => {
    setRunning(true); // Set isRunning state to true to indicate the workflow is running

    // 1. Push to trigger pipeline run queue
    try {
      await runWorkflow(workflowId);
    } catch (error) {
      console.log(`runWorkflow error: `, runWorkflow);
    }

    // 2. Trigger a poll to keep update states
    const pollInterval = setInterval(async () => {
      try {
        const { workflowSrc: updatedWorkflowSrc } = await getWorkflow(
          workflowId
        );
        console.log(`updatedWorkflowSrc = `, updatedWorkflowSrc);
        const updatedNodes = updateNodesStatus(nodes, updatedWorkflowSrc);

        setNodes(updatedNodes);
        setWorkflowSrc(updatedWorkflowSrc);

        if (!checkWorkflowRunning(updatedWorkflowSrc)) {
          clearInterval(pollInterval); // Stop polling when the workflow is not running anymore
          setRunning(false); // Reset the running state
          toast({
            title: "Finished workflow.",
            description: "You can click on output block to download file.",
          });
        }
      } catch (error) {
        console.error("Error during workflow status polling:", error);
        clearInterval(pollInterval);
        setRunning(false); // Ensure running state is reset on error
      }
    }, 2500); // Adjust polling interval as needed
  };

  const onWorkflowSave = async () => {
    await saveWorkflow({ workflowId, workflowSrc, nodes, edges });
  };

  // Create a debounced function that will be called after 1 second of inactivity
  const debouncedUpdate = useDebouncedCallback(
    () => {
      console.log(
        "Debounced function called with latest nodes and edges",
        nodes,
        edges
      );
      // Implement the logic you want to execute after the debounce period here.
      const yamlStr = reactFlowToYaml(nodes, edges);
      setWorkflowSrc(yamlStr);

      // update unsaved changes
      if (
        isEqual(nodes, initNodes) &&
        isEqual(edges, initEdges) &&
        yamlStr === initWorkflowSrc
      ) {
        return;
      }
      setEdited(true);
    },
    500 // delay in milliseconds
  );

  // Effect that triggers the debounced function on changes to nodes or edges
  useEffect(() => {
    if (isRunning) return;
    debouncedUpdate();
  }, [isRunning, nodes, edges, debouncedUpdate]);

  const onConnect = useCallback(
    (params: any) => {
      if (validateEdge(nodes, edges, params)) {
        // 1. generate and assign a data id corresponding to the two ends of the connection
        setNodes((nodes) => assignNodesDataIO(nodes, params));

        // 2. update edges
        setEdges((eds) => {
          return addEdge(params, eds);
        });
      }
    },
    [nodes, edges, setEdges, setNodes]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: any, newConnection: any) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onEdgeUpdateEnd = useCallback(
    (_: any, edge: any) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeUpdateSuccessful.current = true;
    },
    [setEdges]
  );

  return (
    <WorkflowContext.Provider value={{ workflowId, setWorkflowSrc, setNodes }}>
      <div className="flex flex-col w-screen h-screen">
        <NodeSidePanel
          onNodeCreate={(node: any) => {
            setNodes((nodes) => [...nodes, node]);
          }}
        />
        <WorkflowDebugPanel yamlSrc={workflowSrc} />
        <WorkflowRunPanel
          isRunning={isRunning}
          isEdited={isEdited}
          setEdited={setEdited}
          setRunning={setRunning}
          onWorkflowRun={onWorkflowRun}
          onWorkflowSave={onWorkflowSave}
        />
        <WorkflowSavePanel
          isRunning={isRunning}
          isEdited={isEdited}
          setEdited={setEdited}
          onWorkflowSave={onWorkflowSave}
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
          contentEditable={!isRunning}
          nodesConnectable={!isRunning}
          nodesDraggable={!isRunning}
          className="bg-teal-50 h-100 w-100"
        >
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </WorkflowContext.Provider>
  );
}
