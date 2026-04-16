import { useCallback } from "react";
import { AppointmentResponseColumns } from "../../components/column/AppointmentResponseColumns";
import { TableServer } from "../../components/table/TableServer";
import { getAppointments } from "../../services/appointmentService";
import { useAppointmentStore } from "../../stores/useAppointmentStore";
import { customStyles } from "../../theme/tableTheme";

export function AppointmentPage() {
  const { filters, setFilters } = useAppointmentStore();

  const queryFn = useCallback(
    async (filters: string, page: number, pageSize: number) => {
      return getAppointments({
        pageNumber: page,
        pageSize,
        filters,
        include: "Specialty,Branch,AppointmentStatus,Patient,Doctor",
        includeTotal: false,
      });
    },
    [],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-4">Citas Médicas</h1>
      <TableServer
        hasFilters
        columns={AppointmentResponseColumns}
        filters={filters}
        queryFn={queryFn}
        queryKey="appointments"
        setFilters={setFilters}
        styles={customStyles}
        text="citas"
        title="Citas Médicas"
      />
    </div>
  );
}
