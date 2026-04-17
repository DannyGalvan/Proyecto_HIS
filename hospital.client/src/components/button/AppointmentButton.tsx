import { Button, Dropdown, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { deleteAppointment } from "../../services/appointmentService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import { validationFailureToString } from "../../utils/converted";
import { Icon } from "../icons/Icon";
import { ConfirmDialog } from "../modal/ConfirmDialog";

interface AppointmentButtonProps {
  readonly data: AppointmentResponse;
}

export function AppointmentButton({ data }: AppointmentButtonProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = useCallback(() => {
    navigate(`/appointment/view/${data.id}`);
  }, [navigate, data.id]);

  const handleDeleteClick = useCallback(() => setIsDeleteDialogOpen(true), []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteAppointment(data.id);
      if (response.success) {
        toast.success(`Cita #${data.id} eliminada correctamente`);
        await queryClient.invalidateQueries({ queryKey: ["appointments"] });
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

  const handleCloseDialog = useCallback(() => {
    if (!isDeleting) setIsDeleteDialogOpen(false);
  }, [isDeleting]);

  return (
    <>
      <Dropdown>
        <Dropdown.Trigger>
          <Button isIconOnly size="sm" variant="primary">
            <Icon name="bi bi-three-dots-vertical" />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu aria-label="Acciones de cita">
            <Dropdown.Item key="view" className="text-primary hover:text-white" onClick={handleView}>
              Ver Detalle
            </Dropdown.Item>
            <Dropdown.Item key="delete" className="text-danger hover:text-white" onClick={handleDeleteClick}>
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
        message={`¿Está seguro que desea eliminar la cita #${data.id}?`}
        title="Confirmar eliminación"
        onClose={handleCloseDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
