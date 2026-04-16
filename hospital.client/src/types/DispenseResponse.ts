export interface DispenseResponse {
  id: number;
  prescriptionId: number;
  patientId: number;
  pharmacistId: number;
  dispenseStatus: number;
  totalAmount: number;
  notes?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface DispenseRequest {
  id?: number | null;
  prescriptionId?: number | null;
  patientId?: number | null;
  pharmacistId?: number | null;
  dispenseStatus?: number | null;
  totalAmount?: number | null;
  notes?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
