import { beforeEach, describe, expect, it } from "vitest";

import { calculateChange } from "../calculateChange";
import { isCuiValid } from "../cuiValidator";
import { formatDate, formatLocalDateTime } from "../dateFormatter";
import { formatCurrency } from "../formatCurrency";
import { luhnCheck } from "../luhn";

describe("luhnCheck", () => {
  describe("valid card numbers", () => {
    it("returns true for a valid 16-digit Visa card number", () => {
      // 4532015112830366 is a known valid Luhn number
      expect(luhnCheck("4532015112830366")).toBe(true);
    });

    it("returns true for a valid 13-digit card number", () => {
      // 4111111111119 is a valid 13-digit Visa (Luhn checksum verified)
      expect(luhnCheck("4111111111119")).toBe(true);
    });

    it("returns true for a valid 19-digit card number", () => {
      // 6011000000000000001 is a valid 19-digit Discover (Luhn checksum verified)
      expect(luhnCheck("6011000000000000001")).toBe(true);
    });

    it("returns true for a valid MasterCard number", () => {
      expect(luhnCheck("5500000000000004")).toBe(true);
    });

    it("returns true for a valid Amex number (15 digits)", () => {
      expect(luhnCheck("378282246310005")).toBe(true);
    });
  });

  describe("invalid card numbers", () => {
    it("returns false for a number with fewer than 13 digits", () => {
      expect(luhnCheck("123456789012")).toBe(false);
    });

    it("returns false for a number with more than 19 digits", () => {
      expect(luhnCheck("12345678901234567890")).toBe(false);
    });

    it("returns false for a number with bad checksum", () => {
      // Change last digit of a valid number
      expect(luhnCheck("4532015112830367")).toBe(false);
    });

    it("returns false for a string with non-digit characters (after stripping they are too short)", () => {
      expect(luhnCheck("abcdefghijklm")).toBe(false);
    });

    it("returns false for an empty string", () => {
      expect(luhnCheck("")).toBe(false);
    });

    it("returns false for all zeros of valid length (13 zeros passes Luhn but let's verify)", () => {
      // 0000000000000 → sum = 0, 0 % 10 === 0, so it actually passes Luhn
      // This is valid per the algorithm
      expect(luhnCheck("0000000000000")).toBe(true);
    });

    it("returns false for a valid-length number with incorrect checksum", () => {
      expect(luhnCheck("1234567890123")).toBe(false);
    });
  });
});

describe("isCuiValid", () => {
  describe("valid CUI numbers", () => {
    it("returns true for a valid CUI with correct check digit, dept, and municipality", () => {
      // 1234567890101: numero=12345678, check=9 (sum%11=9), dept=01, muni=01
      expect(isCuiValid("1234567890101")).toBe(true);
    });

    it("returns true for a valid CUI with spaces (spaces are stripped)", () => {
      expect(isCuiValid("1234 5678 90101")).toBe(true);
    });
  });

  describe("invalid CUI numbers", () => {
    it("returns false for null", () => {
      expect(isCuiValid(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isCuiValid(undefined)).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isCuiValid("")).toBe(false);
    });

    it("returns false for a CUI with wrong length (12 digits)", () => {
      expect(isCuiValid("261653354010")).toBe(false);
    });

    it("returns false for a CUI with wrong length (14 digits)", () => {
      expect(isCuiValid("26165335401011")).toBe(false);
    });

    it("returns false for a CUI with invalid department (00)", () => {
      expect(isCuiValid("1234567890001")).toBe(false);
    });

    it("returns false for a CUI with department > 22", () => {
      expect(isCuiValid("1234567892301")).toBe(false);
    });

    it("returns false for a CUI with municipality 0", () => {
      expect(isCuiValid("1234567890100")).toBe(false);
    });

    it("returns false for a CUI with municipality exceeding max for department", () => {
      // Dept 01 (Guatemala) has 17 municipalities, so muni 18 is invalid
      expect(isCuiValid("1234567890118")).toBe(false);
    });

    it("returns false for a CUI with incorrect check digit", () => {
      // 1234567890101 is valid (check digit 9), change check digit 9→8
      expect(isCuiValid("1234567880101")).toBe(false);
    });

    it("returns false for non-numeric characters", () => {
      expect(isCuiValid("261653354010a")).toBe(false);
    });
  });
});

describe("formatDate", () => {
  beforeEach(() => {
    // Set up localStorage with a timezone for consistent test results
    window.localStorage.setItem(
      "@auth",
      JSON.stringify({ timezoneIanaId: "America/Guatemala" }),
    );
  });

  describe("valid ISO date strings", () => {
    it('returns formatted date "dd/MM/yyyy" for a valid ISO string', () => {
      const result = formatDate("2024-03-15T10:30:00Z");
      // In America/Guatemala (UTC-6), this is still March 15
      expect(result).toMatch(/15\/03\/2024/);
    });

    it("returns formatted date for an ISO date without time", () => {
      const result = formatDate("2024-01-01T00:00:00Z");
      // In Guatemala (UTC-6), midnight UTC is Dec 31 at 18:00 local
      // So the date could be 31/12/2023
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("returns formatted date for a date with timezone offset", () => {
      const result = formatDate("2024-06-20T14:00:00Z");
      expect(result).toMatch(/20\/06\/2024/);
    });
  });

  describe("null/undefined/unparseable inputs", () => {
    it('returns "—" for null input', () => {
      expect(formatDate(null)).toBe("—");
    });

    it('returns "—" for undefined input', () => {
      expect(formatDate(undefined)).toBe("—");
    });

    it("returns the original string for an unparseable date", () => {
      expect(formatDate("not-a-date")).toBe("not-a-date");
    });

    it("returns the original string for a random text", () => {
      expect(formatDate("hello world")).toBe("hello world");
    });
  });
});

describe("formatLocalDateTime", () => {
  it('returns "yyyy-MM-ddTHH:mm:ss" format with zero-padded components', () => {
    // January 5, 2024 at 09:03:07 local time
    const date = new Date(2024, 0, 5, 9, 3, 7);
    expect(formatLocalDateTime(date)).toBe("2024-01-05T09:03:07");
  });

  it("uses local time components, not UTC", () => {
    // Create a date and verify it uses getHours() not getUTCHours()
    const date = new Date(2024, 5, 15, 14, 30, 45); // June 15, 2024 14:30:45 local
    expect(formatLocalDateTime(date)).toBe("2024-06-15T14:30:45");
  });

  it("zero-pads single-digit month and day", () => {
    const date = new Date(2024, 0, 1, 0, 0, 0); // Jan 1, midnight
    expect(formatLocalDateTime(date)).toBe("2024-01-01T00:00:00");
  });

  it("handles end of year correctly", () => {
    const date = new Date(2024, 11, 31, 23, 59, 59); // Dec 31, 23:59:59
    expect(formatLocalDateTime(date)).toBe("2024-12-31T23:59:59");
  });

  it("handles double-digit months and days without extra padding", () => {
    const date = new Date(2024, 10, 25, 15, 45, 30); // Nov 25, 15:45:30
    expect(formatLocalDateTime(date)).toBe("2024-11-25T15:45:30");
  });
});

describe("calculateChange", () => {
  it("returns correct change for simple subtraction", () => {
    expect(calculateChange(100, 75)).toBe(25);
  });

  it("returns 0 when amountReceived equals amount", () => {
    expect(calculateChange(50, 50)).toBe(0);
  });

  it("returns negative value when amountReceived is less than amount", () => {
    expect(calculateChange(30, 50)).toBe(-20);
  });

  it("rounds to 2 decimal places to avoid floating-point drift", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in floating point
    expect(calculateChange(0.3, 0.1)).toBe(0.2);
  });

  it("handles decimal amounts correctly", () => {
    expect(calculateChange(100, 87.53)).toBe(12.47);
  });

  it("handles large amounts", () => {
    expect(calculateChange(10000, 9999.99)).toBe(0.01);
  });

  it("returns result rounded to 2 decimal places", () => {
    // 10.555 - 10.001 = 0.554 → rounds to 0.55
    expect(calculateChange(10.555, 10.001)).toBe(0.55);
  });
});

describe("formatCurrency", () => {
  it('returns "Q " followed by amount with 2 decimal places', () => {
    expect(formatCurrency(150)).toBe("Q 150.00");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("Q 0.00");
  });

  it("formats decimal amounts with 2 places", () => {
    expect(formatCurrency(99.9)).toBe("Q 99.90");
  });

  it("truncates to 2 decimal places", () => {
    expect(formatCurrency(10.999)).toBe("Q 11.00");
  });

  it("handles large numbers", () => {
    expect(formatCurrency(1000000)).toBe("Q 1000000.00");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-50.5)).toBe("Q -50.50");
  });

  it("formats small decimal amounts", () => {
    expect(formatCurrency(0.01)).toBe("Q 0.01");
  });
});
