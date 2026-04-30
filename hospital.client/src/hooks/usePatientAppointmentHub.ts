import { usePatientAuthStore } from "../stores/usePatientAuthStore";
import type { UseAppointmentHubReturn } from "./useAppointmentHub";
import { useAppointmentHubCore } from "./useAppointmentHub";

/**
 * SignalR hub hook para el portal del paciente.
 * Autentica usando el token del store de sesión del paciente.
 *
 * @param doctorId - ID del médico seleccionado (null = inactivo)
 * @param date     - Fecha seleccionada en formato "yyyy-MM-dd" (null = inactivo)
 */
export function usePatientAppointmentHub(
  doctorId: number | null,
  date: string | null,
): UseAppointmentHubReturn {
  return useAppointmentHubCore(
    doctorId,
    date,
    () => usePatientAuthStore.getState().token,
  );
}
