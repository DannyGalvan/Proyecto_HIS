import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, toast } from "@heroui/react";

import { nameRoutes } from "../../configs/constants";
import { getMyAppointments, cancelAppointment } from "../../services/patientPortalService";
import { formatDateShort, formatTime, APP_TIMEZONE, APP_LOCALE } from "../../utils/dateFormatter";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { readonly status: string }) {
  const map: Record<string, string> = {
    "Pendiente de Pago": "bg-yellow-100 text-yellow-800",
    Confirmada: "bg-green-100 text-green-800",
    "Signos Vitales": "bg-purple-100 text-purple-800",
    "En Espera": "bg-orange-100 text-orange-800",
    "Consulta Médica": "bg-blue-100 text-blue-800",
    Evaluado: "bg-teal-100 text-teal-800",
    Laboratorio: "bg-indigo-100 text-indigo-800",
    Farmacia: "bg-cyan-100 text-cyan-800",
    "Atención Finalizada": "bg-gray-100 text-gray-700",
    "No Asistió": "bg-red-100 text-red-800",
    Cancelada: "bg-red-100 text-red-800",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// Appointments that the patient can still cancel
const CANCELLABLE_STATUSES = new Set(["Pendiente de Pago", "Confirmada"]);

// ── Appointment row ───────────────────────────────────────────────────────────
interface AppointmentItem {
  id: number;
  appointmentDate: string;
  doctorName?: string;
  specialtyName?: string;
  branchName?: string;
  appointmentStatusName?: string;  // matches the API response field
  amount?: number;
}

function AppointmentRow({
  appt,
  onCancel,
}: {
  readonly appt: AppointmentItem;
  readonly onCancel: (id: number, label: string) => void;
}) {
  const statusName = appt.appointmentStatusName ?? "";
  const canCancel = CANCELLABLE_STATUSES.has(statusName);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: date + info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
              {new Date(appt.appointmentDate).toLocaleDateString(APP_LOCALE, { month: "short", timeZone: APP_TIMEZONE }).toUpperCase()}
            </span>
            <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
              {new Date(appt.appointmentDate).toLocaleDateString(APP_LOCALE, { day: "numeric", timeZone: APP_TIMEZONE })}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {appt.doctorName ?? "Médico"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {appt.specialtyName ?? "Especialidad"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <i className="bi bi-geo-alt mr-1" />
              {appt.branchName ?? "Sucursal"}
            </p>
          </div>
        </div>

        {/* Right: time + status + amount + cancel */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            <i className="bi bi-clock mr-1" />
            {formatTime(appt.appointmentDate)}
          </span>
          {statusName && <StatusBadge status={statusName} />}
          {appt.amount !== undefined && (
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              Q{appt.amount.toFixed(2)}
            </span>
          )}
          {canCancel && (
            <button
              className="mt-1 flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
              type="button"
              onClick={() => onCancel(appt.id, appt.doctorName ?? `cita #${appt.id}`)}
            >
              <i className="bi bi-x-circle" />
              Cancelar cita
            </button>
          )}
        </div>
      </div>

      {/* Full date on mobile */}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 sm:hidden">
        {formatDateShort(appt.appointmentDate)}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export function MyAppointmentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<{ id: number; label: string } | null>(null);

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
        toast.success("Cita cancelada correctamente. Recibirá un correo de confirmación.");
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

  const handleCancelRequest = useCallback((id: number, label: string) => {
    setCancelTarget({ id, label });
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (cancelTarget) cancelMutation.mutate(cancelTarget.id);
  }, [cancelTarget, cancelMutation]);

  const appointments = (data?.success ? (data.data as AppointmentItem[]) : []) ?? [];
  const hasMore = appointments.length === PAGE_SIZE;
  const hasPrev = page > 1;

  return (
    <section className="min-h-[calc(100vh-140px)] bg-gray-50 px-4 py-10 dark:bg-gray-900">
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
            onClick={() => navigate(nameRoutes.portalBook)}
          >
            <i className="bi bi-calendar-plus" />
            Agendar Nueva Cita
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <i className="bi bi-hourglass-split animate-spin text-4xl text-blue-500" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
            <i className="bi bi-exclamation-triangle-fill mr-2" />
            Error al cargar sus citas. Intente de nuevo.
          </div>
        )}

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
              onClick={() => navigate(nameRoutes.portalBook)}
            >
              Agendar su primera cita
            </button>
          </div>
        )}

        {/* Appointments list */}
        {!isLoading && appointments.length > 0 && (
          <>
            <div className={`flex flex-col gap-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
              {appointments.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} onCancel={handleCancelRequest} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasPrev || isFetching}
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left" />
                Anterior
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                Página {page}
              </span>

              <button
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                disabled={!hasMore || isFetching}
                type="button"
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal isOpen={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-md w-full">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Cancelar Cita</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex items-start gap-4 p-4">
                  <i className="bi bi-exclamation-triangle text-red-500 text-3xl shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ¿Está seguro que desea cancelar esta cita?
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Recibirá un correo de confirmación y los fondos serán reintegrados según los términos del servicio.
                    </p>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex gap-2 justify-end w-full">
                  <Button
                    isDisabled={cancelMutation.isPending}
                    variant="secondary"
                    onPress={() => setCancelTarget(null)}
                  >
                    No, mantener cita
                  </Button>
                  <Button
                    isPending={cancelMutation.isPending}
                    variant="danger"
                    onPress={handleCancelConfirm}
                  >
                    Sí, cancelar cita
                  </Button>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </section>
  );
}

export default MyAppointmentsPage;

export function Component() {
  return <MyAppointmentsPage />;
}
Component.displayName = "MyAppointmentsPage";
