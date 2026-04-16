import { useCallback } from "react";
import { VitalSignResponseColumns } from "../../components/column/VitalSignResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getVitalSigns } from "../../services/vitalSignService";
import { useVitalSignStore } from "../../stores/useVitalSignStore";
import { customStyles } from "../../theme/tableTheme";

export function VitalSignPage() {
  const { filters, setFilters } = useVitalSignStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getVitalSigns({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Signos Vitales</h1>
      <TableServer
        hasFilters
        columns={VitalSignResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="vital-signs"
        setFilters={setFilters}
        styles={customStyles}
        text="registros"
        title="Signos Vitales"
      />
    </div>
  );
}
