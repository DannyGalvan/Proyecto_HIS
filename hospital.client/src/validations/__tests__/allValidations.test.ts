import { describe, expect, it } from "vitest";

import { validateAppointmentStatus } from "../appointmentStatusValidation";
import { validateBranch } from "../branchValidation";
import { validateChangePassword } from "../changePasswordValidation";
import { validateInventoryMovement } from "../inventoryMovementValidation";
import { validateLabExam } from "../labExamValidation";
import { validateLaboratory } from "../laboratoryValidation";
import { validateMedicalConsultation } from "../medicalConsultationValidation";
import { validateMedicineInventory } from "../medicineInventoryValidation";
import { validateMedicine } from "../medicineValidation";
import { paymentSchema } from "../paymentCardValidations";
import {
    validatePrescription,
    validatePrescriptionItem,
} from "../prescriptionValidation";
import { profileSchema } from "../profileValidations";
import { validateRol } from "../rolValidation";
import { validateSpecialty } from "../specialtyValidation";
import { validateUser } from "../userValidation";
import { validateVitalSign } from "../vitalSignValidation";

describe("validateBranch", () => {
  const valid = { name: "Sucursal Central", phone: "55551234", state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateBranch(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateBranch({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for invalid phone (not 8 digits)", () => {
    const errors = validateBranch({ ...valid, phone: "123" });
    expect(errors.phone).toBeDefined();
  });
});

describe("validateSpecialty", () => {
  const valid = { name: "Cardiología", description: "Especialidad del corazón", state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateSpecialty(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateSpecialty({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for empty description", () => {
    const errors = validateSpecialty({ ...valid, description: "" });
    expect(errors.description).toBeDefined();
  });
});

describe("validateRol", () => {
  const valid = { name: "Admin", description: "Administrador del sistema", state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateRol(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateRol({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for empty description", () => {
    const errors = validateRol({ ...valid, description: "" });
    expect(errors.description).toBeDefined();
  });
});

describe("validateLaboratory", () => {
  const valid = { name: "Laboratorio Central", state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateLaboratory(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateLaboratory({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });
});

describe("validateLabExam", () => {
  const valid = {
    name: "Hemograma",
    defaultAmount: 100,
    laboratoryId: 1,
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validateLabExam(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateLabExam({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for missing laboratoryId", () => {
    const errors = validateLabExam({ ...valid, laboratoryId: 0 });
    expect(errors.laboratoryId).toBeDefined();
  });
});

describe("validateMedicine", () => {
  const valid = {
    name: "Acetaminofén",
    description: "Analgésico",
    defaultPrice: 25,
    unit: "tableta",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validateMedicine(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateMedicine({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for empty unit", () => {
    const errors = validateMedicine({ ...valid, unit: "" });
    expect(errors.unit).toBeDefined();
  });
});

describe("validateMedicineInventory", () => {
  const valid = { medicineId: 1, branchId: 1, currentStock: 50, state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateMedicineInventory(valid)).toEqual({});
  });

  it("returns error for missing medicineId", () => {
    const errors = validateMedicineInventory({ ...valid, medicineId: 0 });
    expect(errors.medicineId).toBeDefined();
  });
});

describe("validateAppointmentStatus", () => {
  const valid = { name: "Pendiente", state: 1 };

  it("returns empty object for valid data", () => {
    expect(validateAppointmentStatus(valid)).toEqual({});
  });

  it("returns error for empty name", () => {
    const errors = validateAppointmentStatus({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns error for name exceeding 50 chars", () => {
    const errors = validateAppointmentStatus({ ...valid, name: "a".repeat(51) });
    expect(errors.name).toBeDefined();
  });
});

describe("validateChangePassword", () => {
  const valid = { idUser: 1, password: "newpassword123", confirmPassword: "newpassword123" };

  it("returns empty object for valid data", () => {
    expect(validateChangePassword(valid)).toEqual({});
  });

  it("returns error for short password", () => {
    const errors = validateChangePassword({ ...valid, password: "12345", confirmPassword: "12345" });
    expect(errors.password).toBeDefined();
  });

  it("returns error for mismatched passwords", () => {
    const errors = validateChangePassword({ ...valid, confirmPassword: "different123" });
    expect(errors.confirmPassword).toBeDefined();
  });
});

describe("validateInventoryMovement", () => {
  const valid = { movementType: 1, medicineId: 1, branchId: 1, quantity: 10 };

  it("returns empty object for valid data", () => {
    expect(validateInventoryMovement(valid)).toEqual({});
  });

  it("returns error for missing medicineId", () => {
    const errors = validateInventoryMovement({ ...valid, medicineId: 0 });
    expect(errors.medicineId).toBeDefined();
  });

  it("requires unitCost for purchase (movementType 0)", () => {
    const errors = validateInventoryMovement({ ...valid, movementType: 0 });
    expect(errors.unitCost).toBeDefined();
  });

  it("rejects unitCost <= 0 for purchase", () => {
    const errors = validateInventoryMovement({ ...valid, movementType: 0, unitCost: 0 });
    expect(errors.unitCost).toBe("El costo unitario debe ser mayor a 0");
  });

  it("rejects unitCost with more than 2 decimals", () => {
    const errors = validateInventoryMovement({ ...valid, movementType: 0, unitCost: "10.555" });
    expect(errors.unitCost).toBe("El costo unitario debe tener máximo 2 decimales");
  });

  it("requires notes for adjustment (movementType 4)", () => {
    const errors = validateInventoryMovement({ ...valid, movementType: 4, notes: "short" });
    expect(errors.notes).toBeDefined();
  });

  it("accepts valid purchase with unitCost", () => {
    const errors = validateInventoryMovement({ ...valid, movementType: 0, unitCost: 10.5 });
    expect(errors.unitCost).toBeUndefined();
  });

  it("validates quantity as string must be positive integer", () => {
    const errors = validateInventoryMovement({ ...valid, quantity: "0" });
    expect(errors.quantity).toBeDefined();
  });

  it("validates quantity as string with decimal is rejected", () => {
    const errors = validateInventoryMovement({ ...valid, quantity: "2.5" });
    expect(errors.quantity).toBeDefined();
  });

  it("accepts valid quantity as string", () => {
    const errors = validateInventoryMovement({ ...valid, quantity: "5" });
    expect(errors.quantity).toBeUndefined();
  });
});

describe("validateMedicalConsultation", () => {
  const valid = {
    appointmentId: 1,
    doctorId: 2,
    reasonForVisit: "Dolor de cabeza",
    consultationStatus: 0,
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validateMedicalConsultation(valid)).toEqual({});
  });

  it("returns errors for invalid data (missing required fields)", () => {
    const errors = validateMedicalConsultation({ ...valid, appointmentId: 0 });
    expect(errors.appointmentId).toBeDefined();
  });

  it("requires diagnosis when finalizing (status 1)", () => {
    const errors = validateMedicalConsultation({ ...valid, consultationStatus: 1 });
    expect(errors.diagnosis).toBeDefined();
  });

  it("does not require diagnosis when status is 0", () => {
    const errors = validateMedicalConsultation(valid);
    expect(errors.diagnosis).toBeUndefined();
  });

  it("accepts valid consultation with diagnosis when finalizing", () => {
    const errors = validateMedicalConsultation({
      ...valid,
      consultationStatus: 1,
      diagnosis: "Cefalea tensional diagnosticada",
    });
    expect(errors.diagnosis).toBeUndefined();
  });
});

describe("validatePrescription", () => {
  const valid = {
    consultationId: 1,
    doctorId: 2,
    prescriptionDate: "2024-06-15",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validatePrescription(valid)).toEqual({});
  });

  it("returns error for missing consultationId", () => {
    const errors = validatePrescription({ ...valid, consultationId: 0 });
    expect(errors.consultationId).toBeDefined();
  });
});

describe("validatePrescriptionItem", () => {
  const valid = {
    prescriptionId: 1,
    medicineName: "Acetaminofén",
    dosage: "500mg",
    frequency: "Cada 8 horas",
    duration: "5 días",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validatePrescriptionItem(valid)).toEqual({});
  });

  it("returns error for empty medicineName", () => {
    const errors = validatePrescriptionItem({ ...valid, medicineName: "" });
    expect(errors.medicineName).toBeDefined();
  });

  it("returns error for empty dosage", () => {
    const errors = validatePrescriptionItem({ ...valid, dosage: "" });
    expect(errors.dosage).toBeDefined();
  });
});

describe("validateVitalSign", () => {
  const valid = {
    appointmentId: 1,
    nurseId: 2,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    temperature: 36.5,
    weight: 70,
    height: 170,
    heartRate: 72,
    state: 1,
  };

  it("returns empty object for valid data", () => {
    expect(validateVitalSign(valid)).toEqual({});
  });

  it("returns error for missing appointmentId", () => {
    const errors = validateVitalSign({ ...valid, appointmentId: 0 });
    expect(errors.appointmentId).toBeDefined();
  });

  it("returns error for temperature out of range", () => {
    const errors = validateVitalSign({ ...valid, temperature: 50 });
    expect(errors.temperature).toBeDefined();
  });
});

describe("validateUser", () => {
  const valid = {
    rolId: 1,
    email: "test@hospital.com",
    name: "Juan Carlos Pérez López",
    userName: "juancarl",
    state: 1,
  };

  it("returns empty object for valid data", () => {
    const errors = validateUser(valid);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("returns error for invalid email", () => {
    const errors = validateUser({ ...valid, email: "not-email" });
    expect(errors.email).toBeDefined();
  });

  it("returns error for short userName", () => {
    const errors = validateUser({ ...valid, userName: "abc" });
    expect(errors.userName).toBeDefined();
  });

  it("requires specialtyId when rolId is MEDICO (3)", () => {
    const errors = validateUser({ ...valid, rolId: 3 });
    expect(errors.specialtyId).toBeDefined();
  });

  it("requires specialtyId when rolId is MEDICO and specialtyId is null", () => {
    const errors = validateUser({ ...valid, rolId: 3, specialtyId: null });
    expect(errors.specialtyId).toBeDefined();
  });

  it("requires specialtyId when rolId is MEDICO and specialtyId is empty string", () => {
    const errors = validateUser({ ...valid, rolId: 3, specialtyId: "" });
    expect(errors.specialtyId).toBeDefined();
  });

  it("requires specialtyId when rolId is MEDICO and specialtyId is 0", () => {
    const errors = validateUser({ ...valid, rolId: 3, specialtyId: 0 });
    expect(errors.specialtyId).toBeDefined();
  });

  it("does not require specialtyId for non-MEDICO roles", () => {
    const errors = validateUser({ ...valid, rolId: 1 });
    expect(errors.specialtyId).toBeUndefined();
  });

  it("accepts MEDICO with valid specialtyId", () => {
    const errors = validateUser({ ...valid, rolId: 3, specialtyId: 5 });
    expect(errors.specialtyId).toBeUndefined();
  });
});

describe("profileSchema", () => {
  const valid = {
    name: "Juan Carlos Pérez López",
    email: "juan@hospital.com",
    number: "55551234",
  };

  it("passes with valid data", () => {
    const result = profileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails with short name", () => {
    const result = profileSchema.safeParse({ ...valid, name: "Juan" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email", () => {
    const result = profileSchema.safeParse({ ...valid, email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid phone", () => {
    const result = profileSchema.safeParse({ ...valid, number: "123" });
    expect(result.success).toBe(false);
  });
});

describe("paymentCardValidations - paymentSchema", () => {
  const valid = {
    cardNumber: "4532015112830366",
    cardHolder: "Juan Carlos Pérez",
    expiry: "12/99",
    cvv: "123",
  };

  it("passes with valid card data", () => {
    const result = paymentSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails with invalid Luhn number", () => {
    const result = paymentSchema.safeParse({ ...valid, cardNumber: "4532015112830367" });
    expect(result.success).toBe(false);
  });

  it("fails with short card holder name", () => {
    const result = paymentSchema.safeParse({ ...valid, cardHolder: "Juan" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid expiry format", () => {
    const result = paymentSchema.safeParse({ ...valid, expiry: "1299" });
    expect(result.success).toBe(false);
  });

  it("fails with expired card", () => {
    const result = paymentSchema.safeParse({ ...valid, expiry: "01/20" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid CVV", () => {
    const result = paymentSchema.safeParse({ ...valid, cvv: "12" });
    expect(result.success).toBe(false);
  });

  it("accepts 4-digit CVV (Amex)", () => {
    const result = paymentSchema.safeParse({ ...valid, cvv: "1234" });
    expect(result.success).toBe(true);
  });
});
