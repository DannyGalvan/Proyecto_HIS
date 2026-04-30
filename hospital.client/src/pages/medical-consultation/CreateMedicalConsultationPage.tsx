import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CreateMedicalConsultationGuard } from "../../components/medicalConsultation/CreateMedicalConsultationGuard";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";

export function CreateMedicalConsultationPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const appointmentIdParam = searchParams.get("appointmentId");
  const doctorIdParam = searchParams.get("doctorId");
  const patientNameParam = searchParams.get("patientName");

  const handleSubmitSuccess = useCallback(() => {
    client.invalidateQueries({ queryKey: ["medical-consultations"] });
    client.invalidateQueries({ queryKey: ["doctor-appointments"] });
    navigate(nameRoutes.doctorDashboard);
  }, [client, navigate]);

  if (!appointmentIdParam) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel del Medico"
        backRoute={nameRoutes.doctorDashboard}
        icon="bi-shield-exclamation"
        message="No puedes crear una consulta medica sin que provenga de una cita medica activa. Las consultas solo pueden iniciarse desde el panel del medico."
        title="Acceso no permitido"
      />
    );
  }

  return (
    <CreateMedicalConsultationGuard
      appointmentId={Number(appointmentIdParam)}
      doctorId={doctorIdParam ? Number(doctorIdParam) : (userId ?? 0)}
      patientName={patientNameParam ?? undefined}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
}
