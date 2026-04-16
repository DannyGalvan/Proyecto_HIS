import { useCallback } from "react";
import { DispenseResponseColumns } from "../../components/column/DispenseResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getDispenses } from "../../services/dispenseService";
import { useDispenseStore } from "../../stores/useDispenseStore";
import { customStyles } from "../../theme/tableTheme";

export function DispensePage() {
  const { filters, setFilters } = useDispenseStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getDispenses({
        pageNumber: page,
        pageSize,
        filters,
        include: "Prescription",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Despachos</h1>
      <TableServer
        hasFilters
        columns={DispenseResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="dispenses"
        setFilters={setFilters}
        styles={customStyles}
        text="despachos"
        title="Despachos"
      />
    </div>
  );
}
