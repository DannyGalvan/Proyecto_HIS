import { useCallback, useState } from "react";
import type { UseAppointmentHubReturn } from "../../hooks/useAppointmentHub";
import { formatDateLong } from "../../utils/dateFormatter";
import { DynamicCalendar } from "../portal/DynamicCalendar";

interface Step5SlotProps {
  readonly doctorId: number;
  readonly doctorName: string;
  readonly specialtyName: string;
  readonly branchName: string;
  readonly hub: UseAppointmentHubReturn;
  readonly onDateChange: (date: string | null) => void;
  readonly onSelect: (dateTime: Date) => void;
  readonly onBack: () => void;
}

export function Step5Slot({
  doctorId,
  doctorName,
  specialtyName,
  branchName,
  hub,
  onDateChange,
  onSelect,
  onBack,
}: Step5SlotProps) {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const handleSlotSelected = useCallback((dt: Date) => setSelectedSlot(dt), []);

  const handleContinue = useCallback(() => {
    if (selectedSlot) onSelect(selectedSlot);
  }, [selectedSlot, onSelect]);

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione Fecha y Horario
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-blue-600">{branchName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{specialtyName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{doctorName}</span>
      </p>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/50">
        <DynamicCalendar
          doctorId={doctorId}
          hub={hub}
          onDateChange={onDateChange}
          onSlotSelected={handleSlotSelected}
        />
      </div>

      {selectedSlot ? (
        <p className="mb-4 text-sm font-medium text-green-600">
          <i className="bi bi-check-circle mr-1" />
          Horario seleccionado: {formatDateLong(selectedSlot.toISOString())}
        </p>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          type="button"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left" />
          Volver a médicos
        </button>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedSlot}
          type="button"
          onClick={handleContinue}
        >
          Continuar
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}
