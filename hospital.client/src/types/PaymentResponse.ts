export interface PaymentResponse {
  id: number;
  appointmentId?: number | null;
  labOrderId?: number | null;
  dispenseId?: number | null;
  transactionNumber: string;
  amount: number;
  paymentMethod: number;
  paymentType: number;
  paymentStatus: number;
  paymentDate: string;
  cardLastFourDigits?: string | null;
  idempotencyKey?: string | null;
  amountReceived?: number | null;
  changeAmount?: number | null;
  gatewayResponseCode?: string | null;
  gatewayMessage?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface PaymentRequest {
  id?: number | null;
  appointmentId?: number | null;
  labOrderId?: number | null;
  dispenseId?: number | null;
  transactionNumber?: string | null;
  amount?: number | null;
  paymentMethod?: number | null;
  paymentType?: number | null;
  paymentStatus?: number | null;
  paymentDate?: string | null;
  cardLastFourDigits?: string | null;
  idempotencyKey?: string | null;
  amountReceived?: number | null;
  changeAmount?: number | null;
  gatewayResponseCode?: string | null;
  gatewayMessage?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
