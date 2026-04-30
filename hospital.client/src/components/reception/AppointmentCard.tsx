import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  "Pendiente de Pago": "bg-yellow-100 text-yellow-800 border-yellow-300",
  Confirmada: "bg-green-100 text-green-800 border-green-300",
  "Paciente Presente": "bg-purple-100 text-purple-800 border-purple-300",
  "Signos Vitales": "bg-blue-100 text-blue-800 border-blue-300",
  "En Espera": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Consulta Médica": "bg-cyan-100 text-cyan-800 border-cyan-300",
  Cancelada: "bg-red-100 text-red-800 border-red-300",
  "No Asistió": "bg-orange-100 text-orange-800 border-orange-300",
};

interface AppointmentCardProps {
  readonly appointment: AppointmentResponse;
  readonly onRegisterArrival: (a: AppointmentResponse) => void;
  readonly onNavigate: (path: string) => void;
  readonly isRegistering: boolean;
}

export function AppointmentCard({
  appointment,
  onRegisterArrival,
  onNavigate,
  isRegistering,
}: AppointmentCardProps) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass =
    statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-300";
  const isConfirmed = statusName === "Confirmada";
  const isPatientPresent = statusName === "Paciente Presente";
  const isPendingPayment = statusName === "Pendiente de Pago";
  const isCancelled = statusName === "Cancelada";

  const handleRegisterArrival = useCallback(
    () => onRegisterArrival(appointment),
    [appointment, onRegisterArrival],
  );
  const handleReassign = useCallback(
    () => onNavigate(`/appointment/reassign?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );
  const handlePayment = useCallback(
    () => onNavigate(`/payment/create?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );
  const handleNewAppointment = useCallback(
    () => onNavigate("/appointment/create"),
    [onNavigate],
  );
  const handleVitalSigns = useCallback(
    () => onNavigate(`/vital-sign/create?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );

  return (
    <div className={`border rounded-xl p-5 ${colorClass}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold">
              {appointment.patient?.name ??
                `Paciente #${appointment.patientId}`}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
            >
              {statusName}
            </span>
            {appointment.priority > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                🚨 EMERGENCIA
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="font-semibold">Cita #:</span> {appointment.id}
            </div>
            <div>
              <span className="font-semibold">Especialidad:</span>{" "}
              {appointment.specialty?.name ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Sucursal:</span>{" "}
              {appointment.branch?.name ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Fecha:</span>{" "}
              {appointment.appointmentDate}
            </div>
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold">Motivo:</span>{" "}
              {appointment.reason}
            </div>
            {appointment.arrivalTime ? (
              <div>
                <span className="font-semibold">Llegada:</span>{" "}
                {appointment.arrivalTime}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-45">
          {isConfirmed ? (
            <Button
              isDisabled={isRegistering}
              variant="primary"
              onPress={handleRegisterArrival}
            >
              <i className="bi bi-person-check mr-2" />
              Registrar Llegada
            </Button>
          ) : null}
          {isConfirmed || isPatientPresent ? (
            <Button variant="secondary" onPress={handleReassign}>
              <i className="bi bi-person-badge mr-2" />
              Reasignar Médico
            </Button>
          ) : null}
          {isPatientPresent ? (
            <div className="text-green-700 font-semibold text-sm text-center p-2 bg-green-50 rounded-lg border border-green-200">
              ✅ Llegada registrada — esperando llamado de enfermería
            </div>
          ) : null}
          {isPendingPayment ? (
            <>
              <div className="text-yellow-700 text-xs text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                La cita del paciente tiene estado &apos;Pendiente de Pago&apos;.
                Debe realizar el pago en caja antes de ser atendido.
              </div>
              <Button variant="primary" onPress={handlePayment}>
                <i className="bi bi-cash-coin mr-2" />
                Ir a Caja
              </Button>
            </>
          ) : null}
          {isCancelled ? (
            <>
              <div className="text-red-700 text-xs text-center p-2 bg-red-50 rounded-lg border border-red-200">
                La cita fue cancelada. El paciente debe agendar una nueva cita.
              </div>
              <Button variant="secondary" onPress={handleNewAppointment}>
                <i className="bi bi-calendar-plus mr-2" />
                Nueva Cita
              </Button>
            </>
          ) : null}
          {appointment.priority > 0 && (
            <Button variant="danger" onPress={handleVitalSigns}>
              <i className="bi bi-heart-pulse mr-2" />
              Signos Vitales (Urgente)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
