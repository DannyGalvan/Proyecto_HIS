import { useCallback } from "react";
import { MedicineResponseColumns } from "../../components/column/MedicineResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getMedicines } from "../../services/medicineService";
import { useMedicineStore } from "../../stores/useMedicineStore";
import { customStyles } from "../../theme/tableTheme";

export function MedicinePage() {
  const { filters, setFilters } = useMedicineStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getMedicines({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Medicamentos</h1>
      <TableServer
        hasFilters
        columns={MedicineResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="medicines"
        setFilters={setFilters}
        styles={customStyles}
        text="medicamentos"
        title="Medicamentos"
      />
    </div>
  );
}
