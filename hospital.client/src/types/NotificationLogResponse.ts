export interface NotificationLogResponse {
  id: number;
  recipientEmail: string;
  subject: string;
  notificationType: number;
  relatedEntityType: string;
  relatedEntityId?: number | null;
  sentAt?: string | null;
  status: number;
  retryCount?: number | null;
  errorMessage?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface NotificationLogRequest {
  id?: number | null;
  recipientEmail?: string | null;
  subject?: string | null;
  notificationType?: number | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  sentAt?: string | null;
  status?: number | null;
  retryCount?: number | null;
  errorMessage?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
