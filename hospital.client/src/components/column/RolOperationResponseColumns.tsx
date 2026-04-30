import type { OperationWithAssignment } from "../../types/OperationWithAssignment";
import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import { ToggleButton } from "../button/ToggleButton";

export type { OperationWithAssignment } from "../../types/OperationWithAssignment";

export function getRolOperationColumns(
  onToggle: (op: OperationWithAssignment) => void,
): TableColumnWithFilters<OperationWithAssignment>[] {
  return [
    {
      id: "id",
      name: "ID",
      selector: (data) => data.id ?? 0,
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
