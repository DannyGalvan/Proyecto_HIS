import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CreatePrescriptionGuard } from "../../components/prescription/CreatePrescriptionGuard";
import { ExistingPrescriptionView } from "../../components/prescription/ExistingPrescriptionView";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";

export function PrescriptionDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const appointmentId = searchParams.get("appointmentId");
  const doctorId = searchParams.get("doctorId") ?? String(userId);
  const patientNameParam = searchParams.get("patientName");
  const isCreating = !id;
  const fromDoctorDashboard = !!appointmentId;

  const handleCreated = useCallback(
    (prescriptionId: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("prescriptionId", String(prescriptionId));
        return next;
      });
      navigate(
        `/prescription/${prescriptionId}?appointmentId=${appointmentId}&doctorId=${doctorId}&patientName=${encodeURIComponent(patientNameParam ?? "")}`,
      );
    },
    [navigate, setSearchParams, appointmentId, doctorId, patientNameParam],
  );

  if (!appointmentId && isCreating) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel del Medico"
        backRoute={nameRoutes.doctorDashboard}
        icon="bi-prescription2"
        message="No puedes crear una receta medica sin que provenga de una consulta medica completada."
        title="Acceso no permitido"
      />
    );
  }

  if (id) {
    return (
      <ExistingPrescriptionView
        fromDoctorDashboard={fromDoctorDashboard}
        patientName={patientNameParam ?? undefined}
        prescriptionId={Number(id)}
      />
    );
  }

  return (
    <CreatePrescriptionGuard
      appointmentId={Number(appointmentId)}
      doctorId={Number(doctorId)}
      patientName={patientNameParam ?? undefined}
      onCreated={handleCreated}
    />
  );
}
