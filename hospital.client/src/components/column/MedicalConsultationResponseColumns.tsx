import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { MedicalConsultationResponse } from "../../types/MedicalConsultationResponse";
import { MedicalConsultationButton } from "../button/MedicalConsultationButton";

const consultationStatusLabel: Record<number, string> = {
  0: "En curso",
  1: "Finalizada",
};

const consultationStatusColors: Record<number, string> = {
  0: "bg-blue-100 text-blue-800",
  1: "bg-green-100 text-green-800",
};

export const MedicalConsultationResponseColumns: TableColumnWithFilters<MedicalConsultationResponse>[] = [
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
    id: "appointmentId",
    name: "Cita",
    selector: (data) => data.appointmentId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `AppointmentId:eq:${value}` : ""),
  },
  {
    id: "doctorId",
    name: "Médico ID",
    selector: (data) => data.doctorId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "reasonForVisit",
    name: "Motivo",
    selector: (data) => data.reasonForVisit ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "diagnosis",
    name: "Diagnóstico",
    selector: (data) => data.diagnosis ?? "—",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "consultationStatus",
    name: "Estado",
    cell: (data) => {
      const label = consultationStatusLabel[data.consultationStatus] ?? "—";
      const colorClass = consultationStatusColors[data.consultationStatus] ?? "bg-gray-100 text-gray-800";
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
    id: "actions",
    name: "Acciones",
    maxWidth: "100px",
    center: true,
    button: true,
    cell: (data) => <MedicalConsultationButton data={data} />,
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
