import { useCallback } from "react";
import type { TimezoneResponse } from "../../types/TimezoneResponse";

interface TimezoneItemProps {
  readonly tz: TimezoneResponse;
  readonly currentTz: string;
  readonly onSelect: (tz: TimezoneResponse) => void;
}

export function TimezoneItem({ tz, currentTz, onSelect }: TimezoneItemProps) {
  const handleClick = useCallback(() => onSelect(tz), [onSelect, tz]);

  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
        tz.ianaId === currentTz
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700"
      }`}
      type="button"
      onClick={handleClick}
    >
      {tz.displayName}
    </button>
  );
}
