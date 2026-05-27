import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRangeOfDatesStore } from "../useRangeOfDatesStore";

describe("useRangeOfDatesStore", () => {
  it("initializes with start and end dates", () => {
    const state = useRangeOfDatesStore.getState();
    expect(state.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(state.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("setRageOfDates updates start and end", () => {
    act(() => {
      useRangeOfDatesStore
        .getState()
        .setRageOfDates({ start: "2024-01-01", end: "2024-06-30" });
    });

    const state = useRangeOfDatesStore.getState();
    expect(state.start).toBe("2024-01-01");
    expect(state.end).toBe("2024-06-30");
  });

  it("getDateFilters returns filter string with field name", () => {
    act(() => {
      useRangeOfDatesStore
        .getState()
        .setRageOfDates({ start: "2024-01-01", end: "2024-06-30" });
    });

    const filter = useRangeOfDatesStore.getState().getDateFilters("createdAt");
    expect(filter).toContain("createdAt:gt:2024-01-01T00");
    expect(filter).toContain("createdAt:lt:2024-06-30T23");
  });

  it("setCalendarDate updates calendarDate", () => {
    act(() => {
      useRangeOfDatesStore.getState().setCalendarDate(null);
    });

    const state = useRangeOfDatesStore.getState();
    expect(state.calendarDate).toBeNull();
  });

  it("getCalendarDateFilter returns filter string with field name", () => {
    // Use the default calendarDate (set on init)
    const filter = useRangeOfDatesStore
      .getState()
      .getCalendarDateFilter("appointmentDate");
    expect(filter).toContain("appointmentDate:gt:");
    expect(filter).toContain("appointmentDate:lt:");
    expect(filter).toContain("State:eq:1");
  });

  it("getCalendarDateTitle returns title with date range", () => {
    const title = useRangeOfDatesStore.getState().getCalendarDateTitle();
    expect(title).toContain("Informe del");
    expect(title).toContain("al");
  });
});
