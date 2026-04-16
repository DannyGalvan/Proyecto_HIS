import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { partialUpdateAppointment } from "../../services/appointmentService";
import { getAppointments } from "../../services/appointmentService";
import { useAuth } from "../../hooks/useAuth";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800 border-green-200",
  "Paciente presente": "bg-purple-100 text-purple-800 border-purple-200",
  "En curso": "bg-blue-100 text-blue-800 border-blue-200",
  Completada: "bg-gray-100 text-gray-800 border-gray-200",
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cancelada: "bg-red-100 text-red-800 border-red-200",
};

function AppointmentCard({ appointment, onAction }: {
  readonly appointment: AppointmentResponse;
  readonly onAction: (appointment: AppointmentResponse, action: string) => void;
}) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const isPaid = statusName === "Pagada";
  const isPresent = statusName === "Paciente presente";
  const isInProgress = statusName === "En curso";

  return (
    <div className={`border rounded-xl p-4 flex flex-col gap-3 shadow-sm ${colorClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg">{appointment.patient?.name ?? `Paciente #${appointment.patientId}`}</p>
          <p className="text-sm opacity-75">{appointment.specialty?.name ?? "Especialidad"}</p>
          <p className="text-sm opacity-75">{appointment.branch?.name ?? "Sucursal"}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {statusName || "—"}
        </span>
      </div>

      <div className="text-sm space-y-1">
        <p><span className="font-semibold">Fecha:</span> {appointment.appointmentDate}</p>
        <p><span className="font-semibold">Motivo:</span> {appointment.reason}</p>
        {appointment.arrivalTime && (
          <p><span className="font-semibold">Llegada:</span> {appointment.arrivalTime}</p>
        )}
        {appointment.priority > 0 && (
          <p className="text-red-600 font-bold">🚨 EMERGENCIA</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {isPaid && (
          <Button size="sm" variant="primary" onPress={() => onAction(appointment, "register-arrival")}>
            <i className="bi bi-person-check mr-1" /> Registrar Llegada
          </Button>
        )}
        {isPresent && (
          <Button size="sm" variant="primary" onPress={() => onAction(appointment, "vital-signs")}>
            <i className="bi bi-heart-pulse mr-1" /> Signos Vitales
          </Button>
        )}
        {(isPresent || isInProgress) && (
          <Button size="sm" variant="secondary" onPress={() => onAction(appointment, "consultation")}>
            <i className="bi bi-clipboard2-pulse mr-1" /> Consulta Médica
          </Button>
        )}
        {(isPresent || isInProgress) && (
          <Button size="sm" variant="secondary" onPress={() => onAction(appointment, "prescription")}>
            <i className="bi bi-prescription2 mr-1" /> Receta
          </Button>
        )}
        {(isPresent || isInProgress) && (
          <Button size="sm" variant="secondary" onPress={() => onAction(appointment, "lab-order")}>
            <i className="bi bi-flask mr-1" /> Orden Lab
          </Button>
        )}
      </div>
    </div>
  );
}

export function DoctorDashboardPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Citas asignadas al médico/enfermero actual con estados activos
  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments", userId],
    queryFn: () => getAppointments({
      pageNumber: 1,
      pageSize: 50,
      filters: `DoctorId:eq:${userId} AND State:eq:1`,
      include: "Specialty,Branch,AppointmentStatus,Patient",
      includeTotal: false,
    }),
    refetchInterval: 30000, // Actualiza cada 30 segundos (RNF-021)
  });

  const registerArrivalMutation = useMutation({
    mutationFn: (appointment: AppointmentResponse) =>
      partialUpdateAppointment({
        id: appointment.id,
        arrivalTime: new Date().toISOString(),
        // appointmentStatusId se actualizaría al estado "Paciente presente"
      }),
    onSuccess: () => {
      toast.success("Llegada del paciente registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["my-appointments", userId] });
    },
    onError: () => toast.danger("Error al registrar la llegada"),
  });

  const handleAction = useCallback((appointment: AppointmentResponse, action: string) => {
    switch (action) {
      case "register-arrival":
        registerArrivalMutation.mutate(appointment);
        break;
      case "vital-signs":
        navigate(`/vital-sign/create?appointmentId=${appointment.id}&patientId=${appointment.patientId}`);
        break;
      case "consultation":
        navigate(`/medical-consultation/create?appointmentId=${appointment.id}&doctorId=${userId}`);
        break;
      case "prescription":
        navigate(`/prescription/create?appointmentId=${appointment.id}&doctorId=${userId}`);
        break;
      case "lab-order":
        navigate(`/lab-order/create?appointmentId=${appointment.id}&doctorId=${userId}&patientId=${appointment.patientId}`);
        break;
    }
  }, [navigate, userId, registerArrivalMutation]);

  if (isLoading) return <LoadingComponent />;

  const appointments = data?.success ? data.data : [];

  // Agrupar por estado
  const pending = appointments.filter(a => a.appointmentStatus?.name === "Pagada");
  const present = appointments.filter(a => a.appointmentStatus?.name === "Paciente presente");
  const inProgress = appointments.filter(a => a.appointmentStatus?.name === "En curso");
  const completed = appointments.filter(a => a.appointmentStatus?.name === "Completada");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Mi Panel de Atención</h1>
      <p className="text-gray-500 text-sm mb-6">
        Las citas se actualizan automáticamente cada 30 segundos.
        Total activas: <strong>{appointments.length}</strong>
      </p>

      {appointments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="bi bi-calendar-x text-5xl block mb-4" />
          <p className="text-lg">No tienes citas asignadas en este momento.</p>
        </div>
      )}

      {present.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            Pacientes Presentes ({present.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {present.map(a => <AppointmentCard key={a.id} appointment={a} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            En Consulta ({inProgress.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgress.map(a => <AppointmentCard key={a.id} appointment={a} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            Citas Pagadas — En Espera ({pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map(a => <AppointmentCard key={a.id} appointment={a} onAction={handleAction} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
            Completadas Hoy ({completed.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map(a => <AppointmentCard key={a.id} appointment={a} onAction={handleAction} />)}
          </div>
        </section>
      )}
    </div>
  );
}
