import { describe, expect, it } from "vitest";

import { validateDocument } from "../validateDocument";

describe("validateDocument", () => {
  it("returns null for a valid PDF under 2MB", () => {
    const file = new File(["content"], "test.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB
    expect(validateDocument(file)).toBeNull();
  });

  it("returns error message for non-PDF file", () => {
    const file = new File(["content"], "test.png", { type: "image/png" });
    expect(validateDocument(file)).toBe("Solo se permiten archivos PDF");
  });

  it("returns error message for PDF over 2MB", () => {
    const file = new File(["content"], "big.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 3 * 1024 * 1024 }); // 3MB
    expect(validateDocument(file)).toBe("El archivo no puede superar 2MB");
  });

  it("returns null for PDF exactly at 2MB limit", () => {
    const file = new File(["content"], "exact.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 2097152 }); // exactly 2MB
    expect(validateDocument(file)).toBeNull();
  });

  it("returns type error before size error (type checked first)", () => {
    const file = new File(["content"], "big.txt", { type: "text/plain" });
    Object.defineProperty(file, "size", { value: 3 * 1024 * 1024 });
    expect(validateDocument(file)).toBe("Solo se permiten archivos PDF");
  });
});
