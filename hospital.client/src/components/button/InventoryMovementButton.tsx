import { Button, Dropdown, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { partialUpdateInventoryMovement } from "../../services/inventoryMovementService";
import type { InventoryMovementResponse } from "../../types/InventoryMovementResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";
import { ConfirmDialog } from "../modal/ConfirmDialog";

interface InventoryMovementButtonProps {
  readonly data: InventoryMovementResponse;
}

export function InventoryMovementButton({ data }: InventoryMovementButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleView = useCallback(() => navigate(`/inventory-movement/${data.id}`), [navigate, data.id]);
  const handleDeactivateClick = useCallback(() => setIsDeactivateDialogOpen(true), []);

  const handleDeactivateConfirm = useCallback(async () => {
    setIsDeactivating(true);
    try {
      const response = await partialUpdateInventoryMovement({ id: data.id, state: data.state === 1 ? 0 : 1 });
      if (response.success) {
        toast.success(`Movimiento ${data.state === 1 ? "desactivado" : "activado"} correctamente`);
        await queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        setIsDeactivateDialogOpen(false);
      } else {
        toast.danger(`Error: ${response.message} ${validationFailureToString(response.data)}`);
      }
    } catch (error) {
      toast.danger(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsDeactivating(false);
    }
  }, [data, queryClient]);

  const handleCloseDialog = useCallback(() => {
    if (!isDeactivating) setIsDeactivateDialogOpen(false);
  }, [isDeactivating]);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Button isIconOnly size="sm" variant="primary">
            <Icon name="bi bi-three-dots-vertical" />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Acciones">
            <Dropdown.Item key="view" className="text-primary hover:text-white" onClick={handleView}>
              Ver
            </Dropdown.Item>
            <Dropdown.Item key="toggle" className="text-danger hover:text-white" onClick={handleDeactivateClick}>
              {data.state === 1 ? "Desactivar" : "Activar"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <ConfirmDialog
        cancelText="Cancelar"
        confirmText={data.state === 1 ? "Desactivar" : "Activar"}
        isLoading={isDeactivating}
        isOpen={isDeactivateDialogOpen}
        message={`¿Está seguro que desea ${data.state === 1 ? "desactivar" : "activar"} este movimiento de inventario?`}
        title="Confirmar acción"
        onClose={handleCloseDialog}
        onConfirm={handleDeactivateConfirm}
      />
    </>
  );
}
