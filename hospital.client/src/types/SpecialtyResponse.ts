export interface SpecialtyResponse {
  id: number;
  name: string;
  description: string;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface SpecialtyRequest {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
