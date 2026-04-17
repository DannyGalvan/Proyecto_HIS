import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { AppointmentStatusResponse } from "../../types/AppointmentStatusResponse";
import { AppointmentStatusButton } from "../button/AppointmentStatusButton";
import { formatDateTime } from "../../utils/dateFormatter";

const statusColors: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Cancelada: "bg-red-100 text-red-800",
  "En curso": "bg-blue-100 text-blue-800",
  Completada: "bg-gray-100 text-gray-800",
  "No asistió": "bg-orange-100 text-orange-800",
  Confirmada: "bg-teal-100 text-teal-800",
  "Paciente presente": "bg-purple-100 text-purple-800",
};

export const AppointmentStatusResponseColumns: TableColumnWithFilters<AppointmentStatusResponse>[] = [
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
    id: "name",
    name: "Nombre",
    cell: (data) => {
      const colorClass = statusColors[data.name] ?? "bg-gray-100 text-gray-800";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {data.name}
        </span>
      );
    },
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Name:like:${value}` : ""),
  },
  {
    id: "description",
    name: "Descripción",
    selector: (data) => data.description ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "state",
    name: "Estado",
    selector: (data) => (data.state === 1 ? "Activo" : "Inactivo"),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "actions",
    name: "Acciones",
    maxWidth: "100px",
    center: true,
    button: true,
    cell: (data) => <AppointmentStatusButton data={data} />,
  },
  {
    id: "createdAt",
    name: "Creado",
    selector: (data) => formatDateTime(data.createdAt),
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
