import { Minus, Trash } from "lucide-react";
import { Button } from "../button";

export function SmallDeleteButton(props: { onClick?: () => void }) {
  const { onClick } = props;

  return (
    <Button
      size="icon"
      className="shadow-sm h-[20px] w-[20px] rounded-full bg-red-500 hover:bg-red-700 active:bg-red-400"
      onClick={onClick}
    >
      <Minus className="h-[14px] w-[14px]" color="#ffffff" />
    </Button>
  );
}
