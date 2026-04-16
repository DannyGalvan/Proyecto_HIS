import { useCallback } from "react";
import { TableServer } from "../../components/table/TableServer";
import { getPrescriptions } from "../../services/prescriptionService";
import { usePrescriptionStore } from "../../stores/usePrescriptionStore";
import { customStyles } from "../../theme/tableTheme";
import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { PrescriptionResponse } from "../../types/PrescriptionResponse";
import { PrescriptionButton } from "../../components/button/PrescriptionButton";

const PrescriptionColumns: TableColumnWithFilters<PrescriptionResponse>[] = [
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
    id: "consultationId",
    name: "Consulta",
    selector: (data) => data.consultationId ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `ConsultationId:eq:${value}` : ""),
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
    id: "prescriptionDate",
    name: "Fecha",
    selector: (data) => data.prescriptionDate ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "notes",
    name: "Notas",
    selector: (data) => data.notes ?? "—",
    sortable: false,
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
    cell: (data) => <PrescriptionButton data={data} />,
  },
];

export function PrescriptionPage() {
  const { filters, setFilters } = usePrescriptionStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getPrescriptions({
        pageNumber: page,
        pageSize,
        filters,
        include: "Consultation,Doctor",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Recetas Médicas</h1>
      <TableServer
        hasFilters
        columns={PrescriptionColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="prescriptions"
        setFilters={setFilters}
        styles={customStyles}
        text="recetas"
        title="Recetas Médicas"
      />
    </div>
  );
}
