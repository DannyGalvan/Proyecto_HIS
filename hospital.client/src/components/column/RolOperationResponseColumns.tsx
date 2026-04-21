import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { OperationResponse } from "../../types/OperationResponse";
import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";

export interface OperationWithAssignment extends OperationResponse {
  assigned: boolean;
  rolOperationId?: number;
}

function ToggleButton({
  data,
  onToggle,
}: {
  readonly data: OperationWithAssignment;
  readonly onToggle: (op: OperationWithAssignment) => void;
}) {
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

export function getRolOperationColumns(
  onToggle: (op: OperationWithAssignment) => void,
): TableColumnWithFilters<OperationWithAssignment>[] {
  return [
    {
      id: "id",
      name: "ID",
      selector: (data) => data.id ?? "",
      sortable: true,
      wrap: true,
      omit: false,
    },
    {
      id: "name",
      name: "Nombre",
      selector: (data) => data.name ?? "",
      sortable: true,
      wrap: true,
      omit: false,
    },
    {
      id: "path",
      name: "Ruta",
      selector: (data) => data.path ?? "",
      sortable: true,
      wrap: true,
      omit: false,
    },
    {
      id: "httpMethod",
      name: "Método HTTP",
      selector: (data) =>
        (data as OperationWithAssignment & { httpMethod?: string })
          .httpMethod ?? "",
      sortable: true,
      wrap: true,
      omit: false,
    },
    {
      id: "assigned",
      name: "Estado",
      center: true,
      cell: (data) =>
        data.assigned ? (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
            Asignado
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
            No asignado
          </span>
        ),
    },
    {
      id: "actions",
      name: "Acciones",
      center: true,
      button: true,
      cell: (data) => <ToggleButton data={data} onToggle={onToggle} />,
    },
  ];
}
