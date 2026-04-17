import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments, startVitals } from "../../services/appointmentService";
import { callPatient } from "../../utils/tts";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
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
  onGoToForm,
  isLoading,
}: {
  readonly appointment: AppointmentResponse;
  readonly onStartVitals: (a: AppointmentResponse) => void;
  readonly onGoToForm: (a: AppointmentResponse) => void;
  readonly isLoading: boolean;
}) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isConfirmed = appointment.appointmentStatusId === STATUS_CONFIRMADA;
  const isVitals = appointment.appointmentStatusId === STATUS_SIGNOS;
  const patientName = appointment.patient?.name ?? `Paciente #${appointment.patientId}`;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-base">
            #{appointment.id} — {patientName}
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
            <i className="bi bi-megaphone mr-1" />
            Llamar y Tomar Signos
          </Button>
        )}
        {isVitals && (
          <Button
            size="sm"
            variant="primary"
            isDisabled={isLoading}
            onPress={() => onGoToForm(appointment)}
          >
            <i className="bi bi-heart-pulse mr-1" />
            Registrar Signos Vitales
          </Button>
        )}
      </div>
    </div>
  );
}

export function NurseDashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["nurse-appointments"],
    queryFn: () =>
      getAppointments({
        pageNumber: 1,
        pageSize: 100,
        filters: `State:eq:1 AND AppointmentStatusId:in:${STATUS_CONFIRMADA},${STATUS_SIGNOS}`,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      }),
    refetchInterval: 30000,
  });

  // Step 1: call patient via TTS + transition to "Signos Vitales"
  const startVitalsMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => startVitals(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        const patientName = appt.patient?.name ?? "Paciente";
        callPatient(appt.id, patientName, "favor pasar a toma de signos vitales");
        toast.success(`Paciente ${patientName} llamado — cita #${appt.id}`);
        queryClient.invalidateQueries({ queryKey: ["nurse-appointments"] });
      } else {
        toast.danger(res.message ?? "Error al cambiar estado");
      }
    },
    onError: () => toast.danger("Error al actualizar estado"),
  });

  // Step 2: navigate to the vitals form with appointment context
  const handleGoToForm = useCallback((appt: AppointmentResponse) => {
    navigate(
      `/vital-sign/create?appointmentId=${appt.id}&patientId=${appt.patientId}&nurseId=${userId}&patientName=${encodeURIComponent(appt.patient?.name ?? "")}`,
    );
  }, [navigate, userId]);

  const handleStartVitals = useCallback((appt: AppointmentResponse) => {
    startVitalsMutation.mutate(appt);
  }, [startVitalsMutation]);

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
            Pacientes Llamados — Pendiente de Registrar Signos ({inVitals.length})
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Estos pacientes ya fueron llamados. Haga clic en "Registrar Signos Vitales" para completar el formulario.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inVitals.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isLoading={startVitalsMutation.isPending}
                onGoToForm={handleGoToForm}
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
            Citas Confirmadas — En Espera de Ser Llamadas ({confirmed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmed.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                isLoading={startVitalsMutation.isPending}
                onGoToForm={handleGoToForm}
                onStartVitals={handleStartVitals}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
