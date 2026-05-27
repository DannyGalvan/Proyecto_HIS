import { describe, expect, it } from "vitest";

import { decodeJwtPayload, getRoleFromToken } from "../jwt";

describe("decodeJwtPayload", () => {
  it("decodes a valid JWT payload", () => {
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"sub":"1","name":"Test","RoleName":"Admin"}
    const payload = { sub: "1", name: "Test", RoleName: "Admin" };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const token = `eyJhbGciOiJIUzI1NiJ9.${encoded}.signature`;

    const result = decodeJwtPayload(token);
    expect(result).toEqual(payload);
  });

  it("returns null for a malformed token (no dots)", () => {
    expect(decodeJwtPayload("notavalidtoken")).toBeNull();
  });

  it("returns null for a token with invalid base64 payload", () => {
    expect(decodeJwtPayload("header.!!!invalid!!!.signature")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("handles URL-safe base64 characters (- and _)", () => {
    const payload = { key: "value+with/special" };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const token = `header.${encoded}.sig`;

    expect(decodeJwtPayload(token)).toEqual(payload);
  });
});

describe("getRoleFromToken", () => {
  function makeToken(payload: Record<string, unknown>): string {
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `header.${encoded}.sig`;
  }

  it("extracts role from RoleName claim", () => {
    const token = makeToken({ RoleName: "Doctor" });
    expect(getRoleFromToken(token)).toBe("Doctor");
  });

  it("extracts role from standard Microsoft role claim", () => {
    const token = makeToken({
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Nurse",
    });
    expect(getRoleFromToken(token)).toBe("Nurse");
  });

  it("prefers RoleName over standard claim", () => {
    const token = makeToken({
      RoleName: "Admin",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User",
    });
    expect(getRoleFromToken(token)).toBe("Admin");
  });

  it("returns null when no role claims exist", () => {
    const token = makeToken({ sub: "1", name: "Test" });
    expect(getRoleFromToken(token)).toBeNull();
  });

  it("returns null for a malformed token", () => {
    expect(getRoleFromToken("invalid")).toBeNull();
  });
});
