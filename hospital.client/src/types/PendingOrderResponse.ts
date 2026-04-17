export interface PendingOrderResponse {
  orderType: string;
  orderId: number;
  orderNumber: string;
  patientName: string;
  patientDpi: string;
  createdAt: string;
  itemCount: number;
  totalAmount: number;
  paymentType: number;
}
