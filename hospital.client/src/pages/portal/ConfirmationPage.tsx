import { useLocation, useNavigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import type { PaymentConfirmationResponse } from "../../types/PatientPortalTypes";
import { formatDateLong, formatTime } from "../../utils/dateFormatter";

// ── Page ──────────────────────────────────────────────────────────────────────
export function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = usePatientAuthStore();

  const confirmation = location.state as PaymentConfirmationResponse | null;

  // If no state, redirect to portal home
  if (!confirmation) {
    navigate(nameRoutes.portalHome, { replace: true });
    return null;
  }

  const patientEmail = confirmation.patientEmail || email;

  return (
    <section className="min-h-[calc(100vh-140px)] px-4 py-10 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <i className="bi bi-check-circle-fill text-5xl text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ¡Pago Exitoso!
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            ¡Pago realizado exitosamente! Número de transacción: {confirmation.transactionNumber}. Su cita ha sido confirmada.
          </p>
        </div>

        {/* Receipt card */}
        <div className="mb-6 rounded-2xl border border-gray-100 shadow-sm dark:border-gray-700">
          {/* Receipt header */}
          <div className="rounded-t-2xl bg-gradient-to-r from-blue-700 to-cyan-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                  Comprobante de Pago
                </p>
                <p className="mt-1 text-lg font-bold">
                  #{confirmation.transactionNumber}
                </p>
              </div>
              <i className="bi bi-receipt text-4xl text-blue-200" />
            </div>
          </div>

          {/* Receipt body */}
          <div className="p-6">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Médico
                </dt>
                <dd className="font-semibold text-gray-800 dark:text-gray-100">
                  {confirmation.doctorName}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Especialidad
                </dt>
                <dd className="font-semibold text-gray-800 dark:text-gray-100">
                  {confirmation.specialtyName}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Sucursal
                </dt>
                <dd className="font-semibold text-gray-800 dark:text-gray-100">
                  {confirmation.branchName}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Fecha de la Cita
                </dt>
                <dd className="font-semibold text-gray-800 dark:text-gray-100">
                  {formatDateLong(confirmation.appointmentDate)}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Hora
                </dt>
                <dd className="font-semibold text-gray-800 dark:text-gray-100">
                  {formatTime(confirmation.appointmentDate)}
                </dd>
              </div>

              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Monto Pagado
                </dt>
                <dd className="text-lg font-bold text-green-600 dark:text-green-400">
                  Q{confirmation.amount.toFixed(2)}
                </dd>
              </div>
            </dl>

            {/* Divider */}
            <div className="my-5 border-t border-dashed border-gray-200 dark:border-gray-700" />

            {/* Email confirmation */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <i className="bi bi-envelope-check-fill mt-0.5 shrink-0 text-xl text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Se ha enviado un correo de confirmación a{" "}
                <span className="font-bold">{patientEmail}</span> con los detalles de su cita.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-success  px-5 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-green-800  dark:text-gray-200 dark:hover:bg-gray-700"
            type="button"
            onClick={() => navigate(nameRoutes.portalDashboard)}
          >
            <i className="bi bi-house" />
            Volver al Portal
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-700"
            type="button"
            onClick={() => navigate(nameRoutes.portalAppointments)}
          >
            <i className="bi bi-calendar-check" />
            Ver Mis Citas
          </button>
        </div>
      </div>
    </section>
  );
}

export default ConfirmationPage;

export function Component() {
  return <ConfirmationPage />;
}
Component.displayName = "ConfirmationPage";
