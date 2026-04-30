import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { OperationWithAssignment } from "../../types/OperationWithAssignment";

interface ToggleButtonProps {
  readonly data: OperationWithAssignment;
  readonly onToggle: (op: OperationWithAssignment) => void;
}

export function ToggleButton({ data, onToggle }: ToggleButtonProps) {
  const handleClick = useCallback(() => onToggle(data), [data, onToggle]);
  return (
    <Button
      size="sm"
      variant={data.assigned ? "danger" : "primary"}
      onClick={handleClick}
    >
      {data.assigned ? "Quitar" : "Asignar"}
    </Button>
  );
}

ToggleButton.displayName = "ToggleButton";
