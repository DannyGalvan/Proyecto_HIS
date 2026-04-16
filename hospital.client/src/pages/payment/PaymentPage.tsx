import { useCallback } from "react";
import { PaymentResponseColumns } from "../../components/column/PaymentResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getPayments } from "../../services/paymentService";
import { usePaymentStore } from "../../stores/usePaymentStore";
import { customStyles } from "../../theme/tableTheme";

export function PaymentPage() {
  const { filters, setFilters } = usePaymentStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getPayments({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Pagos</h1>
      <TableServer
        hasFilters
        columns={PaymentResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="payments"
        setFilters={setFilters}
        styles={customStyles}
        text="pagos"
        title="Pagos"
      />
    </div>
  );
}
