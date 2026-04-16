import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown timer for appointment reservation slots.
 * Decrements every second and calls `onExpiry` when it reaches zero.
 *
 * @param minutes - Initial duration in minutes
 * @param onExpiry - Callback invoked when the timer reaches zero
 */
export function useReservationTimer(
  minutes: number,
  onExpiry: () => void,
): { remaining: number; isExpired: boolean; reset: () => void } {
  const [remaining, setRemaining] = useState<number>(minutes * 60);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const onExpiryRef = useRef(onExpiry);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the callback ref up to date without restarting the interval
  useEffect(() => {
    onExpiryRef.current = onExpiry;
  }, [onExpiry]);

  const startInterval = useCallback((initialSeconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let seconds = initialSeconds;

    intervalRef.current = setInterval(() => {
      seconds -= 1;
      setRemaining(seconds);

      if (seconds <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsExpired(true);
        onExpiryRef.current();
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const initialSeconds = minutes * 60;
    setRemaining(initialSeconds);
    setIsExpired(false);
    startInterval(initialSeconds);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [minutes, startInterval]);

  const reset = useCallback(() => {
    setIsExpired(false);
    const initialSeconds = minutes * 60;
    setRemaining(initialSeconds);
    startInterval(initialSeconds);
  }, [minutes, startInterval]);

  return { remaining, isExpired, reset };
}
