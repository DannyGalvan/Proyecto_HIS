import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { LabOrderResponse } from "../../types/LabOrderResponse";
import { LabOrderButton } from "../button/LabOrderButton";

const orderStatusLabel: Record<number, string> = {
  0: "Pendiente",
  1: "En Proceso",
  2: "Completada",
  3: "Cancelada",
};

const orderStatusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-blue-100 text-blue-800",
  2: "bg-green-100 text-green-800",
  3: "bg-red-100 text-red-800",
};

export const LabOrderResponseColumns: TableColumnWithFilters<LabOrderResponse>[] = [
  {
    id: "id",
    name: "ID",
    selector: (data) => data.id ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Id:eq:${value}` : ""),
  },
  {
    id: "orderNumber",
    name: "No. Orden",
    selector: (data) => data.orderNumber ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `OrderNumber:like:${value}` : ""),
  },
  {
    id: "patientId",
    name: "Paciente ID",
    selector: (data) => data.patientId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "orderStatus",
    name: "Estado",
    cell: (data) => {
      const label = orderStatusLabel[data.orderStatus] ?? "—";
      const colorClass = orderStatusColors[data.orderStatus] ?? "bg-gray-100 text-gray-800";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {label}
        </span>
      );
    },
    sortable: false,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "totalAmount",
    name: "Total",
    selector: (data) => `Q ${data.totalAmount?.toFixed(2) ?? "0.00"}`,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "isExternal",
    name: "Externo",
    selector: (data) => (data.isExternal ? "Sí" : "No"),
    sortable: false,
    wrap: true,
    omit: true,
    hasFilter: false,
  },
  {
    id: "actions",
    name: "Acciones",
    maxWidth: "100px",
    center: true,
    button: true,
    cell: (data) => <LabOrderButton data={data} />,
  },
  {
    id: "createdAt",
    name: "Creado",
    selector: (data) => data.createdAt ?? "",
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
