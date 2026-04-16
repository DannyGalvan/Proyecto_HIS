export interface BranchResponse {
  id: number;
  name: string;
  phone: string;
  address: string;
  description: string;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface BranchRequest {
  id?: number | null;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
