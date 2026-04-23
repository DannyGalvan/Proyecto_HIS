import { useCallback } from "react";
import {
  APP_LOCALE,
  formatDateShort,
  formatTime,
  getAppTimezone,
} from "../../utils/dateFormatter";
import { StatusBadge } from "./StatusBadge";

// Appointments that the patient can still cancel
const CANCELLABLE_STATUSES = new Set(["Pendiente de Pago", "Confirmada"]);

// ── Appointment row ───────────────────────────────────────────────────────────
export interface AppointmentItem {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  specialtyName?: string;
  branchName?: string;
  appointmentStatusName?: string; // matches the API response field
  amount?: number;
}

export function AppointmentRow({
  appt,
  onCancel,
}: {
  readonly appt: AppointmentItem;
  readonly onCancel: (id: number, label: string) => void;
}) {
  const statusName = appt.appointmentStatusName ?? "";
  const canCancel = CANCELLABLE_STATUSES.has(statusName);

  const handleCancelClick = useCallback(
    () => onCancel(appt.id, appt.doctorName ?? `cita #${appt.id}`),
    [appt, onCancel],
  );

  return (
    <div className="rounded-xl border border-gray-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-900/50">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: date + info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
              {new Date(appt.appointmentDate)
                .toLocaleDateString(APP_LOCALE, {
                  month: "short",
                  timeZone: getAppTimezone(),
                })
                .toUpperCase()}
            </span>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {new Date(appt.appointmentDate).toLocaleDateString(APP_LOCALE, {
                day: "numeric",
                timeZone: getAppTimezone(),
              })}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {appt.doctorName ?? "Médico"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {appt.specialtyName ?? "Especialidad"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <i className="bi bi-geo-alt mr-1" />
              {appt.branchName ?? "Sucursal"}
            </p>
          </div>
        </div>

        {/* Right: time + status + amount + cancel */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            <i className="bi bi-clock mr-1" />
            {formatTime(appt.appointmentDate)}
          </span>
          {statusName ? <StatusBadge status={statusName} /> : null}
          {appt.amount !== undefined && (
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Q{appt.amount.toFixed(2)}
            </span>
          )}
          {canCancel ? (
            <button
              className="mt-1 flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
              type="button"
              onClick={handleCancelClick}
            >
              <i className="bi bi-x-circle" />
              Cancelar cita
            </button>
          ) : null}
        </div>
      </div>

      {/* Full date on mobile */}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 sm:hidden">
        {formatDateShort(appt.appointmentDate)}
      </p>
    </div>
  );
}
