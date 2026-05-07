import type { OperationResponse } from "./OperationResponse";

export interface OperationWithAssignment extends OperationResponse {
  assigned: boolean;
  rolOperationId?: number;
  /**
   * IsVisible override at the role-operation level. Only meaningful when assigned=true.
   * Controls whether the module shows up in the role's menu/sidebar.
   */
  rolOperationIsVisible?: boolean;
}
