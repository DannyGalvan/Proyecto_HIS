import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  getAppointments,
  startConsultation,
  finishAppointment,
  markNoShow,
} from "../../services/appointmentService";
import { callPatient } from "../../utils/tts";
import { useAuth } from "../../hooks/useAuth";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const STATUS_EN_ESPERA = 4;
const STATUS_CONSULTA = 5;
const STATUS_EVALUADO = 6;

const statusColors: Record<string, string> = {
  "En Espera": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Consulta Medica": "bg-blue-100 text-blue-800 border-blue-200",
  "Evaluado": "bg-teal-100 text-teal-800 border-teal-200",
};

function AppointmentCard({
  appointment,
  onAction,
  isLoading,
}: {
  readonly appointment: AppointmentResponse;
  readonly onAction: (a: AppointmentResponse, action: string) => void;
  readonly isLoading: boolean;
}) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isWaiting = appointment.appointmentStatusId === STATUS_EN_ESPERA;
  const isInConsultation = appointment.appointmentStatusId === STATUS_CONSULTA;
  const isEvaluated = appointment.appointmentStatusId === STATUS_EVALUADO;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold">
            #{appointment.id} — {appointment.patient?.name ?? `Paciente #${appointment.patientId}`}
          </p>
          <p className="text-sm opacity-75">{appointment.specialty?.name ?? "—"}</p>
          <p className="text-sm opacity-75">{appointment.appointmentDate}</p>
          {appointment.priority > 0 && (
            <p className="text-red-600 font-bold text-xs">Emergencia</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {statusName}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {isWaiting && (
          <>
            <Button size="sm" variant="primary" isDisabled={isLoading} onPress={() => onAction(appointment, "start-consultation")}>
              <i className="bi bi-clipboard2-pulse mr-1" /> Iniciar Consulta
            </Button>
            <Button size="sm" variant="danger" isDisabled={isLoading} onPress={() => onAction(appointment, "no-show")}>
              <i className="bi bi-person-x mr-1" /> No Asistio
            </Button>
          </>
        )}
        {isInConsultation && (
          <>
            <Button size="sm" variant="primary" isDisabled={isLoading} onPress={() => onAction(appointment, "consultation")}>
              <i className="bi bi-clipboard2 mr-1" /> Ver / Completar Consulta
            </Button>
          </>
        )}
        {isEvaluated && (
          <>
            <Button size="sm" variant="secondary" isDisabled={isLoading} onPress={() => onAction(appointment, "lab-order")}>
              <i className="bi bi-flask mr-1" /> Pedir Laboratorio
            </Button>
            <Button size="sm" variant="secondary" isDisabled={isLoading} onPress={() => onAction(appointment, "prescription")}>
              <i className="bi bi-prescription2 mr-1" /> Receta / Farmacia
            </Button>
            <Button size="sm" variant="primary" isDisabled={isLoading} onPress={() => onAction(appointment, "finish")}>
              <i className="bi bi-check-circle mr-1" /> Finalizar Atencion
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function DoctorDashboardPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-appointments", userId],
    queryFn: () =>
      getAppointments({
        pageNumber: 1,
        pageSize: 50,
        filters: `DoctorId:eq:${userId} AND State:eq:1 AND AppointmentStatusId:in:${STATUS_EN_ESPERA},${STATUS_CONSULTA},${STATUS_EVALUADO}`,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      }),
    refetchInterval: 30000,
  });

  const startMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => startConsultation(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        callPatient(appt.id, appt.patient?.name ?? "Paciente", "favor pasar a consulta medica");
        toast.success(`Consulta iniciada para cita #${appt.id}`);
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments", userId] });
      } else {
        toast.danger(res.message ?? "Error al iniciar consulta");
      }
    },
    onError: () => toast.danger("Error al iniciar consulta"),
  });

  const finishMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => finishAppointment(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        toast.success(`Atencion finalizada para cita #${appt.id}`);
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments", userId] });
      } else {
        toast.danger(res.message ?? "Error al finalizar");
      }
    },
    onError: () => toast.danger("Error al finalizar atencion"),
  });

  const noShowMutation = useMutation({
    mutationFn: (appt: AppointmentResponse) => markNoShow(appt.id),
    onSuccess: (res, appt) => {
      if (res.success) {
        toast.success(`Cita #${appt.id} marcada como No Asistio`);
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments", userId] });
      } else {
        toast.danger(res.message ?? "Error");
      }
    },
    onError: () => toast.danger("Error al marcar no asistio"),
  });

  const handleAction = useCallback(
    (appt: AppointmentResponse, action: string) => {
      switch (action) {
        case "start-consultation":
          startMutation.mutate(appt);
          break;
        case "finish":
          finishMutation.mutate(appt);
          break;
        case "no-show":
          noShowMutation.mutate(appt);
          break;
        case "consultation":
          navigate(`/medical-consultation/create?appointmentId=${appt.id}&doctorId=${userId}&patientName=${encodeURIComponent(appt.patient?.name ?? "")}`);
          break;
        case "prescription":
          navigate(`/prescription/create?appointmentId=${appt.id}&doctorId=${userId}&patientName=${encodeURIComponent(appt.patient?.name ?? "")}`);
          break;
        case "lab-order":
          navigate(`/lab-order/create?appointmentId=${appt.id}&doctorId=${userId}&patientId=${appt.patientId}&patientName=${encodeURIComponent(appt.patient?.name ?? "")}`);
          break;
      }
    },
    [startMutation, finishMutation, noShowMutation, navigate, userId],
  );

  if (isLoading) return <LoadingComponent />;

  const appointments = data?.success ? data.data : [];
  const waiting = appointments.filter(a => a.appointmentStatusId === STATUS_EN_ESPERA);
  const inConsultation = appointments.filter(a => a.appointmentStatusId === STATUS_CONSULTA);
  const evaluated = appointments.filter(a => a.appointmentStatusId === STATUS_EVALUADO);
  const isMutating = startMutation.isPending || finishMutation.isPending || noShowMutation.isPending;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Mi Panel de Atencion</h1>
      <p className="text-gray-500 text-sm mb-6">
        Citas activas: <strong>{appointments.length}</strong> — actualiza cada 30s
      </p>

      {appointments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="bi bi-calendar-x text-5xl block mb-4" />
          <p className="text-lg">No tienes citas asignadas en espera.</p>
        </div>
      )}

      {evaluated.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
            Evaluados — Pendiente de cierre ({evaluated.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {evaluated.map(a => <AppointmentCard key={a.id} appointment={a} isLoading={isMutating} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {inConsultation.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            En Consulta Medica ({inConsultation.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inConsultation.map(a => <AppointmentCard key={a.id} appointment={a} isLoading={isMutating} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {waiting.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
            En Espera de Consulta ({waiting.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {waiting.map(a => <AppointmentCard key={a.id} appointment={a} isLoading={isMutating} onAction={handleAction} />)}
          </div>
        </section>
      )}
    </div>
  );
}
