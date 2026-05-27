import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import { calculateChange } from "../calculateChange";
import { isCuiValid } from "../cuiValidator";
import { formatLocalDateTime } from "../dateFormatter";
import { formatCurrency } from "../formatCurrency";
import { luhnCheck } from "../luhn";

// Feature: unit-integration-test-coverage, Property 10: Luhn check correctness
describe("Property 10: Luhn check correctness", () => {
  /**
   * Validates: Requirements 10.1, 10.2
   *
   * For any numeric string of 13 to 19 digits where the Luhn checksum modulo 10
   * equals zero, luhnCheck SHALL return true; and for any string that fails any
   * of these conditions, luhnCheck SHALL return false.
   */

  it("returns true for any generated valid Luhn number (13-19 digits)", () => {
    // Generator: create a random digit string of 12-18 digits, then compute the Luhn check digit
    const validLuhnArb = fc.integer({ min: 13, max: 19 }).chain((length) =>
      fc
        .array(fc.integer({ min: 0, max: 9 }), {
          minLength: length - 1,
          maxLength: length - 1,
        })
        .map((digits) => {
          // Compute Luhn check digit for the partial number
          const checkDigit = computeLuhnCheckDigit(digits);
          return [...digits, checkDigit].join("");
        }),
    );

    fc.assert(
      fc.property(validLuhnArb, (cardNumber) => {
        expect(luhnCheck(cardNumber)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for strings with fewer than 13 digits", () => {
    const shortArb = fc.integer({ min: 0, max: 12 }).chain((length) =>
      fc
        .array(fc.integer({ min: 0, max: 9 }), {
          minLength: length,
          maxLength: length,
        })
        .map((digits) => digits.join("")),
    );

    fc.assert(
      fc.property(shortArb, (input) => {
        expect(luhnCheck(input)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for strings with more than 19 digits", () => {
    const longArb = fc.integer({ min: 20, max: 30 }).chain((length) =>
      fc
        .array(fc.integer({ min: 0, max: 9 }), {
          minLength: length,
          maxLength: length,
        })
        .map((digits) => digits.join("")),
    );

    fc.assert(
      fc.property(longArb, (input) => {
        expect(luhnCheck(input)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for valid-length strings with incorrect checksum", () => {
    // Generate a valid Luhn number, then corrupt the last digit
    const invalidLuhnArb = fc.integer({ min: 13, max: 19 }).chain((length) =>
      fc
        .tuple(
          fc.array(fc.integer({ min: 0, max: 9 }), {
            minLength: length - 1,
            maxLength: length - 1,
          }),
          fc.integer({ min: 1, max: 9 }), // offset to corrupt the check digit
        )
        .map(([digits, offset]) => {
          const checkDigit = computeLuhnCheckDigit(digits);
          const corruptedDigit = (checkDigit + offset) % 10;
          return [...digits, corruptedDigit].join("");
        }),
    );

    fc.assert(
      fc.property(invalidLuhnArb, (cardNumber) => {
        expect(luhnCheck(cardNumber)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: unit-integration-test-coverage, Property 11: CUI validation correctness
describe("Property 11: CUI validation correctness", () => {
  /**
   * Validates: Requirements 10.3, 10.4
   *
   * For any 13-digit string where the department code is between 1 and 22,
   * the municipality code is between 1 and the maximum for that department,
   * and the check digit equals the sum-of-products modulo 11, isCuiValid SHALL
   * return true; and for any input that violates any of these constraints,
   * isCuiValid SHALL return false.
   */

  const munisPorDepto = [
    17, 8, 16, 16, 13, 14, 19, 8, 24, 21, 9, 30, 32, 21, 8, 17, 14, 5, 11, 11,
    7, 17,
  ];

  it("returns true for any generated valid CUI", () => {
    const validCuiArb = fc
      .tuple(
        // 8 digits for the number part
        fc.array(fc.integer({ min: 0, max: 9 }), {
          minLength: 8,
          maxLength: 8,
        }),
        // department 1-22
        fc.integer({ min: 1, max: 22 }),
      )
      .chain(([numero, depto]) =>
        // municipality 1-max for that department
        fc.integer({ min: 1, max: munisPorDepto[depto - 1] }).map((muni) => {
          // Compute check digit (modulo 11)
          let total = 0;
          for (let i = 0; i < numero.length; i++) {
            total += numero[i] * (i + 2);
          }
          const verificador = total % 11;

          // If verificador >= 10, this CUI is not representable with a single digit
          // Skip by returning null (will be filtered)
          if (verificador >= 10) return null;

          const deptoStr = String(depto).padStart(2, "0");
          const muniStr = String(muni).padStart(2, "0");
          return `${numero.join("")}${verificador}${deptoStr}${muniStr}`;
        }),
      )
      .filter((cui): cui is string => cui !== null);

    fc.assert(
      fc.property(validCuiArb, (cui) => {
        expect(isCuiValid(cui)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for CUI with invalid department (0 or > 22)", () => {
    const invalidDeptArb = fc
      .tuple(
        fc
          .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
          .map((d) => d.join("")),
        fc.oneof(
          fc.constant("00"),
          fc
            .integer({ min: 23, max: 99 })
            .map((n) => String(n).padStart(2, "0")),
        ),
        fc.integer({ min: 1, max: 99 }).map((n) => String(n).padStart(2, "0")),
      )
      .map(([prefix, dept, muni]) => `${prefix}${dept}${muni}`);

    fc.assert(
      fc.property(invalidDeptArb, (cui) => {
        expect(isCuiValid(cui)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for CUI with municipality 0", () => {
    const invalidMuniArb = fc
      .tuple(
        fc
          .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
          .map((d) => d.join("")),
        fc.integer({ min: 1, max: 22 }).map((n) => String(n).padStart(2, "0")),
      )
      .map(([prefix, dept]) => `${prefix}${dept}00`);

    fc.assert(
      fc.property(invalidMuniArb, (cui) => {
        expect(isCuiValid(cui)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for null/undefined/empty inputs", () => {
    const invalidInputArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant(""),
    );

    fc.assert(
      fc.property(invalidInputArb, (input) => {
        expect(isCuiValid(input)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("returns false for strings with wrong length (not 13 digits)", () => {
    const wrongLengthArb = fc
      .integer({ min: 1, max: 20 })
      .filter((len) => len !== 13)
      .chain((len) =>
        fc
          .array(fc.integer({ min: 0, max: 9 }), {
            minLength: len,
            maxLength: len,
          })
          .map((digits) => digits.join("")),
      );

    fc.assert(
      fc.property(wrongLengthArb, (input) => {
        expect(isCuiValid(input)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: unit-integration-test-coverage, Property 12: calculateChange avoids floating-point drift
describe("Property 12: calculateChange avoids floating-point drift", () => {
  /**
   * Validates: Requirements 10.8
   *
   * For any two numeric values amountReceived and amount, calculateChange
   * SHALL return a value equal to (amountReceived - amount) rounded to exactly
   * 2 decimal places, with no floating-point drift.
   */

  it("always returns a value with at most 2 decimal places", () => {
    const amountArb = fc.double({
      min: 0,
      max: 100000,
      noNaN: true,
      noDefaultInfinity: true,
    });

    fc.assert(
      fc.property(amountArb, amountArb, (received, amount) => {
        const result = calculateChange(received, amount);
        // Result should have at most 2 decimal places
        const rounded = Math.round(result * 100) / 100;
        expect(result).toBe(rounded);
      }),
      { numRuns: 100 },
    );
  });

  it("equals integer-arithmetic-based rounding of the difference", () => {
    // Use integers representing cents to verify no drift
    const centsArb = fc.integer({ min: 0, max: 10000000 });

    fc.assert(
      fc.property(centsArb, centsArb, (receivedCents, amountCents) => {
        const received = receivedCents / 100;
        const amount = amountCents / 100;
        const result = calculateChange(received, amount);
        const expected = Math.round((received - amount) * 100) / 100;
        expect(result).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  it("satisfies the identity: calculateChange(a, a) === 0 for any amount", () => {
    const amountArb = fc.double({
      min: 0,
      max: 100000,
      noNaN: true,
      noDefaultInfinity: true,
    });

    fc.assert(
      fc.property(amountArb, (amount) => {
        expect(calculateChange(amount, amount)).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: unit-integration-test-coverage, Property 13: formatCurrency output format
describe("Property 13: formatCurrency output format", () => {
  /**
   * Validates: Requirements 10.9
   *
   * For any numeric value n, formatCurrency(n) SHALL return a string matching
   * the pattern "Q " followed by the number formatted with exactly 2 decimal places.
   */

  it('always starts with "Q " followed by a number with exactly 2 decimal places', () => {
    const numArb = fc.double({
      min: -1000000,
      max: 1000000,
      noNaN: true,
      noDefaultInfinity: true,
    });

    fc.assert(
      fc.property(numArb, (n) => {
        const result = formatCurrency(n);
        expect(result).toMatch(/^Q -?\d+\.\d{2}$/);
      }),
      { numRuns: 100 },
    );
  });

  it("the numeric part equals the input rounded to 2 decimal places", () => {
    const numArb = fc.double({
      min: -1000000,
      max: 1000000,
      noNaN: true,
      noDefaultInfinity: true,
    });

    fc.assert(
      fc.property(numArb, (n) => {
        const result = formatCurrency(n);
        const numericPart = result.replace("Q ", "");
        expect(parseFloat(numericPart)).toBeCloseTo(n, 2);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: unit-integration-test-coverage, Property 14: formatLocalDateTime output format
describe("Property 14: formatLocalDateTime output format", () => {
  /**
   * Validates: Requirements 10.7
   *
   * For any valid JavaScript Date object, formatLocalDateTime(date) SHALL return
   * a string in the format "yyyy-MM-ddTHH:mm:ss" using zero-padded local time
   * components without UTC conversion.
   */

  it("always returns a string matching yyyy-MM-ddTHH:mm:ss format", () => {
    // Generate valid dates within a reasonable range
    const dateArb = fc
      .date({
        min: new Date(1970, 0, 1),
        max: new Date(2099, 11, 31),
      })
      .filter((d) => !isNaN(d.getTime()));

    fc.assert(
      fc.property(dateArb, (date) => {
        const result = formatLocalDateTime(date);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      }),
      { numRuns: 100 },
    );
  });

  it("uses local time components (not UTC)", () => {
    const dateArb = fc
      .date({
        min: new Date(1970, 0, 1),
        max: new Date(2099, 11, 31),
      })
      .filter((d) => !isNaN(d.getTime()));

    fc.assert(
      fc.property(dateArb, (date) => {
        const result = formatLocalDateTime(date);
        const [datePart, timePart] = result.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        expect(year).toBe(date.getFullYear());
        expect(month).toBe(date.getMonth() + 1);
        expect(day).toBe(date.getDate());
        expect(hours).toBe(date.getHours());
        expect(minutes).toBe(date.getMinutes());
        expect(seconds).toBe(date.getSeconds());
      }),
      { numRuns: 100 },
    );
  });

  it("zero-pads all components to correct width", () => {
    // Generate dates with single-digit components
    const singleDigitDateArb = fc
      .tuple(
        fc.integer({ min: 2000, max: 2099 }),
        fc.integer({ min: 0, max: 8 }), // months 0-8 → 1-9 (single digit)
        fc.integer({ min: 1, max: 9 }), // days 1-9
        fc.integer({ min: 0, max: 9 }), // hours 0-9
        fc.integer({ min: 0, max: 9 }), // minutes 0-9
        fc.integer({ min: 0, max: 9 }), // seconds 0-9
      )
      .map(([y, m, d, h, min, s]) => new Date(y, m, d, h, min, s))
      .filter((d) => !isNaN(d.getTime()));

    fc.assert(
      fc.property(singleDigitDateArb, (date) => {
        const result = formatLocalDateTime(date);
        // Each component should be zero-padded: month 2 chars, day 2 chars, etc.
        const parts = result.match(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
        );
        expect(parts).not.toBeNull();
        // Verify padding: month, day, hour, minute, second all have 2 digits
        expect(parts![2].length).toBe(2);
        expect(parts![3].length).toBe(2);
        expect(parts![4].length).toBe(2);
        expect(parts![5].length).toBe(2);
        expect(parts![6].length).toBe(2);
      }),
      { numRuns: 100 },
    );
  });
});

// Helper function to compute Luhn check digit
function computeLuhnCheckDigit(digits: number[]): number {
  // The check digit is appended at the end. We need to find a digit such that
  // the full number passes Luhn.
  // Process from right to left: the check digit is at position 0 (rightmost),
  // so digits at odd positions (from right, 0-indexed) get doubled.
  // Since check digit is at index 0, the existing digits start at index 1.

  let sum = 0;
  const len = digits.length + 1; // total length including check digit

  for (let i = 0; i < digits.length; i++) {
    // Position from right: len - 1 - i (for the original digits array, the rightmost
    // original digit will be at position 1 from right in the final number)
    const posFromRight = len - 1 - i;
    let d = digits[i];

    if (posFromRight % 2 === 1) {
      // This position gets doubled in Luhn (odd positions from right, 0-indexed)
      d *= 2;
      if (d > 9) d -= 9;
    }

    sum += d;
  }

  // Check digit must make (sum + checkDigit) % 10 === 0
  return (10 - (sum % 10)) % 10;
}
