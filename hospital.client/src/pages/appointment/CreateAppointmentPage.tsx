import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { AppointmentForm } from "../../components/form/AppointmentForm";
import { createAppointment } from "../../services/appointmentService";
import type { AppointmentRequest } from "../../types/AppointmentResponse";

export function CreateAppointmentPage() {
  const client = useQueryClient();
  const navigate = useNavigate();

  const initialData: AppointmentRequest = {
    patientId: null,
    doctorId: null,
    specialtyId: null,
    branchId: null,
    appointmentStatusId: null,
    appointmentDate: null,
    reason: "",
    notes: "",
    state: 1,
  };

  const onSubmit = useCallback(
    async (form: AppointmentRequest) => {
      const response = await createAppointment(form);
      if (!response.success) {
        toast.danger(response.message);
        return response;
      }
      await client.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cita agendada correctamente");
      return response;
    },
    [client],
  );

  const onSuccess = useCallback(
    (appointmentId: number) => {
      navigate(`/payment?appointmentId=${appointmentId}`);
    },
    [navigate],
  );

  return (
    <AppointmentForm
      initialForm={initialData}
      type="create"
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  );
}
