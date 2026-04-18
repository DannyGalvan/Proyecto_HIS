export interface TimezoneResponse {
  id: number;
  ianaId: string;
  displayName: string;
  utcOffset: string;
  state: number;
}

export interface TimezoneRequest {
  id?: number | null;
  ianaId?: string | null;
  displayName?: string | null;
  utcOffset?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
