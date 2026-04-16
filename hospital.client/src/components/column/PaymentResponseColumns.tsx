import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { PaymentResponse } from "../../types/PaymentResponse";

const paymentMethodLabel: Record<number, string> = {
  0: "Efectivo",
  1: "Visa",
  2: "Mastercard",
  3: "Débito",
};

const paymentStatusLabel: Record<number, string> = {
  0: "Pendiente",
  1: "Completado",
  2: "Fallido",
  3: "Reembolsado",
};

const paymentStatusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-red-100 text-red-800",
  3: "bg-blue-100 text-blue-800",
};

export const PaymentResponseColumns: TableColumnWithFilters<PaymentResponse>[] = [
  {
    id: "id",
    name: "ID",
    selector: (data) => data.id ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `Id:eq:${value}` : ""),
  },
  {
    id: "transactionNumber",
    name: "No. Transacción",
    selector: (data) => data.transactionNumber ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `TransactionNumber:like:${value}` : ""),
  },
  {
    id: "amount",
    name: "Monto",
    selector: (data) => `Q${data.amount?.toFixed(2) ?? "0.00"}`,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "paymentMethod",
    name: "Método",
    selector: (data) => paymentMethodLabel[data.paymentMethod] ?? "—",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "paymentStatus",
    name: "Estado",
    cell: (data) => {
      const label = paymentStatusLabel[data.paymentStatus] ?? "—";
      const colorClass = paymentStatusColors[data.paymentStatus] ?? "bg-gray-100 text-gray-800";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {label}
        </span>
      );
    },
    sortable: false,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "paymentDate",
    name: "Fecha",
    selector: (data) => data.paymentDate ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "createdAt",
    name: "Creado",
    selector: (data) => data.createdAt ?? "",
    sortable: true,
    maxWidth: "160px",
    omit: true,
  },
];
