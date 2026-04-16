export interface LabOrderResponse {
  id: number;
  consultationId: number;
  doctorId: number;
  patientId: number;
  orderNumber: string;
  orderStatus: number;
  totalAmount: number;
  isExternal: boolean;
  notes?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface LabOrderRequest {
  id?: number | null;
  consultationId?: number | null;
  doctorId?: number | null;
  patientId?: number | null;
  orderNumber?: string | null;
  orderStatus?: number | null;
  totalAmount?: number | null;
  isExternal?: boolean | null;
  notes?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
