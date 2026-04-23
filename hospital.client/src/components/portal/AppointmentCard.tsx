import { formatDateShort, formatTime } from "../../utils/dateFormatter";
import { StatusBadge } from "./StatusBadge";

// ── Appointment card ──────────────────────────────────────────────────────────
interface AppointmentItem {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  specialtyName?: string;
  branchName?: string;
  appointmentStatusName?: string; // matches API response field
  amount?: number;
}

export function AppointmentCard({ appt }: { readonly appt: AppointmentItem }) {
  const statusName = appt.appointmentStatusName ?? "";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/90">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {appt.doctorName ?? "Médico"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {appt.specialtyName ?? "Especialidad"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <i className="bi bi-geo-alt mr-1" />
            {appt.branchName ?? "Sucursal"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <i className="bi bi-calendar3 mr-1" />
            {formatDateShort(appt.appointmentDate)} —{" "}
            {formatTime(appt.appointmentDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {statusName ? <StatusBadge status={statusName} /> : null}
          {appt.amount !== undefined && (
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Q{appt.amount.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
