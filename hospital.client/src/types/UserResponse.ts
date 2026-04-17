import type { BranchResponse } from "./BranchResponse";
import type { RolResponse } from "./RolResponse";
import type { SpecialtyResponse } from "./SpecialtyResponse";

export interface UserResponse {
  id: number;
  rolId: number;
  email: string;
  name: string;
  userName: string;
  identificationDocument: string;
  number: string;
  nit?: string | null;
  branchId?: number | null;
  specialtyId?: number | null;
  insuranceNumber?: string | null;
  state: number;
  createdAt: string;
  updatedAt?: string | null;
  createdBy: number;
  updatedBy?: number | null;

  rol?: RolResponse | null;
  branch?: BranchResponse | null;
  specialty?: SpecialtyResponse | null;
}
