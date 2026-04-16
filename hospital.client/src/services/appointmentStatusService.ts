import { api } from "../configs/axios/interceptors";
import type { AppointmentStatusRequest, AppointmentStatusResponse } from "../types/AppointmentStatusResponse";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getAppointmentStatuses = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<AppointmentStatusResponse[]>> => {
  let baseQuery = `AppointmentStatus?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<AppointmentStatusResponse[]>>(baseQuery);
};

export const getAppointmentStatusById = async (id: number): Promise<ApiResponse<AppointmentStatusResponse>> =>
  api.get<unknown, ApiResponse<AppointmentStatusResponse>>(`AppointmentStatus/${id}`);

export const createAppointmentStatus = async (data: AppointmentStatusRequest): Promise<ApiResponse<AppointmentStatusResponse>> =>
  api.post<unknown, ApiResponse<AppointmentStatusResponse>, AppointmentStatusRequest>("AppointmentStatus", data);

export const updateAppointmentStatus = async (data: AppointmentStatusRequest): Promise<ApiResponse<AppointmentStatusResponse>> =>
  api.put<unknown, ApiResponse<AppointmentStatusResponse>, AppointmentStatusRequest>("AppointmentStatus", data);

export const deleteAppointmentStatus = async (id: number): Promise<ApiResponse<AppointmentStatusResponse>> =>
  api.delete<unknown, ApiResponse<AppointmentStatusResponse>>(`AppointmentStatus/${id}`);
