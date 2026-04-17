import type { BranchResponse } from "./BranchResponse";
import type { MedicineInventoryResponse } from "./MedicineInventoryResponse";
import type { MedicineResponse } from "./MedicineResponse";
import type { UserResponse } from "./UserResponse";

export interface InventoryMovementResponse {
  id: number;
  medicineInventoryId: number;
  medicineId: number;
  branchId: number;
  movementType: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  referenceNumber?: string | null;
  referenceType?: string | null;
  notes?: string | null;
  userId: number;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;

  medicineInventory?: MedicineInventoryResponse | null;
  medicine?: MedicineResponse | null;
  branch?: BranchResponse | null;
  user?: UserResponse | null;
}

export interface InventoryMovementRequest {
  id?: number | null;
  medicineInventoryId?: number | null;
  medicineId?: number | null;
  branchId?: number | null;
  movementType?: number | null;
  quantity?: number | null;
  previousStock?: number | null;
  newStock?: number | null;
  unitCost?: number | null;
  totalCost?: number | null;
  referenceNumber?: string | null;
  referenceType?: string | null;
  notes?: string | null;
  userId?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

/**
 * Maps numeric MovementType values to Spanish labels and TailwindCSS badge colors.
 * 0=Compra, 1=Devolución, 2=Venta, 3=Reclamo, 4=Ajuste+, 5=Ajuste-, 6=Despacho
 */
export const MovementTypeLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Compra", color: "bg-green-100 text-green-800" },
  1: { label: "Devolución", color: "bg-green-100 text-green-800" },
  2: { label: "Venta", color: "bg-blue-100 text-blue-800" },
  3: { label: "Reclamo", color: "bg-red-100 text-red-800" },
  4: { label: "Ajuste+", color: "bg-yellow-100 text-yellow-800" },
  5: { label: "Ajuste-", color: "bg-yellow-100 text-yellow-800" },
  6: { label: "Despacho", color: "bg-purple-100 text-purple-800" },
};
