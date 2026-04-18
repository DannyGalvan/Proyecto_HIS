import { useEffect, useRef, useState } from 'react';
import { api } from '../../configs/axios/interceptors';
import type { AppointmentRequest } from '../../types/AppointmentResponse';
import type { ApiResponse } from '../../types/ApiResponse';

interface ReservationTimerProps {
  appointmentId: number;
  createdAt: string; // ISO string
  onExpired: () => void;
}

const RESERVATION_SECONDS = 300; // 5 minutes

/** Calculate remaining seconds based on createdAt timestamp. */
const calcRemaining = (createdAt: string): number => {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  return Math.max(0, RESERVATION_SECONDS - elapsed);
};

/** Format seconds as MM:SS */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Cancel the appointment via PATCH /api/v1/Appointment */
const cancelAppointment = async (appointmentId: number): Promise<void> => {
  try {
    await api.patch<unknown, ApiResponse<unknown>, AppointmentRequest>('Appointment', {
      id: appointmentId,
      // appointmentStatusId will be resolved by the backend to "Cancelada"
      // We send state=0 to mark it as inactive / cancelled
      state: 0,
    });
  } catch {
    // Best-effort cancellation — the backend also enforces the 5-minute window
  }
};

export function ReservationTimer({ appointmentId, createdAt, onExpired }: ReservationTimerProps) {
  const [remaining, setRemaining] = useState<number>(() => calcRemaining(createdAt));
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);

  // Keep the callback ref up to date without restarting the interval
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Warn user before navigating away while timer is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!expiredRef.current) {
        e.preventDefault();
        // Modern browsers show a generic message; setting returnValue is required for legacy support
        e.returnValue =
          'Tienes una reserva activa. Si sales ahora, tu cita será cancelada. ¿Deseas continuar?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Countdown interval
  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const secs = calcRemaining(createdAt);
      setRemaining(secs);

      if (secs <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        void cancelAppointment(appointmentId).then(() => {
          onExpiredRef.current();
        });
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, createdAt]);

  const isUrgent = remaining < 60;
  const colorClass = isUrgent ? 'text-red-600' : 'text-yellow-600';

  return (
    <div
      aria-label={`Tiempo restante para completar el pago: ${formatTime(remaining)}`}
      aria-live="polite"
      className="flex flex-col items-center gap-1"
      role="timer"
    >
      <span className="text-sm font-medium text-gray-600">
        Tiene 5 minutos para confirmar su cita. El horario seleccionado está reservado temporalmente.
      </span>
      <span className={`text-3xl font-bold tabular-nums ${colorClass}`}>
        {formatTime(remaining)}
      </span>
      {isUrgent && remaining > 0 && (
        <span className="text-xs font-medium text-red-500">
          ¡Menos de 1 minuto! Completa el pago ahora.
        </span>
      )}
      {remaining <= 0 && (
        <span className="text-sm font-medium text-red-600">
          La reserva ha expirado.
        </span>
      )}
    </div>
  );
}
