import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { VitalSignForm } from "../../components/form/VitalSignForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  getVitalSignById,
  updateVitalSign,
} from "../../services/vitalSignService";
import type { VitalSignRequest } from "../../types/VitalSignResponse";
import { computeClinicalAlerts } from "../../utils/clinicalAlerts";
import { validationFailureToString } from "../../utils/converted";

export function UpdateVitalSignPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["vitalSignToUpdate", id],
    queryFn: () => getVitalSignById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: VitalSignRequest) => {
      // Coerce string values from inputs to numbers before sending to backend
      const numericForm = {
        bloodPressureSystolic: form.bloodPressureSystolic != null ? Number(form.bloodPressureSystolic) : null,
        bloodPressureDiastolic: form.bloodPressureDiastolic != null ? Number(form.bloodPressureDiastolic) : null,
        temperature: form.temperature != null ? Number(form.temperature) : null,
        weight: form.weight != null ? Number(form.weight) : null,
        height: form.height != null ? Number(form.height) : null,
        heartRate: form.heartRate != null ? Number(form.heartRate) : null,
      };

      // Compute clinical alerts and persist them
      const alerts = computeClinicalAlerts(numericForm);

      const payload: VitalSignRequest = {
        ...form,
        ...numericForm,
        appointmentId: form.appointmentId != null ? Number(form.appointmentId) : null,
        nurseId: form.nurseId != null ? Number(form.nurseId) : null,
        state: form.state != null ? Number(form.state) : null,
        clinicalAlerts: alerts.length > 0 ? alerts.join(", ") : null,
      };
      const response = await updateVitalSign(payload);
      if (!response.success) {
        toast.danger(
          `${response.message} ${validationFailureToString(response.data)}`,
        );
        return response;
      }
      await client.invalidateQueries({ queryKey: ["vital-signs"] });
      await client.invalidateQueries({ queryKey: ["vitalSignToUpdate", id] });
      toast.success("Signos vitales actualizados correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <VitalSignForm
          initialForm={data.data}
          type="edit"
          onSubmit={onSubmit}
        />
      ) : (
        <div>
          Error: {error instanceof Error ? error.message : "Error desconocido"}
        </div>
      )}
    </div>
  );
}
