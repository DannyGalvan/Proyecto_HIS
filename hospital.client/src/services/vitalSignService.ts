import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { VitalSignRequest, VitalSignResponse } from "../types/VitalSignResponse";

export const getVitalSigns = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<VitalSignResponse[]>> => {
  let baseQuery = `VitalSign?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<VitalSignResponse[]>>(baseQuery);
};

export const getVitalSignById = async (id: number): Promise<ApiResponse<VitalSignResponse>> =>
  api.get<unknown, ApiResponse<VitalSignResponse>>(`VitalSign/${id}`);

export const getVitalSignByAppointment = async (appointmentId: number): Promise<ApiResponse<VitalSignResponse[]>> =>
  api.get<unknown, ApiResponse<VitalSignResponse[]>>(
    `VitalSign?filters=${encodeURIComponent(`AppointmentId:eq:${appointmentId}`)}`,
  );

export const createVitalSign = async (data: VitalSignRequest): Promise<ApiResponse<VitalSignResponse>> =>
  api.post<unknown, ApiResponse<VitalSignResponse>, VitalSignRequest>("VitalSign", data);

export const updateVitalSign = async (data: VitalSignRequest): Promise<ApiResponse<VitalSignResponse>> =>
  api.put<unknown, ApiResponse<VitalSignResponse>, VitalSignRequest>("VitalSign", data);

export const deleteVitalSign = async (id: number): Promise<ApiResponse<VitalSignResponse>> =>
  api.delete<unknown, ApiResponse<VitalSignResponse>>(`VitalSign/${id}`);
