import { Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments, partialUpdateAppointment } from "../../services/appointmentService";
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

export function ReceptionPage() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"dpi" | "id">("dpi");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reception-search", searchQuery, searchType],
    queryFn: () => {
      if (!searchQuery) return Promise.resolve({ success: true as const, data: [], message: "", totalResults: 0 });
      const filter = searchType === "dpi"
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
    onSuccess: () => {
      toast.success("Llegada del paciente registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["reception-search"] });
    },
    onError: () => toast.danger("Error al registrar la llegada"),
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) { toast.danger("Ingrese un número de cita o DPI para buscar"); return; }
    setSearchQuery(searchValue.trim());
  }, [searchValue]);

  const appointments = data?.success ? data.data : [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Recepción y Verificación de Citas</h1>
      <p className="text-gray-500 text-sm mb-6">Busque al paciente por DPI o número de cita para verificar y registrar su llegada.</p>

      {/* Buscador */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSearch}>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "dpi" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              onClick={() => setSearchType("dpi")}
            >
              Por DPI
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${searchType === "id" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}
              onClick={() => setSearchType("id")}
            >
              Por No. Cita
            </button>
          </div>
          <input
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={searchType === "dpi" ? "Ingrese DPI del paciente (13 dígitos)" : "Ingrese número de cita"}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button type="submit" variant="primary" className="px-6">
            <i className="bi bi-search mr-2" /> Buscar
          </Button>
        </form>
      </div>

      {/* Resultados */}
      {isLoading && <LoadingComponent />}

      {!isLoading && searchQuery && appointments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <i className="bi bi-search text-4xl block mb-3" />
          <p>No se encontró una cita asociada a los parámetros ingresados.</p>
          <p className="text-sm mt-1">Verifique los datos e intente nuevamente.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Button variant="primary" onPress={() => navigate("/appointment/create")}>
              <i className="bi bi-plus-circle mr-2" /> Nueva Cita (Walk-in)
            </Button>
            <Button variant="secondary" onPress={() => navigate("/register")}>
              <i className="bi bi-person-plus mr-2" /> Registrar Paciente
            </Button>
          </div>
        </div>
      )}

      {appointments.length > 0 && (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const statusName = appointment.appointmentStatus?.name ?? "";
            const colorClass = statusColors[statusName] ?? "bg-gray-100 text-gray-800 border-gray-300";
            const isPaid = statusName === "Pagada";
            const isPending = statusName === "Pendiente";
            const isCancelled = statusName === "Cancelada";

            return (
              <div key={appointment.id} className={`border rounded-xl p-5 ${colorClass}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">
                        {appointment.patient?.name ?? `Paciente #${appointment.patientId}`}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
                        {statusName}
                      </span>
                      {appointment.priority > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                          🚨 EMERGENCIA
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="font-semibold">Cita #:</span> {appointment.id}</div>
                      <div><span className="font-semibold">Especialidad:</span> {appointment.specialty?.name ?? "—"}</div>
                      <div><span className="font-semibold">Sucursal:</span> {appointment.branch?.name ?? "—"}</div>
                      <div><span className="font-semibold">Fecha:</span> {appointment.appointmentDate}</div>
                      <div className="col-span-2 md:col-span-4">
                        <span className="font-semibold">Motivo:</span> {appointment.reason}
                      </div>
                      {appointment.arrivalTime && (
                        <div><span className="font-semibold">Llegada:</span> {appointment.arrivalTime}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[180px]">
                    {isPaid && !appointment.arrivalTime && (
                      <Button
                        variant="primary"
                        isDisabled={registerArrivalMutation.isPending}
                        onPress={() => registerArrivalMutation.mutate(appointment)}
                      >
                        <i className="bi bi-person-check mr-2" />
                        Registrar Llegada
                      </Button>
                    )}
                    {isPaid && appointment.arrivalTime && (
                      <div className="text-green-700 font-semibold text-sm text-center p-2 bg-green-50 rounded-lg border border-green-200">
                        ✅ Llegada registrada
                      </div>
                    )}
                    {isPending && (
                      <Button
                        variant="primary"
                        onPress={() => navigate(`/payment/create?appointmentId=${appointment.id}`)}
                      >
                        <i className="bi bi-cash-coin mr-2" />
                        Ir a Caja
                      </Button>
                    )}
                    {isCancelled && (
                      <Button variant="secondary" onPress={() => navigate("/appointment/create")}>
                        <i className="bi bi-calendar-plus mr-2" />
                        Nueva Cita
                      </Button>
                    )}
                    {appointment.priority > 0 && (
                      <Button
                        variant="danger"
                        onPress={() => navigate(`/vital-sign/create?appointmentId=${appointment.id}`)}
                      >
                        <i className="bi bi-heart-pulse mr-2" />
                        Signos Vitales (Urgente)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
