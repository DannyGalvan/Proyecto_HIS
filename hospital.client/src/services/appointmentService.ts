import { api } from "../configs/axios/interceptors";
import type { AppointmentRequest, AppointmentResponse } from "../types/AppointmentResponse";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getAppointments = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<AppointmentResponse[]>> => {
  let baseQuery = `Appointment?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<AppointmentResponse[]>>(baseQuery);
};

export const getAppointmentById = async (id: number): Promise<ApiResponse<AppointmentResponse>> =>
  api.get<unknown, ApiResponse<AppointmentResponse>>(
    `Appointment/${id}?Include=Specialty,Branch,AppointmentStatus,Patient,Doctor`,
  );

export const createAppointment = async (data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> =>
  api.post<unknown, ApiResponse<AppointmentResponse>, AppointmentRequest>("Appointment", data);

export const updateAppointment = async (data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> =>
  api.put<unknown, ApiResponse<AppointmentResponse>, AppointmentRequest>("Appointment", data);

export const partialUpdateAppointment = async (data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> =>
  api.patch<unknown, ApiResponse<AppointmentResponse>, AppointmentRequest>("Appointment", data);

export const deleteAppointment = async (id: number): Promise<ApiResponse<AppointmentResponse>> =>
  api.delete<unknown, ApiResponse<AppointmentResponse>>(`Appointment/${id}`);

// ── Appointment State Machine Transitions ─────────────────────────────────────

const transition = (id: number, action: string): Promise<ApiResponse<string>> =>
  api.post<unknown, ApiResponse<string>>(`AppointmentTransition/${id}/${action}`);

/** Nurse: Confirmada → Signos Vitales */
export const startVitals = (id: number) => transition(id, "start-vitals");

/** Nurse: Signos Vitales → En Espera */
export const completeVitals = (id: number) => transition(id, "vitals-done");

/** Doctor: En Espera → Consulta Médica */
export const startConsultation = (id: number) => transition(id, "start-consultation");

/** Doctor: Evaluado/Laboratorio/Farmacia → Atención Finalizada */
export const finishAppointment = (id: number) => transition(id, "finish");

/** Doctor: Confirmada/En Espera → No Asistió */
export const markNoShow = (id: number) => transition(id, "no-show");
