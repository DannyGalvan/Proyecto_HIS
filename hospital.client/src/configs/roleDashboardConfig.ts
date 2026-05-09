import { nameRoutes } from "./constants";

export interface RoleKpi {
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  /** Filter function applied to today's appointments to compute the KPI value */
  readonly filter: (a: RoleAppointment) => boolean;
}

export interface RoleQuickAction {
  readonly icon: string;
  readonly label: string;
  readonly to: string;
}

export interface RoleDashboardConfig {
  readonly title: string;
  readonly subtitle: string;
  /** API filter string to fetch today's relevant appointments */
  readonly appointmentFilter: string;
  readonly kpis: readonly RoleKpi[];
  readonly quickActions: readonly RoleQuickAction[];
  /** Status names to highlight in the "by status" breakdown */
  readonly relevantStatuses?: readonly string[];
}

/** Minimal appointment shape needed by KPI filters */
export interface RoleAppointment {
  appointmentStatus?: { name?: string } | null;
  arrivalTime?: string | null;
  priority: number;
}

// ─── Status IDs used in API filters ──────────────────────────────────────────
const STATUS_PENDIENTE_PAGO = 1;
const STATUS_CONFIRMADA = 2;
const STATUS_PACIENTE_PRESENTE = 12;
const STATUS_CANCELADA = 11;

// ─── Recepcionista ───────────────────────────────────────────────────────────
const recepcionistaConfig: RoleDashboardConfig = {
  title: "Panel de Recepción",
  subtitle: "Verificación de citas y registro de llegada de pacientes",
  appointmentFilter: `State:eq:1 AND AppointmentStatusId:in:${STATUS_PENDIENTE_PAGO},${STATUS_CONFIRMADA},${STATUS_PACIENTE_PRESENTE}`,
  kpis: [
    {
      icon: "bi-calendar-check",
      label: "Citas hoy",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      filter: () => true,
    },
    {
      icon: "bi-person-check",
      label: "Confirmadas (por llegar)",
      color: "bg-green-50 text-green-800 border-green-200",
      filter: (a) => a.appointmentStatus?.name === "Confirmada",
    },
    {
      icon: "bi-hourglass-split",
      label: "Pendientes de pago",
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
      filter: (a) => a.appointmentStatus?.name === "Pendiente de Pago",
    },
    {
      icon: "bi-person-fill-check",
      label: "Llegadas registradas",
      color: "bg-purple-50 text-purple-800 border-purple-200",
      filter: (a) => a.appointmentStatus?.name === "Paciente Presente",
    },
  ],
  quickActions: [
    { icon: "bi-search", label: "Recepción", to: nameRoutes.reception },
    {
      icon: "bi-calendar-plus",
      label: "Nueva Cita",
      to: nameRoutes.appointmentCreate,
    },
  ],
  relevantStatuses: ["Pendiente de Pago", "Confirmada", "Paciente Presente"],
};

// ─── Cajero ──────────────────────────────────────────────────────────────────
const cajeroConfig: RoleDashboardConfig = {
  title: "Panel de Caja",
  subtitle: "Cobro de consultas y gestión de pagos",
  appointmentFilter: `State:eq:1 AND AppointmentStatusId:in:${STATUS_PENDIENTE_PAGO},${STATUS_CONFIRMADA}`,
  kpis: [
    {
      icon: "bi-cash-coin",
      label: "Pendientes de cobro",
      color: "bg-yellow-50 text-yellow-800 border-yellow-200",
      filter: (a) => a.appointmentStatus?.name === "Pendiente de Pago",
    },
    {
      icon: "bi-check-circle",
      label: "Cobradas hoy",
      color: "bg-green-50 text-green-800 border-green-200",
      filter: (a) => a.appointmentStatus?.name === "Confirmada",
    },
    {
      icon: "bi-exclamation-triangle",
      label: "Emergencias",
      color: "bg-red-50 text-red-800 border-red-200",
      filter: (a) =>
        a.priority > 0 && a.appointmentStatus?.name === "Pendiente de Pago",
    },
  ],
  quickActions: [
    { icon: "bi-cash-coin", label: "Caja", to: nameRoutes.cashier },
    { icon: "bi-receipt", label: "Pagos", to: nameRoutes.payment },
  ],
  relevantStatuses: ["Pendiente de Pago", "Confirmada"],
};

// ─── Farmacéutico ────────────────────────────────────────────────────────────
const farmaceuticoConfig: RoleDashboardConfig = {
  title: "Panel de Farmacia",
  subtitle: "Despacho de recetas y gestión de inventario",
  appointmentFilter: "", // Farmacia no depende de citas directamente
  kpis: [],
  quickActions: [
    { icon: "bi-capsule", label: "Despacho", to: nameRoutes.dispense },
    { icon: "bi-box-seam", label: "Medicamentos", to: nameRoutes.medicine },
    {
      icon: "bi-arrow-left-right",
      label: "Inventario",
      to: nameRoutes.medicineInventory,
    },
    {
      icon: "bi-clipboard-data",
      label: "Movimientos",
      to: nameRoutes.inventoryMovement,
    },
  ],
};

// ─── Laboratorista ───────────────────────────────────────────────────────────
const laboratoristaConfig: RoleDashboardConfig = {
  title: "Panel de Laboratorio",
  subtitle: "Órdenes de laboratorio y resultados de exámenes",
  appointmentFilter: "", // Lab no depende de citas directamente
  kpis: [],
  quickActions: [
    {
      icon: "bi-clipboard2-pulse",
      label: "Órdenes",
      to: nameRoutes.labOrder,
    },
    { icon: "bi-droplet", label: "Exámenes", to: nameRoutes.labExam },
    { icon: "bi-building", label: "Laboratorios", to: nameRoutes.laboratory },
  ],
};

// ─── Registry ────────────────────────────────────────────────────────────────
export const roleDashboardConfigs: Record<string, RoleDashboardConfig> = {
  Recepcionista: recepcionistaConfig,
  Cajero: cajeroConfig,
  Farmaceutico: farmaceuticoConfig,
  Laboratorista: laboratoristaConfig,
};
