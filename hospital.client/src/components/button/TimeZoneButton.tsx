import { useCallback } from "react";
import type { TimezoneResponse } from "../../types/TimezoneResponse";

interface TimezoneButtonProps {
  readonly tz: TimezoneResponse;
  readonly isCurrent: boolean;
  readonly onSelect: (tz: TimezoneResponse) => void;
}

export function TimezoneButton({
  tz,
  isCurrent,
  onSelect,
}: TimezoneButtonProps) {
  const handleClick = useCallback(() => onSelect(tz), [tz, onSelect]);

  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
        isCurrent
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
      }`}
      type="button"
      onClick={handleClick}
    >
      <span className="block truncate">{tz.displayName}</span>
    </button>
  );
}
