import type { LaboratoryResponse } from "./LaboratoryResponse";

export interface LabExamResponse {
  id: number;
  name: string;
  description: string;
  defaultAmount: number;
  referenceRange?: string | null;
  unit?: string | null;
  laboratoryId: number;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;

  laboratory?: LaboratoryResponse | null;
}

export interface LabExamRequest {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  defaultAmount?: number | null;
  referenceRange?: string | null;
  unit?: string | null;
  laboratoryId?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
