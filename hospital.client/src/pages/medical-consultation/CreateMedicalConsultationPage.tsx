import { toast } from "@heroui/react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { MedicalConsultationForm } from "../../components/form/MedicalConsultationForm";
import { createMedicalConsultation, getMedicalConsultations } from "../../services/medicalConsultationService";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import type { MedicalConsultationRequest } from "../../types/MedicalConsultationResponse";

export function CreateMedicalConsultationPage() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const appointmentIdParam = searchParams.get("appointmentId");
  const doctorIdParam = searchParams.get("doctorId");
  const patientNameParam = searchParams.get("patientName");

  // ── Guard: no appointmentId → blocked ──────────────────────────────────────
  if (!appointmentIdParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-shield-exclamation text-6xl text-red-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Acceso no permitido
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          No puedes crear una consulta médica sin que provenga de una cita médica activa.
          Las consultas solo pueden iniciarse desde el panel del médico.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => navigate(nameRoutes.doctorDashboard)}
        >
          <i className="bi bi-arrow-left" />
          Ir al Panel del Médico
        </button>
      </div>
    );
  }

  // ── Check if a consultation already exists for this appointment ─────────────
  return (
    <CreateMedicalConsultationGuard
      appointmentId={Number(appointmentIdParam)}
      doctorId={doctorIdParam ? Number(doctorIdParam) : (userId ?? 0)}
      patientName={patientNameParam ?? undefined}
      onSubmitSuccess={() => {
        client.invalidateQueries({ queryKey: ["medical-consultations"] });
        client.invalidateQueries({ queryKey: ["doctor-appointments"] });
        navigate(nameRoutes.doctorDashboard);
      }}
    />
  );
}

// ── Inner component that runs the duplicate check ─────────────────────────────
function CreateMedicalConsultationGuard({
  appointmentId,
  doctorId,
  patientName,
  onSubmitSuccess,
}: {
  readonly appointmentId: number;
  readonly doctorId: number;
  readonly patientName?: string;
  readonly onSubmitSuccess: () => void;
}) {
  const navigate = useNavigate();

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
    staleTime: 0, // always fresh
  });

  if (isLoading) return <LoadingComponent />;

  const existing = data?.success && data.data.length > 0 ? data.data[0] : null;

  // Consultation exists and is NOT completed → redirect to update it
  if (existing && existing.consultationStatus !== 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-clipboard2-pulse text-6xl text-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Ya existe una consulta en curso
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta cita ya tiene una consulta médica registrada que aún no ha sido finalizada.
          Puedes continuar editándola.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => navigate(`/medical-consultation/update/${existing.id}`)}
        >
          <i className="bi bi-pencil-square mr-1" />
          Continuar Consulta Existente
        </button>
        <button
          className="text-sm text-gray-400 hover:text-gray-600"
          type="button"
          onClick={() => navigate(nameRoutes.doctorDashboard)}
        >
          Volver al panel
        </button>
      </div>
    );
  }

  // Consultation exists and IS completed → show info
  if (existing && existing.consultationStatus === 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-check-circle text-6xl text-green-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Consulta ya finalizada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta cita ya tiene una consulta médica completada. No es posible crear una nueva.
          Puedes ver la consulta existente o regresar al panel.
        </p>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 rounded-xl bg-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
            type="button"
            onClick={() => navigate(`/medical-consultation/update/${existing.id}`)}
          >
            <i className="bi bi-eye mr-1" />
            Ver Consulta
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 transition-colors"
            type="button"
            onClick={() => navigate(nameRoutes.doctorDashboard)}
          >
            <i className="bi bi-arrow-left mr-1" />
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  // No existing consultation → show the form
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
      onSubmit={async (form) => {
        const response = await createMedicalConsultation(form);
        if (response.success) {
          toast.success("Consulta médica guardada correctamente");
          onSubmitSuccess();
        } else {
          toast.danger(response.message);
        }
        return response;
      }}
    />
  );
}
