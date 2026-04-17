import { useCallback, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDoctorAvailability } from '../../services/patientPortalService';
import { formatDateLong } from '../../utils/dateFormatter';

interface DynamicCalendarProps {
  doctorId: number;
  onSlotSelected: (dateTime: Date) => void;
}

/**
 * Returns true if the 30-minute window starting at slotStart overlaps with
 * any of the occupied slots (each also treated as a 30-minute window).
 */
const isSlotOccupied = (slotStart: Date, occupiedSlots: string[]): boolean => {
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  return occupiedSlots.some((occupied) => {
    const occStart = new Date(occupied);
    const occEnd = new Date(occStart.getTime() + 30 * 60 * 1000);
    return slotStart < occEnd && slotEnd > occStart;
  });
};

/** Generate all 30-minute slots from 07:00 to 18:30 for the given date. */
const generateSlots = (date: Date): Date[] => {
  const slots: Date[] = [];
  // Start at 07:00, end at 18:30 (last slot starts at 18:30)
  for (let hour = 7; hour <= 18; hour++) {
    const minutes = hour === 18 ? [0, 30] : [0, 30];
    for (const minute of minutes) {
      if (hour === 18 && minute > 30) break;
      const slot = new Date(date);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
};

/** Format a Date as "yyyy-MM-dd" for the API call. */
const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Format a Date as "HH:MM" for display. */
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function DynamicCalendar({ doctorId, onSlotSelected }: DynamicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const handleDateChange = useCallback(
    async (value: Date) => {
      setSelectedDate(value);
      setSelectedSlot(null);
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
    [doctorId],
  );

  const handleSlotClick = useCallback(
    (slot: Date) => {
      setSelectedSlot(slot);
      onSlotSelected(slot);
    },
    [onSlotSelected],
  );

  const now = new Date();
  const allSlots = selectedDate ? generateSlots(selectedDate) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* react-calendar */}
      <div className="flex justify-center">
        <Calendar
          minDate={new Date()}
          value={selectedDate}
          onChange={(value) => {
            if (value instanceof Date) {
              void handleDateChange(value);
            }
          }}
        />
      </div>

      {/* Slot grid */}
      {selectedDate && (
        <div className="mt-2">
          <h3 className="mb-2 font-semibold text-gray-700">
            Horarios disponibles para el{' '}
            {formatDateLong(selectedDate.toISOString())}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <span className="text-sm text-gray-500">Cargando disponibilidad...</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {allSlots.map((slot) => {
                const isPast = slot <= now;
                const occupied = isSlotOccupied(slot, occupiedSlots);
                const isSelected =
                  selectedSlot !== null && slot.getTime() === selectedSlot.getTime();
                const disabled = isPast || occupied;

                let buttonClass =
                  'rounded px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ';

                if (isSelected) {
                  buttonClass += 'bg-blue-600 text-white focus:ring-blue-500';
                } else if (disabled) {
                  buttonClass +=
                    'cursor-not-allowed bg-gray-100 text-gray-400';
                } else {
                  buttonClass +=
                    'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500';
                }

                return (
                  <button
                    key={slot.toISOString()}
                    aria-label={`Slot ${formatTime(slot)}${occupied ? ' - ocupado' : isPast ? ' - pasado' : ' - disponible'}`}
                    aria-pressed={isSelected}
                    className={buttonClass}
                    disabled={disabled}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                  >
                    {formatTime(slot)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
