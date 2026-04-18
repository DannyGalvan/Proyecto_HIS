export interface DoctorEventResponse {
  id: number;
  doctorId: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  eventType: number;
  isAllDay: boolean;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
  doctorName?: string | null;
}

export interface DoctorEventRequest {
  id?: number | null;
  doctorId?: number | null;
  title?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  eventType?: number | null;
  isAllDay?: boolean | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

/**
 * Maps numeric EventType values to Spanish labels and TailwindCSS colors.
 * 0=Reunión, 1=Descanso, 2=Capacitación, 3=Personal, 4=Otro
 */
export const EventTypeLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Reunión", color: "bg-purple-100 text-purple-800" },
  1: { label: "Descanso", color: "bg-green-100 text-green-800" },
  2: { label: "Capacitación", color: "bg-blue-100 text-blue-800" },
  3: { label: "Personal", color: "bg-orange-100 text-orange-800" },
  4: { label: "Otro", color: "bg-gray-100 text-gray-800" },
};
