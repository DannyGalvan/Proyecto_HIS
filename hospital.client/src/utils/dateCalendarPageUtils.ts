/** Map appointment status to color */
export function getAppointmentColor(statusId: number): string {
  // 1=Pendiente(blue), 2=Confirmada(green), 3-6=En progreso(yellow), 7+=Completada(gray)
  if (statusId <= 1) return "#3b82f6"; // blue
  if (statusId === 2) return "#22c55e"; // green
  if (statusId >= 3 && statusId <= 6) return "#eab308"; // yellow
  return "#9ca3af"; // gray
}

/** Parse backend date strings (handles "dd/MM/yyyy HH:mm:ss" and ISO formats) */
export function parseCalendarDate(
  dateStr: string | null | undefined,
): Date | null {
  if (!dateStr) return null;
  // ISO format
  if (dateStr.includes("T") || dateStr.endsWith("Z")) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  // Backend format: "dd/MM/yyyy HH:mm:ss"
  const match = dateStr.match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );
  if (match) {
    const [, day, month, year, hour, min, sec] = match;
    return new Date(Date.UTC(+year, +month - 1, +day, +hour, +min, +sec));
  }
  // Date-only: "dd/MM/yyyy"
  const dateOnly = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dateOnly) {
    const [, day, month, year] = dateOnly;
    return new Date(Date.UTC(+year, +month - 1, +day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Convert a UTC Date to a local datetime string in the user's timezone.
 * Returns format "YYYY-MM-DDTHH:mm:ss" (no Z suffix) so FullCalendar treats it as local.
 */
export function toLocalCalendarString(utcDate: Date, tz: string): string {
  // Use Intl.DateTimeFormat to get the date parts in the target timezone
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcDate);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}
