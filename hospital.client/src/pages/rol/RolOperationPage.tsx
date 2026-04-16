import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router";
import {
  getRolOperationColumns,
  type OperationWithAssignment,
} from "../../components/column/RolOperationResponseColumns";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getOperations } from "../../services/operationService";
import {
  createRolOperation,
  deleteRolOperation,
  getRolOperations,
} from "../../services/rolOperationService";
import type React from "react";
import type { ApiResponse } from "../../types/ApiResponse";
import type { OperationResponse } from "../../types/OperationResponse";
import type { RolOperationResponse } from "../../types/RolOperationResponse";
import type { ApiError } from "../../types/errors";

export function RolOperationPage() {
  const { id } = useParams<{ id: string }>();
  const rolId = Number(id);
  const queryClient = useQueryClient();

  const { data: operationsData, isLoading: loadingOperations } = useQuery<
    ApiResponse<OperationResponse[]>,
    ApiError
  >({
    queryKey: ["operations"],
    queryFn: () =>
      getOperations({ pageSize: 1000, filters: "", include: "" }),
  });

  const { data: rolOperationsData, isLoading: loadingRolOperations } = useQuery<
    ApiResponse<RolOperationResponse[]>,
    ApiError
  >({
    queryKey: ["rolOperations", rolId],
    queryFn: () =>
      getRolOperations({
        pageSize: 1000,
        filters: `RolId:eq:${rolId}`,
        include: "Operation",
      }),
  });

  const mergedRows = useMemo<OperationWithAssignment[]>(() => {
    const allOps = operationsData?.data ?? [];
    const assigned = rolOperationsData?.data ?? [];

    return allOps.map((op) => {
      const match = assigned.find((ro) => ro.operationId === op.id);
      return {
        ...op,
        assigned: !!match,
        rolOperationId: match?.id,
      };
    });
  }, [operationsData, rolOperationsData]);

  const assignMutation = useMutation({
    mutationFn: (op: OperationWithAssignment) =>
      createRolOperation({ id: null, rolId, operationId: op.id, state: 1 }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rolOperations", rolId] });
      await queryClient.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Operación asignada correctamente");
    },
    onError: () => {
      toast.danger("Error al asignar la operación");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (op: OperationWithAssignment) =>
      deleteRolOperation(op.rolOperationId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rolOperations", rolId] });
      await queryClient.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Operación removida correctamente");
    },
    onError: () => {
      toast.danger("Error al remover la operación");
    },
  });

  const handleToggle = (op: OperationWithAssignment) => {
    if (op.assigned) {
      revokeMutation.mutate(op);
    } else {
      assignMutation.mutate(op);
    }
  };

  const columns = useMemo(
    () => getRolOperationColumns(handleToggle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (loadingOperations || loadingRolOperations) {
    return <LoadingComponent />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Gestionar Permisos del Rol
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Asigna o quita operaciones para el rol seleccionado.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id as string}
                  className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
                >
                  {col.name as string}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mergedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-400"
                >
                  No hay operaciones disponibles
                </td>
              </tr>
            ) : (
              mergedRows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.id as string} className="px-4 py-2 text-sm">
                      {"cell" in col && col.cell
                        ? (col.cell as (data: OperationWithAssignment) => React.ReactNode)(row)
                        : "selector" in col && col.selector
                          ? String((col.selector as (data: OperationWithAssignment) => unknown)(row) ?? "")
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
