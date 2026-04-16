import { useCallback } from "react";
import { AppointmentStatusResponseColumns } from "../../components/column/AppointmentStatusResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getAppointmentStatuses } from "../../services/appointmentStatusService";
import { useAppointmentStatusStore } from "../../stores/useAppointmentStatusStore";
import { customStyles } from "../../theme/tableTheme";

export function AppointmentStatusPage() {
  const { filters, setFilters } = useAppointmentStatusStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getAppointmentStatuses({ pageNumber: page, pageSize, filters, include: "", includeTotal: false });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Estados de Cita</h1>
      <TableServer
        hasFilters
        columns={AppointmentStatusResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="appointment-statuses"
        setFilters={setFilters}
        styles={customStyles}
        text="estados"
        title="Estados de Cita"
      />
    </div>
  );
}
