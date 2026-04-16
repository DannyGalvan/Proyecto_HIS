const NOTIFICATION_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  1: { label: "Enviado", color: "bg-green-100 text-green-800" },
  2: { label: "Fallido", color: "bg-red-100 text-red-800" },
  3: { label: "Reintentando", color: "bg-blue-100 text-blue-800" },
};

interface NotificationStatusBadgeProps {
  /** Numeric status code: 0=Pendiente, 1=Enviado, 2=Fallido, 3=Reintentando */
  readonly status: number;
}

/**
 * Renders a colored badge for a notification status code.
 * Defaults to gray styling when the status code is not recognized.
 */
export function NotificationStatusBadge({ status }: NotificationStatusBadgeProps) {
  const entry = NOTIFICATION_STATUS[status] ?? { label: String(status), color: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.color}`}>
      {entry.label}
    </span>
  );
}
