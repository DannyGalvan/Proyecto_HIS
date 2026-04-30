import { Button } from "@heroui/react";
import { useCallback } from "react";
import {
  STATUS_PACIENTE_PRESENTE,
  STATUS_SIGNOS,
} from "../../configs/constants";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  "Paciente Presente": "bg-green-100 text-green-800 border-green-200",
  "Signos Vitales": "bg-purple-100 text-purple-800 border-purple-200",
};

interface NurseAppointmentCardProps {
  readonly appointment: AppointmentResponse;
  readonly onStartVitals: (a: AppointmentResponse) => void;
  readonly onGoToForm: (a: AppointmentResponse) => void;
  readonly isLoading: boolean;
}

export function NurseAppointmentCard({
  appointment,
  onStartVitals,
  onGoToForm,
  isLoading,
}: NurseAppointmentCardProps) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass =
    statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isPresent =
    appointment.appointmentStatusId === STATUS_PACIENTE_PRESENTE;
  const isVitals = appointment.appointmentStatusId === STATUS_SIGNOS;
  const patientName =
    appointment.patient?.name ?? `Paciente #${appointment.patientId}`;

  const handleStartVitals = useCallback(
    () => onStartVitals(appointment),
    [appointment, onStartVitals],
  );

  const handleGoToForm = useCallback(
    () => onGoToForm(appointment),
    [appointment, onGoToForm],
  );

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-base">
            #{appointment.id} — {patientName}
          </p>
          <p className="text-sm opacity-75">
            {appointment.specialty?.name ?? "—"}
          </p>
          <p className="text-sm opacity-75">
            {appointment.branch?.name ?? "—"}
          </p>
          <p className="text-sm opacity-75">{appointment.appointmentDate}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
        >
          {statusName}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {isPresent ? (
          <Button
            isDisabled={isLoading}
            size="sm"
            variant="primary"
            onPress={handleStartVitals}
          >
            <i className="bi bi-megaphone mr-1" />
            Llamar y Tomar Signos
          </Button>
        ) : null}
        {isVitals ? (
          <Button
            isDisabled={isLoading}
            size="sm"
            variant="primary"
            onPress={handleGoToForm}
          >
            <i className="bi bi-heart-pulse mr-1" />
            Registrar Signos Vitales
          </Button>
        ) : null}
      </div>
    </div>
  );
}
