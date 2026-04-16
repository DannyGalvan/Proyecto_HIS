import { useCallback } from "react";
import { LaboratoryResponseColumns } from "../../components/column/LaboratoryResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getLaboratories } from "../../services/laboratoryService";
import { useLaboratoryStore } from "../../stores/useLaboratoryStore";
import { customStyles } from "../../theme/tableTheme";

export function LaboratoryPage() {
  const { filters, setFilters } = useLaboratoryStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getLaboratories({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Laboratorios</h1>
      <TableServer
        hasFilters
        columns={LaboratoryResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="laboratories"
        setFilters={setFilters}
        styles={customStyles}
        text="laboratorios"
        title="Laboratorios"
      />
    </div>
  );
}
