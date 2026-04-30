import { toast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import {
  createMedicalConsultation,
  getMedicalConsultations,
} from "../../services/medicalConsultationService";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";
import { MedicalConsultationForm } from "../form/MedicalConsultationForm";
import { LoadingComponent } from "../spinner/LoadingComponent";

interface CreateMedicalConsultationGuardProps {
  readonly appointmentId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onSubmitSuccess: () => void;
}

export function CreateMedicalConsultationGuard({
  appointmentId,
  doctorId,
  patientName,
  onSubmitSuccess,
}: CreateMedicalConsultationGuardProps) {
  const navigate = useNavigate();

  const handleNavigateDashboard = useCallback(
    () => navigate(nameRoutes.doctorDashboard),
    [navigate],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["consultation-check", appointmentId],
    queryFn: () =>
      getMedicalConsultations({
        pageNumber: 1,
        pageSize: 1,
        filters: `AppointmentId:eq:${appointmentId} AND State:eq:1`,
        include: null,
        includeTotal: false,
      }),
    staleTime: 0,
  });

  const existing = data?.success && data.data.length > 0 ? data.data[0] : null;

  const handleNavigateExistingConsultation = useCallback(() => {
    if (existing) navigate(`/medical-consultation/update/${existing.id}`);
  }, [existing, navigate]);

  const handleFormSubmit = useCallback(
    async (form: MedicalConsultationRequest) => {
      const response = await createMedicalConsultation(form);
      if (response.success) {
        if (form.consultationStatus === 1) {
          toast.success(
            "La consulta ha sido finalizada exitosamente. El paciente puede proceder a las siguientes indicaciones médicas.",
          );
        } else {
          toast.success(
            "Consulta médica registrada exitosamente. Puede continuar editándola desde el panel del médico.",
          );
        }
        onSubmitSuccess();
      } else {
        toast.danger(response.message);
      }
      return response;
    },
    [onSubmitSuccess],
  );

  if (isLoading) return <LoadingComponent />;

  if (existing && existing.consultationStatus !== 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-clipboard2-pulse text-6xl text-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Ya existe una consulta en curso
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta cita ya tiene una consulta médica registrada que aún no ha sido
          finalizada. Puedes continuar editándola.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={handleNavigateExistingConsultation}
        >
          <i className="bi bi-pencil-square mr-1" />
          Continuar Consulta Existente
        </button>
        <button
          className="text-sm text-gray-400 hover:text-gray-600"
          type="button"
          onClick={handleNavigateDashboard}
        >
          Volver al panel
        </button>
      </div>
    );
  }

  if (existing && existing.consultationStatus === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-check-circle text-6xl text-green-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Consulta ya finalizada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta cita ya tiene una consulta médica completada. No es posible crear
          una nueva. Puedes ver la consulta existente o regresar al panel.
        </p>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 rounded-xl bg-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
            type="button"
            onClick={handleNavigateExistingConsultation}
          >
            <i className="bi bi-eye mr-1" />
            Ver Consulta
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors"
            type="button"
            onClick={handleNavigateDashboard}
          >
            <i className="bi bi-arrow-left mr-1" />
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  const initialData: MedicalConsultationRequest = {
    appointmentId,
    doctorId,
    reasonForVisit: "",
    clinicalFindings: "",
    diagnosis: "",
    diagnosisCie10Code: "",
    treatmentPlan: "",
    consultationStatus: 0,
    notes: "",
    state: 1,
  };

  return (
    <MedicalConsultationForm
      fromDoctorDashboard
      initialForm={initialData}
      patientName={patientName}
      type="create"
      onSubmit={handleFormSubmit}
    />
  );
}
