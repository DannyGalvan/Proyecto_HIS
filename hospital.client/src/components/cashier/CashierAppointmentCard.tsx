import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

interface CashierAppointmentCardProps {
  readonly appointment: AppointmentResponse;
  readonly onSelect: (appointment: AppointmentResponse) => void;
}

export function CashierAppointmentCard({
  appointment,
  onSelect,
}: CashierAppointmentCardProps) {
  const handleClick = useCallback(
    () => onSelect(appointment),
    [appointment, onSelect],
  );

  return (
    <div
      className="border rounded-xl p-4 bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">
            {appointment.patient?.name ?? `Paciente #${appointment.patientId}`}
          </p>
          <p className="text-sm text-gray-600">
            Cita #{appointment.id} · {appointment.specialty?.name} ·{" "}
            {appointment.appointmentDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-700">
            Q{appointment.amount?.toFixed(2)}
          </p>
          <Button size="sm" variant="primary">
            Cobrar
          </Button>
        </div>
      </div>
    </div>
  );
}
