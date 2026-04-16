import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { AppointmentForm } from "../../components/form/AppointmentForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointmentById, updateAppointment } from "../../services/appointmentService";
import type { AppointmentRequest } from "../../types/AppointmentResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateAppointmentPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["appointmentToUpdate", id],
    queryFn: () => getAppointmentById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: AppointmentRequest) => {
      const response = await updateAppointment(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["appointments"] });
      await client.invalidateQueries({ queryKey: ["appointmentToUpdate", id] });
      toast.success("Cita actualizada correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <AppointmentForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
