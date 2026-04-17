import { Button, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { SingleValue } from "react-select";
import { useNavigate, useSearchParams } from "react-router";
import { CatalogueSelect } from "../../components/select/CatalogueSelect";
import { AsyncButton } from "../../components/button/AsyncButton";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments, partialUpdateAppointment } from "../../services/appointmentService";
import { getUsers } from "../../services/userService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import type { UserResponse } from "../../types/UserResponse";
import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";

export function AppointmentReassignPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const preloadedId = searchParams.get("appointmentId");

  const [searchQuery, setSearchQuery] = useState(preloadedId ?? "");
  const [searchInput, setSearchInput] = useState(preloadedId ?? "");
  const [searchType, setSearchType] = useState<"dpi" | "id">(preloadedId ? "id" : "dpi");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [newDoctorId, setNewDoctorId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Search appointments (only Pagada status)
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["reassign-search", searchQuery, searchType],
    queryFn: () => {
      const filter =
        searchType === "dpi"
          ? `Patient.IdentificationDocument:eq:${searchQuery}`
          : `Id:eq:${searchQuery}`;
      return getAppointments({
        pageNumber: 1,
        pageSize: 20,
        filters: `${filter} AND State:eq:1 AND AppointmentStatus.Name:eq:Pagada`,
        include: "Specialty,Branch,AppointmentStatus,Patient,Doctor",
        includeTotal: false,
      });
    },
    enabled: !!searchQuery,
  });

  // Fetch available doctors for selected appointment
  const doctorFilters = selectedAppointment
    ? `Rol.Name:eq:Medico AND State:eq:1 AND BranchId:eq:${selectedAppointment.branchId} AND SpecialtyId:eq:${selectedAppointment.specialtyId}`
    : "";

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["reassign-doctors", selectedAppointment?.branchId, selectedAppointment?.specialtyId],
    queryFn: () =>
      getUsers({
        pageNumber: 1,
        pageSize: 50,
        filters: doctorFilters,
        include: "Rol,Branch,Specialty",
        includeTotal: false,
      }),
    enabled: !!selectedAppointment,
  });

  const reassignMutation = useMutation({
    mutationFn: () =>
      partialUpdateAppointment({
        id: selectedAppointment!.id,
        doctorId: newDoctorId,
        notes: notes || undefined,
        updatedBy: userId,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Médico reasignado correctamente");
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["reassign-search"] });
        navigate(nameRoutes.appointment);
      } else {
        toast.danger(res.message ?? "Error al reasignar");
      }
    },
    onError: () => toast.danger("Error inesperado al reasignar"),
  });

  const selectorDoctor = useCallback(
    (item: UserResponse) => ({ label: item.name, value: String(item.id) }),
    [],
  );

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    setSelectedAppointment(null);
    setNewDoctorId(null);
  };

  const appointments = searchData?.success ? searchData.data : [];
  const availableDoctors = doctorsData?.success ? doctorsData.data : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-1">
        <Button size="sm" variant="secondary" onPress={() => navigate(nameRoutes.appointment)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">Reasignar Médico</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Busque una cita pagada y asigne un nuevo médico de la misma sede y especialidad.
      </p>

      {/* Search bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors
                ${searchType === "dpi" ? "bg-primary text-white border-primary" : "bg-gray-100 border-gray-200 text-gray-600"}`}
              onClick={() => setSearchType("dpi")}
            >
              DPI
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors
                ${searchType === "id" ? "bg-primary text-white border-primary" : "bg-gray-100 border-gray-200 text-gray-600"}`}
              onClick={() => setSearchType("id")}
            >
              # Cita
            </button>
          </div>
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={searchType === "dpi" ? "Ingrese DPI del paciente..." : "Ingrese número de cita..."}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="primary" onPress={handleSearch}>
            <i className="bi bi-search mr-1" /> Buscar
          </Button>
        </div>
      </div>

      {/* Search results */}
      {searchLoading && <LoadingComponent />}

      {!searchLoading && searchQuery && appointments.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <i className="bi bi-calendar-x text-4xl block mb-3" />
          <p>No se encontraron citas pagadas con los parámetros ingresados.</p>
        </div>
      )}

      {appointments.length > 0 && !selectedAppointment && (
        <div className="mb-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
            Seleccione la cita a reasignar
          </h2>
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-gray-800 border rounded-xl p-4 flex justify-between items-start gap-4 hover:border-primary/60 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(appt);
                  setNewDoctorId(null);
                }}
              >
                <div className="text-sm space-y-1">
                  <p className="font-bold">{appt.patient?.name ?? `Paciente #${appt.patientId}`}</p>
                  <p><span className="font-semibold">Cita #:</span> {appt.id}</p>
                  <p><span className="font-semibold">Fecha:</span> {appt.appointmentDate}</p>
                  <p><span className="font-semibold">Especialidad:</span> {appt.specialty?.name ?? "—"}</p>
                  <p><span className="font-semibold">Sede:</span> {appt.branch?.name ?? "—"}</p>
                  <p><span className="font-semibold">Médico actual:</span> {appt.doctor?.name ?? <em className="text-orange-500">Sin asignar</em>}</p>
                </div>
                <Button size="sm" variant="primary">
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reassign form */}
      {selectedAppointment && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
              Reasignar cita #{selectedAppointment.id}
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => { setSelectedAppointment(null); setNewDoctorId(null); }}
            >
              Cambiar cita
            </Button>
          </div>

          {/* Appointment summary */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
            <div><span className="font-semibold">Paciente:</span> {selectedAppointment.patient?.name}</div>
            <div><span className="font-semibold">Fecha:</span> {selectedAppointment.appointmentDate}</div>
            <div><span className="font-semibold">Especialidad:</span> {selectedAppointment.specialty?.name ?? "—"}</div>
            <div><span className="font-semibold">Sede:</span> {selectedAppointment.branch?.name ?? "—"}</div>
            <div className="col-span-2 md:col-span-4">
              <span className="font-semibold">Médico actual:</span>{" "}
              {selectedAppointment.doctor?.name ?? <em className="text-orange-500">Sin médico asignado</em>}
            </div>
          </div>

          {/* Doctor picker */}
          {doctorsLoading && <LoadingComponent />}
          {!doctorsLoading && availableDoctors.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm mb-4">
              <i className="bi bi-exclamation-triangle mr-2" />
              No hay médicos disponibles en esta sede con esta especialidad.
            </div>
          )}
          {!doctorsLoading && availableDoctors.length > 0 && (
            <div className="mb-4">
              <CatalogueSelect<UserResponse>
                defaultValue={null}
                deps={doctorFilters}
                fieldSearch="Name"
                isRequired
                label="Nuevo médico"
                name="newDoctorId"
                placeholder="Seleccione el nuevo médico..."
                queryFn={getUsers}
                selectorFn={selectorDoctor}
                onChange={(opt) => {
                  const o = opt as SingleValue<{ label: string; value: string }>;
                  setNewDoctorId(o?.value ? Number(o.value) : null);
                }}
              />
            </div>
          )}

          {/* Notes */}
          <div className="mb-5">
            <label className="text-xs text-gray-500 block mb-1">Notas (opcional)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Motivo de la reasignación..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onPress={() => navigate(nameRoutes.appointment)}>
              Cancelar
            </Button>
            <AsyncButton
              isDisabled={!newDoctorId}
              isLoading={reassignMutation.isPending}
              loadingText="Reasignando..."
              variant="primary"
              onPress={() => reassignMutation.mutate()}
            >
              <i className="bi bi-person-check mr-1" />
              Confirmar Reasignación
            </AsyncButton>
          </div>
        </div>
      )}
    </div>
  );
}
