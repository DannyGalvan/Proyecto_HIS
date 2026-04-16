export interface VitalSignResponse {
  id: number;
  appointmentId: number;
  nurseId: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  weight: number;
  height: number;
  heartRate: number;
  isEmergency: boolean;
  clinicalAlerts?: string | null;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface VitalSignRequest {
  id?: number | null;
  appointmentId?: number | null;
  nurseId?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  weight?: number | null;
  height?: number | null;
  heartRate?: number | null;
  isEmergency?: boolean | null;
  clinicalAlerts?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}
