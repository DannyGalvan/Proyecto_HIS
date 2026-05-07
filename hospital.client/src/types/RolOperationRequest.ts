export interface RolOperationRequest {
  id: number | null;
  rolId?: number;
  operationId?: number;
  state?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
