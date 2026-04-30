import { Button } from "@heroui/react";
import { useCallback } from "react";

interface PrescriptionItemRowProps {
  readonly item: {
    id: number;
    medicineName?: string | null;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    specialInstructions?: string | null;
  };
  readonly onDelete: (id: number) => void;
}

export function PrescriptionItemRow({
  item,
  onDelete,
}: PrescriptionItemRowProps) {
  const handleDelete = useCallback(
    () => onDelete(item.id),
    [onDelete, item.id],
  );

  return (
    <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <p className="font-bold">{item.medicineName}</p>
        <div className="text-sm text-gray-600 dark:text-gray-300 grid grid-cols-3 gap-2 mt-1">
          <span>
            <strong>Dosis:</strong> {item.dosage}
          </span>
          <span>
            <strong>Frecuencia:</strong> {item.frequency}
          </span>
          <span>
            <strong>Duracion:</strong> {item.duration}
          </span>
        </div>
        {item.specialInstructions ? (
          <p className="text-sm text-blue-600 mt-1">
            <i className="bi bi-info-circle mr-1" />
            {item.specialInstructions}
          </p>
        ) : null}
      </div>
      <Button isIconOnly size="sm" variant="danger" onPress={handleDelete}>
        <i className="bi bi-trash" />
      </Button>
    </div>
  );
}
