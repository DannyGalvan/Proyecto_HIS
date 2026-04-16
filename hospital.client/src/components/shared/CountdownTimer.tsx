interface CountdownTimerProps {
  /** Remaining time in seconds */
  readonly remaining: number;
  /** Optional label displayed above the timer */
  readonly label?: string;
}

/**
 * Displays a countdown in MM:SS format.
 * Applies red text and border styling when fewer than 60 seconds remain.
 */
export function CountdownTimer({ remaining, label }: CountdownTimerProps) {
  const minutes = Math.floor(Math.max(remaining, 0) / 60);
  const seconds = Math.max(remaining, 0) % 60;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remaining < 60;

  return (
    <div
      className={`inline-flex flex-col items-center gap-1 rounded-md border-2 px-4 py-2 font-mono transition-colors ${
        isUrgent
          ? 'border-red-500 text-red-600'
          : 'border-gray-300 text-gray-700'
      }`}
    >
      {label && (
        <span className="text-xs font-sans font-medium uppercase tracking-wide">
          {label}
        </span>
      )}
      <span className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-gray-800'}`}>
        {formatted}
      </span>
    </div>
  );
}
