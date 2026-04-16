import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import { AppointmentButton } from "../button/AppointmentButton";

const statusColors: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Cancelada: "bg-red-100 text-red-800",
  "En curso": "bg-blue-100 text-blue-800",
  Completada: "bg-gray-100 text-gray-800",
  "No asistió": "bg-orange-100 text-orange-800",
  Confirmada: "bg-teal-100 text-teal-800",
};

export const AppointmentResponseColumns: TableColumnWithFilters<AppointmentResponse>[] = [
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
    id: "patient",
    name: "Paciente",
    selector: (data) => data.patient?.name ?? String(data.patientId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Patient.Name:like:${value}` : ""),
  },
  {
    id: "doctor",
    name: "Médico",
    selector: (data) => data.doctor?.name ?? (data.doctorId ? String(data.doctorId) : "—"),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "specialty",
    name: "Especialidad",
    selector: (data) => data.specialty?.name ?? String(data.specialtyId),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "appointmentDate",
    name: "Fecha",
    selector: (data) => data.appointmentDate ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "appointmentStatus",
    name: "Estado",
    cell: (data) => {
      const statusName = data.appointmentStatus?.name ?? "";
      const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {statusName || "—"}
        </span>
      );
    },
    sortable: false,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "amount",
    name: "Monto",
    selector: (data) => `Q${data.amount?.toFixed(2) ?? "0.00"}`,
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
    cell: (data) => <AppointmentButton data={data} />,
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
