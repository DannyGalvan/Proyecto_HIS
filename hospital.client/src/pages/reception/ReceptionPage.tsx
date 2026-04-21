import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { ReceptionSearch } from "../../components/reception/ReceptionSearch";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  getAppointments,
  partialUpdateAppointment,
} from "../../services/appointmentService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800 border-green-300",
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Cancelada: "bg-red-100 text-red-800 border-red-300",
  "En curso": "bg-blue-100 text-blue-800 border-blue-300",
  Completada: "bg-gray-100 text-gray-800 border-gray-300",
  "No asistió": "bg-orange-100 text-orange-800 border-orange-300",
  "Paciente presente": "bg-purple-100 text-purple-800 border-purple-300",
};

function AppointmentCard({
  appointment,
  onRegisterArrival,
  onNavigate,
  isRegistering,
}: {
  readonly appointment: AppointmentResponse;
  readonly onRegisterArrival: (a: AppointmentResponse) => void;
  readonly onNavigate: (path: string) => void;
  readonly isRegistering: boolean;
}) {
  const statusName = appointment.appointmentStatus?.name ?? "";
  const colorClass =
    statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-300";
  const isPaid = statusName === "Pagada";
  const isPending = statusName === "Pendiente";
  const isCancelled = statusName === "Cancelada";

  const handleRegisterArrival = useCallback(
    () => onRegisterArrival(appointment),
    [appointment, onRegisterArrival],
  );
  const handleReassign = useCallback(
    () => onNavigate(`/appointment/reassign?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );
  const handlePayment = useCallback(
    () => onNavigate(`/payment/create?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );
  const handleNewAppointment = useCallback(
    () => onNavigate("/appointment/create"),
    [onNavigate],
  );
  const handleVitalSigns = useCallback(
    () => onNavigate(`/vital-sign/create?appointmentId=${appointment.id}`),
    [appointment.id, onNavigate],
  );

  return (
    <div className={`border rounded-xl p-5 ${colorClass}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold">
              {appointment.patient?.name ??
                `Paciente #${appointment.patientId}`}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
            >
              {statusName}
            </span>
            {appointment.priority > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                🚨 EMERGENCIA
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="font-semibold">Cita #:</span> {appointment.id}
            </div>
            <div>
              <span className="font-semibold">Especialidad:</span>{" "}
              {appointment.specialty?.name ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Sucursal:</span>{" "}
              {appointment.branch?.name ?? "—"}
            </div>
            <div>
              <span className="font-semibold">Fecha:</span>{" "}
              {appointment.appointmentDate}
            </div>
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold">Motivo:</span>{" "}
              {appointment.reason}
            </div>
            {appointment.arrivalTime ? (
              <div>
                <span className="font-semibold">Llegada:</span>{" "}
                {appointment.arrivalTime}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-45">
          {isPaid && !appointment.arrivalTime ? (
            <Button
              isDisabled={isRegistering}
              variant="primary"
              onPress={handleRegisterArrival}
            >
              <i className="bi bi-person-check mr-2" />
              Registrar Llegada
            </Button>
          ) : null}
          {isPaid ? (
            <Button variant="secondary" onPress={handleReassign}>
              <i className="bi bi-person-badge mr-2" />
              Reasignar Médico
            </Button>
          ) : null}
          {isPaid && appointment.arrivalTime ? (
            <div className="text-green-700 font-semibold text-sm text-center p-2 bg-green-50 rounded-lg border border-green-200">
              ✅ Llegada registrada
            </div>
          ) : null}
          {isPending ? (
            <>
              <div className="text-yellow-700 text-xs text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                La cita del paciente tiene estado &apos;Pendiente de pago&apos;.
                Debe realizar el pago en caja antes de ser atendido.
              </div>
              <Button variant="primary" onPress={handlePayment}>
                <i className="bi bi-cash-coin mr-2" />
                Ir a Caja
              </Button>
            </>
          ) : null}
          {isCancelled ? (
            <>
              <div className="text-red-700 text-xs text-center p-2 bg-red-50 rounded-lg border border-red-200">
                La cita fue cancelada. El paciente debe agendar una nueva cita.
              </div>
              <Button variant="secondary" onPress={handleNewAppointment}>
                <i className="bi bi-calendar-plus mr-2" />
                Nueva Cita
              </Button>
            </>
          ) : null}
          {appointment.priority > 0 && (
            <Button variant="danger" onPress={handleVitalSigns}>
              <i className="bi bi-heart-pulse mr-2" />
              Signos Vitales (Urgente)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReceptionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "id">("dpi");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reception-search", searchQuery, searchType],
    queryFn: () => {
      if (!searchQuery)
        return Promise.resolve({
          success: true as const,
          data: [],
          message: "",
          totalResults: 0,
        });
      const filter =
        searchType === "dpi"
          ? `Patient.IdentificationDocument:eq:${searchQuery}`
          : `Id:eq:${searchQuery}`;
      return getAppointments({
        pageNumber: 1,
        pageSize: 20,
        filters: `${filter} AND State:eq:1`,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      });
    },
    enabled: !!searchQuery,
  });

  const registerArrivalMutation = useMutation({
    mutationFn: async (appointment: AppointmentResponse) => {
      return partialUpdateAppointment({
        id: appointment.id,
        arrivalTime: new Date().toISOString(),
      });
    },
    onSuccess: (_data, appointment) => {
      const patientName =
        appointment.patient?.name ?? `Paciente #${appointment.patientId}`;
      if (appointment.priority > 0) {
        toast.success(
          `Paciente ${patientName} registrado con prioridad de EMERGENCIA. El paciente debe pasar directamente a toma de signos vitales.`,
        );
      } else {
        toast.success(
          `La llegada del paciente ${patientName} ha sido registrada exitosamente. El paciente debe pasar a la sala de espera.`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ["reception-search"] });
    },
    onError: () => toast.danger("Error al registrar la llegada"),
  });

  const appointments = data?.success ? data.data : [];

  const handleSearch = useCallback((query: string, type: "dpi" | "id") => {
    setSearchType(type);
    setSearchQuery(query);
  }, []);

  const handleNavigateNewAppointment = useCallback(
    () => navigate("/appointment/create"),
    [navigate],
  );

  const handleNavigateRegister = useCallback(
    () => navigate("/register"),
    [navigate],
  );

  const handleNavigate = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

  const handleRegisterArrival = useCallback(
    (appointment: AppointmentResponse) => {
      registerArrivalMutation.mutate(appointment);
    },
    [registerArrivalMutation],
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Recepción y Verificación de Citas
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Busque al paciente por DPI o número de cita para verificar y registrar
        su llegada.
      </p>

      {/* Buscador */}
      <ReceptionSearch onSearch={handleSearch} />

      {/* Resultados */}
      {isLoading ? <LoadingComponent /> : null}

      {!isLoading && searchQuery && appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <i className="bi bi-search text-4xl block mb-3" />
          <p className="text-gray-600 dark:text-gray-300">
            No se encontraron citas activas para el paciente.
          </p>
          <p className="text-sm mt-1">
            El paciente no se encuentra registrado en el sistema o no tiene
            citas activas. Verifique los datos e intente nuevamente.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Button variant="primary" onPress={handleNavigateNewAppointment}>
              <i className="bi bi-plus-circle mr-2" /> Nueva Cita (Walk-in)
            </Button>
            <Button variant="secondary" onPress={handleNavigateRegister}>
              <i className="bi bi-person-plus mr-2" /> Registrar Paciente
            </Button>
          </div>
        </div>
      ) : null}

      {appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isRegistering={registerArrivalMutation.isPending}
              onNavigate={handleNavigate}
              onRegisterArrival={handleRegisterArrival}
            />
          ))}
        </div>
      )}
    </div>
  );
}
