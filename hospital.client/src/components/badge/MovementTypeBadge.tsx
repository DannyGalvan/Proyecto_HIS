import { MovementTypeLabels } from "../../types/InventoryMovementResponse";

interface MovementTypeBadgeProps {
  readonly movementType: number;
}

export function MovementTypeBadge({ movementType }: MovementTypeBadgeProps) {
  const info = MovementTypeLabels[movementType] ?? {
    label: "Desconocido",
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.color}`}
    >
      {info.label}
    </span>
  );
}

MovementTypeBadge.displayName = "MovementTypeBadge";
