import type { TableColumnWithFilters } from "../../types/TableColumnWithFilters";
import type { NotificationLogResponse } from "../../types/NotificationLogResponse";
import { NotificationStatusBadge } from "../badge/NotificationStatusBadge";
import { formatDateTime } from "../../utils/dateFormatter";

const notificationTypeLabel: Record<number, string> = {
  0: "Confirmación Cita",
  1: "Recibo Pago",
  2: "Resultado Lab",
  3: "Recordatorio",
  4: "Recuperación Contraseña",
};

export const NotificationLogResponseColumns: TableColumnWithFilters<NotificationLogResponse>[] = [
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
    cell: (data) => <NotificationStatusBadge status={data.status} />,
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
    selector: (data) => formatDateTime(data.sentAt),
    sortable: true,
    wrap: true,
    omit: false,
    hasFilter: false,
  },
];
