import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function ContextMenuWrapper({
  triggerElement,
  contextMenuElement,
}: {
  triggerElement: React.ReactNode;
  contextMenuElement: React.ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{triggerElement}</ContextMenuTrigger>
      <ContextMenuContent>{contextMenuElement}</ContextMenuContent>
    </ContextMenu>
  );
}
