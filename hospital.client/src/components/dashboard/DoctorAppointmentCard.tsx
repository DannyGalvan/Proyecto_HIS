import { Button } from "@heroui/react";
import { useCallback } from "react";
import {
  STATUS_CONSULTA,
  STATUS_EN_ESPERA,
  STATUS_EVALUADO,
} from "../../configs/constants";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  "En Espera": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Consulta Medica": "bg-blue-100 text-blue-800 border-blue-200",
  Evaluado: "bg-teal-100 text-teal-800 border-teal-200",
};

interface DoctorAppointmentCardProps {
  readonly appointment: AppointmentResponse;
  readonly onAction: (a: AppointmentResponse, action: string) => void;
  readonly isLoading: boolean;
}

export function DoctorAppointmentCard({
  appointment,
  onAction,
  isLoading,
}: DoctorAppointmentCardProps) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass =
    statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isWaiting = appointment.appointmentStatusId === STATUS_EN_ESPERA;
  const isInConsultation = appointment.appointmentStatusId === STATUS_CONSULTA;
  const isEvaluated = appointment.appointmentStatusId === STATUS_EVALUADO;

  const handleStartConsultation = useCallback(
    () => onAction(appointment, "start-consultation"),
    [appointment, onAction],
  );
  const handleNoShow = useCallback(
    () => onAction(appointment, "no-show"),
    [appointment, onAction],
  );
  const handleConsultation = useCallback(
    () => onAction(appointment, "consultation"),
    [appointment, onAction],
  );
  const handleLabOrder = useCallback(
    () => onAction(appointment, "lab-order"),
    [appointment, onAction],
  );
  const handlePrescription = useCallback(
    () => onAction(appointment, "prescription"),
    [appointment, onAction],
  );
  const handleFinish = useCallback(
    () => onAction(appointment, "finish"),
    [appointment, onAction],
  );

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold">
            #{appointment.id} —{" "}
            {appointment.patient?.name ?? `Paciente #${appointment.patientId}`}
          </p>
          <p className="text-sm opacity-75">
            {appointment.specialty?.name ?? "—"}
          </p>
          <p className="text-sm opacity-75">{appointment.appointmentDate}</p>
          {appointment.priority > 0 && (
            <p className="text-red-600 font-bold text-xs">Emergencia</p>
          )}
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
        >
          {statusName}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {isWaiting ? (
          <>
            <Button
              isDisabled={isLoading}
              size="sm"
              variant="primary"
              onPress={handleStartConsultation}
            >
              <i className="bi bi-clipboard2-pulse mr-1" /> Iniciar Consulta
            </Button>
            <Button
              isDisabled={isLoading}
              size="sm"
              variant="danger"
              onPress={handleNoShow}
            >
              <i className="bi bi-person-x mr-1" /> No Asistio
            </Button>
          </>
        ) : null}
        {isInConsultation ? (
          <Button
            isDisabled={isLoading}
            size="sm"
            variant="primary"
            onPress={handleConsultation}
          >
            <i className="bi bi-clipboard2 mr-1" /> Ver / Completar Consulta
          </Button>
        ) : null}
        {isEvaluated ? (
          <>
            <Button
              isDisabled={isLoading}
              size="sm"
              variant="secondary"
              onPress={handleLabOrder}
            >
              <i className="bi bi-flask mr-1" /> Pedir Laboratorio
            </Button>
            <Button
              isDisabled={isLoading}
              size="sm"
              variant="secondary"
              onPress={handlePrescription}
            >
              <i className="bi bi-prescription2 mr-1" /> Receta / Farmacia
            </Button>
            <Button
              isDisabled={isLoading}
              size="sm"
              variant="primary"
              onPress={handleFinish}
            >
              <i className="bi bi-check-circle mr-1" /> Finalizar Atencion
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
