import { Button, Dropdown, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { deleteAppointmentStatus } from "../../services/appointmentStatusService";
import type { AppointmentStatusResponse } from "../../types/AppointmentStatusResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";
import { ConfirmDialog } from "../modal/ConfirmDialog";

interface AppointmentStatusButtonProps {
  readonly data: AppointmentStatusResponse;
}

export function AppointmentStatusButton({ data }: AppointmentStatusButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = useCallback(() => navigate(`/appointment-status/update/${data.id}`), [navigate, data.id]);
  const handleDeleteClick = useCallback(() => setIsDeleteDialogOpen(true), []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteAppointmentStatus(data.id);
      if (response.success) {
        toast.success(`Estado "${data.name}" eliminado correctamente`);
        await queryClient.invalidateQueries({ queryKey: ["appointment-statuses"] });
        setIsDeleteDialogOpen(false);
      } else {
        toast.danger(`No se pudo eliminar: ${response.message} ${validationFailureToString(response.data)}`);
      }
    } catch (error) {
      toast.danger(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsDeleting(false);
    }
  }, [data, queryClient]);

  const handleCloseDialog = useCallback(() => { if (!isDeleting) setIsDeleteDialogOpen(false); }, [isDeleting]);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Button isIconOnly size="sm" variant="primary"><Icon name="bi bi-three-dots-vertical" /></Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Acciones">
            <Dropdown.Item key="edit" className="text-warning hover:text-white" onClick={handleEdit}>Editar</Dropdown.Item>
            <Dropdown.Item key="delete" className="text-danger hover:text-white" onClick={handleDeleteClick}>Eliminar</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <ConfirmDialog cancelText="Cancelar" confirmText="Eliminar" isLoading={isDeleting} isOpen={isDeleteDialogOpen}
        message={`¿Está seguro que desea eliminar el estado "${data.name}"?`} title="Confirmar eliminación"
        onClose={handleCloseDialog} onConfirm={handleDeleteConfirm} />
    </>
  );
}
