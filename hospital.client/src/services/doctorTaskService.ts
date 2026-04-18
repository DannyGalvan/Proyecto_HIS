import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { DoctorTaskRequest, DoctorTaskResponse } from "../types/DoctorTaskResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getDoctorTasks = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<DoctorTaskResponse[]>> => {
  let baseQuery = `DoctorTask?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<DoctorTaskResponse[]>>(baseQuery);
};

export const getDoctorTask = async (id: number): Promise<ApiResponse<DoctorTaskResponse>> =>
  api.get<unknown, ApiResponse<DoctorTaskResponse>>(`DoctorTask/${id}?Include=Doctor`);

export const createDoctorTask = async (data: DoctorTaskRequest): Promise<ApiResponse<DoctorTaskResponse>> =>
  api.post<unknown, ApiResponse<DoctorTaskResponse>, DoctorTaskRequest>("DoctorTask", data);

export const updateDoctorTask = async (data: DoctorTaskRequest): Promise<ApiResponse<DoctorTaskResponse>> =>
  api.put<unknown, ApiResponse<DoctorTaskResponse>, DoctorTaskRequest>("DoctorTask", data);

export const patchDoctorTask = async (data: DoctorTaskRequest): Promise<ApiResponse<DoctorTaskResponse>> =>
  api.patch<unknown, ApiResponse<DoctorTaskResponse>, DoctorTaskRequest>("DoctorTask", data);

export const deleteDoctorTask = async (id: number): Promise<ApiResponse<DoctorTaskResponse>> =>
  api.delete<unknown, ApiResponse<DoctorTaskResponse>>(`DoctorTask/${id}`);
