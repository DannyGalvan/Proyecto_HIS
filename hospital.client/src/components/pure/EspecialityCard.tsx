import { useCallback } from "react";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";

const SPECIALTY_ICONS: Record<string, string> = {
  Cardiologia: "bi-heart-pulse",
  Pediatria: "bi-person-hearts",
  Neurologia: "bi-brain",
  Ortopedia: "bi-bandaid",
  Ginecologia: "bi-gender-female",
  Dermatologia: "bi-droplet",
  Oftalmologia: "bi-eye",
  "Medicina General": "bi-clipboard2-pulse",
};

function EspecialityCard({
  specialty,
  onSelect,
}: {
  readonly specialty: SpecialtyResponse;
  readonly onSelect: (s: SpecialtyResponse) => void;
}) {
  const icon = SPECIALTY_ICONS[specialty.name] ?? "bi-hospital";

  const handleSelect = useCallback(() => {
    onSelect(specialty);
  }, [onSelect, specialty]);

  return (
    <button
      key={specialty.id}
      className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-5 text-center shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
      type="button"
      onClick={handleSelect}
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

export default EspecialityCard;
