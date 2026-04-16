import { useCallback } from "react";
import { SpecialtyResponseColumns } from "../../components/column/SpecialtyResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getSpecialties } from "../../services/specialtyService";
import { useSpecialtyStore } from "../../stores/useSpecialtyStore";
import { customStyles } from "../../theme/tableTheme";

export function SpecialtyPage() {
  const { filters, setFilters } = useSpecialtyStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getSpecialties({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Especialidades</h1>
      <TableServer
        hasFilters
        columns={SpecialtyResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="specialties"
        setFilters={setFilters}
        styles={customStyles}
        text="especialidades"
        title="Especialidades"
      />
    </div>
  );
}
