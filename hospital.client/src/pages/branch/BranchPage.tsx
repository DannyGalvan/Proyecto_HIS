import { useCallback } from "react";
import { BranchResponseColumns } from "../../components/column/BranchResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getBranches } from "../../services/branchService";
import { useBranchStore } from "../../stores/useBranchStore";
import { customStyles } from "../../theme/tableTheme";

export function BranchPage() {
  const { filters, setFilters } = useBranchStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getBranches({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Sucursales</h1>
      <TableServer
        hasFilters
        columns={BranchResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="branches"
        setFilters={setFilters}
        styles={customStyles}
        text="sucursales"
        title="Sucursales"
      />
    </div>
  );
}
