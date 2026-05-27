import { describe, expect, it } from "vitest";

import { calcRemaining, formatTime } from "../reservationTimer";

describe("calcRemaining", () => {
  it("returns 300 when createdAt is now", () => {
    const now = new Date().toISOString();
    const remaining = calcRemaining(now);
    // Should be very close to 300 (within 1 second tolerance)
    expect(remaining).toBeGreaterThanOrEqual(299);
    expect(remaining).toBeLessThanOrEqual(300);
  });

  it("returns 0 when more than 5 minutes have elapsed", () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    expect(calcRemaining(sixMinutesAgo)).toBe(0);
  });

  it("returns approximately 150 when 2.5 minutes have elapsed", () => {
    const twoAndHalfMinAgo = new Date(
      Date.now() - 2.5 * 60 * 1000,
    ).toISOString();
    const remaining = calcRemaining(twoAndHalfMinAgo);
    expect(remaining).toBeGreaterThanOrEqual(149);
    expect(remaining).toBeLessThanOrEqual(151);
  });

  it("never returns negative values", () => {
    const longAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(calcRemaining(longAgo)).toBe(0);
  });
});

describe("formatTime", () => {
  it("formats 300 seconds as 05:00", () => {
    expect(formatTime(300)).toBe("05:00");
  });

  it("formats 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats 90 seconds as 01:30", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("formats 59 seconds as 00:59", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats 61 seconds as 01:01", () => {
    expect(formatTime(61)).toBe("01:01");
  });
});
