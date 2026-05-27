import { describe, expect, it } from "vitest";

import {
    getPaymentMethod,
    isExpiryInFuture,
    maskCardNumber,
    parseExpiry,
} from "../paymentUtils";

describe("maskCardNumber (paymentUtils)", () => {
  it("masks all but last 4 digits in groups", () => {
    expect(maskCardNumber("4111111111111111")).toBe("****-****-****-1111");
  });

  it("returns raw input if fewer than 4 digits", () => {
    expect(maskCardNumber("123")).toBe("123");
  });

  it("strips non-digit characters before masking", () => {
    expect(maskCardNumber("4111-1111-1111-1111")).toBe("****-****-****-1111");
  });

  it("handles exactly 4 digits", () => {
    // With exactly 4 digits, maskedGroups = 0, so result is "-1234"
    expect(maskCardNumber("1234")).toBe("-1234");
  });
});

describe("getPaymentMethod", () => {
  it("returns 1 for Visa (starts with 4)", () => {
    expect(getPaymentMethod("4111111111111111")).toBe(1);
  });

  it("returns 2 for Mastercard (starts with 5)", () => {
    expect(getPaymentMethod("5500000000000004")).toBe(2);
  });

  it("returns 1 as default for other card types", () => {
    expect(getPaymentMethod("3782822463100050")).toBe(1);
  });
});

describe("parseExpiry", () => {
  it("parses valid MM/YY format", () => {
    expect(parseExpiry("12/25")).toEqual({ month: 12, year: 2025 });
  });

  it("parses 01/30", () => {
    expect(parseExpiry("01/30")).toEqual({ month: 1, year: 2030 });
  });

  it("returns null for invalid format (no slash)", () => {
    expect(parseExpiry("1225")).toBeNull();
  });

  it("returns null for month > 12", () => {
    expect(parseExpiry("13/25")).toBeNull();
  });

  it("returns null for month 0", () => {
    expect(parseExpiry("00/25")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseExpiry("")).toBeNull();
  });

  it("returns null for letters", () => {
    expect(parseExpiry("ab/cd")).toBeNull();
  });
});

describe("isExpiryInFuture", () => {
  it("returns true for a date far in the future", () => {
    expect(isExpiryInFuture("12/99")).toBe(true);
  });

  it("returns false for a date in the past", () => {
    expect(isExpiryInFuture("01/20")).toBe(false);
  });

  it("returns false for invalid expiry format", () => {
    expect(isExpiryInFuture("invalid")).toBe(false);
  });

  it("returns true for current month", () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear() - 2000).padStart(2, "0");
    expect(isExpiryInFuture(`${month}/${year}`)).toBe(true);
  });
});
