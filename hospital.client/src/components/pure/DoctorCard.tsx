import { useCallback } from "react";
import type { DoctorResponse } from "../../types/PatientPortalTypes";

function DoctorCard({
  doctor,
  onSelect,
  specialityName,
}: {
  readonly doctor: DoctorResponse;
  readonly onSelect: (d: DoctorResponse) => void;
  readonly specialityName: string;
}) {
  const handleSelect = useCallback(() => onSelect(doctor), [onSelect, doctor]);

  return (
    <button
      key={doctor.id}
      className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-500"
      type="button"
      onClick={handleSelect}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
        <i className="bi bi-person-badge text-2xl text-cyan-600 dark:text-cyan-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">
          {doctor.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {doctor.specialtyName ?? specialityName}
        </p>
      </div>
      <i className="bi bi-chevron-right ml-auto text-gray-400" />
    </button>
  );
}

export default DoctorCard;
