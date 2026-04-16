import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CardPaymentForm } from '../../components/payment/CardPaymentForm';
import { PaymentReceipt } from '../../components/shared/PaymentReceipt';
import { LoadingComponent } from '../../components/spinner/LoadingComponent';
import { partialUpdateAppointment, getAppointmentById } from '../../services/appointmentService';
import type { PaymentResponse } from '../../types/PaymentResponse';

/** appointmentStatusId that corresponds to "Pagada" */
const PAID_STATUS_ID = 1;

/**
 * Online payment page.
 * Reads appointmentId from the `appointmentId` query param,
 * shows a payment summary, and renders CardPaymentForm.
 * On success, updates the appointment status and shows a receipt.
 */
export function OnlinePaymentPage() {
  const [searchParams] = useSearchParams();
  const appointmentIdParam = searchParams.get('appointmentId');
  const appointmentId = appointmentIdParam ? parseInt(appointmentIdParam, 10) : NaN;

  const [completedPayment, setCompletedPayment] = useState<PaymentResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
    enabled: !isNaN(appointmentId),
  });

  const statusMutation = useMutation({
    mutationFn: () =>
      partialUpdateAppointment({
        id: appointmentId,
        appointmentStatusId: PAID_STATUS_ID,
      }),
  });

  async function handleSuccess(payment: PaymentResponse) {
    // Update appointment status to "Pagada" — fire and forget (non-blocking)
    statusMutation.mutate();
    setCompletedPayment(payment);
  }

  if (isNaN(appointmentId)) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-red-600 font-semibold">
          No se proporcionó un ID de cita válido.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (isError || !data?.success || !data.data) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-red-600 font-semibold">
          No se pudo cargar la información de la cita.
        </p>
      </div>
    );
  }

  const appointment = data.data;
  const patientName = appointment.patient?.name ?? `Paciente #${appointment.patientId}`;
  const specialtyName = appointment.specialty?.name ?? 'Consulta';
  const branchName = appointment.branch?.name ?? '—';

  const formattedDate = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('es-GT', {
        dateStyle: 'long',
      })
    : '—';

  // Show receipt after successful payment
  if (completedPayment) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-800">¡Pago exitoso!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Su cita ha sido confirmada y marcada como pagada.
          </p>
        </div>

        <PaymentReceipt
          payment={completedPayment}
          patientName={patientName}
          serviceDetail={`${specialtyName} — ${formattedDate}`}
          branchName={branchName}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Pago en línea</h1>

      {/* Payment summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Resumen de la cita</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Paciente</dt>
            <dd className="text-gray-800">{patientName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Especialidad</dt>
            <dd className="text-gray-800">{specialtyName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Sucursal</dt>
            <dd className="text-gray-800">{branchName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Fecha</dt>
            <dd className="text-gray-800">{formattedDate}</dd>
          </div>
        </dl>
      </div>

      {/* Card payment form */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <CardPaymentForm
          amount={appointment.amount}
          appointmentId={appointmentId}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
