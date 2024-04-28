"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "../textarea";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

export function EditorTextarea({
  id,
  placeholder,
  value,
  onValueChange,
  debugMode = false,
  inputs = [],
}: {
  id: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  debugMode?: boolean;
  inputs?: {
    order: number;
    title: string;
    type: string;
  }[];
}) {
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 });
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorDivRef = useRef<HTMLDivElement>(null);
  const parentDivRef = useRef<HTMLDivElement>(null);

  // TODO: create a ref to track the last typed position in the text area
  const lastTypedPosition = useRef(0);

  useEffect(() => {
    // adjusts area height whenever the value changes
    adjustTextareaHeight();
    // update the last typed position
    lastTypedPosition.current = textareaRef.current?.selectionStart ?? 0;
  }, [value]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    const parentDiv = parentDivRef.current;

    if (!textarea) return;
    // Reset the height to 'auto' to reduce the height when deleting text
    textarea.style.height = "auto";
    // Set the height to the scrollHeight to expand as needed
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (!parentDiv) return;
    // Also adjust the parent div's height to match the updated textarea height
    parentDiv.style.height = `${textarea.scrollHeight}px`;
  };

  const onInsertInput = (index: number) => {
    const currentText = value;
    const before = currentText.substring(0, lastTypedPosition.current - 1); // Remove the "/" character
    const after = currentText.substring(lastTypedPosition.current);
    const newText = `${before}{{ input.${index} }}${after}`;
    onValueChange(newText);
    setCommandMenuOpen(false); // Close the dropdown menu
  };
  const updateCaretPosition = () => {
    const textarea = textareaRef.current;
    const mirrorDiv = mirrorDivRef.current;

    if (!textarea || !mirrorDiv) return;

    const text = textarea.value.substr(0, textarea.selectionStart);
    const content = text.replace(/\n/g, "<br>") + "<span></span>";
    mirrorDiv.innerHTML = content;

    const span = mirrorDiv.querySelector("span");

    if (!span) return;

    const rect = span.getBoundingClientRect();
    // const textareaRect = textarea.getBoundingClientRect();

    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY;

    setCaretPosition({ x, y });
  };

  useEffect(() => {
    const handleResize = () => {
      updateCaretPosition();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={parentDivRef} className="relative w-full">
      <DropdownMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
        <DropdownMenuContent
          className="w-56 z-[9999999]"
          id="test"
          style={{
            position: "fixed",
            top: `${caretPosition.y}px`,
            left: `${caretPosition.x}px`,
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Inputs</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {inputs.map((input, index) => (
              <DropdownMenuItem
                className="cursor-pointer"
                key={`menu-item-${index}`}
                onClick={() => onInsertInput(input.order)}
              >
                {input.title}
                <DropdownMenuShortcut>{input.type}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Textarea
        ref={textareaRef}
        id={id}
        rows={10}
        cols={50}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyUp={(event) => {
          updateCaretPosition();
          if (event.key === "/") {
            setCommandMenuOpen(true);
          }
        }}
        onClick={updateCaretPosition}
        className="absolute"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "20px",
          padding: "8px 12px",
          resize: "none",
        }}
      />
      <div
        ref={mirrorDivRef}
        className={clsx("absolute whitespace-pre-wrap pointer-events-none", {
          invisible: !debugMode,
        })}
        style={{
          width: textareaRef.current
            ? `${textareaRef.current.offsetWidth}px`
            : "auto",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "20px",
          padding: "8px 12px 8px 12px",
        }}
      />
      <p className={clsx("absolute z-[999]", { invisible: !debugMode })}>
        Caret Position - X: {caretPosition.x}, Y: {caretPosition.y}
      </p>
    </div>
  );
}
