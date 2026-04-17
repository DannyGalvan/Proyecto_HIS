import { api } from '../configs/axios/interceptors';
import type { ApiResponse } from '../types/ApiResponse';
import type {
  AvailabilityResponse,
  BookAppointmentRequest,
  DoctorResponse,
  DpiVerificationResponse,
  PatientPaymentRequest,
  PatientRegisterRequest,
  PaymentConfirmationResponse,
} from '../types/PatientPortalTypes';
import type { LoginRequest, LoginResponse } from '../types/LoginRequest';
import { usePatientAuthStore } from '../stores/usePatientAuthStore';

// ---------------------------------------------------------------------------
// Helper: build Authorization header from the patient store (outside React)
// ---------------------------------------------------------------------------
const getPatientAuthHeader = (): Record<string, string> => {
  const token = usePatientAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

/**
 * Verify if a DPI belongs to an existing user and whether they have the
 * patient role.
 * GET /api/v1/PatientPortal/verify-dpi/{dpi}
 */
export const verifyDpi = (dpi: string): Promise<ApiResponse<DpiVerificationResponse>> =>
  api.get<unknown, ApiResponse<DpiVerificationResponse>>(
    `PatientPortal/verify-dpi/${encodeURIComponent(dpi)}`,
  );

/**
 * Register a new patient account.
 * POST /api/v1/PatientPortal/register
 */
export const registerPatient = (
  data: PatientRegisterRequest,
): Promise<ApiResponse<string>> =>
  api.post<unknown, ApiResponse<string>, PatientRegisterRequest>(
    'PatientPortal/register',
    data,
  );

/**
 * Authenticate a patient using the shared auth endpoint.
 * POST /api/v1/Auth
 */
export const loginPatient = (credentials: {
  userName: string;
  password: string;
}): Promise<ApiResponse<LoginResponse>> =>
  api.post<unknown, ApiResponse<LoginResponse>, LoginRequest>('auth', credentials);

/**
 * Get specialties available at a specific branch.
 * GET /api/v1/PatientPortal/specialties-by-branch?branchId={id}
 */
export const getSpecialtiesByBranch = (
  branchId: number,
): Promise<ApiResponse<import('../types/SpecialtyResponse').SpecialtyResponse[]>> =>
  api.get(
    `PatientPortal/specialties-by-branch?branchId=${branchId}`,
  );

/**
 * Get doctors filtered by branch and optionally by specialty.
 * GET /api/v1/PatientPortal/doctors?branchId={id}&specialtyId={id}
 */
export const getDoctorsByBranchAndSpecialty = (
  branchId: number,
  specialtyId: number,
): Promise<ApiResponse<DoctorResponse[]>> =>
  api.get<unknown, ApiResponse<DoctorResponse[]>>(
    `PatientPortal/doctors?branchId=${branchId}&specialtyId=${specialtyId}`,
  );

/**
 * Get doctors filtered by specialty.
 * GET /api/v1/PatientPortal/doctors?specialtyId={id}
 * @deprecated Use getDoctorsByBranchAndSpecialty for correct branch-based filtering
 */
export const getDoctorsBySpecialty = (
  specialtyId: number,
): Promise<ApiResponse<DoctorResponse[]>> =>
  api.get<unknown, ApiResponse<DoctorResponse[]>>(
    `PatientPortal/doctors?specialtyId=${specialtyId}`,
  );

/**
 * Get occupied time slots for a doctor on a given date.
 * GET /api/v1/PatientPortal/availability?doctorId={id}&date={date}
 */
export const getDoctorAvailability = (
  doctorId: number,
  date: string,
): Promise<ApiResponse<AvailabilityResponse>> =>
  api.get<unknown, ApiResponse<AvailabilityResponse>>(
    `PatientPortal/availability?doctorId=${doctorId}&date=${encodeURIComponent(date)}`,
  );

// ---------------------------------------------------------------------------
// Authenticated endpoints (patient token injected per-request)
// ---------------------------------------------------------------------------

/**
 * Book an appointment for the authenticated patient.
 * POST /api/v1/PatientPortal/book
 */
export const bookAppointment = (
  data: BookAppointmentRequest,
): Promise<ApiResponse<{ appointmentId: number; createdAt: string }>> =>
  api.post<
    unknown,
    ApiResponse<{ appointmentId: number; createdAt: string }>,
    BookAppointmentRequest
  >('PatientPortal/book', data, {
    headers: getPatientAuthHeader(),
  });

/**
 * Process payment for a booked appointment.
 * POST /api/v1/PatientPortal/pay
 */
export const processPatientPayment = (
  data: PatientPaymentRequest,
): Promise<ApiResponse<PaymentConfirmationResponse>> =>
  api.post<
    unknown,
    ApiResponse<PaymentConfirmationResponse>,
    PatientPaymentRequest
  >('PatientPortal/pay', data, {
    headers: getPatientAuthHeader(),
  });

/**
 * Get the authenticated patient's appointment history (paginated).
 * GET /api/v1/PatientPortal/my-appointments
 */
export const getMyAppointments = (
  pageNumber = 1,
  pageSize = 10,
): Promise<ApiResponse<unknown[]>> =>
  api.get<unknown, ApiResponse<unknown[]>>(
    `PatientPortal/my-appointments?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      headers: getPatientAuthHeader(),
    },
  );

/**
 * Cancel a confirmed appointment (patient only).
 * POST /api/v1/PatientPortal/appointments/{id}/cancel
 */
export const cancelAppointment = (
  id: number,
): Promise<ApiResponse<string>> =>
  api.post<unknown, ApiResponse<string>>(
    `PatientPortal/appointments/${id}/cancel`,
  );

/**
 * Get the authenticated patient's profile data.
 * GET /api/v1/PatientPortal/my-profile
 */
export const getMyProfile = (): Promise<ApiResponse<{
  id: number;
  name: string;
  email: string;
  number: string;
  identificationDocument: string;
  nit: string | null;
  insuranceNumber: string | null;
  userName: string;
}>> =>
  api.get('PatientPortal/my-profile', {
    headers: getPatientAuthHeader(),
  });

/**
 * Update the authenticated patient's profile data (partial update).
 * PATCH /api/v1/PatientPortal/my-profile
 */
export const updateMyProfile = (data: {
  name?: string | null;
  email?: string | null;
  number?: string | null;
  nit?: string | null;
  insuranceNumber?: string | null;
}): Promise<ApiResponse<{
  id: number;
  name: string;
  email: string;
  number: string;
  identificationDocument: string;
  nit: string | null;
  insuranceNumber: string | null;
  userName: string;
}>> =>
  api.patch('PatientPortal/my-profile', data, {
    headers: getPatientAuthHeader(),
  });
