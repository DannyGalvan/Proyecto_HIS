/**
 * Validates whether a prescription is still within its 7-day validity window.
 *
 * @param prescriptionDate - ISO date string of when the prescription was issued, or null
 * @returns `isValid` — true iff the prescription is 7 days old or less;
 *          `daysOld` — number of full days since the prescription date
 */
/**
 * Parses a date string that may be in "dd/MM/yyyy HH:mm:ss" (backend format)
 * or any ISO-compatible format. Returns a valid Date or null.
 */
function parsePrescriptionDate(dateStr: string): Date | null {
  // Try ISO / standard format first
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) return direct;

  // Backend format: "dd/MM/yyyy HH:mm:ss"
  const match = dateStr.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );
  if (match) {
    const [, dd, mm, yyyy, hh, min, ss] = match;
    const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    const parsed = new Date(iso);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

export function usePrescriptionValidity(prescriptionDate: string | null): {
  isValid: boolean;
  daysOld: number;
} {
  if (!prescriptionDate) {
    return { isValid: false, daysOld: 0 };
  }

  const issued = parsePrescriptionDate(prescriptionDate);
  if (!issued) return { isValid: false, daysOld: 0 };

  const today = new Date();

  // Normalise both dates to midnight to count full calendar days
  issued!.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - issued!.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    isValid: daysOld <= 7,
    daysOld,
  };
}
