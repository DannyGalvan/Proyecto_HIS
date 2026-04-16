import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { BranchRequest, BranchResponse } from "../types/BranchResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getBranches = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<BranchResponse[]>> => {
  let baseQuery = `Branch?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<BranchResponse[]>>(baseQuery);
};

export const getBranchById = async (id: number): Promise<ApiResponse<BranchResponse>> =>
  api.get<unknown, ApiResponse<BranchResponse>>(`Branch/${id}`);

export const createBranch = async (data: BranchRequest): Promise<ApiResponse<BranchResponse>> =>
  api.post<unknown, ApiResponse<BranchResponse>, BranchRequest>("Branch", data);

export const updateBranch = async (data: BranchRequest): Promise<ApiResponse<BranchResponse>> =>
  api.put<unknown, ApiResponse<BranchResponse>, BranchRequest>("Branch", data);

export const deleteBranch = async (id: number): Promise<ApiResponse<BranchResponse>> =>
  api.delete<unknown, ApiResponse<BranchResponse>>(`Branch/${id}`);
