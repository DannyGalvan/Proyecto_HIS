import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { LaboratoryRequest, LaboratoryResponse } from "../types/LaboratoryResponse";

export const getLaboratories = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<LaboratoryResponse[]>> => {
  let baseQuery = `Laboratory?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<LaboratoryResponse[]>>(baseQuery);
};

export const getLaboratoryById = async (id: number): Promise<ApiResponse<LaboratoryResponse>> =>
  api.get<unknown, ApiResponse<LaboratoryResponse>>(`Laboratory/${id}`);

export const createLaboratory = async (data: LaboratoryRequest): Promise<ApiResponse<LaboratoryResponse>> =>
  api.post<unknown, ApiResponse<LaboratoryResponse>, LaboratoryRequest>("Laboratory", data);

export const updateLaboratory = async (data: LaboratoryRequest): Promise<ApiResponse<LaboratoryResponse>> =>
  api.put<unknown, ApiResponse<LaboratoryResponse>, LaboratoryRequest>("Laboratory", data);

export const deleteLaboratory = async (id: number): Promise<ApiResponse<LaboratoryResponse>> =>
  api.delete<unknown, ApiResponse<LaboratoryResponse>>(`Laboratory/${id}`);
