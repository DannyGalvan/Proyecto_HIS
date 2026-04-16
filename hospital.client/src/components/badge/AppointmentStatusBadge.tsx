const STATUS_COLORS: Record<string, string> = {
  Pagada: "bg-green-100 text-green-800",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Cancelada: "bg-red-100 text-red-800",
  "En curso": "bg-blue-100 text-blue-800",
  Completada: "bg-gray-100 text-gray-800",
  "No asistió": "bg-orange-100 text-orange-800",
};

interface AppointmentStatusBadgeProps {
  /** The appointment status name to display */
  readonly statusName: string;
}

/**
 * Renders a colored badge for an appointment status.
 * Defaults to gray styling when the status is not in the color map.
 */
export function AppointmentStatusBadge({ statusName }: AppointmentStatusBadgeProps) {
  const colorClass = STATUS_COLORS[statusName] ?? "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {statusName || "—"}
    </span>
  );
}
