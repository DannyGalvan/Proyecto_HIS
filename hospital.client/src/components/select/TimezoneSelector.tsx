import { useCallback, useEffect, useState } from "react";

import { api } from "../../configs/axios/interceptors";
import { getTimezones } from "../../services/timezoneService";
import { useAuthStore } from "../../stores/useAuthStore";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";
import type { ApiResponse } from "../../types/ApiResponse";
import type { TimezoneResponse } from "../../types/TimezoneResponse";

interface TimezoneSelectorProps {
  readonly currentTimezoneId?: number | null;
  readonly onTimezoneChanged?: (timezoneIanaId: string) => void;
  readonly userId: number;
  readonly isPatientPortal?: boolean;
}

export function TimezoneSelector({
  currentTimezoneId,
  onTimezoneChanged,
  userId,
  isPatientPortal = false,
}: TimezoneSelectorProps) {
  const [timezones, setTimezones] = useState<TimezoneResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(currentTimezoneId ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const adminSignIn = useAuthStore((s) => s.signIn);
  const adminAuthState = useAuthStore((s) => s.authState);
  const patientStore = usePatientAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsFetching(true);
      try {
        const response = await getTimezones({
          filters: "State:eq:1",
          include: null,
          includeTotal: false,
          pageNumber: 1,
          pageSize: 100,
        });
        if (!cancelled && response.success) setTimezones(response.data);
      } catch { /* silent */ }
      finally { if (!cancelled) setIsFetching(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setSelectedId(currentTimezoneId ?? null); }, [currentTimezoneId]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newId = Number(e.target.value);
      if (!newId || newId === selectedId) return;
      setIsLoading(true);
      try {
        const response = await api.patch<unknown, ApiResponse<{ timezoneIanaId: string }>, { timezoneId: number }>(
          "/Auth/Timezone",
          { timezoneId: newId },
        );
        if (response.success) {
          setSelectedId(newId);
          const selectedTz = timezones.find((tz) => tz.id === newId);
          const newIanaId = selectedTz?.ianaId ?? "America/Guatemala";
          if (isPatientPortal) {
            patientStore.signInPatient({
              isLoggedIn: patientStore.isLoggedIn,
              token: patientStore.token,
              userId: patientStore.userId,
              name: patientStore.name,
              email: patientStore.email,
              userName: patientStore.userName,
              timezoneIanaId: newIanaId,
            });
          } else {
            adminSignIn({ ...adminAuthState, timezoneIanaId: newIanaId });
          }
          onTimezoneChanged?.(newIanaId);
          window.location.reload();
        }
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    },
    [selectedId, userId, timezones, isPatientPortal, adminSignIn, adminAuthState, patientStore, onTimezoneChanged],
  );

  if (isFetching) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Zona Horaria</label>
        <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500">
          Cargando zonas horarias...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="timezone-selector" className="text-sm font-bold text-gray-700 dark:text-gray-300">
        Zona Horaria <i className="bi bi-globe ms-1" />
      </label>
      <select
        id="timezone-selector"
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        disabled={isLoading}
        value={selectedId ?? ""}
        onChange={handleChange}
      >
        <option value="">Seleccione una zona horaria</option>
        {timezones.map((tz) => (
          <option key={tz.id} value={tz.id}>{tz.displayName}</option>
        ))}
      </select>
      {isLoading && (
        <p className="text-xs text-blue-500 mt-0.5">
          <i className="bi bi-hourglass-split animate-spin mr-1" />Actualizando...
        </p>
      )}
    </div>
  );
}
