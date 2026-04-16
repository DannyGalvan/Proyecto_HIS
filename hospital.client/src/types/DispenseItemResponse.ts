export interface DispenseItemResponse {
  id: number;
  dispenseId: number;
  medicineId: number;
  prescriptionItemId?: number | null;
  originalMedicineName: string;
  dispensedMedicineName: string;
  quantity: number;
  unitPrice?: number | null;
  wasSubstituted?: boolean | null;
  substitutionReason?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface DispenseItemRequest {
  id?: number | null;
  dispenseId?: number | null;
  medicineId?: number | null;
  prescriptionItemId?: number | null;
  originalMedicineName?: string | null;
  dispensedMedicineName?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  wasSubstituted?: boolean | null;
  substitutionReason?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
