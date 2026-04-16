import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { MedicalConsultationForm } from "../../components/form/MedicalConsultationForm";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getMedicalConsultationById, updateMedicalConsultation } from "../../services/medicalConsultationService";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";
import { validationFailureToString } from "../../utils/converted";

export function UpdateMedicalConsultationPage() {
  const { id } = useParams();
  const client = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["consultationToUpdate", id],
    queryFn: () => getMedicalConsultationById(Number(id)),
  });

  const onSubmit = useCallback(
    async (form: MedicalConsultationRequest) => {
      const response = await updateMedicalConsultation(form);
      if (!response.success) { toast.danger(`${response.message} ${validationFailureToString(response.data)}`); return response; }
      await client.invalidateQueries({ queryKey: ["medical-consultations"] });
      await client.invalidateQueries({ queryKey: ["consultationToUpdate", id] });
      toast.success("Consulta médica actualizada correctamente");
      return response;
    },
    [client, id],
  );

  if (isLoading) return <LoadingComponent />;

  return (
    <div>
      {data?.success ? (
        <MedicalConsultationForm initialForm={data.data} type="edit" onSubmit={onSubmit} />
      ) : (
        <div>Error: {error instanceof Error ? error.message : "Error desconocido"}</div>
      )}
    </div>
  );
}
