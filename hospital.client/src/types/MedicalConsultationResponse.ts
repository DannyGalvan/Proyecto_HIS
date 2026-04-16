export interface MedicalConsultationResponse {
  id: number;
  appointmentId: number;
  doctorId: number;
  reasonForVisit: string;
  clinicalFindings: string;
  diagnosis?: string | null;
  diagnosisCie10Code?: string | null;
  treatmentPlan?: string | null;
  consultationStatus: number;
  notes?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface MedicalConsultationRequest {
  id?: number | null;
  appointmentId?: number | null;
  doctorId?: number | null;
  reasonForVisit?: string | null;
  clinicalFindings?: string | null;
  diagnosis?: string | null;
  diagnosisCie10Code?: string | null;
  treatmentPlan?: string | null;
  consultationStatus?: number | null;
  notes?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
