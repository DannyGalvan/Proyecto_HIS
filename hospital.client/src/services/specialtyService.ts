import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { SpecialtyRequest, SpecialtyResponse } from "../types/SpecialtyResponse";

export const getSpecialties = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<SpecialtyResponse[]>> => {
  let baseQuery = `Specialty?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<SpecialtyResponse[]>>(baseQuery);
};

export const getSpecialtyById = async (id: number): Promise<ApiResponse<SpecialtyResponse>> =>
  api.get<unknown, ApiResponse<SpecialtyResponse>>(`Specialty/${id}`);

export const createSpecialty = async (data: SpecialtyRequest): Promise<ApiResponse<SpecialtyResponse>> =>
  api.post<unknown, ApiResponse<SpecialtyResponse>, SpecialtyRequest>("Specialty", data);

export const updateSpecialty = async (data: SpecialtyRequest): Promise<ApiResponse<SpecialtyResponse>> =>
  api.put<unknown, ApiResponse<SpecialtyResponse>, SpecialtyRequest>("Specialty", data);

export const deleteSpecialty = async (id: number): Promise<ApiResponse<SpecialtyResponse>> =>
  api.delete<unknown, ApiResponse<SpecialtyResponse>>(`Specialty/${id}`);
