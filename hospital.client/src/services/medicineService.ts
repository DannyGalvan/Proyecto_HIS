import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { MedicineRequest, MedicineResponse } from "../types/MedicineResponse";
import type { MedicineInventoryRequest, MedicineInventoryResponse } from "../types/MedicineInventoryResponse";

export const getMedicines = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<MedicineResponse[]>> => {
  let baseQuery = `Medicine?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<MedicineResponse[]>>(baseQuery);
};

export const getMedicineById = async (id: number): Promise<ApiResponse<MedicineResponse>> =>
  api.get<unknown, ApiResponse<MedicineResponse>>(`Medicine/${id}`);

export const createMedicine = async (data: MedicineRequest): Promise<ApiResponse<MedicineResponse>> =>
  api.post<unknown, ApiResponse<MedicineResponse>, MedicineRequest>("Medicine", data);

export const updateMedicine = async (data: MedicineRequest): Promise<ApiResponse<MedicineResponse>> =>
  api.put<unknown, ApiResponse<MedicineResponse>, MedicineRequest>("Medicine", data);

export const deleteMedicine = async (id: number): Promise<ApiResponse<MedicineResponse>> =>
  api.delete<unknown, ApiResponse<MedicineResponse>>(`Medicine/${id}`);

// Medicine Inventory
export const getMedicineInventory = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<MedicineInventoryResponse[]>> => {
  let baseQuery = `MedicineInventory?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<MedicineInventoryResponse[]>>(baseQuery);
};

export const getMedicineInventoryById = async (id: number): Promise<ApiResponse<MedicineInventoryResponse>> =>
  api.get<unknown, ApiResponse<MedicineInventoryResponse>>(`MedicineInventory/${id}?Include=Medicine,Branch`);

export const createMedicineInventory = async (data: MedicineInventoryRequest): Promise<ApiResponse<MedicineInventoryResponse>> =>
  api.post<unknown, ApiResponse<MedicineInventoryResponse>, MedicineInventoryRequest>("MedicineInventory", data);

export const updateMedicineInventory = async (data: MedicineInventoryRequest): Promise<ApiResponse<MedicineInventoryResponse>> =>
  api.put<unknown, ApiResponse<MedicineInventoryResponse>, MedicineInventoryRequest>("MedicineInventory", data);

export const partialUpdateMedicineInventory = async (data: MedicineInventoryRequest): Promise<ApiResponse<MedicineInventoryResponse>> =>
  api.patch<unknown, ApiResponse<MedicineInventoryResponse>, MedicineInventoryRequest>("MedicineInventory", data);
