import type { AppointmentResponse } from "@/types/AppointmentResponse";
import type { MedicalConsultationResponse } from "@/types/MedicalConsultationResponse";
import type { MedicineResponse } from "@/types/MedicineResponse";
import type { PaymentResponse } from "@/types/PaymentResponse";
import type { UserResponse } from "@/types/UserResponse";

/**
 * Creates a mock UserResponse with sensible defaults.
 * Override any field by passing a partial object.
 */
export const createMockUser = (
  overrides?: Partial<UserResponse>,
): UserResponse => ({
  id: 1,
  rolId: 1,
  email: "test@hospital.com",
  name: "Test User",
  userName: "testuser",
  identificationDocument: "1234567890101",
  number: "12345678",
  state: 1,
  createdAt: "2024-01-01T00:00:00",
  createdBy: 1,
  ...overrides,
});

/**
 * Creates a mock AppointmentResponse with sensible defaults.
 * Override any field by passing a partial object.
 */
export const createMockAppointment = (
  overrides?: Partial<AppointmentResponse>,
): AppointmentResponse => ({
  id: 1,
  patientId: 1,
  doctorId: 2,
  specialtyId: 1,
  branchId: 1,
  appointmentStatusId: 1,
  appointmentDate: "2024-06-15T10:00:00",
  reason: "Consulta general de rutina",
  amount: 150.0,
  priority: 1,
  state: 1,
  createdAt: "2024-01-01T00:00:00",
  createdBy: 1,
  ...overrides,
});

/**
 * Creates a mock PaymentResponse with sensible defaults.
 * Override any field by passing a partial object.
 */
export const createMockPayment = (
  overrides?: Partial<PaymentResponse>,
): PaymentResponse => ({
  id: 1,
  appointmentId: 1,
  transactionNumber: "TXN-001",
  amount: 150.0,
  paymentMethod: 1,
  paymentType: 1,
  paymentStatus: 1,
  paymentDate: "2024-06-15T10:00:00",
  state: 1,
  createdAt: "2024-01-01T00:00:00",
  createdBy: 1,
  ...overrides,
});

/**
 * Creates a mock MedicineResponse with sensible defaults.
 * Override any field by passing a partial object.
 */
export const createMockMedicine = (
  overrides?: Partial<MedicineResponse>,
): MedicineResponse => ({
  id: 1,
  name: "Acetaminofén",
  description: "Analgésico y antipirético",
  defaultPrice: 25.0,
  unit: "tableta",
  isControlled: false,
  minimumStock: 100,
  state: 1,
  createdAt: "2024-01-01T00:00:00",
  createdBy: 1,
  ...overrides,
});

/**
 * Creates a mock MedicalConsultationResponse with sensible defaults.
 * Override any field by passing a partial object.
 */
export const createMockMedicalConsultation = (
  overrides?: Partial<MedicalConsultationResponse>,
): MedicalConsultationResponse => ({
  id: 1,
  appointmentId: 1,
  doctorId: 2,
  reasonForVisit: "Dolor de cabeza persistente",
  clinicalFindings: "Paciente presenta cefalea tensional",
  consultationStatus: 0,
  state: 1,
  createdAt: "2024-01-01T00:00:00",
  createdBy: 2,
  ...overrides,
});
