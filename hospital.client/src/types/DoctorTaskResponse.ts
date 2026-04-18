export interface DoctorTaskResponse {
  id: number;
  doctorId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  isCompleted: boolean;
  priority: number;
  state: number;
  createdAt: string;
  createdBy: number;
  updatedBy?: number | null;
  updatedAt?: string | null;
  doctorName?: string | null;
}

export interface DoctorTaskRequest {
  id?: number | null;
  doctorId?: number | null;
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
  isCompleted?: boolean | null;
  priority?: number | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
}

/**
 * Maps numeric Priority values to Spanish labels and TailwindCSS colors.
 * 0=Baja, 1=Normal, 2=Alta
 */
export const PriorityLabels: Record<number, { label: string; color: string }> = {
  0: { label: "Baja", color: "bg-gray-100 text-gray-800" },
  1: { label: "Normal", color: "bg-blue-100 text-blue-800" },
  2: { label: "Alta", color: "bg-red-100 text-red-800" },
};
