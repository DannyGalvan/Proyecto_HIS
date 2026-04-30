import { useAuthStore } from "../stores/useAuthStore";
import type { UseAppointmentHubReturn } from "./useAppointmentHub";
import { useAppointmentHubCore } from "./useAppointmentHub";

/**
 * SignalR hub hook para el lado administrativo.
 * Autentica usando el token del store de sesión del administrador/personal.
 *
 * @param doctorId - ID del médico seleccionado (null = inactivo)
 * @param date     - Fecha seleccionada en formato "yyyy-MM-dd" (null = inactivo)
 */
export function useAdminAppointmentHub(
  doctorId: number | null,
  date: string | null,
): UseAppointmentHubReturn {
  return useAppointmentHubCore(
    doctorId,
    date,
    () => useAuthStore.getState().authState.token,
  );
}
