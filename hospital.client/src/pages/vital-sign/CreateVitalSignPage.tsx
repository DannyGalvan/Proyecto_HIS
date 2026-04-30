import { useSearchParams } from "react-router";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import { CreateVitalSignGuard } from "../../components/vitalSign/CreateVitalSignGuard";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";

export function CreateVitalSignPage() {
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const appointmentIdParam = searchParams.get("appointmentId");
  const nurseIdParam = searchParams.get("nurseId");
  const patientNameParam = searchParams.get("patientName");

  if (!appointmentIdParam) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel de Signos Vitales"
        backRoute={nameRoutes.nurseDashboard}
        icon="bi-heart-pulse"
        message="No puedes registrar signos vitales sin que provenga de una cita medica activa. Los signos vitales solo pueden registrarse desde el panel del rol interino."
        title="Acceso no permitido"
      />
    );
  }

  return (
    <CreateVitalSignGuard
      appointmentId={Number(appointmentIdParam)}
      nurseId={nurseIdParam ? Number(nurseIdParam) : (userId ?? 0)}
      patientName={patientNameParam ?? undefined}
    />
  );
}
