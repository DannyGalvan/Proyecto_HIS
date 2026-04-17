import type { BranchResponse } from "./BranchResponse";
import type { SpecialtyResponse } from "./SpecialtyResponse";

export interface BranchSpecialtyResponse {
  id: number;
  branchId: number;
  specialtyId: number;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
  branch?: BranchResponse | null;
  specialty?: SpecialtyResponse | null;
}

export interface BranchSpecialtyRequest {
  id?: number | null;
  branchId?: number | null;
  specialtyId?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
