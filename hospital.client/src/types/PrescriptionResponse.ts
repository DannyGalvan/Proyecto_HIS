export interface PrescriptionResponse {
  id: number;
  consultationId: number;
  doctorId: number;
  prescriptionDate: string;
  notes?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface PrescriptionRequest {
  id?: number | null;
  consultationId?: number | null;
  doctorId?: number | null;
  prescriptionDate?: string | null;
  notes?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
