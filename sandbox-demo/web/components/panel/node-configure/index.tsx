"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { SquareFunction } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateNode } from "@/lib/nodes/flow-graph/update-node";
import { useWorkflowContext } from "@/lib/contexts/workflow-context";
import { Gpt4TurboConfigArea } from "./gpt_4_turbo";

export function NodeConfigurePanel() {
  const { nodes, setNodes, editingNodeId, setEditingNodeId } =
    useWorkflowContext();

  const [isOpen, setIsOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<any | undefined>();

  const syncFieldData = useCallback((node: any, type: "from" | "to") => {
    // 1. update node title and description
    updateFields({
      obj: node.data,
      key: "title",
      id: "node-config-panel-title-input",
      type,
    });
    updateFields({
      obj: node.data,
      key: "description",
      id: "node-config-panel-description-input",
      type,
    });

    console.log(`node = `, node);
    if (
      node?.data?.service === "single_file_download" &&
      (node?.data?.input ?? []).length
    ) {
      console.log(`isFilenameConfigurable = true`);

      updateFields({
        obj: node.data.input[0],
        key: "filename",
        id: "node-config-panel-single-download-filename",
        type,
      });
    }

    // 2. update node data io title and description
    for (const ioType of ["input", "output"]) {
      for (const [index, element] of (node.data[ioType] ?? []).entries()) {
        for (const key of ["type", "title", "description"]) {
          try {
            updateFields({
              obj: element,
              type,
              key,
              id: `node-config-panel-${ioType}-${index}-${key}-input`,
            });
          } catch (error) {
            console.log(
              "error while updating data io value from field input: ",
              error
            );
          }
        }
      }
    }
  }, []);

  const onClose = () => {
    setIsOpen(false);
    setCurrentNode(undefined);
    setEditingNodeId("");
  };

  const onSave = () => {
    const updatedNode = { ...currentNode };
    syncFieldData(updatedNode, "from");

    // check if node is gpt_4_turbo. If so, sync related data.
    if (updatedNode.data?.service === "gpt_4_turbo") {
      gpt4TurboSyncDataFromInput(updatedNode);
    }

    updateNode(updatedNode, setNodes);
    onClose();
  };

  useEffect(() => {
    if (!editingNodeId) return;
    try {
      const editingNode = nodes.find((node) => node.id === editingNodeId);
      setCurrentNode(editingNode);
      setIsOpen(true);
    } catch (error) {
      console.log(error);
    }
  }, [editingNodeId, nodes]);

  useEffect(() => {
    if (!currentNode) return;

    // update the input fields default value
    syncFieldData(currentNode, "to");
  }, [currentNode, syncFieldData]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="z-[99999] fixed top-[130px] right-[30px] shadow-lg"
        onClick={onClose}
      >
        <SquareFunction className="h-4 w-4" />
      </Button>
      <div
        className={`flex flex-col overflow-y-scroll text-xs gap-2 bg-white w-[35%] w-40 h-full p-5 z-[999] fixed inset-y-0 right-0 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-md`}
      >
        <h2 className="text-sm mb-4 font-semibold">node configuration</h2>

        <p className="font-semibold">node title</p>
        <Input id="node-config-panel-title-input" placeholder="Title" />

        <p className="pt-2 font-semibold">node description</p>
        <Input id="node-config-panel-description-input" placeholder="Title" />

        {/** if node is using "gpt_4_turbo", create a section for configure system and user message */}
        {currentNode?.data?.service === "gpt_4_turbo" ? (
          <Gpt4TurboConfigArea
            node={currentNode}
            inputs={currentNode?.data?.input ?? []}
          />
        ) : (
          <></>
        )}

        {(currentNode?.data?.input ?? []).length ? (
          <>
            <p className="pt-2 font-semibold">data input</p>
            {(currentNode?.data?.input ?? []).map((_: any, index: number) => (
              <DataIoConfigRow
                key={`data-io-config-row-input-${index}`}
                index={index}
                type="input"
              />
            ))}
          </>
        ) : (
          <></>
        )}

        {(currentNode?.data?.output ?? []).length ? (
          <>
            <p className="pt-2 font-semibold">data output</p>
            {(currentNode?.data?.output ?? []).map((_: any, index: number) => (
              <DataIoConfigRow
                key={`data-io-config-row-output-${index}`}
                index={index}
                type="output"
              />
            ))}
          </>
        ) : (
          <></>
        )}

        {currentNode?.data?.service === "single_file_download" &&
        (currentNode?.data?.input ?? []).length ? (
          <>
            <p className="pt-2 font-semibold">download filename</p>
            <div className="flex gap-2 items-center">
              <Input
                id={`node-config-panel-single-download-filename`}
                placeholder={`${(currentNode?.data?.input[0].key ?? ".")
                  .split(".")
                  .slice(0, -1)
                  .join(".")}`}
              />
              <p>{`.${(currentNode?.data?.input[0].key ?? ".")
                .split(".")
                .slice(-1)
                .join("")}`}</p>
            </div>
          </>
        ) : (
          <></>
        )}

        <Button className="mt-4" onClick={onSave}>
          Save
        </Button>
      </div>
    </>
  );

  function updateFields(args: {
    obj: any;
    key: string;
    id: string;
    type: "from" | "to";
  }) {
    try {
      const { obj, key, id, type } = args;
      // 1. Find the input element with the specified id
      const inputElement = document.getElementById(id);

      // 2. Check if the element exists and is an input
      if (inputElement && inputElement instanceof HTMLInputElement) {
        // 3. Update value
        if (type === "from") {
          obj[key] = inputElement.value;
        } else {
          inputElement.value = obj[key] ?? "";
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function DataIoConfigRow({
    index,
    type,
  }: {
    index: number;
    type: "input" | "output";
  }) {
    return (
      <div className="flex flex-col p-2 border-2 border-gray-100 rounded-md">
        <p className="text-gray-400 font-semibold">{`${type}.${index}`}</p>

        <div className="flex items-center">
          <p className="w-[100px]">type: </p>
          <Input
            disabled
            id={`node-config-panel-${type}-${index}-type-input`}
            placeholder={`${type}.${index} type`}
          />
        </div>

        <div className="flex items-center">
          <p className="w-[100px]">title: </p>
          <Input
            id={`node-config-panel-${type}-${index}-title-input`}
            placeholder={`${type}.${index} title`}
          />
        </div>

        <div className="flex items-center">
          <p className="w-[100px]">description: </p>
          <Input
            id={`node-config-panel-${type}-${index}-description-input`}
            placeholder={`${type}.${index} description`}
          />
        </div>
      </div>
    );
  }

  function gpt4TurboSyncDataFromInput(node: any) {
    try {
      let newParameter = node.parameters ?? {};

      // 1. Find the input element with the specified id
      const inputElement = document.getElementById(
        `node-config-panel-gpt-4-turbo-parameters-input`
      );

      // 2. Check if the element exists and is an input
      if (inputElement && inputElement instanceof HTMLInputElement) {
        console.log(`inputElement.value: `);
        console.log(inputElement.value);

        newParameter = { ...newParameter, ...JSON.parse(inputElement.value) };
      }
      console.log(`newParameter: `, newParameter);

      node.parameters = newParameter;
    } catch (error) {
      console.log(error);
    }
  }
}
