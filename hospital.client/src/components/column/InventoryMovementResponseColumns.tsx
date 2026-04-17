import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { InventoryMovementResponse } from "../../types/InventoryMovementResponse";
import { MovementTypeLabels } from "../../types/InventoryMovementResponse";
import { InventoryMovementButton } from "../button/InventoryMovementButton";

function MovementTypeBadge({ movementType }: { readonly movementType: number }) {
  const info = MovementTypeLabels[movementType] ?? { label: "Desconocido", color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}

export const InventoryMovementResponseColumns: TableColumnWithFilters<InventoryMovementResponse>[] = [
  {
    id: "createdAt",
    name: "Fecha/Hora",
    selector: (data) => data.createdAt ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "movementType",
    name: "Tipo",
    cell: (data) => <MovementTypeBadge movementType={data.movementType} />,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `MovementType:eq:${value}` : ""),
  },
  {
    id: "medicine",
    name: "Medicamento",
    selector: (data) => data.medicine?.name ?? String(data.medicineId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Medicine.Name:like:${value}` : ""),
  },
  {
    id: "branch",
    name: "Sucursal",
    selector: (data) => data.branch?.name ?? String(data.branchId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Branch.Name:like:${value}` : ""),
  },
  {
    id: "quantity",
    name: "Cantidad",
    selector: (data) => data.quantity ?? 0,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "previousStock",
    name: "Stock Anterior",
    selector: (data) => data.previousStock ?? 0,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "newStock",
    name: "Stock Nuevo",
    selector: (data) => data.newStock ?? 0,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "totalCost",
    name: "Costo",
    selector: (data) => `Q ${(data.totalCost ?? 0).toFixed(2)}`,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "referenceNumber",
    name: "Referencia",
    selector: (data) => data.referenceNumber ?? "—",
    sortable: false,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `ReferenceNumber:like:${value}` : ""),
  },
  {
    id: "user",
    name: "Usuario",
    selector: (data) => data.user?.name ?? String(data.userId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `User.Name:like:${value}` : ""),
  },
  {
    id: "actions",
    name: "Acciones",
    maxWidth: "100px",
    center: true,
    button: true,
    cell: (data) => <InventoryMovementButton data={data} />,
  },
];
