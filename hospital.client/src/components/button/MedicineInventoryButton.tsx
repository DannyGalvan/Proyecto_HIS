import { Button, Dropdown, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { partialUpdateMedicineInventory } from "../../services/medicineService";
import type { MedicineInventoryResponse } from "../../types/MedicineInventoryResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";
import { ConfirmDialog } from "../modal/ConfirmDialog";

interface MedicineInventoryButtonProps {
  readonly data: MedicineInventoryResponse;
}

export function MedicineInventoryButton({ data }: MedicineInventoryButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleEdit = useCallback(() => navigate(`/medicine-inventory/update/${data.id}`), [navigate, data.id]);
  const handleDeactivateClick = useCallback(() => setIsDeactivateDialogOpen(true), []);

  const handleDeactivateConfirm = useCallback(async () => {
    setIsDeactivating(true);
    try {
      const response = await partialUpdateMedicineInventory({ id: data.id, state: data.state === 1 ? 0 : 1 });
      if (response.success) {
        toast.success(`Inventario ${data.state === 1 ? "desactivado" : "activado"} correctamente`);
        await queryClient.invalidateQueries({ queryKey: ["medicine-inventory"] });
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

  const handleCloseDialog = useCallback(() => { if (!isDeactivating) setIsDeactivateDialogOpen(false); }, [isDeactivating]);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Button isIconOnly size="sm" variant="primary"><Icon name="bi bi-three-dots-vertical" /></Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Acciones">
            <Dropdown.Item key="edit" className="text-warning hover:text-white" onClick={handleEdit}>Ajustar Stock</Dropdown.Item>
            <Dropdown.Item key="toggle" className="text-danger hover:text-white" onClick={handleDeactivateClick}>
              {data.state === 1 ? "Desactivar" : "Activar"}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <ConfirmDialog cancelText="Cancelar" confirmText={data.state === 1 ? "Desactivar" : "Activar"}
        isLoading={isDeactivating} isOpen={isDeactivateDialogOpen}
        message={`¿Está seguro que desea ${data.state === 1 ? "desactivar" : "activar"} este registro de inventario?`}
        title="Confirmar acción" onClose={handleCloseDialog} onConfirm={handleDeactivateConfirm} />
    </>
  );
}
