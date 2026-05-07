import { Button, Spinner, toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  getRolOperations,
  patchRolOperation,
} from "../../services/rolOperationService";
import type { ApiResponse } from "../../types/ApiResponse";
import type { OperationResponse } from "../../types/OperationResponse";
import type { RolOperationResponse } from "../../types/RolOperationResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";

interface OperationVisibilityButtonProps {
  readonly data: OperationResponse;
}

/**
 * Toggle del flag IsVisible de la asignación rol-operación.
 * Solo es interactuable cuando la operación está asignada al rol; si no, se
 * deshabilita porque no hay fila en RolOperations sobre la cual hacer PATCH.
 *
 * IsVisible=true → la operación contribuye a mostrar el módulo en el menú del rol.
 * IsVisible=false → el endpoint sigue siendo callable pero el módulo no aparece
 *                   en la navegación (útil para permisos de lookup interno).
 */
export function OperationVisibilityButton({
  data,
}: OperationVisibilityButtonProps) {
  const { id } = useParams();
  const client = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: operationsResponse } = useQuery<
    ApiResponse<RolOperationResponse[]>
  >({
    queryKey: ["operationsForRol", id],
    queryFn: async () =>
      getRolOperations({
        filters: `RolId:eq:${id}`,
        pageNumber: 1,
        pageSize: 1000,
        include: null,
        includeTotal: false,
      }),
    enabled: !!id,
  });

  const operations: RolOperationResponse[] = useMemo(
    () =>
      operationsResponse?.success && Array.isArray(operationsResponse.data)
        ? operationsResponse.data
        : [],
    [operationsResponse],
  );

  const assignment = operations.find(
    (operation: RolOperationResponse) => operation.operationId === data.id,
  );
  const hasPermission = !!assignment;
  const isVisible = assignment?.isVisible ?? false;

  const handleToggleVisibility = useCallback(async () => {
    if (!assignment) return;

    setIsLoading(true);
    // Reenviamos todos los campos de la asignación junto con el nuevo IsVisible
    // para que el PATCH no termine sobrescribiendo State/RolId/OperationId con
    // los defaults del int (Util.UpdateProperties solo ignora int=0 si la prop
    // se llama "OrdersQuantity"). Asignación y visibilidad son independientes:
    // toggle visibilidad NO debe desasignar.
    const response = await patchRolOperation({
      id: assignment.id,
      rolId: assignment.rolId,
      operationId: assignment.operationId,
      state: assignment.state,
      isVisible: !isVisible,
    });

    if (response.success) {
      await client.invalidateQueries({ queryKey: ["operationsForRol", id] });
      toast.success(
        `Permiso ${data.name} ${!isVisible ? "visible" : "oculto"} en el menú`,
      );
      setIsLoading(false);
      return;
    }

    toast.danger(
      `No se pudo actualizar la visibilidad: ${response.message} ${validationFailureToString(response.data)}`,
    );
    setIsLoading(false);
  }, [assignment, isVisible, data, client, id]);

  if (!hasPermission) {
    return (
      <Button disabled size="sm" variant="secondary">
        —
      </Button>
    );
  }

  return (
    <Button
      isPending={isLoading}
      size="sm"
      variant={isVisible ? "primary" : "secondary"}
      onPress={handleToggleVisibility}
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          <Icon name={isVisible ? "bi bi-eye" : "bi bi-eye-slash"} />
          {isVisible ? "Visible" : "Oculto"}
        </>
      )}
    </Button>
  );
}
