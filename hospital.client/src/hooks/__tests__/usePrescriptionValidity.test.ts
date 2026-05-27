import { describe, expect, it } from "vitest";

import { usePrescriptionValidity } from "../usePrescriptionValidity";

describe("usePrescriptionValidity", () => {
  it("returns isValid true for a prescription issued today", () => {
    const today = new Date().toISOString();
    const { isValid, daysOld } = usePrescriptionValidity(today);
    expect(isValid).toBe(true);
    expect(daysOld).toBe(0);
  });

  it("returns isValid true for a prescription issued 7 days ago", () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { isValid, daysOld } = usePrescriptionValidity(
      sevenDaysAgo.toISOString(),
    );
    expect(isValid).toBe(true);
    expect(daysOld).toBe(7);
  });

  it("returns isValid false for a prescription issued 8 days ago", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const { isValid, daysOld } = usePrescriptionValidity(
      eightDaysAgo.toISOString(),
    );
    expect(isValid).toBe(false);
    expect(daysOld).toBe(8);
  });

  it("returns isValid false and daysOld 0 for null input", () => {
    const { isValid, daysOld } = usePrescriptionValidity(null);
    expect(isValid).toBe(false);
    expect(daysOld).toBe(0);
  });

  it("returns isValid true for a prescription issued 3 days ago", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const { isValid, daysOld } = usePrescriptionValidity(
      threeDaysAgo.toISOString(),
    );
    expect(isValid).toBe(true);
    expect(daysOld).toBe(3);
  });
});
