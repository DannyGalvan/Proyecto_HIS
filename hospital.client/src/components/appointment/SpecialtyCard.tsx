import { useCallback } from "react";
import { SPECIALTY_ICONS } from "../../configs/constants";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";

interface SpecialtyCardProps {
  readonly specialty: SpecialtyResponse;
  readonly onSelect: (specialty: SpecialtyResponse) => void;
}

export function SpecialtyCard({ specialty, onSelect }: SpecialtyCardProps) {
  const handleClick = useCallback(
    () => onSelect(specialty),
    [specialty, onSelect],
  );
  const icon = SPECIALTY_ICONS[specialty.name] ?? "bi-hospital";

  return (
    <button
      className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-blue-500"
      type="button"
      onClick={handleClick}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <i className={`bi ${icon} text-2xl text-blue-600 dark:text-blue-300`} />
      </div>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {specialty.name}
      </span>
    </button>
  );
}
