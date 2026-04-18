interface OutOfRangeAlertProps {
  /** Whether the value is outside the reference range */
  readonly isOutOfRange: boolean;
  /** Optional reference range string to display (e.g. "3.5–5.0 mmol/L") */
  readonly referenceRange?: string;
}

/**
 * Renders a red alert badge when a lab result is out of range.
 * Returns null when the value is within range.
 */
export function OutOfRangeAlert({ isOutOfRange, referenceRange }: OutOfRangeAlertProps) {
  if (!isOutOfRange) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-300"
      title={referenceRange ? `Los resultados del examen están fuera del rango de referencia (${referenceRange}). Se requiere revisión médica.` : "Los resultados del examen están fuera del rango de referencia. Se requiere revisión médica."}
    >
      <span aria-hidden="true">🔴</span>
      Fuera de rango
      {referenceRange && (
        <span className="font-normal text-red-600">({referenceRange})</span>
      )}
    </span>
  );
}
