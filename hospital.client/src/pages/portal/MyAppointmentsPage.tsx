import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";

import {
  AppointmentRow,
  type AppointmentItem,
} from "../../components/portal/AppointmentRow";
import { CancelModal } from "../../components/portal/CancelModal";
import { nameRoutes } from "../../configs/constants";
import {
  cancelAppointment,
  getMyAppointments,
} from "../../services/patientPortalService";

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export function Component() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["portal-my-appointments", page],
    queryFn: () => getMyAppointments(page, PAGE_SIZE),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          "Cita cancelada correctamente. Recibirá un correo de confirmación.",
        );
        queryClient.invalidateQueries({ queryKey: ["portal-my-appointments"] });
      } else {
        toast.danger(res.message ?? "No se pudo cancelar la cita");
      }
      setCancelTarget(null);
    },
    onError: () => {
      toast.danger("Error al cancelar la cita. Intente de nuevo.");
      setCancelTarget(null);
    },
  });

  const handleNavigateBook = useCallback(
    () => navigate(nameRoutes.portalBook),
    [navigate],
  );

  const handlePrevPage = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [],
  );

  const handleNextPage = useCallback(() => setPage((p) => p + 1), []);

  const handleCloseCancelModal = useCallback(() => setCancelTarget(null), []);

  const handleCancelRequest = useCallback((id: number, label: string) => {
    setCancelTarget({ id, label });
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (cancelTarget) cancelMutation.mutate(cancelTarget.id);
  }, [cancelTarget, cancelMutation]);

  const appointments =
    (data?.success ? (data.data as AppointmentItem[]) : []) ?? [];
  const hasMore = appointments.length === PAGE_SIZE;
  const hasPrev = page > 1;

  return (
    <section className="w-full min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-800">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <i className="bi bi-calendar-check mr-2 text-blue-600" />
              Mis Citas
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Historial de sus consultas médicas.
            </p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700"
            type="button"
            onClick={handleNavigateBook}
          >
            <i className="bi bi-calendar-plus" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <i className="bi bi-hourglass-split animate-spin text-4xl text-blue-500" />
          </div>
        ) : null}

        {/* Error */}
        {isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            Error al cargar sus citas. Intente de nuevo.
          </div>
        ) : null}

        {/* Empty state */}
        {!isLoading && !isError && appointments.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <i className="bi bi-calendar-x text-5xl text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">
              No tiene citas registradas aún.
            </p>
            <button
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white hover:bg-blue-700"
              type="button"
              onClick={handleNavigateBook}
            >
              Agendar su primera cita
            </button>
          </div>
        )}

        {/* Appointments list */}
        {!isLoading && appointments.length > 0 && (
          <>
            <div
              className={`flex flex-col gap-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
            >
              {appointments.map((appt) => (
                <AppointmentRow
                  key={appt.id}
                  appt={appt}
                  onCancel={handleCancelRequest}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasPrev || isFetching}
                type="button"
                onClick={handlePrevPage}
              >
                <i className="bi bi-chevron-left" />
                Anterior
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Página {page}
              </span>

              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasMore || isFetching}
                type="button"
                onClick={handleNextPage}
              >
                Siguiente
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <CancelModal
        isOpen={!!cancelTarget}
        isPending={cancelMutation.isPending}
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelConfirm}
      />
    </section>
  );
}

Component.displayName = "MyAppointmentsPage";
