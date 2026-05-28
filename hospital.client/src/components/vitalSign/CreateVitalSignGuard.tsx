import { toast } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { computeClinicalAlerts } from "../../utils/clinicalAlerts";
import {
  createVitalSign,
  getVitalSignByAppointment,
} from "../../services/vitalSignService";
import type { VitalSignRequest } from "../../types/VitalSignResponse";
import { VitalSignForm } from "../form/VitalSignForm";
import { LoadingComponent } from "../spinner/LoadingComponent";

interface CreateVitalSignGuardProps {
  readonly appointmentId: number;
  readonly nurseId: number;
  readonly patientName?: string;
}

export function CreateVitalSignGuard({
  appointmentId,
  nurseId,
  patientName,
}: CreateVitalSignGuardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleNavigateBack = useCallback(
    () => navigate(nameRoutes.nurseDashboard),
    [navigate],
  );

  const { data: vitalData, isLoading } = useQuery({
    queryKey: ["vitals-check", appointmentId],
    queryFn: () => getVitalSignByAppointment(appointmentId),
    staleTime: 0,
  });

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

  const handleSubmit = useCallback(
    async (form: VitalSignRequest) => {
      // Coerce string values from inputs to numbers before sending to backend
      const numericForm = {
        bloodPressureSystolic: form.bloodPressureSystolic != null ? Number(form.bloodPressureSystolic) : null,
        bloodPressureDiastolic: form.bloodPressureDiastolic != null ? Number(form.bloodPressureDiastolic) : null,
        temperature: form.temperature != null ? Number(form.temperature) : null,
        weight: form.weight != null ? Number(form.weight) : null,
        height: form.height != null ? Number(form.height) : null,
        heartRate: form.heartRate != null ? Number(form.heartRate) : null,
      };

      // Compute clinical alerts and persist them (e.g. "Fiebre", "Hipertensión")
      const alerts = computeClinicalAlerts(numericForm);

      const payload: VitalSignRequest = {
        ...form,
        ...numericForm,
        appointmentId: form.appointmentId != null ? Number(form.appointmentId) : null,
        nurseId: form.nurseId != null ? Number(form.nurseId) : null,
        state: form.state != null ? Number(form.state) : null,
        clinicalAlerts: alerts.length > 0 ? alerts.join(", ") : null,
      };
      const response = await createVitalSign(payload);
      if (response.success) {
        const name = patientName ?? "Paciente";
        if (form.isEmergency) {
          toast.success(
            `Signos vitales de emergencia registrados para paciente ${name}. El paciente debe pasar directamente a consulta medica.`,
          );
        } else {
          toast.success(
            `Signos vitales del paciente ${name} registrados correctamente. El paciente puede regresar a la sala de espera.`,
          );
        }
        await queryClient.invalidateQueries({ queryKey: ["vital-signs"] });
        await queryClient.invalidateQueries({
          queryKey: ["nurse-appointments"],
        });
        navigate(nameRoutes.nurseDashboard);
      } else {
        // Show backend validation errors if available, otherwise generic message
        const responseData = (response as Record<string, unknown>).data;
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          const validationErrors = responseData as Array<{ errorMessage?: string; propertyName?: string }>;
          const errorMessages = validationErrors
            .map((e) => e.errorMessage ?? e.propertyName ?? "Error de validación")
            .join(". ");
          toast.danger(errorMessages);
        } else {
          toast.danger(response.message || "Error al registrar signos vitales");
        }
      }
      return response;
    },
    [patientName, queryClient, navigate],
  );

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
          Esta cita ya tiene signos vitales registrados. No es posible
          registrarlos nuevamente.
        </p>
        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
          type="button"
          onClick={handleNavigateBack}
        >
          <i className="bi bi-arrow-left" />
          Volver al Panel
        </button>
      </div>
    );
  }

  return (
    <VitalSignForm
      fromNurseDashboard
      initialForm={initialData}
      patientName={patientName}
      type="create"
      onSubmit={handleSubmit}
    />
  );
}
