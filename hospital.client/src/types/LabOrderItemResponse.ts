export interface LabOrderItemResponse {
  id: number;
  labOrderId: number;
  labExamId: number;
  examName?: string | null;
  amount?: number | null;
  resultValue?: string | null;
  resultUnit?: string | null;
  referenceRange?: string | null;
  isOutOfRange?: boolean | null;
  resultNotes?: string | null;
  resultDate?: string | null;
  isPublished?: boolean | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface LabOrderItemRequest {
  id?: number | null;
  labOrderId?: number | null;
  labExamId?: number | null;
  examName?: string | null;
  amount?: number | null;
  resultValue?: string | null;
  resultUnit?: string | null;
  referenceRange?: string | null;
  isOutOfRange?: boolean | null;
  resultNotes?: string | null;
  resultDate?: string | null;
  isPublished?: boolean | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
