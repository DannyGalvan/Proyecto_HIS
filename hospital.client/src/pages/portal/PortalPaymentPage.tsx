import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import { ReservationTimer } from "../../components/portal/ReservationTimer";
import { PaymentForm } from "../../components/portal/PaymentForm";
import type { PaymentConfirmationResponse } from "../../types/PatientPortalTypes";
import { formatDateLong, formatTime } from "../../utils/dateFormatter";

// ── Navigation state shape ────────────────────────────────────────────────────
interface PaymentLocationState {
  appointmentId: number;
  createdAt: string;
  doctorName: string;
  specialtyName: string;
  branchName: string;
  appointmentDate: string;
  amount: number;
}

// ── Page ──────────────────────────────────────────────────────────────────────
// Note: named PortalPaymentPage to avoid collision with admin PaymentPage
export function PortalPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = usePatientAuthStore();

  const state = location.state as PaymentLocationState | null;

  // If no navigation state, redirect to booking
  if (!state) {
    navigate(nameRoutes.portalBook, { replace: true });
    return null;
  }

  const { appointmentId, createdAt, doctorName, specialtyName, branchName, appointmentDate, amount } =
    state;

  return (
    <PortalPaymentContent
      amount={amount}
      appointmentDate={appointmentDate}
      appointmentId={appointmentId}
      branchName={branchName}
      createdAt={createdAt}
      doctorName={doctorName}
      patientEmail={email}
      specialtyName={specialtyName}
    />
  );
}

interface PortalPaymentContentProps {
  appointmentId: number;
  createdAt: string;
  doctorName: string;
  specialtyName: string;
  branchName: string;
  appointmentDate: string;
  amount: number;
  patientEmail: string;
}

function PortalPaymentContent({
  appointmentId,
  createdAt,
  doctorName,
  specialtyName,
  branchName,
  appointmentDate,
  amount,
  patientEmail: _patientEmail,
}: PortalPaymentContentProps) {
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  const handleTimerExpired = useCallback(() => {
    setTimerExpired(true);
    setTimeout(() => {
      navigate(nameRoutes.portalBook, { replace: true });
    }, 4000);
  }, [navigate]);

  const handlePaymentSuccess = useCallback(
    (confirmation: PaymentConfirmationResponse) => {
      navigate(nameRoutes.portalConfirm, { state: confirmation });
    },
    [navigate],
  );

  const handlePaymentError = useCallback((message: string) => {
    // Show error WITHOUT canceling the timer
    setPaymentError(message);
  }, []);

  return (
    <section className="min-h-[calc(100vh-140px)] px-4 py-10 bg-white dark:bg-gray-800">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            <i className="bi bi-credit-card mr-2 text-blue-600" />
            Pago de Consulta
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete el pago para confirmar su cita médica.
          </p>
        </div>

        {/* Timer expired banner */}
        {timerExpired && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-5 text-center text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-clock-history text-3xl block mb-2" />
            <p className="font-bold">El tiempo para confirmar su cita ha expirado. El horario seleccionado ha sido liberado.</p>
            <p className="text-sm mt-1">Por favor, seleccione un nuevo horario. Será redirigido en unos segundos...</p>
          </div>
        )}

        {!timerExpired && (
          <div className="flex flex-col gap-6">
            {/* Timer */}
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-700 dark:bg-yellow-900/20">
              <ReservationTimer
                appointmentId={appointmentId}
                createdAt={createdAt}
                onExpired={handleTimerExpired}
              />
            </div>

            {/* Appointment summary */}
            <div className="rounded-2xl border border-gray-100 p-6 shadow-sm dark:border-gray-700">
              <h2 className="mb-4 font-bold text-gray-800 dark:text-gray-100">
                <i className="bi bi-clipboard2-check mr-2 text-blue-600" />
                Resumen de la Cita
              </h2>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Médico</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">{doctorName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Especialidad</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">{specialtyName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Sucursal</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">{branchName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatDateLong(appointmentDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Hora</dt>
                  <dd className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatTime(appointmentDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Total a Pagar</dt>
                  <dd className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    Q{amount.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Payment error */}
            {paymentError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                <i className="bi bi-exclamation-triangle-fill mr-2" />
                {paymentError}
              </div>
            )}

            {/* Payment form */}
            <div className="rounded-2xl border border-gray-100  p-6 shadow-sm dark:border-gray-700 ">
              <PaymentForm
                amount={amount}
                appointmentId={appointmentId}
                onPaymentError={handlePaymentError}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default PortalPaymentPage;

export function Component() {
  return <PortalPaymentPage />;
}
Component.displayName = "PortalPaymentPage";
