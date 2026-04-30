import { Button } from "@heroui/react";
import { useCallback } from "react";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

interface AppointmentSearchResultProps {
  readonly appt: AppointmentResponse;
  readonly onSelect: (appt: AppointmentResponse) => void;
}

export function AppointmentSearchResult({
  appt,
  onSelect,
}: AppointmentSearchResultProps) {
  const handleClick = useCallback(() => onSelect(appt), [appt, onSelect]);

  return (
    <div
      className="bg-white dark:bg-gray-800 border rounded-xl p-4 flex justify-between items-start gap-4 hover:border-primary/60 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="text-sm space-y-1">
        <p className="font-bold">
          {appt.patient?.name ?? `Paciente #${appt.patientId}`}
        </p>
        <p>
          <span className="font-semibold">Cita #:</span> {appt.id}
        </p>
        <p>
          <span className="font-semibold">Fecha:</span> {appt.appointmentDate}
        </p>
        <p>
          <span className="font-semibold">Especialidad:</span>{" "}
          {appt.specialty?.name ?? "—"}
        </p>
        <p>
          <span className="font-semibold">Sede:</span>{" "}
          {appt.branch?.name ?? "—"}
        </p>
        <p>
          <span className="font-semibold">Médico actual:</span>{" "}
          {appt.doctor?.name ?? (
            <em className="text-orange-500">Sin asignar</em>
          )}
        </p>
      </div>
      <Button size="sm" variant="primary">
        Seleccionar
      </Button>
    </div>
  );
}
