import { useQuery } from "@tanstack/react-query";
import { getSpecialtiesByBranch } from "../../services/patientPortalService";
import type { SpecialtyResponse } from "../../types/SpecialtyResponse";
import { SpecialtyCard } from "./SpecialtyCard";

interface Step3SpecialtyProps {
  readonly branchId: number;
  readonly branchName: string;
  readonly onSelect: (specialty: SpecialtyResponse) => void;
  readonly onBack: () => void;
}

export function Step3Specialty({
  branchId,
  branchName,
  onSelect,
  onBack,
}: Step3SpecialtyProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-book-specialties-branch", branchId],
    queryFn: () => getSpecialtiesByBranch(branchId),
    staleTime: 1000 * 60 * 10,
  });

  const specialties = data?.success ? data.data : [];

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione una Especialidad
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Sede: <span className="font-semibold text-blue-600">{branchName}</span>
      </p>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar especialidades. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && specialties.length === 0 && (
        <p className="text-center text-gray-400">
          No hay especialidades disponibles en esta sede.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {specialties.map((s) => (
          <SpecialtyCard key={s.id} specialty={s} onSelect={onSelect} />
        ))}
      </div>

      <button
        className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        type="button"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left" />
        Volver a sedes
      </button>
    </div>
  );
}
