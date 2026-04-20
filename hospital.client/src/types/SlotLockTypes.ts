/**
 * Information about a locked slot received from the SignalR Hub.
 */
export interface SlotLockInfo {
  doctorId: number;
  date: string;       // "yyyy-MM-dd"
  time: string;       // "HH:mm"
  expiresAt: string;  // ISO 8601
}

/**
 * Rejection payload when a lock attempt fails.
 */
export interface SlotLockRejection {
  doctorId: number;
  date: string;
  time: string;
  reason: string;
}

/**
 * Connection state of the SignalR hub.
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
