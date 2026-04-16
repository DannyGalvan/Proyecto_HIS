export interface PrescriptionItemResponse {
  id: number;
  prescriptionId: number;
  medicineName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  specialInstructions?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface PrescriptionItemRequest {
  id?: number | null;
  prescriptionId?: number | null;
  medicineName?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  specialInstructions?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
