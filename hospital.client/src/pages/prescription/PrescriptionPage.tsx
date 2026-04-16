import { useCallback } from "react";
import { TableServer } from "../../components/table/TableServer";
import { getPrescriptions } from "../../services/prescriptionService";
import { usePrescriptionStore } from "../../stores/usePrescriptionStore";
import { customStyles } from "../../theme/tableTheme";
import { PrescriptionResponseColumns } from "../../components/column/PrescriptionResponseColumns";

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
        columns={PrescriptionResponseColumns}
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
