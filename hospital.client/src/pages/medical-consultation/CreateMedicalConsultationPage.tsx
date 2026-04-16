import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { MedicalConsultationForm } from "../../components/form/MedicalConsultationForm";
import { createMedicalConsultation } from "../../services/medicalConsultationService";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";

export function CreateMedicalConsultationPage() {
  const client = useQueryClient();

  const initialData: MedicalConsultationRequest = {
    appointmentId: null, doctorId: null, reasonForVisit: "",
    clinicalFindings: "", diagnosis: "", diagnosisCie10Code: "",
    treatmentPlan: "", consultationStatus: 0, notes: "", state: 1,
  };

  const onSubmit = useCallback(
    async (form: MedicalConsultationRequest) => {
      const response = await createMedicalConsultation(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["medical-consultations"] });
      toast.success("Consulta médica creada correctamente");
      return response;
    },
    [client],
  );

  return <MedicalConsultationForm initialForm={initialData} type="create" onSubmit={onSubmit} />;
}
