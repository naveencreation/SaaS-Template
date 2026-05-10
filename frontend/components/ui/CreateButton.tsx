"use client";

import { Plus } from "lucide-react";
import { Button } from "./Button";

interface CreateButtonProps {
  label?: string;
  onClick: () => void;
}

export function CreateButton({
  label = "Create New",
  onClick,
}: CreateButtonProps) {
  return (
    <Button onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
