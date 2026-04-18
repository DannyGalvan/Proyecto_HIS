import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { AppointmentStatusForm } from "../../components/form/AppointmentStatusForm";
import { createAppointmentStatus } from "../../services/appointmentStatusService";
import type { AppointmentStatusRequest } from "../../types/AppointmentStatusResponse";

export function CreateAppointmentStatusPage() {
  const client = useQueryClient();

  const initialData: AppointmentStatusRequest = { name: "", description: "", state: 1 };

  const onSubmit = useCallback(
    async (form: AppointmentStatusRequest) => {
      const response = await createAppointmentStatus(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["appointment-statuses"] });
      toast.success(`El registro ${form.name} ha sido creado exitosamente.`);
      return response;
    },
    [client],
  );

  return <AppointmentStatusForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
