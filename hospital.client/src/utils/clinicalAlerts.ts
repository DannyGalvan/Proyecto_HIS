/**
 * Computes clinical alert strings for vital sign values outside normal ranges.
 * Pure function — can be called from hooks, callbacks, or anywhere.
 *
 * Normal ranges:
 * - Systolic BP:  90–140 mmHg
 * - Diastolic BP: 60–90 mmHg
 * - Temperature:  36.0–37.5 °C
 * - Heart rate:   60–100 bpm
 */
export function computeClinicalAlerts(values: {
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  heartRate?: number | null;
}): string[] {
  const alerts: string[] = [];
  const { bloodPressureSystolic, bloodPressureDiastolic, temperature, heartRate } = values;

  if (bloodPressureSystolic != null) {
    if (bloodPressureSystolic < 90) alerts.push("Hipotensión");
    else if (bloodPressureSystolic > 140) alerts.push("Hipertensión");
  }

  if (bloodPressureDiastolic != null) {
    if (bloodPressureDiastolic < 60) alerts.push("Presión diastólica baja");
    else if (bloodPressureDiastolic > 90) alerts.push("Presión diastólica alta");
  }

  if (temperature != null) {
    if (temperature < 36.0) alerts.push("Hipotermia");
    else if (temperature > 37.5) alerts.push("Fiebre");
  }

  if (heartRate != null) {
    if (heartRate < 60) alerts.push("Bradicardia");
    else if (heartRate > 100) alerts.push("Taquicardia");
  }

  return alerts;
}
