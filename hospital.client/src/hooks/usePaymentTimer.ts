import { useEffect, useRef, useState } from 'react';

/**
 * Countdown timer for payment sessions.
 * Decrements every second and calls `onExpiry` when it reaches zero.
 *
 * @param minutes - Session duration in minutes (typically 10)
 * @param onExpiry - Callback invoked when the session expires
 */
export function usePaymentTimer(
  minutes: number,
  onExpiry: () => void,
): { remaining: number; isExpired: boolean } {
  const [remaining, setRemaining] = useState<number>(minutes * 60);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const onExpiryRef = useRef(onExpiry);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the callback ref up to date without restarting the interval
  useEffect(() => {
    onExpiryRef.current = onExpiry;
  }, [onExpiry]);

  useEffect(() => {
    const initialSeconds = minutes * 60;
    setRemaining(initialSeconds);
    setIsExpired(false);

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

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [minutes]);

  return { remaining, isExpired };
}
