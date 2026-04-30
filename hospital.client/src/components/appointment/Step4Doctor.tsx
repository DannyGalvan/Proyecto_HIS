import { useQuery } from "@tanstack/react-query";
import { getDoctorsByBranchAndSpecialty } from "../../services/patientPortalService";
import type { DoctorResponse } from "../../types/PatientPortalTypes";
import { DoctorCard } from "./DoctorCard";

interface Step4DoctorProps {
  readonly branchId: number;
  readonly specialtyId: number;
  readonly specialtyName: string;
  readonly branchName: string;
  readonly onSelect: (doctor: DoctorResponse) => void;
  readonly onBack: () => void;
}

export function Step4Doctor({
  branchId,
  specialtyId,
  specialtyName,
  branchName,
  onSelect,
  onBack,
}: Step4DoctorProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-book-doctors", branchId, specialtyId],
    queryFn: () => getDoctorsByBranchAndSpecialty(branchId, specialtyId),
    staleTime: 1000 * 60 * 5,
  });

  const doctors = data?.success ? data.data : [];

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione un Médico
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-blue-600">{branchName}</span>
        <span className="mx-2 text-gray-300">|</span>
        <span className="font-semibold text-blue-600">{specialtyName}</span>
      </p>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar médicos. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && doctors.length === 0 && (
        <p className="text-center text-gray-400">
          No hay médicos disponibles para esta especialidad en esta sede.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {doctors.map((d) => (
          <DoctorCard
            key={d.id}
            doctor={d}
            specialtyName={specialtyName}
            onSelect={onSelect}
          />
        ))}
      </div>

      <button
        className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        type="button"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left" />
        Volver a especialidades
      </button>
    </div>
  );
}
