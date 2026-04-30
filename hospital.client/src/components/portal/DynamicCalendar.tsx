import { useCallback, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { UseAppointmentHubReturn } from "../../hooks/useAppointmentHub";
import { getDoctorAvailability } from "../../services/patientPortalService";
import { formatDateLong } from "../../utils/dateFormatter";
import {
  formatDateForApi,
  formatTime,
  generateSlots,
  isSlotOccupied,
} from "../../utils/dynamicCalendar";
import { SlotButton } from "./SlotButton";

interface DynamicCalendarProps {
  readonly doctorId: number;
  readonly onSlotSelected: (dateTime: Date) => void;
  /** Optional SignalR hub state — when provided, enables real-time slot blocking */
  readonly hub?: UseAppointmentHubReturn;
  /** The currently selected date (controlled from parent for hub group management) */
  readonly onDateChange?: (date: string | null) => void;
}

export function DynamicCalendar({
  doctorId,
  onSlotSelected,
  hub,
  onDateChange,
}: DynamicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Use hub state from props (or fallback to empty defaults if not provided)
  const connectionState = hub?.connectionState ?? "disconnected";
  const lockedSlots = hub?.lockedSlots ?? new Map();
  const confirmedSlots = hub?.confirmedSlots ?? new Set();
  const myLockedSlot = hub?.myLockedSlot ?? null;
  const lockSlot = hub?.lockSlot;
  const hubError = hub?.error ?? null;

  const handleDateChange = useCallback(
    async (value: Date) => {
      setSelectedDate(value);
      onDateChange?.(formatDateForApi(value));
      setLoading(true);
      try {
        const formattedDate = formatDateForApi(value);
        const response = await getDoctorAvailability(doctorId, formattedDate);
        if (response.success && response.data) {
          setOccupiedSlots(response.data.occupiedSlots ?? []);
        } else {
          setOccupiedSlots([]);
        }
      } catch {
        setOccupiedSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [doctorId, onDateChange],
  );

  const handleSlotClick = useCallback(
    async (slot: Date) => {
      const time = formatTime(slot);
      if (lockSlot) {
        await lockSlot(time);
      }
      onSlotSelected(slot);
    },
    [onSlotSelected, lockSlot],
  );

  const handleCalendarChange = useCallback(
    (value: Date | Date[] | null | [Date | null, Date | null]) => {
      if (value instanceof Date) {
        void handleDateChange(value);
      }
    },
    [handleDateChange],
  );

  const now = new Date();
  const allSlots = selectedDate ? generateSlots(selectedDate) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* react-calendar */}
      <div className="flex justify-center">
        <Calendar
          calendarType="iso8601"
          className="text-xl text-black"
          minDate={new Date()}
          value={selectedDate}
          onChange={handleCalendarChange}
        />
      </div>

      {/* Slot grid */}
      {selectedDate ? (
        <div className="mt-2">
          <h3 className="mb-2 font-semibold text-black dark:text-white">
            Horarios disponibles para el{" "}
            {formatDateLong(selectedDate.toISOString())}
          </h3>

          {/* Connection state indicator */}
          {connectionState === "connecting" && (
            <div className="text-sm text-blue-500">Conectando...</div>
          )}
          {connectionState === "reconnecting" && (
            <div className="text-sm text-amber-600">Reconectando...</div>
          )}
          {connectionState === "disconnected" && selectedDate ? (
            <div className="text-sm text-red-500">
              Desconectado — los horarios pueden no estar actualizados
            </div>
          ) : null}

          {/* Hub error */}
          {hubError ? (
            <div className="text-sm text-red-500">{hubError}</div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-sm text-gray-500">
                Cargando disponibilidad...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {allSlots.map((slot) => {
                const time = formatTime(slot);
                const isPast = slot <= now;
                const occupied = isSlotOccupied(slot, occupiedSlots);
                const isConfirmed = confirmedSlots.has(time);
                const isLockedByOther = lockedSlots.has(time);
                const isSelected = myLockedSlot === time;
                const disabled =
                  isPast || occupied || isLockedByOther || isConfirmed;

                return (
                  <SlotButton
                    key={slot.toISOString()}
                    disabled={disabled}
                    isConfirmed={isConfirmed}
                    isLockedByOther={isLockedByOther}
                    isPast={isPast}
                    isSelected={isSelected}
                    occupied={occupied}
                    slot={slot}
                    time={time}
                    onSlotClick={handleSlotClick}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
