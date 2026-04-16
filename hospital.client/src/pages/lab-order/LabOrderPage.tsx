import { useCallback } from "react";
import { LabOrderResponseColumns } from "../../components/column/LabOrderResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getLabOrders } from "../../services/labOrderService";
import { useLabOrderStore } from "../../stores/useLabOrderStore";
import { customStyles } from "../../theme/tableTheme";

export function LabOrderPage() {
  const { filters, setFilters } = useLabOrderStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getLabOrders({
        pageNumber: page,
        pageSize,
        filters,
        include: "Consultation,Doctor,Patient",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Órdenes de Laboratorio</h1>
      <TableServer
        hasFilters
        columns={LabOrderResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="lab-orders"
        setFilters={setFilters}
        styles={customStyles}
        text="órdenes"
        title="Órdenes de Laboratorio"
      />
    </div>
  );
}
