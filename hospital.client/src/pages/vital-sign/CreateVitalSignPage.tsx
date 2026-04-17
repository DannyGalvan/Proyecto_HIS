import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { VitalSignForm } from "../../components/form/VitalSignForm";
import { createVitalSign } from "../../services/vitalSignService";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import type { VitalSignRequest } from "../../types/VitalSignResponse";

export function CreateVitalSignPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  // Read context from URL params (set by NurseDashboardPage)
  const appointmentIdParam = searchParams.get("appointmentId");
  const nurseIdParam = searchParams.get("nurseId");
  const patientNameParam = searchParams.get("patientName");
  const fromNurseDashboard = !!appointmentIdParam;

  const initialData: VitalSignRequest = {
    appointmentId: appointmentIdParam ? Number(appointmentIdParam) : null,
    nurseId: nurseIdParam ? Number(nurseIdParam) : (userId ?? null),
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    temperature: null,
    weight: null,
    height: null,
    heartRate: null,
    isEmergency: false,
    state: 1,
  };

  const onSubmit = useCallback(
    async (form: VitalSignRequest) => {
      const response = await createVitalSign(form);
      if (!response.success) {
        toast.danger(response.message);
        return response;
      }
      await client.invalidateQueries({ queryKey: ["vital-signs"] });
      await client.invalidateQueries({ queryKey: ["nurse-appointments"] });
      toast.success("Signos vitales registrados. El paciente pasa a En Espera.");
      // Return to nurse dashboard if we came from there
      if (fromNurseDashboard) {
        navigate(nameRoutes.nurseDashboard);
      }
      return response;
    },
    [client, navigate, fromNurseDashboard],
  );

  return (
    <VitalSignForm
      fromNurseDashboard={fromNurseDashboard}
      initialForm={initialData}
      patientName={patientNameParam ?? undefined}
      type="create"
      onSubmit={onSubmit}
    />
  );
}
