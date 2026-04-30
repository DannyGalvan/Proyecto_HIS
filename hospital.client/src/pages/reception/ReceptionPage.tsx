import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { AppointmentCard } from "../../components/reception/AppointmentCard";
import { ReceptionSearch } from "../../components/reception/ReceptionSearch";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import {
  getAppointments,
  registerArrival,
} from "../../services/appointmentService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

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
      return registerArrival(appointment.id);
    },
    onSuccess: (res, appointment) => {
      if (!res.success) {
        toast.danger(res.message ?? "Error al registrar la llegada");
        return;
      }
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
