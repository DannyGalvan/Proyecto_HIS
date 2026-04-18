/**
 * Centralized date formatting utility for the HIS application.
 * All dates from the backend are in UTC. This utility converts them
 * to the configured timezone for display.
 * 
 * The timezone is read dynamically from the authenticated user's
 * preference stored in localStorage.
 * Default timezone: America/Guatemala (UTC-6)
 */

export const APP_LOCALE = "es-GT";

const DEFAULT_TIMEZONE = "America/Guatemala";

/**
 * Reads the user's preferred timezone from localStorage.
 * Checks admin auth (@auth) first, then patient auth (@patient-auth).
 * Falls back to "America/Guatemala" if nothing is found.
 */
export function getAppTimezone(): string {
  try {
    // Try admin auth store first
    const adminAuth = window.localStorage.getItem("@auth");
    if (adminAuth) {
      const parsed = JSON.parse(adminAuth);
      if (parsed.timezoneIanaId) {
        return parsed.timezoneIanaId;
      }
    }
  } catch {
    // Fallback silently
  }

  try {
    // Try patient auth store
    const patientAuth = window.localStorage.getItem("@patient-auth");
    if (patientAuth) {
      const parsed = JSON.parse(patientAuth);
      if (parsed.timezoneIanaId) {
        return parsed.timezoneIanaId;
      }
    }
  } catch {
    // Fallback silently
  }

  return DEFAULT_TIMEZONE;
}

/**
 * Parses a date string from the backend.
 * Handles both ISO strings ("2026-04-15T14:30:00Z") and 
 * pre-formatted strings ("15/04/2026 14:30:00" which are UTC).
 */
function parseBackendDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  // If it's already ISO format, parse directly
  if (dateStr.includes("T") || dateStr.endsWith("Z")) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Backend format: "dd/MM/yyyy HH:mm:ss" (UTC)
  // Parse manually: day/month/year hour:minute:second
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, day, month, year, hour, min, sec] = match;
    // Create as UTC since backend stores UTC
    const d = new Date(Date.UTC(
      parseInt(year), parseInt(month) - 1, parseInt(day),
      parseInt(hour), parseInt(min), parseInt(sec)
    ));
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Try date-only format: "dd/MM/yyyy"
  const dateOnly = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dateOnly) {
    const [, day, month, year] = dateOnly;
    const d = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    return isNaN(d.getTime()) ? null : d;
  }
  
  // Fallback: try native parsing
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/** Format as "15/04/2026" */
export function formatDate(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleDateString(APP_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: getAppTimezone(),
  });
}

/** Format as "15/04/2026 08:30" */
export function formatDateTime(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleString(APP_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getAppTimezone(),
  });
}

/** Format as "15/04/2026 08:30:45" */
export function formatDateTimeFull(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleString(APP_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: getAppTimezone(),
  });
}

/** Format as "08:30" */
export function formatTime(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleTimeString(APP_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getAppTimezone(),
  });
}

/** Format as "martes, 15 de abril de 2026" */
export function formatDateLong(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleDateString(APP_LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: getAppTimezone(),
  });
}

/** Format as "15 abr 2026" */
export function formatDateShort(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleDateString(APP_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getAppTimezone(),
  });
}

/** Format as "15 de abril de 2026, 08:30 a.m." (for receipts, confirmations) */
export function formatDateTimeLong(dateStr: string | null | undefined): string {
  const d = parseBackendDate(dateStr);
  if (!d) return dateStr ?? "—";
  return d.toLocaleString(APP_LOCALE, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: getAppTimezone(),
  });
}
