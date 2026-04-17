import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { InventoryMovementRequest, InventoryMovementResponse } from "../types/InventoryMovementResponse";

export const getInventoryMovements = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<InventoryMovementResponse[]>> => {
  let baseQuery = `InventoryMovement?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<InventoryMovementResponse[]>>(baseQuery);
};

export const getInventoryMovement = async (id: number): Promise<ApiResponse<InventoryMovementResponse>> =>
  api.get<unknown, ApiResponse<InventoryMovementResponse>>(`InventoryMovement/${id}?Include=MedicineInventory,Medicine,Branch,User`);

export const createInventoryMovement = async (data: InventoryMovementRequest): Promise<ApiResponse<InventoryMovementResponse>> =>
  api.post<unknown, ApiResponse<InventoryMovementResponse>, InventoryMovementRequest>("InventoryMovement", data);

export const updateInventoryMovement = async (data: InventoryMovementRequest): Promise<ApiResponse<InventoryMovementResponse>> =>
  api.put<unknown, ApiResponse<InventoryMovementResponse>, InventoryMovementRequest>("InventoryMovement", data);

export const partialUpdateInventoryMovement = async (data: InventoryMovementRequest): Promise<ApiResponse<InventoryMovementResponse>> =>
  api.patch<unknown, ApiResponse<InventoryMovementResponse>, InventoryMovementRequest>("InventoryMovement", data);

export const deleteInventoryMovement = async (id: number): Promise<ApiResponse<InventoryMovementResponse>> =>
  api.delete<unknown, ApiResponse<InventoryMovementResponse>>(`InventoryMovement/${id}`);
