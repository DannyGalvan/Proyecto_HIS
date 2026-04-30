import type { OperationResponse } from "./OperationResponse";

export interface OperationWithAssignment extends OperationResponse {
  assigned: boolean;
  rolOperationId?: number;
}
