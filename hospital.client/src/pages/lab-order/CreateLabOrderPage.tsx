import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LabOrderForm } from "../../components/form/LabOrderForm";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { getMedicalConsultations } from "../../services/medicalConsultationService";

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

  // If we have appointmentId but not consultationId, look up the consultation
  const { data: consultationData } = useQuery({
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

  const resolvedConsultationId = consultationIdParam
    ? Number(consultationIdParam)
    : (consultationData?.success && consultationData.data.length > 0
        ? consultationData.data[0].id
        : null);

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
