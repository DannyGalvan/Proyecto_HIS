import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";
import { QuickActionButton } from "../../components/admin/QuickActionButton";
import { StatCard } from "../../components/admin/StatCard";
import { LoadingComponent } from "../../components/spinner/LoadingComponent";
import { nameRoutes } from "../../configs/constants";
import {
  roleDashboardConfigs,
  type RoleAppointment,
} from "../../configs/roleDashboardConfig";
import { useAuth } from "../../hooks/useAuth";
import { getAppointments } from "../../services/appointmentService";
import type { AppointmentResponse } from "../../types/AppointmentResponse";
import { formatDateLong } from "../../utils/dateFormatter";
import { getRoleFromToken } from "../../utils/jwt";

const statusColors: Record<string, string> = {
  "Pendiente de Pago": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmada: "bg-green-100 text-green-800 border-green-200",
  "Paciente Presente": "bg-purple-100 text-purple-800 border-purple-200",
  "Signos Vitales": "bg-blue-100 text-blue-800 border-blue-200",
  "En Espera": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Consulta Médica": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Cancelada: "bg-red-100 text-red-800 border-red-200",
  "No Asistió": "bg-orange-100 text-orange-800 border-orange-200",
};

const statusDots: Record<string, string> = {
  "Pendiente de Pago": "bg-yellow-500",
  Confirmada: "bg-green-500",
  "Paciente Presente": "bg-purple-500",
  "Signos Vitales": "bg-blue-500",
  "En Espera": "bg-indigo-500",
  "Consulta Médica": "bg-cyan-500",
  Cancelada: "bg-red-500",
  "No Asistió": "bg-orange-500",
};

export function RoleDashboardPage() {
  const { token } = useAuth();
  const role = token ? getRoleFromToken(token) : null;
  const config = role ? roleDashboardConfigs[role] : undefined;

  // Today's date range for filtering
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const hasAppointmentFilter = !!config?.appointmentFilter;
  const dateFilter = `AppointmentDate:gte:${todayStart.toISOString()} AND AppointmentDate:lte:${todayEnd.toISOString()}`;
  const fullFilter = hasAppointmentFilter
    ? `${config.appointmentFilter} AND ${dateFilter}`
    : "";

  const { data, isLoading } = useQuery({
    queryKey: ["role-dashboard", role, todayStart.toDateString()],
    queryFn: () =>
      getAppointments({
        pageNumber: 1,
        pageSize: 200,
        filters: fullFilter,
        include: "Specialty,Branch,AppointmentStatus,Patient",
        includeTotal: false,
      }),
    enabled: hasAppointmentFilter,
    refetchInterval: 60000,
  });

  // If no config for this role, redirect to admin dashboard
  if (!config) {
    return <Navigate replace to={nameRoutes.adminDashboard} />;
  }

  const appointments: AppointmentResponse[] =
    data?.success ? data.data : [];

  // Compute KPIs from config filters
  const kpiValues = config.kpis.map((kpi) => ({
    ...kpi,
    value: appointments.filter((a) =>
      kpi.filter(a as unknown as RoleAppointment),
    ).length,
  }));

  // Group by status (only relevant statuses if defined)
  const byStatus = appointments.reduce<Record<string, number>>((acc, a) => {
    const name = a.appointmentStatus?.name ?? "Desconocido";
    if (
      !config.relevantStatuses ||
      config.relevantStatuses.includes(name)
    ) {
      acc[name] = (acc[name] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{config.title}</h1>
        {hasAppointmentFilter ? (
          <span className="text-xs text-gray-400">
            <i className="bi bi-arrow-repeat mr-1" />
            Actualización automática cada 60s
          </span>
        ) : null}
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {config.subtitle} &mdash;{" "}
        {formatDateLong(todayStart.toISOString())}
      </p>

      {isLoading ? <LoadingComponent /> : null}

      {!isLoading && (
        <>
          {/* KPI Cards */}
          {kpiValues.length > 0 ? (
            <div
              className={`grid gap-4 mb-8 ${
                kpiValues.length <= 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 md:grid-cols-4"
              }`}
            >
              {kpiValues.map((kpi) => (
                <StatCard
                  key={kpi.label}
                  color={kpi.color}
                  icon={kpi.icon}
                  label={kpi.label}
                  value={kpi.value}
                />
              ))}
            </div>
          ) : null}

          {/* Status breakdown */}
          {Object.keys(byStatus).length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 mb-8">
              <h2 className="font-bold mb-4 text-base">Citas por estado</h2>
              <div className="space-y-2">
                {Object.entries(byStatus).map(([status, count]) => {
                  const colorClass =
                    statusColors[status] ??
                    "bg-gray-100 text-gray-800 border-gray-200";
                  const dotClass = statusDots[status] ?? "bg-gray-400";
                  return (
                    <div
                      key={status}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border ${colorClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${dotClass}`}
                        />
                        <span className="text-sm font-medium">{status}</span>
                      </div>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quick actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5">
            <h2 className="font-bold mb-4 text-base">Acciones rápidas</h2>
            <div
              className={`grid gap-3 ${
                config.quickActions.length <= 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {config.quickActions.map((action) => (
                <QuickActionButton
                  key={action.to}
                  icon={action.icon}
                  label={action.label}
                  to={action.to}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
