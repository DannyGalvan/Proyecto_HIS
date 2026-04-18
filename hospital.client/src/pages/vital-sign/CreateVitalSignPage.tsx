import { toast } from "@heroui/react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { VitalSignForm } from "../../components/form/VitalSignForm";
import { createVitalSign, getVitalSignByAppointment } from "../../services/vitalSignService";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { BlockedWithoutContext } from "../../components/shared/BlockedWithoutContext";
import type { VitalSignRequest } from "../../types/VitalSignResponse";

export function CreateVitalSignPage() {
  const { userId } = useAuth();
  const [searchParams] = useSearchParams();

  const appointmentIdParam = searchParams.get("appointmentId");
  const nurseIdParam = searchParams.get("nurseId");
  const patientNameParam = searchParams.get("patientName");

  // ── Guard: no appointmentId → blocked ──────────────────────────────────────
  if (!appointmentIdParam) {
    return (
      <BlockedWithoutContext
        backLabel="Ir al Panel de Signos Vitales"
        backRoute={nameRoutes.nurseDashboard}
        icon="bi-heart-pulse"
        message="No puedes registrar signos vitales sin que provenga de una cita médica activa. Los signos vitales solo pueden registrarse desde el panel del rol interino."
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

function CreateVitalSignGuard({
  appointmentId,
  nurseId,
  patientName,
}: {
  readonly appointmentId: number;
  readonly nurseId: number;
  readonly patientName?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vitalData, isLoading } = useQuery({
    queryKey: ["vitals-check", appointmentId],
    queryFn: () => getVitalSignByAppointment(appointmentId),
    staleTime: 0,
  });

  if (isLoading) return <LoadingComponent />;

  const alreadyHasVitals = vitalData?.success && vitalData.data.length > 0;

  if (alreadyHasVitals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <i className="bi bi-check-circle text-6xl text-green-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Signos vitales ya registrados
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Esta cita ya tiene signos vitales registrados. No es posible registrarlos nuevamente.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={() => navigate(nameRoutes.nurseDashboard)}
        >
          <i className="bi bi-arrow-left" />
          Volver al Panel
        </button>
      </div>
    );
  }

  const initialData: VitalSignRequest = {
    appointmentId,
    nurseId,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    temperature: null,
    weight: null,
    height: null,
    heartRate: null,
    isEmergency: false,
    state: 1,
  };

  return (
    <VitalSignForm
      fromNurseDashboard
      initialForm={initialData}
      patientName={patientName}
      type="create"
      onSubmit={async (form) => {
        const response = await createVitalSign(form);
        if (response.success) {
          const name = patientNameParam ?? "Paciente";
          if (form.isEmergency) {
            toast.success(`Signos vitales de emergencia registrados para paciente ${name}. El paciente debe pasar directamente a consulta médica.`);
          } else {
            toast.success(`Signos vitales del paciente ${name} registrados correctamente. El paciente puede regresar a la sala de espera.`);
          }
          await queryClient.invalidateQueries({ queryKey: ["vital-signs"] });
          await queryClient.invalidateQueries({ queryKey: ["nurse-appointments"] });
          navigate(nameRoutes.nurseDashboard);
        } else {
          toast.danger(response.message);
        }
        return response;
      }}
    />
  );
}
