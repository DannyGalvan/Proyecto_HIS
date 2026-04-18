import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { DoctorEventRequest, DoctorEventResponse } from "../types/DoctorEventResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getDoctorEvents = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<DoctorEventResponse[]>> => {
  let baseQuery = `DoctorEvent?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<DoctorEventResponse[]>>(baseQuery);
};

export const getDoctorEvent = async (id: number): Promise<ApiResponse<DoctorEventResponse>> =>
  api.get<unknown, ApiResponse<DoctorEventResponse>>(`DoctorEvent/${id}?Include=Doctor`);

export const createDoctorEvent = async (data: DoctorEventRequest): Promise<ApiResponse<DoctorEventResponse>> =>
  api.post<unknown, ApiResponse<DoctorEventResponse>, DoctorEventRequest>("DoctorEvent", data);

export const updateDoctorEvent = async (data: DoctorEventRequest): Promise<ApiResponse<DoctorEventResponse>> =>
  api.put<unknown, ApiResponse<DoctorEventResponse>, DoctorEventRequest>("DoctorEvent", data);

export const patchDoctorEvent = async (data: DoctorEventRequest): Promise<ApiResponse<DoctorEventResponse>> =>
  api.patch<unknown, ApiResponse<DoctorEventResponse>, DoctorEventRequest>("DoctorEvent", data);

export const deleteDoctorEvent = async (id: number): Promise<ApiResponse<DoctorEventResponse>> =>
  api.delete<unknown, ApiResponse<DoctorEventResponse>>(`DoctorEvent/${id}`);
