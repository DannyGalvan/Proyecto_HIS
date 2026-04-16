import { useCallback } from "react";
import { TableServer } from "../../components/table/TableServer";
import { getNotificationLogs } from "../../services/notificationLogService";
import { useNotificationLogStore } from "../../stores/useNotificationLogStore";
import { customStyles } from "../../theme/tableTheme";
import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { NotificationLogResponse } from "../../types/NotificationLogResponse";

const notificationTypeLabel: Record<number, string> = {
  0: "Confirmación Cita",
  1: "Recibo Pago",
  2: "Resultado Lab",
  3: "Recordatorio",
  4: "Recuperación Contraseña",
};

const statusLabel: Record<number, string> = {
  0: "Pendiente",
  1: "Enviado",
  2: "Fallido",
  3: "Reintentando",
};

const statusColors: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-800",
  1: "bg-green-100 text-green-800",
  2: "bg-red-100 text-red-800",
  3: "bg-blue-100 text-blue-800",
};

const NotificationLogColumns: TableColumnWithFilters<NotificationLogResponse>[] = [
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
    id: "recipientEmail",
    name: "Destinatario",
    selector: (data) => data.recipientEmail ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: true,
    filterField: (value) => (value ? `RecipientEmail:like:${value}` : ""),
  },
  {
    id: "subject",
    name: "Asunto",
    selector: (data) => data.subject ?? "",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "notificationType",
    name: "Tipo",
    selector: (data) => notificationTypeLabel[data.notificationType] ?? "—",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "status",
    name: "Estado",
    cell: (data) => {
      const label = statusLabel[data.status] ?? "—";
      const colorClass = statusColors[data.status] ?? "bg-gray-100 text-gray-800";
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
    id: "retryCount",
    name: "Reintentos",
    selector: (data) => data.retryCount ?? 0,
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
  {
    id: "sentAt",
    name: "Enviado",
    selector: (data) => data.sentAt ?? "—",
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
];

export function NotificationLogPage() {
  const { filters, setFilters } = useNotificationLogStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getNotificationLogs({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Registro de Notificaciones</h1>
      <TableServer
        hasFilters
        columns={NotificationLogColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="notification-logs"
        setFilters={setFilters}
        styles={customStyles}
        text="notificaciones"
        title="Notificaciones"
      />
    </div>
  );
}
