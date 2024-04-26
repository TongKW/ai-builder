import { Plus } from "lucide-react";
import { Button } from "../button";

export function SmallAddButton(props: { onClick?: () => void }) {
  const { onClick } = props;

  return (
    <Button
      size="icon"
      className="shadow-sm h-[20px] w-[20px] rounded-full bg-green-500 hover:bg-green-700 active:bg-green-400"
      onClick={onClick}
    >
      <Plus className="h-[14px] w-[14px]" color="#ffffff" />
    </Button>
  );
}
