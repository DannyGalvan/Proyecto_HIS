import { toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MedicalConsultationForm } from "../../components/form/MedicalConsultationForm";
import { createMedicalConsultation } from "../../services/medicalConsultationService";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";

export function CreateMedicalConsultationPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const appointmentIdParam = searchParams.get("appointmentId");
  const doctorIdParam = searchParams.get("doctorId");
  const patientNameParam = searchParams.get("patientName");
  const fromDoctorDashboard = !!appointmentIdParam;

  const initialData: MedicalConsultationRequest = {
    appointmentId: appointmentIdParam ? Number(appointmentIdParam) : null,
    doctorId: doctorIdParam ? Number(doctorIdParam) : (userId ?? null),
    reasonForVisit: "",
    clinicalFindings: "",
    diagnosis: "",
    diagnosisCie10Code: "",
    treatmentPlan: "",
    consultationStatus: 0,
    notes: "",
    state: 1,
  };

  const onSubmit = useCallback(
    async (form: MedicalConsultationRequest) => {
      const response = await createMedicalConsultation(form);
      if (!response.success) { toast.danger(response.message); return response; }
      await client.invalidateQueries({ queryKey: ["medical-consultations"] });
      await client.invalidateQueries({ queryKey: ["doctor-appointments"] });
      toast.success("Consulta médica guardada correctamente");
      if (fromDoctorDashboard) {
        navigate(nameRoutes.doctorDashboard);
      }
      return response;
    },
    [client, navigate, fromDoctorDashboard],
  );

  return (
    <MedicalConsultationForm
      fromDoctorDashboard={fromDoctorDashboard}
      initialForm={initialData}
      patientName={patientNameParam ?? undefined}
      type="create"
      onSubmit={onSubmit}
    />
  );
}
