import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { nameRoutes } from "../../configs/constants";
import { getMyAppointments } from "../../services/patientPortalService";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("es-GT", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString("es-GT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { readonly status: string }) {
  const map: Record<string, string> = {
    Pagada: "bg-green-100 text-green-800",
    Pendiente: "bg-yellow-100 text-yellow-800",
    Cancelada: "bg-red-100 text-red-800",
    "En curso": "bg-blue-100 text-blue-800",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

// ── Appointment row ───────────────────────────────────────────────────────────
interface AppointmentItem {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  specialtyName?: string;
  branchName?: string;
  status?: string;
  amount?: number;
}

function AppointmentRow({ appt }: { readonly appt: AppointmentItem }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: date + time */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
              {new Date(appt.appointmentDate).toLocaleDateString("es-GT", { month: "short" }).toUpperCase()}
            </span>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {new Date(appt.appointmentDate).getDate()}
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

        {/* Right: time + status + amount */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            <i className="bi bi-clock mr-1" />
            {formatTime(appt.appointmentDate)}
          </span>
          {appt.status && <StatusBadge status={appt.status} />}
          {appt.amount !== undefined && (
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Q{appt.amount.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Full date on mobile */}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 sm:hidden">
        {formatDate(appt.appointmentDate)}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export function MyAppointmentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["portal-my-appointments", page],
    queryFn: () => getMyAppointments(page, PAGE_SIZE),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const appointments = (data?.success ? (data.data as AppointmentItem[]) : []) ?? [];
  const hasMore = appointments.length === PAGE_SIZE;
  const hasPrev = page > 1;

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-calendar-check mr-2 text-blue-600" />
              Mis Citas
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Historial de sus consultas médicas.
            </p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700"
            type="button"
            onClick={() => navigate(nameRoutes.portalBook)}
          >
            <i className="bi bi-calendar-plus" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <i className="bi bi-hourglass-split animate-spin text-4xl text-blue-500" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            Error al cargar sus citas. Intente de nuevo.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && appointments.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <i className="bi bi-calendar-x text-5xl text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">
              No tiene citas registradas aún.
            </p>
            <button
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700"
              type="button"
              onClick={() => navigate(nameRoutes.portalBook)}
            >
              Agendar su primera cita
            </button>
          </div>
        )}

        {/* Appointments list */}
        {!isLoading && appointments.length > 0 && (
          <>
            <div className={`flex flex-col gap-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
              {appointments.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasPrev || isFetching}
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left" />
                Anterior
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Página {page}
              </span>

              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasMore || isFetching}
                type="button"
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default MyAppointmentsPage;

export function Component() {
  return <MyAppointmentsPage />;
}
Component.displayName = "MyAppointmentsPage";
