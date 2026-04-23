import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router";

import { AppointmentCard } from "../../components/portal/AppointmentCard";
import type { AppointmentItem } from "../../components/portal/AppointmentRow";
import { nameRoutes } from "../../configs/constants";
import { getMyAppointments } from "../../services/patientPortalService";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

// Statuses that indicate the appointment is finished or won't happen
const PAST_STATUSES = new Set([
  "Atención Finalizada",
  "No Asistió",
  "Cancelada",
]);

// ── Page ──────────────────────────────────────────────────────────────────────
export function Component() {
  const navigate = useNavigate();
  const { name, logoutPatient } = usePatientAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["portal-my-appointments-dashboard"],
    queryFn: () => getMyAppointments(1, 10),
    staleTime: 1000 * 60 * 2,
  });

  const allAppointments =
    (data?.success ? (data.data as AppointmentItem[]) : []) ?? [];

  // "Próximas": only "Confirmada" — paid and scheduled, haven't entered clinical flow yet
  const upcomingAppointments = allAppointments.filter(
    (a) => a.appointmentStatusName === "Confirmada",
  );

  // "Historial": finished, cancelled, no-show, or currently in clinical flow
  const pastAppointments = allAppointments.filter(
    (a) =>
      a.appointmentStatusName && PAST_STATUSES.has(a.appointmentStatusName),
  );

  const handleNavigateBook = useCallback(
    () => navigate(nameRoutes.portalBook),
    [navigate],
  );

  const handleLogout = useCallback(() => {
    logoutPatient();
    navigate(nameRoutes.portalHome);
  }, [logoutPatient, navigate]);

  return (
    <section className="w-full min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10  dark:bg-gray-800">
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
        <div className="mb-8 rounded-2xl bg-linear-to-r from-blue-700 to-cyan-600 p-8 text-white shadow-md">
          <h2 className="mb-2 text-xl font-bold">
            ¿Necesita una consulta médica?
          </h2>
          <p className="mb-5 text-blue-100">
            Agende su cita en línea de forma rápida y segura.
          </p>
          <button
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-800 transition-colors hover:bg-blue-50"
            type="button"
            onClick={handleNavigateBook}
          >
            <i className="bi bi-calendar-plus" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* ── Próximas Citas (Confirmadas) ─────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900/50 mb-6 rounded-2xl border border-gray-100 p-6 shadow-sm dark:border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-calendar-check mr-2 text-blue-600" />
              Próximas Citas
            </h2>
            <Link
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              to={nameRoutes.portalAppointments}
            >
              Ver todas →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <i className="bi bi-hourglass-split animate-spin text-2xl text-blue-500" />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <i className="bi bi-calendar-x text-4xl text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">
                No tiene citas confirmadas próximas.
              </p>
              <button
                className="mt-1 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700"
                type="button"
                onClick={handleNavigateBook}
              >
                Agendar una cita
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingAppointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </div>

        {/* ── Citas Anteriores ─────────────────────────────────────────────── */}
        {!isLoading && pastAppointments.length > 0 && (
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 p-6 shadow-sm dark:border-gray-700">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                <i className="bi bi-clock-history mr-2 text-gray-500" />
                Citas Anteriores
              </h2>
              <Link
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                to={nameRoutes.portalAppointments}
              >
                Ver historial completo →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {pastAppointments.slice(0, 3).map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

Component.displayName = "PatientDashboardPage";
