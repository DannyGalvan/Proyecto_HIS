import { describe, expect, it } from "vitest";

import { formatDateForApi, formatTime, generateSlots, isSlotOccupied } from "../dynamicCalendar";

describe("isSlotOccupied", () => {
  it("returns true when slot overlaps with an occupied slot", () => {
    const slotStart = new Date("2024-06-15T10:00:00");
    const occupied = ["2024-06-15T10:15:00"]; // overlaps with 10:00-10:30
    expect(isSlotOccupied(slotStart, occupied)).toBe(true);
  });

  it("returns false when slot does not overlap", () => {
    const slotStart = new Date("2024-06-15T10:00:00");
    const occupied = ["2024-06-15T11:00:00"]; // 11:00-11:30, no overlap
    expect(isSlotOccupied(slotStart, occupied)).toBe(false);
  });

  it("returns false when occupied list is empty", () => {
    const slotStart = new Date("2024-06-15T10:00:00");
    expect(isSlotOccupied(slotStart, [])).toBe(false);
  });

  it("returns true when slot starts exactly at occupied end minus 1ms (boundary)", () => {
    const slotStart = new Date("2024-06-15T10:00:00");
    // Occupied: 09:31 to 10:01 — overlaps with 10:00-10:30
    const occupied = ["2024-06-15T09:31:00"];
    expect(isSlotOccupied(slotStart, occupied)).toBe(true);
  });

  it("returns false when slot starts exactly at occupied end (no overlap)", () => {
    const slotStart = new Date("2024-06-15T10:30:00");
    // Occupied: 10:00 to 10:30 — slot starts at 10:30, no overlap
    const occupied = ["2024-06-15T10:00:00"];
    expect(isSlotOccupied(slotStart, occupied)).toBe(false);
  });
});

describe("generateSlots", () => {
  it("generates slots from 07:00 to 18:30", () => {
    const date = new Date("2024-06-15T00:00:00");
    const slots = generateSlots(date);

    expect(slots[0].getHours()).toBe(7);
    expect(slots[0].getMinutes()).toBe(0);

    const last = slots[slots.length - 1];
    expect(last.getHours()).toBe(18);
    expect(last.getMinutes()).toBe(30);
  });

  it("generates 24 slots (12 hours × 2 per hour)", () => {
    const date = new Date("2024-06-15T00:00:00");
    const slots = generateSlots(date);
    expect(slots.length).toBe(24);
  });

  it("all slots are 30 minutes apart", () => {
    const date = new Date("2024-06-15T00:00:00");
    const slots = generateSlots(date);
    for (let i = 1; i < slots.length; i++) {
      const diff = slots[i].getTime() - slots[i - 1].getTime();
      expect(diff).toBe(30 * 60 * 1000);
    }
  });
});

describe("formatDateForApi", () => {
  it("formats date as yyyy-MM-dd", () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    expect(formatDateForApi(date)).toBe("2024-06-15");
  });

  it("zero-pads single-digit month and day", () => {
    const date = new Date(2024, 0, 5); // Jan 5, 2024
    expect(formatDateForApi(date)).toBe("2024-01-05");
  });

  it("handles December 31", () => {
    const date = new Date(2024, 11, 31);
    expect(formatDateForApi(date)).toBe("2024-12-31");
  });
});

describe("formatTime", () => {
  it("formats time as HH:MM", () => {
    const date = new Date(2024, 5, 15, 14, 30);
    expect(formatTime(date)).toBe("14:30");
  });

  it("zero-pads single-digit hours and minutes", () => {
    const date = new Date(2024, 5, 15, 7, 5);
    expect(formatTime(date)).toBe("07:05");
  });

  it("handles midnight", () => {
    const date = new Date(2024, 5, 15, 0, 0);
    expect(formatTime(date)).toBe("00:00");
  });
});
