import { beforeEach, describe, expect, it } from "vitest";

import {
    formatDate,
    formatDateLong,
    formatDateShort,
    formatDateTime,
    formatDateTimeFull,
    formatDateTimeLong,
    formatLocalDateTime,
    formatTime,
    getAppTimezone,
} from "../dateFormatter";

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem(
    "@auth",
    JSON.stringify({ timezoneIanaId: "America/Guatemala" }),
  );
});

describe("getAppTimezone", () => {
  it("reads timezone from admin auth", () => {
    window.localStorage.setItem(
      "@auth",
      JSON.stringify({ timezoneIanaId: "America/New_York" }),
    );
    expect(getAppTimezone()).toBe("America/New_York");
  });

  it("falls back to patient auth if admin has no timezone", () => {
    window.localStorage.setItem("@auth", JSON.stringify({}));
    window.localStorage.setItem(
      "@patient-auth",
      JSON.stringify({ timezoneIanaId: "Europe/Madrid" }),
    );
    expect(getAppTimezone()).toBe("Europe/Madrid");
  });

  it("returns default America/Guatemala if nothing in storage", () => {
    window.localStorage.clear();
    expect(getAppTimezone()).toBe("America/Guatemala");
  });

  it("handles malformed JSON gracefully", () => {
    window.localStorage.setItem("@auth", "not-json");
    window.localStorage.removeItem("@patient-auth");
    expect(getAppTimezone()).toBe("America/Guatemala");
  });
});

describe("formatDate", () => {
  it("formats ISO date to dd/MM/yyyy", () => {
    const result = formatDate("2024-06-15T14:30:00Z");
    expect(result).toMatch(/15\/06\/2024/);
  });

  it("formats backend format dd/MM/yyyy HH:mm:ss", () => {
    const result = formatDate("15/06/2024 14:30:00");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("formats date-only backend format dd/MM/yyyy", () => {
    const result = formatDate("15/06/2024");
    // Parsed as UTC midnight, displayed in America/Guatemala (UTC-6) → June 14
    expect(result).toMatch(/\d{2}\/06\/2024/);
  });

  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns original string for unparseable input", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateTime", () => {
  it("formats ISO date to dd/MM/yyyy HH:mm", () => {
    const result = formatDateTime("2024-06-15T14:30:00Z");
    expect(result).toMatch(/15\/06\/2024/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("returns dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });
});

describe("formatDateTimeFull", () => {
  it("includes seconds in output", () => {
    const result = formatDateTimeFull("2024-06-15T14:30:45Z");
    expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it("returns dash for null", () => {
    expect(formatDateTimeFull(null)).toBe("—");
  });
});

describe("formatTime", () => {
  it("formats to HH:mm", () => {
    const result = formatTime("2024-06-15T14:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("returns dash for null", () => {
    expect(formatTime(null)).toBe("—");
  });
});

describe("formatDateLong", () => {
  it("returns long format with weekday and month name", () => {
    const result = formatDateLong("2024-06-15T14:30:00Z");
    // Should contain "sábado" and "junio" in es-GT locale
    expect(result).toMatch(/\d+/);
    expect(result.length).toBeGreaterThan(10);
  });

  it("returns dash for null", () => {
    expect(formatDateLong(null)).toBe("—");
  });
});

describe("formatDateShort", () => {
  it("returns short format with abbreviated month", () => {
    const result = formatDateShort("2024-06-15T14:30:00Z");
    expect(result).toMatch(/\d+/);
  });

  it("returns dash for null", () => {
    expect(formatDateShort(null)).toBe("—");
  });
});

describe("formatDateTimeLong", () => {
  it("returns long date with time", () => {
    const result = formatDateTimeLong("2024-06-15T14:30:00Z");
    expect(result.length).toBeGreaterThan(10);
  });

  it("returns dash for null", () => {
    expect(formatDateTimeLong(null)).toBe("—");
  });
});

describe("formatLocalDateTime", () => {
  it("formats as yyyy-MM-ddTHH:mm:ss using local time", () => {
    const date = new Date(2024, 5, 15, 14, 30, 45);
    expect(formatLocalDateTime(date)).toBe("2024-06-15T14:30:45");
  });

  it("zero-pads all components", () => {
    const date = new Date(2024, 0, 5, 9, 3, 7);
    expect(formatLocalDateTime(date)).toBe("2024-01-05T09:03:07");
  });
});
