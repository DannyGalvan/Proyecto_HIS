import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointmentById } from "../../services/appointmentService";
import { nameRoutes } from "../../configs/constants";

const statusColors: Record<string, string> = {
  "Pendiente de Pago": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmada: "bg-green-100 text-green-800 border-green-200",
  "Signos Vitales": "bg-purple-100 text-purple-800 border-purple-200",
  "En Espera": "bg-orange-100 text-orange-800 border-orange-200",
  "Consulta Médica": "bg-blue-100 text-blue-800 border-blue-200",
  Evaluado: "bg-teal-100 text-teal-800 border-teal-200",
  Laboratorio: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Farmacia: "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Atención Finalizada": "bg-gray-100 text-gray-700 border-gray-200",
  "No Asistió": "bg-red-100 text-red-800 border-red-200",
  Cancelada: "bg-red-100 text-red-800 border-red-200",
};

function DetailRow({ label, value, icon }: { readonly label: string; readonly value: string; readonly icon?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {icon && <i className={`bi ${icon} mr-1`} />}
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{value || "—"}</span>
    </div>
  );
}

export function AppointmentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["appointment-view", id],
    queryFn: () => getAppointmentById(Number(id)),
  });

  if (isLoading) return <LoadingComponent />;

  if (!data?.success || !data.data) {
    return (
      <div className="p-8 text-center text-gray-400">
        <i className="bi bi-exclamation-triangle text-4xl block mb-3" />
        <p>Cita no encontrada. {error instanceof Error ? error.message : ""}</p>
        <Button className="mt-4" variant="secondary" onPress={() => navigate(nameRoutes.appointment)}>
          Volver a Citas
        </Button>
      </div>
    );
  }

  const appt = data.data;
  const statusName = appt.appointmentStatus?.name ?? "";
  const statusClass = statusColors[statusName] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button size="sm" variant="secondary" onPress={() => navigate(nameRoutes.appointment)}>
          <i className="bi bi-arrow-left mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalle de Cita #{appt.id}</h1>
      </div>

      {/* Status banner */}
      <div className={`mb-6 rounded-xl border p-4 flex items-center justify-between ${statusClass}`}>
        <div>
          <p className="text-sm font-semibold">Estado actual</p>
          <p className="text-lg font-bold">{statusName || "Desconocido"}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusClass}`}>
          {statusName}
        </span>
      </div>

      {/* Details grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 mb-6">
        <h2 className="font-bold text-base mb-4">Información de la Cita</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <DetailRow icon="bi-hash" label="No. Cita" value={String(appt.id)} />
          <DetailRow icon="bi-person" label="Paciente" value={appt.patient?.name ?? `#${appt.patientId}`} />
          <DetailRow icon="bi-person-badge" label="Médico" value={appt.doctor?.name ?? (appt.doctorId ? `#${appt.doctorId}` : "Sin asignar")} />
          <DetailRow icon="bi-hospital" label="Especialidad" value={appt.specialty?.name ?? ""} />
          <DetailRow icon="bi-building" label="Sede" value={appt.branch?.name ?? ""} />
          <DetailRow icon="bi-calendar3" label="Fecha y Hora" value={appt.appointmentDate} />
          <DetailRow icon="bi-cash-coin" label="Monto" value={`Q${appt.amount?.toFixed(2) ?? "0.00"}`} />
          <DetailRow icon="bi-flag" label="Prioridad" value={appt.priority > 0 ? "🚨 Emergencia" : "Normal"} />
          {appt.arrivalTime && <DetailRow icon="bi-clock-history" label="Hora de Llegada" value={appt.arrivalTime} />}
        </div>
      </div>

      {/* Reason */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 mb-6">
        <h2 className="font-bold text-base mb-2">Motivo de Consulta</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{appt.reason || "Sin motivo registrado."}</p>
      </div>

      {/* Notes */}
      {appt.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="font-bold text-base mb-2">Notas</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{appt.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border p-4 text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><span className="font-semibold">Creado:</span> {appt.createdAt}</div>
        <div><span className="font-semibold">Creado por:</span> #{appt.createdBy}</div>
        {appt.updatedAt && <div><span className="font-semibold">Actualizado:</span> {appt.updatedAt}</div>}
        {appt.updatedBy && <div><span className="font-semibold">Actualizado por:</span> #{appt.updatedBy}</div>}
      </div>
    </div>
  );
}
