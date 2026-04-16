export interface MedicineResponse {
  id: number;
  name: string;
  description: string;
  defaultPrice: number;
  unit: string;
  isControlled: boolean;
  minimumStock: number;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface MedicineRequest {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  defaultPrice?: number | null;
  unit?: string | null;
  isControlled?: boolean | null;
  minimumStock?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
