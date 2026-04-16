import type { AppointmentStatusResponse } from "./AppointmentStatusResponse";
import type { BranchResponse } from "./BranchResponse";
import type { SpecialtyResponse } from "./SpecialtyResponse";
import type { UserResponse } from "./UserResponse";

export interface AppointmentResponse {
  id: number;
  patientId: number;
  doctorId?: number | null;
  specialtyId: number;
  branchId: number;
  appointmentStatusId: number;
  appointmentDate: string;
  reason: string;
  amount: number;
  priority: number;
  arrivalTime?: string | null;
  notes?: string | null;
  followUpType?: number | null;
  parentConsultationId?: number | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;

  specialty?: SpecialtyResponse | null;
  branch?: BranchResponse | null;
  appointmentStatus?: AppointmentStatusResponse | null;
  patient?: UserResponse | null;
  doctor?: UserResponse | null;
}

export interface AppointmentRequest {
  id?: number | null;
  patientId?: number | null;
  doctorId?: number | null;
  specialtyId?: number | null;
  branchId?: number | null;
  appointmentStatusId?: number | null;
  appointmentDate?: string | null;
  reason?: string | null;
  amount?: number | null;
  priority?: number | null;
  arrivalTime?: string | null;
  notes?: string | null;
  followUpType?: number | null;
  parentConsultationId?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
