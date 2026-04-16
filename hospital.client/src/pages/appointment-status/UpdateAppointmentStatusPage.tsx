import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { AppointmentStatusForm } from "../../components/form/AppointmentStatusForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointmentStatusById, updateAppointmentStatus } from "../../services/appointmentStatusService";
import type { AppointmentStatusRequest } from "../../types/AppointmentStatusResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateAppointmentStatusPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["appointmentStatusToUpdate", id],
    queryFn: () => getAppointmentStatusById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: AppointmentStatusRequest) => {
      const response = await updateAppointmentStatus(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["appointment-statuses"] });
      await client.invalidateQueries({ queryKey: ["appointmentStatusToUpdate", id] });
      toast.success("Estado de cita actualizado correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <AppointmentStatusForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
