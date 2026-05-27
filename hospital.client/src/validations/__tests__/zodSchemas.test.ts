import { describe, expect, it } from "vitest";
import { appointmentSchema, validateAppointment } from "../appointmentValidation";
import { loginSchema, validateLogin } from "../loginValidation";
import { paymentSchema, validatePayment } from "../paymentValidation";
import { registerSchema, validateRegister } from "../registerValidation";

describe("loginSchema", () => {
  it("passes with valid userName (min 1) and password (min 6)", () => {
    const result = loginSchema.safeParse({
      userName: "admin",
      password: "secret123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userName).toBe("admin");
      expect(result.data.password).toBe("secret123");
    }
  });

  it("fails with empty userName", () => {
    const result = loginSchema.safeParse({
      userName: "",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El campo nombre de usuario es requerido");
    }
  });

  it("fails with password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      userName: "admin",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        "El password debe tener al menos 6 caracteres",
      );
    }
  });
});

describe("registerSchema", () => {
  const validRegister = {
    name: "Juan Carlos Pérez López",
    identificationDocument: "1234567890101",
    userName: "juancarl",
    password: "password1234",
    email: "juan@hospital.com",
    number: "55551234",
  };

  it("passes with valid name, CUI, userName, password, email, number", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe(validRegister.name);
      expect(result.data.identificationDocument).toBe(
        validRegister.identificationDocument,
      );
      expect(result.data.userName).toBe(validRegister.userName);
      expect(result.data.email).toBe(validRegister.email);
      expect(result.data.number).toBe(validRegister.number);
    }
  });

  it('fails with invalid CUI: "El número de DPI/CUI no es válido..."', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      identificationDocument: "1234567800101", // invalid check digit
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain(
        "El número de DPI/CUI no es válido. Verifique que los dígitos sean correctos.",
      );
    }
  });
});

describe("appointmentSchema", () => {
  const validAppointment = {
    patientId: 1,
    doctorId: 2,
    specialtyId: 3,
    branchId: 1,
    appointmentStatusId: 1,
    appointmentDate: "2025-03-15T10:00:00",
    reason: "Consulta general por dolor de cabeza persistente",
    state: 1,
  };

  it("passes with all required fields and reason (10-2000 chars)", () => {
    const result = appointmentSchema.safeParse(validAppointment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.patientId).toBe(1);
      expect(result.data.doctorId).toBe(2);
      expect(result.data.reason).toBe(validAppointment.reason);
    }
  });

  it('fails with short reason: "El motivo debe tener al menos 10 caracteres"', () => {
    const result = appointmentSchema.safeParse({
      ...validAppointment,
      reason: "Dolor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("El motivo debe tener al menos 10 caracteres");
    }
  });
});

describe("paymentSchema", () => {
  const validPayment = {
    amount: 150.0,
    paymentMethod: 1,
    paymentType: 0,
    paymentStatus: 0,
    paymentDate: "2025-03-15T10:00:00",
    idempotencyKey: "abc-123-def-456",
    state: 1,
  };

  it("passes with amount > 0.01, required fields, and idempotencyKey", () => {
    const result = paymentSchema.safeParse(validPayment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(150.0);
      expect(result.data.idempotencyKey).toBe("abc-123-def-456");
    }
  });

  it('fails with invalid cardLastFourDigits: "Deben ser exactamente 4 dígitos"', () => {
    const result = paymentSchema.safeParse({
      ...validPayment,
      cardLastFourDigits: "12A",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Deben ser exactamente 4 dígitos");
    }
  });
});

describe("validateLogin", () => {
  it("returns empty object for valid data", () => {
    expect(validateLogin({ userName: "admin", password: "secret123" })).toEqual(
      {},
    );
  });

  it("returns errors for invalid data", () => {
    const errors = validateLogin({ userName: "", password: "12345" });
    expect(errors.userName).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe("validateRegister", () => {
  const validRegister = {
    name: "Juan Carlos Pérez López",
    identificationDocument: "1234567890101",
    userName: "juancarl",
    password: "password1234",
    email: "juan@hospital.com",
    number: "55551234",
  };

  it("returns empty object for valid data", () => {
    expect(validateRegister(validRegister)).toEqual({});
  });

  it("returns errors for invalid data", () => {
    const errors = validateRegister({ ...validRegister, email: "not-email" });
    expect(errors.email).toBeDefined();
  });
});

describe("validateAppointment", () => {
  const validAppointment = {
    patientId: 1,
    doctorId: 2,
    specialtyId: 3,
    branchId: 1,
    appointmentStatusId: 1,
    appointmentDate: "2025-03-15T10:00:00",
    reason: "Consulta general por dolor de cabeza persistente",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validateAppointment(validAppointment)).toEqual({});
  });

  it("returns errors for invalid data", () => {
    const errors = validateAppointment({ ...validAppointment, reason: "short" });
    expect(errors.reason).toBeDefined();
  });
});

describe("validatePayment", () => {
  const validPayment = {
    amount: 150.0,
    paymentMethod: 1,
    paymentType: 0,
    paymentStatus: 0,
    paymentDate: "2025-03-15T10:00:00",
    idempotencyKey: "abc-123-def-456",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validatePayment(validPayment)).toEqual({});
  });

  it("returns errors for invalid data", () => {
    const errors = validatePayment({ ...validPayment, paymentDate: "" });
    expect(errors.paymentDate).toBeDefined();
  });
});
