import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { VitalSignForm } from "../../components/form/VitalSignForm";
import { createVitalSign } from "../../services/vitalSignService";
import type { VitalSignRequest } from "../../types/VitalSignResponse";

export function CreateVitalSignPage() {
  const client = useQueryClient();

  const initialData: VitalSignRequest = {
    appointmentId: null, nurseId: null,
    bloodPressureSystolic: null, bloodPressureDiastolic: null,
    temperature: null, weight: null, height: null,
    heartRate: null, isEmergency: false, state: 1,
  };

  const onSubmit = useCallback(
    async (form: VitalSignRequest) => {
      const response = await createVitalSign(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["vital-signs"] });
      toast.success("Signos vitales registrados correctamente");
      return response;
    },
    [client],
  );

  return <VitalSignForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
