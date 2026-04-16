interface VitalSignAlertsDisplayProps {
  /** Array of alert messages from useVitalSignAlerts */
  readonly alerts: string[];
}

/**
 * Renders a non-blocking yellow/orange alert panel listing each vital sign alert.
 * Returns null when there are no alerts.
 * Does NOT prevent form submission.
 */
export function VitalSignAlertsDisplay({ alerts }: VitalSignAlertsDisplayProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-orange-300 bg-orange-50 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-orange-500" aria-hidden="true">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-800 mb-1">
            Alertas de signos vitales
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {alerts.map((alert) => (
              <li key={alert} className="text-sm text-orange-700">
                {alert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
