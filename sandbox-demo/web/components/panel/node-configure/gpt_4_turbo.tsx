"use client";

import { SmallAddButton } from "@/components/ui/custom/small-add-button";
import { SmallDeleteButton } from "@/components/ui/custom/small-delete-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BotMessageSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function Gpt4TurboConfigArea(props: { node: any }) {
  const { node } = props;

  const [gpt4TurboParameters, setGpt4TurboParameters] = useState<{
    systemMessage: string;
    messages: {
      role: string;
      content: string;
    }[];
  }>({
    systemMessage: "",
    messages: [],
  });

  const generateParameters = (
    responseFormatType: string,
    systemMessage: string,
    messages: {
      role: string;
      content: string;
    }[]
  ): string => {
    return JSON.stringify({
      responseFormatType,
      messages: systemMessage
        ? [
            {
              role: "system",
              content: systemMessage,
            },
            ...messages,
          ]
        : messages,
    });
  };

  // update value debounce function
  const debouncedUpdate = useDebouncedCallback(
    () => {
      const parameters = generateParameters(
        node?.data?.parameters?.responseFormatType ?? "text",
        gpt4TurboParameters.systemMessage,
        gpt4TurboParameters.messages
      );

      try {
        // 1. Find the input element with the specified id
        const inputElement = document.getElementById(
          `node-config-panel-gpt-4-turbo-parameters-input`
        );

        // 2. Check if the element exists and is an input, then update input field
        if (inputElement && inputElement instanceof HTMLInputElement) {
          inputElement.value = parameters;
        }
      } catch (error) {
        console.log(error);
      }
    },
    100 // delay in milliseconds
  );

  // Effect that triggers the debounced function on changes to nodes or edges
  useEffect(() => {
    debouncedUpdate();
  }, [
    gpt4TurboParameters.messages,
    gpt4TurboParameters.systemMessage,
    node?.data?.parameters?.responseFormatType,
    debouncedUpdate,
  ]);

  useEffect(() => {
    if (!node) return;
    gpt4TurboLoadDataToInput(node);

    function gpt4TurboLoadDataToInput(node: any) {
      if (node.type === "gpt_4_turbo") {
        let systemMessage = "";
        let messages = [];

        if (!node.parameters) return;

        const allMessages = node.parameters.messages;
        if (allMessages) {
          if (allMessages[0]?.role === "system") {
            systemMessage = allMessages[0]?.content ?? "";
            messages = allMessages.slice(1);
          } else {
            messages = allMessages;
          }
        }
        setGpt4TurboParameters({
          systemMessage,
          messages,
        });
      }
    }
  }, [node]);

  return (
    <div className="flex flex-col pt-2 gap-2">
      <p className="font-semibold">gpt_4_turbo parameters</p>

      <Input
        id={`node-config-panel-gpt-4-turbo-parameters-input`}
        value={generateParameters(
          node?.data?.parameters?.responseFormatType ?? "text",
          gpt4TurboParameters.systemMessage,
          gpt4TurboParameters.messages
        )}
        className="hidden"
      />

      {/*
      <p className="">response format</p>
      <RadioGroup
        defaultValue={
          currentNode?.data?.parameters?.responseFormatType ?? "text"
        }
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="text" id="r1" disabled />
          <Label htmlFor="r1" className="text-xs text-gray-400">
            Text
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="json" id="r2" disabled />
          <Label htmlFor="r2" className="text-xs text-gray-400">
            JSON Object
          </Label>
        </div>
      </RadioGroup> 
      */}

      <p className="">system message</p>
      {/** System message */}
      <Textarea
        id="node-config-panel-gpt-4-turbo-system-message"
        placeholder="System message (Optional)"
        value={gpt4TurboParameters.systemMessage ?? ""}
        onChange={(event) => {
          const textValue = event.target.value;
          setGpt4TurboParameters((parameters) => {
            return {
              systemMessage: textValue,
              messages: parameters.messages,
            };
          });
        }}
      />

      {/** User message */}
      {gpt4TurboParameters.messages.map((message, index) => {
        if (message.role === "user") {
          return (
            <Gpt4TurboUserMessageBlock
              key={index}
              index={index}
              initContent={message.content}
              setGpt4TurboParameters={setGpt4TurboParameters}
            />
          );
        } else {
          return (
            <Gpt4TurboAssistantMessageBlock
              key={index}
              index={index}
              initContent={message.content}
              setGpt4TurboParameters={setGpt4TurboParameters}
            />
          );
        }
      })}

      <div className="w-full justify-center flex gap-3">
        <SmallAddButton onClick={addUserMessages} />
        {gpt4TurboParameters.messages.length ? (
          <SmallDeleteButton onClick={deleteUserMessages} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );

  function addUserMessages() {
    setGpt4TurboParameters((parameters) => {
      const newMessages = parameters.messages.length
        ? // For few-shot
          [
            {
              role: "assistant",
              content: "",
            },
            {
              role: "user",
              content: "",
            },
          ]
        : // For zero-shot
          [
            {
              role: "user",
              content: "",
            },
          ];
      return {
        systemMessage: parameters.systemMessage,
        messages: [...parameters.messages, ...newMessages],
      };
    });
  }

  function deleteUserMessages() {
    setGpt4TurboParameters((parameters) => {
      return {
        systemMessage: parameters.systemMessage,
        messages: parameters.messages.slice(0, -2),
      };
    });
  }
}

export function Gpt4TurboUserMessageBlock(props: {
  index: number;
  initContent: string;
  setGpt4TurboParameters: React.Dispatch<
    React.SetStateAction<{
      systemMessage: string;
      messages: {
        role: string;
        content: string;
      }[];
    }>
  >;
}) {
  const { index, initContent, setGpt4TurboParameters } = props;
  return (
    <div className="flex gap-2 items-start">
      <Textarea
        id={`node-config-panel-gpt-4-turbo-user-messages-${index}`}
        placeholder="User message here"
        value={initContent}
        onChange={(event) => {
          const textValue = event.target.value;
          setGpt4TurboParameters((parameters) => {
            return {
              systemMessage: parameters.systemMessage,
              messages: parameters.messages.map((message, i) => {
                if (i !== index) return message;
                return { ...message, content: textValue };
              }),
            };
          });
        }}
      />
      <div className="rounded-sm shadow-sm flex items-center justify-center pt-2 h-5 w-5">
        <User />
      </div>
    </div>
  );
}

export function Gpt4TurboAssistantMessageBlock(props: {
  index: number;
  initContent: string;
  setGpt4TurboParameters: React.Dispatch<
    React.SetStateAction<{
      systemMessage: string;
      messages: {
        role: string;
        content: string;
      }[];
    }>
  >;
}) {
  const { index, initContent, setGpt4TurboParameters } = props;
  return (
    <div className="flex gap-2 items-start">
      <div className="rounded-sm shadow-sm flex items-center justify-center pt-2 h-5 w-5">
        <BotMessageSquare />
      </div>
      <Textarea
        id={`node-config-panel-gpt-4-turbo-user-messages-${index}`}
        value={initContent}
        placeholder="Assistant message here"
        onChange={(event) => {
          const textValue = event.target.value;
          setGpt4TurboParameters((parameters) => {
            return {
              systemMessage: parameters.systemMessage,
              messages: parameters.messages.map((message, i) => {
                if (i !== index) return message;
                return { ...message, content: textValue };
              }),
            };
          });
        }}
      />
    </div>
  );
}
