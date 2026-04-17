import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments, startVitals, completeVitals } from "../../services/appointmentService";
import { callPatient } from "../../utils/tts";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const STATUS_CONFIRMADA = 2;
const STATUS_SIGNOS = 3;

const statusColors: Record<string, string> = {
  "Confirmada": "bg-green-100 text-green-800 border-green-200",
  "Signos Vitales": "bg-purple-100 text-purple-800 border-purple-200",
};

function AppointmentCard({
  appointment,
  onStartVitals,
  onCompleteVitals,
  isLoading,
}: {
  readonly appointment: AppointmentResponse;
  readonly onStartVitals: (a: AppointmentResponse) => void;
  readonly onCompleteVitals: (a: AppointmentResponse) => void;
  readonly isLoading: boolean;
}) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isConfirmed = appointment.appointmentStatusId === STATUS_CONFIRMADA;
  const isVitals = appointment.appointmentStatusId === STATUS_SIGNOS;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold">
            #{appointment.id} — {appointment.patient?.name ?? `Paciente #${appointment.patientId}`}
          </p>
          <p className="text-sm opacity-75">{appointment.specialty?.name ?? "—"}</p>
          <p className="text-sm opacity-75">{appointment.branch?.name ?? "—"}</p>
          <p className="text-sm opacity-75">{appointment.appointmentDate}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {statusName}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {isConfirmed && (
          <Button
            size="sm"
            variant="primary"
            isDisabled={isLoading}
            onPress={() => onStartVitals(appointment)}
          >
            <i className="bi bi-heart-pulse mr-1" />
            Iniciar Signos Vitales
          </Button>
        )}
        {isVitals && (
          <Button
            size="sm"
            variant="secondary"
            isDisabled={isLoading}
            onPress={() => onCompleteVitals(appointment)}
          >
            <i className="bi bi-check-circle mr-1" />
            Completar Signos Vitales
          </Button>
        )}
      </div>
    </div>
  );
}

export function NurseDashboardPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["nurse-appointments"],
    queryFn: () =>
      getAppointments({
        pageNumber: 1,
        pageSize: 100,
        filters: `State:eq:1 AND (AppointmentStatusId:eq:${STATUS_CONFIRMADA} OR AppointmentStatusId:eq:${STATUS_SIGNOS})`,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      }),
    refetchInterval: 30000,
  });

  const startVitalsMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => startVitals(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        callPatient(appt.id, appt.patient?.name ?? "Paciente", "favor pasar a toma de signos vitales");
        toast.success(`Cita #${appt.id} iniciando signos vitales`);
        queryClient.invalidateQueries({ queryKey: ["nurse-appointments"] });
      } else {
        toast.danger(res.message ?? "Error al cambiar estado");
      }
    },
    onError: () => toast.danger("Error al actualizar estado"),
  });

  const completeVitalsMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => completeVitals(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        toast.success(`Cita #${appt.id} en espera de consulta`);
        queryClient.invalidateQueries({ queryKey: ["nurse-appointments"] });
      } else {
        toast.danger(res.message ?? "Error al cambiar estado");
      }
    },
    onError: () => toast.danger("Error al actualizar estado"),
  });

  const handleStartVitals = useCallback((appt: AppointmentResponse) => {
    startVitalsMutation.mutate(appt);
  }, [startVitalsMutation]);

  const handleCompleteVitals = useCallback((appt: AppointmentResponse) => {
    completeVitalsMutation.mutate(appt);
  }, [completeVitalsMutation]);

  if (isLoading) return <LoadingComponent />;

  const appointments = data?.success ? data.data : [];
  const confirmed = appointments.filter(a => a.appointmentStatusId === STATUS_CONFIRMADA);
  const inVitals = appointments.filter(a => a.appointmentStatusId === STATUS_SIGNOS);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Panel de Rol Interino</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gestione la toma de signos vitales. Las citas se actualizan cada 30 segundos.
        Total: <strong>{appointments.length}</strong>
      </p>

      {appointments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="bi bi-calendar-check text-5xl block mb-4" />
          <p>No hay citas confirmadas pendientes de signos vitales.</p>
        </div>
      )}

      {inVitals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            En Toma de Signos Vitales ({inVitals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inVitals.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isLoading={startVitalsMutation.isPending || completeVitalsMutation.isPending}
                onCompleteVitals={handleCompleteVitals}
                onStartVitals={handleStartVitals}
              />
            ))}
          </div>
        </section>
      )}

      {confirmed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            Citas Confirmadas — Esperando Signos Vitales ({confirmed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmed.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isLoading={startVitalsMutation.isPending || completeVitalsMutation.isPending}
                onCompleteVitals={handleCompleteVitals}
                onStartVitals={handleStartVitals}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
