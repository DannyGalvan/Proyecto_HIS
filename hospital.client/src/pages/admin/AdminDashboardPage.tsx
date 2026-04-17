import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { getAppointments } from "../../services/appointmentService";
import { nameRoutes } from "../../configs/constants";
import type { AppointmentResponse } from "../../types/AppointmentResponse";

const statusColors: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800 border-green-200",
  "Paciente presente": "bg-purple-100 text-purple-800 border-purple-200",
  "En curso": "bg-blue-100 text-blue-800 border-blue-200",
  Completada: "bg-gray-100 text-gray-800 border-gray-200",
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cancelada: "bg-red-100 text-red-800 border-red-200",
  "No asistió": "bg-orange-100 text-orange-800 border-orange-200",
};

const statusDots: Record<string, string> = {
  Pagada: "bg-green-500",
  "Paciente presente": "bg-purple-500",
  "En curso": "bg-blue-500",
  Completada: "bg-gray-400",
  Pendiente: "bg-yellow-500",
  Cancelada: "bg-red-500",
  "No asistió": "bg-orange-500",
};

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  readonly icon: string;
  readonly label: string;
  readonly value: number;
  readonly color: string;
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm flex items-center gap-4 ${color}`}>
      <div className="text-3xl">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  to,
}: {
  readonly icon: string;
  readonly label: string;
  readonly to: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:border-primary/60 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
      onClick={() => navigate(to)}
    >
      <i className={`bi ${icon} text-2xl text-primary`} />
      <span className="text-xs font-semibold text-center text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // Build today's filter
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayFilter = `State:eq:1 AND AppointmentDate:gte:${todayStart.toISOString()} AND AppointmentDate:lte:${todayEnd.toISOString()}`;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-appointments", todayStart.toDateString()],
    queryFn: () =>
      getAppointments({
        pageNumber: 1,
        pageSize: 200,
        filters: todayFilter,
        include: "Specialty,Branch,AppointmentStatus,Patient,Doctor",
        includeTotal: false,
      }),
    refetchInterval: 60000, // auto-refresh every 60s
  });

  const appointments: AppointmentResponse[] = data?.success ? data.data : [];

  // KPI calculations
  const total = appointments.length;
  const pagadas = appointments.filter((a) => a.appointmentStatus?.name === "Pagada").length;
  const enEspera = appointments.filter(
    (a) => a.arrivalTime && a.appointmentStatus?.name !== "Completada",
  ).length;
  const completadas = appointments.filter((a) => a.appointmentStatus?.name === "Completada").length;

  // Group by status
  const byStatus = appointments.reduce<Record<string, number>>((acc, a) => {
    const name = a.appointmentStatus?.name ?? "Desconocido";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  // Active doctors today (with paid/in-progress/present appointments)
  const activeDoctorMap = new Map<number, { name: string; branch: string; specialty: string; count: number }>();
  appointments.forEach((a) => {
    if (!a.doctorId) return;
    const statusName = a.appointmentStatus?.name ?? "";
    if (statusName === "Cancelada") return;
    if (!activeDoctorMap.has(a.doctorId)) {
      activeDoctorMap.set(a.doctorId, {
        name: a.doctor?.name ?? `Médico #${a.doctorId}`,
        branch: a.branch?.name ?? "—",
        specialty: a.specialty?.name ?? "—",
        count: 0,
      });
    }
    const entry = activeDoctorMap.get(a.doctorId)!;
    entry.count += 1;
  });
  const activeDoctors = Array.from(activeDoctorMap.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <span className="text-xs text-gray-400">
          <i className="bi bi-arrow-repeat mr-1" />
          Actualización automática cada 60s
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Resumen de operaciones del día — {todayStart.toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      {isLoading && <LoadingComponent />}

      {!isLoading && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              color="bg-blue-50 text-blue-800 border-blue-200"
              icon="bi-calendar-check"
              label="Citas hoy"
              value={total}
            />
            <StatCard
              color="bg-green-50 text-green-800 border-green-200"
              icon="bi-cash-coin"
              label="Citas Pagadas"
              value={pagadas}
            />
            <StatCard
              color="bg-purple-50 text-purple-800 border-purple-200"
              icon="bi-person-check"
              label="Pacientes en espera"
              value={enEspera}
            />
            <StatCard
              color="bg-gray-50 text-gray-800 border-gray-200"
              icon="bi-check2-circle"
              label="Completadas hoy"
              value={completadas}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Appointments by status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
              <h2 className="font-bold mb-4 text-base">Citas por estado</h2>
              {Object.keys(byStatus).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin citas registradas hoy</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(byStatus).map(([status, count]) => {
                    const colorClass = statusColors[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
                    const dotClass = statusDots[status] ?? "bg-gray-400";
                    return (
                      <div
                        key={status}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 border ${colorClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                          <span className="text-sm font-medium">{status}</span>
                        </div>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active doctors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
              <h2 className="font-bold mb-4 text-base">Médicos activos hoy</h2>
              {activeDoctors.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Sin médicos con citas hoy</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="text-left py-1 pb-2">Médico</th>
                        <th className="text-left py-1 pb-2">Sede</th>
                        <th className="text-left py-1 pb-2">Especialidad</th>
                        <th className="text-right py-1 pb-2">Citas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {activeDoctors.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="py-2 font-medium">{doc.name}</td>
                          <td className="py-2 text-gray-500">{doc.branch}</td>
                          <td className="py-2 text-gray-500">{doc.specialty}</td>
                          <td className="py-2 text-right font-bold">{doc.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
            <h2 className="font-bold mb-4 text-base">Acciones rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
              <QuickActionButton icon="bi-calendar-plus" label="Nueva Cita" to={nameRoutes.appointmentCreate} />
              <QuickActionButton icon="bi-door-open" label="Recepción" to={nameRoutes.reception} />
              <QuickActionButton icon="bi-cash-coin" label="Caja" to={nameRoutes.cashier} />
              <QuickActionButton icon="bi-heart-pulse" label="Signos Vitales" to={nameRoutes.nurseDashboard} />
              <QuickActionButton icon="bi-person-badge" label="Gestión Médicos" to={nameRoutes.doctorManagement} />
              <QuickActionButton icon="bi-arrow-left-right" label="Traslados" to={nameRoutes.doctorTransfer} />
              <QuickActionButton icon="bi-diagram-3" label="Especialidades por Sede" to={nameRoutes.branchSpecialty} />
            </div>
          </div>

          {/* Navigate to appointments */}
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onPress={() => navigate(nameRoutes.appointment)}>
              <i className="bi bi-list-ul mr-2" />
              Ver todas las citas
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
