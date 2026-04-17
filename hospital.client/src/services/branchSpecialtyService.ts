import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { BranchSpecialtyRequest, BranchSpecialtyResponse } from "../types/BranchSpecialtyResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getBranchSpecialties = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<BranchSpecialtyResponse[]>> => {
  let baseQuery = `BranchSpecialty?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<BranchSpecialtyResponse[]>>(baseQuery);
};

export const getBranchSpecialtyById = async (
  id: number,
): Promise<ApiResponse<BranchSpecialtyResponse>> =>
  api.get<unknown, ApiResponse<BranchSpecialtyResponse>>(`BranchSpecialty/${id}`);

export const createBranchSpecialty = async (
  data: BranchSpecialtyRequest,
): Promise<ApiResponse<BranchSpecialtyResponse>> =>
  api.post<unknown, ApiResponse<BranchSpecialtyResponse>, BranchSpecialtyRequest>(
    "BranchSpecialty",
    data,
  );

export const updateBranchSpecialty = async (
  data: BranchSpecialtyRequest,
): Promise<ApiResponse<BranchSpecialtyResponse>> =>
  api.put<unknown, ApiResponse<BranchSpecialtyResponse>, BranchSpecialtyRequest>(
    "BranchSpecialty",
    data,
  );

export const deleteBranchSpecialty = async (
  id: number,
): Promise<ApiResponse<BranchSpecialtyResponse>> =>
  api.delete<unknown, ApiResponse<BranchSpecialtyResponse>>(`BranchSpecialty/${id}`);
