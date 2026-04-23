import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getBranches } from "../../services/branchService";
import type { BranchResponse } from "../../types/BranchResponse";
import BranchCard from "../pure/BranchCard";

// Step 1: Branch selection
export function Step1Branch({
  onSelect,
}: {
  readonly onSelect: (branch: BranchResponse) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-branches"],
    queryFn: () =>
      getBranches({
        pageNumber: 1,
        pageSize: 50,
        filters: "State:eq:1",
        include: null,
        includeTotal: false,
      }),
    staleTime: 1000 * 60 * 10,
  });

  const handleSelect = useCallback(
    (branch: BranchResponse) => {
      onSelect(branch);
    },
    [onSelect],
  );

  const branches = data?.success ? data.data : [];
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-800 dark:text-gray-100">
        Seleccione una Sede
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Elija la sede donde desea atenderse.
      </p>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="bi bi-hourglass-split animate-spin text-3xl text-blue-500" />
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <i className="bi bi-exclamation-triangle mr-2" />
          Error al cargar sedes. Intente de nuevo.
        </div>
      ) : null}
      {!isLoading && !isError && branches.length === 0 && (
        <p className="text-center text-gray-400">No hay sedes disponibles.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {branches.map((b) => (
          <BranchCard key={b.id} branch={b} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
