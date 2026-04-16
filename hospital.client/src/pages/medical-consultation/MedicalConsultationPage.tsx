import { useCallback } from "react";
import { MedicalConsultationResponseColumns } from "../../components/column/MedicalConsultationResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getMedicalConsultations } from "../../services/medicalConsultationService";
import { useMedicalConsultationStore } from "../../stores/useMedicalConsultationStore";
import { customStyles } from "../../theme/tableTheme";

export function MedicalConsultationPage() {
  const { filters, setFilters } = useMedicalConsultationStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getMedicalConsultations({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Consultas Médicas</h1>
      <TableServer
        hasFilters
        columns={MedicalConsultationResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="medical-consultations"
        setFilters={setFilters}
        styles={customStyles}
        text="consultas"
        title="Consultas Médicas"
      />
    </div>
  );
}
