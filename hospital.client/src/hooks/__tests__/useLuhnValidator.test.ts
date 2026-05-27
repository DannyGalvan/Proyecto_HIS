import { describe, expect, it } from "vitest";

import { useLuhnValidator } from "../useLuhnValidator";

describe("useLuhnValidator", () => {
  const { validate } = useLuhnValidator();

  it("returns true for a valid Visa card number", () => {
    expect(validate("4532015112830366")).toBe(true);
  });

  it("returns true for a valid MasterCard number", () => {
    expect(validate("5500000000000004")).toBe(true);
  });

  it("returns false for an invalid checksum", () => {
    expect(validate("4532015112830367")).toBe(false);
  });

  it("returns false for a number shorter than 13 digits", () => {
    expect(validate("123456789012")).toBe(false);
  });

  it("returns false for a number longer than 19 digits", () => {
    expect(validate("12345678901234567890")).toBe(false);
  });

  it("returns false for non-digit characters", () => {
    expect(validate("4532-0151-1283-0366")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validate("")).toBe(false);
  });
});
