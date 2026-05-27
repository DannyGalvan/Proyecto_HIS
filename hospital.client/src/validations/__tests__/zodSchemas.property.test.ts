// Feature: unit-integration-test-coverage, Property 15: Zod schema round-trip validity
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import { isCuiValid } from "../../utils/cuiValidator";
import { appointmentSchema } from "../appointmentValidation";
import { loginSchema } from "../loginValidation";
import { paymentSchema } from "../paymentValidation";
import { registerSchema } from "../registerValidation";

/**
 * **Validates: Requirements 11.1, 11.3, 11.5, 11.7**
 *
 * Property 15: Zod schema round-trip validity
 * For any object that successfully passes safeParse against a Zod schema,
 * the parsed output SHALL be structurally equivalent to the input
 * (no data loss or transformation beyond type coercion).
 */

// --- Arbitraries ---

/** Generates a valid login object */
const loginArb = fc.record({
  userName: fc.stringMatching(/^[a-z0-9]{1,50}$/),
  password: fc.stringMatching(/^[a-z0-9]{6,50}$/),
});

/**
 * Generates a valid 13-digit CUI that passes isCuiValid.
 * Builds from valid department/municipality codes and computes the check digit.
 */
const munisPorDepto = [
  17, 8, 16, 16, 13, 14, 19, 8, 24, 21, 9, 30, 32, 21, 8, 17, 14, 5, 11, 11, 7,
  17,
];

const validCuiArb = fc
  .record({
    digits: fc.array(fc.integer({ min: 0, max: 9 }), {
      minLength: 8,
      maxLength: 8,
    }),
    depto: fc.integer({ min: 1, max: 22 }),
  })
  .chain(({ digits, depto }) => {
    const maxMuni = munisPorDepto[depto - 1];
    return fc.integer({ min: 1, max: maxMuni }).map((muni) => {
      let total = 0;
      for (let i = 0; i < 8; i++) {
        total += digits[i] * (i + 2);
      }
      const verificador = total % 11;
      if (verificador >= 10) return null;
      const deptoStr = depto.toString().padStart(2, "0");
      const muniStr = muni.toString().padStart(2, "0");
      return `${digits.join("")}${verificador}${deptoStr}${muniStr}`;
    });
  })
  .filter((cui): cui is string => cui !== null && isCuiValid(cui));

/**
 * Generates a valid email that passes Zod v4's strict email regex.
 */
const validEmailArb = fc
  .record({
    localPart: fc.stringMatching(/^[a-z0-9]{1,10}$/),
    domain: fc.stringMatching(/^[a-z0-9]{2,8}$/),
    tld: fc.stringMatching(/^[a-z]{2,4}$/),
  })
  .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`);

/** Generates a valid register object */
const registerArb = fc.record({
  name: fc.stringMatching(/^[a-z0-9 ]{10,50}$/).filter((s) => s.length >= 10),
  identificationDocument: validCuiArb,
  userName: fc.stringMatching(/^[a-z0-9]{8,9}$/),
  password: fc.stringMatching(/^[a-z0-9]{12,30}$/),
  email: validEmailArb,
  number: fc
    .array(fc.integer({ min: 0, max: 9 }), { minLength: 8, maxLength: 8 })
    .map((digits) => digits.join("")),
});

/** Generates a valid ISO date string from a timestamp range */
const isoDateArb = fc
  .integer({
    min: new Date("2020-01-01").getTime(),
    max: new Date("2030-12-31").getTime(),
  })
  .map((ts) => new Date(ts).toISOString());

/** Generates a valid appointment object */
const appointmentArb = fc.record({
  patientId: fc.integer({ min: 1, max: 10000 }),
  doctorId: fc.integer({ min: 1, max: 10000 }),
  specialtyId: fc.integer({ min: 1, max: 100 }),
  branchId: fc.integer({ min: 1, max: 100 }),
  appointmentStatusId: fc.integer({ min: 1, max: 12 }),
  appointmentDate: isoDateArb,
  reason: fc
    .stringMatching(/^[a-z0-9 ]{10,200}$/)
    .filter((s) => s.length >= 10),
  state: fc.integer({ min: 0, max: 1 }),
});

/** Generates a valid payment object */
const paymentArb = fc.record({
  amount: fc.integer({ min: 1, max: 10000000 }).map((n) => n / 100),
  paymentMethod: fc.integer({ min: 0, max: 3 }),
  paymentType: fc.integer({ min: 0, max: 2 }),
  paymentStatus: fc.integer({ min: 0, max: 3 }),
  paymentDate: isoDateArb,
  idempotencyKey: fc.uuid(),
  state: fc.integer({ min: 0, max: 1 }),
});

// --- Property Tests ---

describe("Property 15: Zod schema round-trip validity", () => {
  it("loginSchema: parsed output is structurally equivalent to input", () => {
    fc.assert(
      fc.property(loginArb, (input) => {
        const result = loginSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.userName).toBe(input.userName);
          expect(result.data.password).toBe(input.password);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("registerSchema: parsed output is structurally equivalent to input", () => {
    fc.assert(
      fc.property(registerArb, (input) => {
        const result = registerSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(input.name);
          expect(result.data.identificationDocument).toBe(
            input.identificationDocument,
          );
          expect(result.data.userName).toBe(input.userName);
          expect(result.data.password).toBe(input.password);
          expect(result.data.email).toBe(input.email);
          expect(result.data.number).toBe(input.number);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("appointmentSchema: parsed output is structurally equivalent to input", () => {
    fc.assert(
      fc.property(appointmentArb, (input) => {
        const result = appointmentSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.patientId).toBe(input.patientId);
          expect(result.data.doctorId).toBe(input.doctorId);
          expect(result.data.specialtyId).toBe(input.specialtyId);
          expect(result.data.branchId).toBe(input.branchId);
          expect(result.data.appointmentStatusId).toBe(
            input.appointmentStatusId,
          );
          expect(result.data.appointmentDate).toBe(input.appointmentDate);
          expect(result.data.reason).toBe(input.reason);
          expect(result.data.state).toBe(input.state);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("paymentSchema: parsed output is structurally equivalent to input", () => {
    fc.assert(
      fc.property(paymentArb, (input) => {
        const result = paymentSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amount).toBe(input.amount);
          expect(result.data.paymentMethod).toBe(input.paymentMethod);
          expect(result.data.paymentType).toBe(input.paymentType);
          expect(result.data.paymentStatus).toBe(input.paymentStatus);
          expect(result.data.paymentDate).toBe(input.paymentDate);
          expect(result.data.idempotencyKey).toBe(input.idempotencyKey);
          expect(result.data.state).toBe(input.state);
        }
      }),
      { numRuns: 100 },
    );
  });
});
