import type { BranchResponse } from "./BranchResponse";
import type { MedicineResponse } from "./MedicineResponse";

export interface MedicineInventoryResponse {
  id: number;
  medicineId: number;
  branchId: number;
  currentStock: number;
  rowVersion?: number | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;

  medicine?: MedicineResponse | null;
  branch?: BranchResponse | null;
}

export interface MedicineInventoryRequest {
  id?: number | null;
  medicineId?: number | null;
  branchId?: number | null;
  currentStock?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
