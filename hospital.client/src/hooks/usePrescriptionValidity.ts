/**
 * Validates whether a prescription is still within its 7-day validity window.
 *
 * @param prescriptionDate - ISO date string of when the prescription was issued, or null
 * @returns `isValid` — true iff the prescription is 7 days old or less;
 *          `daysOld` — number of full days since the prescription date
 */
export function usePrescriptionValidity(
  prescriptionDate: string | null,
): { isValid: boolean; daysOld: number } {
  if (!prescriptionDate) {
    return { isValid: false, daysOld: 0 };
  }

  const issued = new Date(prescriptionDate);
  const today = new Date();

  // Normalise both dates to midnight to count full calendar days
  issued.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - issued.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    isValid: daysOld <= 7,
    daysOld,
  };
}
