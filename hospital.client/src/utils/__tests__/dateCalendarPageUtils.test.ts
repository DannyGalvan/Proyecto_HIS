import { describe, expect, it } from "vitest";

import {
    getAppointmentColor,
    parseCalendarDate,
    toLocalCalendarString,
} from "../dateCalendarPageUtils";

describe("getAppointmentColor", () => {
  it("returns blue for statusId <= 1 (Pendiente)", () => {
    expect(getAppointmentColor(0)).toBe("#3b82f6");
    expect(getAppointmentColor(1)).toBe("#3b82f6");
  });

  it("returns green for statusId === 2 (Confirmada)", () => {
    expect(getAppointmentColor(2)).toBe("#22c55e");
  });

  it("returns yellow for statusId 3-6 (En progreso)", () => {
    expect(getAppointmentColor(3)).toBe("#eab308");
    expect(getAppointmentColor(4)).toBe("#eab308");
    expect(getAppointmentColor(5)).toBe("#eab308");
    expect(getAppointmentColor(6)).toBe("#eab308");
  });

  it("returns gray for statusId >= 7 (Completada)", () => {
    expect(getAppointmentColor(7)).toBe("#9ca3af");
    expect(getAppointmentColor(10)).toBe("#9ca3af");
  });
});

describe("parseCalendarDate", () => {
  it("parses ISO format with T", () => {
    const result = parseCalendarDate("2024-06-15T10:30:00");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2024);
  });

  it("parses ISO format with Z suffix", () => {
    const result = parseCalendarDate("2024-06-15T10:30:00Z");
    expect(result).toBeInstanceOf(Date);
  });

  it("parses backend format dd/MM/yyyy HH:mm:ss", () => {
    const result = parseCalendarDate("15/06/2024 10:30:00");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getUTCFullYear()).toBe(2024);
    expect(result!.getUTCMonth()).toBe(5); // June = 5
    expect(result!.getUTCDate()).toBe(15);
  });

  it("parses date-only format dd/MM/yyyy", () => {
    const result = parseCalendarDate("15/06/2024");
    expect(result).toBeInstanceOf(Date);
    expect(result!.getUTCFullYear()).toBe(2024);
    expect(result!.getUTCMonth()).toBe(5);
    expect(result!.getUTCDate()).toBe(15);
  });

  it("returns null for null input", () => {
    expect(parseCalendarDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(parseCalendarDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseCalendarDate("")).toBeNull();
  });

  it("returns null for unparseable string", () => {
    expect(parseCalendarDate("not-a-date")).toBeNull();
  });
});

describe("toLocalCalendarString", () => {
  it("converts UTC date to local string in given timezone", () => {
    // June 15, 2024 14:30:00 UTC → in America/Guatemala (UTC-6) = 08:30:00
    const utcDate = new Date("2024-06-15T14:30:00Z");
    const result = toLocalCalendarString(utcDate, "America/Guatemala");
    expect(result).toBe("2024-06-15T08:30:00");
  });

  it("handles timezone with positive offset", () => {
    // June 15, 2024 02:00:00 UTC → in Europe/Madrid (UTC+2 in summer) = 04:00:00
    const utcDate = new Date("2024-06-15T02:00:00Z");
    const result = toLocalCalendarString(utcDate, "Europe/Madrid");
    expect(result).toBe("2024-06-15T04:00:00");
  });

  it("handles date crossing midnight boundary", () => {
    // June 15, 2024 03:00:00 UTC → in America/Guatemala (UTC-6) = June 14 21:00:00
    const utcDate = new Date("2024-06-15T03:00:00Z");
    const result = toLocalCalendarString(utcDate, "America/Guatemala");
    expect(result).toBe("2024-06-14T21:00:00");
  });
});
