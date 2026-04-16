export interface DpiVerificationResponse {
  exists: boolean;
  hasPatientRole: boolean;
  name?: string;
}

export interface DoctorResponse {
  id: number;
  name: string;
  specialtyId?: number;
}

export interface AvailabilityResponse {
  doctorId: number;
  date: string;
  occupiedSlots: string[];
}

export interface BookAppointmentRequest {
  patientId: number;
  doctorId: number;
  specialtyId: number;
  branchId: number;
  appointmentDate: string; // ISO 8601
  reason: string;
  amount: number;
}

export interface PatientPaymentRequest {
  appointmentId: number;
  amount: number;
  paymentMethod: number; // 1=Visa, 2=Mastercard
  paymentType: number; // 0=Consulta
  paymentStatus: number; // 0=Pendiente
  paymentDate: string; // ISO 8601
  cardLastFourDigits: string;
  idempotencyKey: string; // UUID v4
}

export interface PaymentConfirmationResponse {
  transactionNumber: string;
  appointmentId: number;
  doctorName: string;
  specialtyName: string;
  branchName: string;
  appointmentDate: string;
  amount: number;
  patientEmail: string;
}

export interface PatientRegisterRequest {
  name: string;
  dpi: string;
  userName: string;
  password: string;
  email: string;
  number: string;
  nit?: string;
  insuranceNumber?: string;
}

export interface PatientAuthState {
  isLoggedIn: boolean;
  token: string;
  userId: number;
  name: string;
  email: string;
  userName: string;
}
