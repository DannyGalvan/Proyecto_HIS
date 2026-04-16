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
