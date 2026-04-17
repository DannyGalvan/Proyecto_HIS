import { Button, Dropdown, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { deleteBranchSpecialty } from "../../services/branchSpecialtyService";
import type { BranchSpecialtyResponse } from "../../types/BranchSpecialtyResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";
import { ConfirmDialog } from "../modal/ConfirmDialog";

interface BranchSpecialtyButtonProps {
  readonly data: BranchSpecialtyResponse;
}

export function BranchSpecialtyButton({ data }: BranchSpecialtyButtonProps) {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback(() => setIsDeleteDialogOpen(true), []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteBranchSpecialty(data.id);
      if (response.success) {
        const label = `${data.branch?.name ?? data.branchId} — ${data.specialty?.name ?? data.specialtyId}`;
        toast.success(`Asignación "${label}" eliminada correctamente`);
        await queryClient.invalidateQueries({ queryKey: ["branch-specialties"] });
        setIsDeleteDialogOpen(false);
      } else {
        toast.danger(
          `No se pudo eliminar: ${response.message} ${validationFailureToString(response.data)}`,
        );
      }
    } catch (error) {
      toast.danger(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsDeleting(false);
    }
  }, [data, queryClient]);

  const handleCloseDialog = useCallback(() => {
    if (!isDeleting) setIsDeleteDialogOpen(false);
  }, [isDeleting]);

  const label = `${data.branch?.name ?? `Sede #${data.branchId}`} — ${data.specialty?.name ?? `Especialidad #${data.specialtyId}`}`;

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
            <Dropdown.Item
              key="delete"
              className="text-danger hover:text-white"
              onClick={handleDeleteClick}
            >
              Eliminar
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <ConfirmDialog
        cancelText="Cancelar"
        confirmText="Eliminar"
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        message={`¿Está seguro que desea eliminar la asignación "${label}"?`}
        title="Confirmar eliminación"
        onClose={handleCloseDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
