import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LabOrderForm } from "../../components/form/LabOrderForm";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { getMedicalConsultations } from "../../services/medicalConsultationService";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";

export function CreateLabOrderPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const consultationIdParam = searchParams.get("consultationId");
  const appointmentIdParam = searchParams.get("appointmentId");
  const doctorIdParam = searchParams.get("doctorId");
  const patientIdParam = searchParams.get("patientId");
  const patientNameParam = searchParams.get("patientName");
  const fromDoctorDashboard = !!appointmentIdParam || !!consultationIdParam;

  // ── Guard: no context → blocked ────────────────────────────────────────────
  if (!appointmentIdParam && !consultationIdParam) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel del Médico"
        backRoute={nameRoutes.doctorDashboard}
        icon="bi-flask"
        message="No puedes crear una orden de laboratorio sin que provenga de una consulta médica completada. Las órdenes solo pueden generarse desde el panel del médico."
        title="Acceso no permitido"
      />
    );
  }

  // If we have appointmentId but not consultationId, look up the consultation
  const { data: consultationData, isLoading } = useQuery({
    queryKey: ["consultation-for-appointment", appointmentIdParam],
    queryFn: () => getMedicalConsultations({
      pageNumber: 1,
      pageSize: 1,
      filters: `AppointmentId:eq:${appointmentIdParam} AND ConsultationStatus:eq:1 AND State:eq:1`,
      include: null,
      includeTotal: false,
    }),
    enabled: !!appointmentIdParam && !consultationIdParam,
  });

  if (isLoading) return <LoadingComponent />;

  const resolvedConsultationId = consultationIdParam
    ? Number(consultationIdParam)
    : (consultationData?.success && consultationData.data.length > 0
        ? consultationData.data[0].id
        : null);

  // No completed consultation found
  if (!resolvedConsultationId && fromDoctorDashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-exclamation-triangle text-6xl text-yellow-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Consulta no finalizada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          No se encontró una consulta médica finalizada para esta cita. Debe finalizar la consulta médica antes de poder generar una orden de laboratorio.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => navigate(nameRoutes.doctorDashboard)}
        >
          <i className="bi bi-arrow-left" />
          Volver al Panel
        </button>
      </div>
    );
  }

  return (
    <div>
      <LabOrderForm
        fromDoctorDashboard={fromDoctorDashboard}
        initialConsultationId={resolvedConsultationId}
        initialDoctorId={doctorIdParam ? Number(doctorIdParam) : (userId ?? null)}
        initialPatientId={patientIdParam ? Number(patientIdParam) : null}
        patientName={patientNameParam ?? undefined}
        onSuccess={(id) => {
          if (fromDoctorDashboard) {
            navigate(nameRoutes.doctorDashboard);
          } else {
            navigate(`/lab-order/${id}`);
          }
        }}
      />
    </div>
  );
}
