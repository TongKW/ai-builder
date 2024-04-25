import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TooltipWrapper({
  triggerElement,
  tooltipElement,
}: {
  triggerElement: React.ReactNode;
  tooltipElement: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{triggerElement}</TooltipTrigger>
        <TooltipContent>{tooltipElement}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
