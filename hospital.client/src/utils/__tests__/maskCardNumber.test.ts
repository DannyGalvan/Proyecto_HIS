import { describe, expect, it } from "vitest";

import { maskCardNumber } from "../maskCardNumber";

describe("maskCardNumber (standalone)", () => {
  it("masks all but last 4 characters with bullet", () => {
    expect(maskCardNumber("4111111111111111")).toBe("••••••••••••1111");
  });

  it("returns string as-is if 4 or fewer characters", () => {
    expect(maskCardNumber("1234")).toBe("1234");
    expect(maskCardNumber("123")).toBe("123");
    expect(maskCardNumber("")).toBe("");
  });

  it("handles 5-character string", () => {
    expect(maskCardNumber("12345")).toBe("•2345");
  });

  it("masks non-digit characters too", () => {
    expect(maskCardNumber("abcdefgh")).toBe("••••efgh");
  });
});
