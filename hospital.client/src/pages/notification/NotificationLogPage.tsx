import { useCallback } from "react";
import { TableServer } from "../../components/table/TableServer";
import { getNotificationLogs } from "../../services/notificationLogService";
import { useNotificationLogStore } from "../../stores/useNotificationLogStore";
import { customStyles } from "../../theme/tableTheme";
import { NotificationLogResponseColumns } from "../../components/column/NotificationLogResponseColumns";

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
        columns={NotificationLogResponseColumns}
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
