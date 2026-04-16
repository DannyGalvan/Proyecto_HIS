import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { nameRoutes } from "../../configs/constants";
import { getMyAppointments } from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

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
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// ── Appointment card ──────────────────────────────────────────────────────────
interface AppointmentItem {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  specialtyName?: string;
  branchName?: string;
  status?: string;
  amount?: number;
}

function AppointmentCard({ appt }: { readonly appt: AppointmentItem }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
            {formatDate(appt.appointmentDate)} — {formatTime(appt.appointmentDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {appt.status && <StatusBadge status={appt.status} />}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { name, logoutPatient } = usePatientAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-my-appointments-dashboard"],
    queryFn: () => getMyAppointments(1, 3),
    staleTime: 1000 * 60 * 2,
  });

  const appointments = (data?.success ? (data.data as AppointmentItem[]) : []) ?? [];

  const handleLogout = useCallback(() => {
    logoutPatient();
    navigate(nameRoutes.portalHome);
  }, [logoutPatient, navigate]);

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-person-circle mr-2 text-blue-600" />
              Bienvenido, {name || "Paciente"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestione sus citas médicas desde su portal personal.
            </p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
            type="button"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right" />
            Cerrar Sesión
          </button>
        </div>

        {/* Main CTA */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 p-8 text-white shadow-md">
          <h2 className="mb-2 text-xl font-bold">¿Necesita una consulta médica?</h2>
          <p className="mb-5 text-blue-100">
            Agende su cita en línea de forma rápida y segura.
          </p>
          <button
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-800 transition-colors hover:bg-blue-50"
            type="button"
            onClick={() => navigate(nameRoutes.portalBook)}
          >
            <i className="bi bi-calendar-plus" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Upcoming appointments */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-calendar-check mr-2 text-blue-600" />
              Próximas Citas
            </h2>
            <Link
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              to={nameRoutes.portalAppointments}
            >
              Ver historial completo →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <i className="bi bi-hourglass-split animate-spin text-2xl text-blue-500" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <i className="bi bi-calendar-x text-4xl text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">
                No tiene citas registradas aún.
              </p>
              <button
                className="mt-1 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700"
                type="button"
                onClick={() => navigate(nameRoutes.portalBook)}
              >
                Agendar su primera cita
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {appointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PatientDashboardPage;

export function Component() {
  return <PatientDashboardPage />;
}
Component.displayName = "PatientDashboardPage";
