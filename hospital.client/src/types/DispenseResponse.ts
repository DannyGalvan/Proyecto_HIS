export interface DispenseResponse {
  id: number;
  prescriptionId: number;
  patientId: number;
  pharmacistId: number;
  dispenseStatus: number;
  totalAmount: number;
  paymentMethod?: string | null;
  notes?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface DispenseRequest {
  id?: number | null;
  prescriptionId?: number | null;
  patientId?: number | null;
  pharmacistId?: number | null;
  dispenseStatus?: number | null;
  totalAmount?: number | null;
  paymentMethod?: string | null;
  notes?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

/** Métodos de pago aceptados según RN-GLOBAL-004 */
export const PAYMENT_METHODS = [
  { label: "Efectivo", value: "EFECTIVO" },
  { label: "Tarjeta de Crédito (Visa/Mastercard)", value: "TARJETA_CREDITO" },
  { label: "Tarjeta de Débito", value: "TARJETA_DEBITO" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];
