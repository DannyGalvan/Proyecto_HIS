import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { DispenseRequest, DispenseResponse } from "../types/DispenseResponse";
import type { DispenseItemRequest, DispenseItemResponse } from "../types/DispenseItemResponse";
import type { filterOptions } from "../types/FilterTypes";

export const getDispenses = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<DispenseResponse[]>> => {
  let baseQuery = `Dispense?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<DispenseResponse[]>>(baseQuery);
};

export const getDispenseById = async (id: number): Promise<ApiResponse<DispenseResponse>> =>
  api.get<unknown, ApiResponse<DispenseResponse>>(`Dispense/${id}?Include=Prescription,Patient,Pharmacist,Items,Payments`);

export const createDispense = async (data: DispenseRequest): Promise<ApiResponse<DispenseResponse>> =>
  api.post<unknown, ApiResponse<DispenseResponse>, DispenseRequest>("Dispense", data);

export const updateDispense = async (data: DispenseRequest): Promise<ApiResponse<DispenseResponse>> =>
  api.put<unknown, ApiResponse<DispenseResponse>, DispenseRequest>("Dispense", data);

export const partialUpdateDispense = async (data: DispenseRequest): Promise<ApiResponse<DispenseResponse>> =>
  api.patch<unknown, ApiResponse<DispenseResponse>, DispenseRequest>("Dispense", data);

export const deleteDispense = async (id: number): Promise<ApiResponse<DispenseResponse>> =>
  api.delete<unknown, ApiResponse<DispenseResponse>>(`Dispense/${id}`);

// Dispense Items
export const getDispenseItems = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<DispenseItemResponse[]>> => {
  let baseQuery = `DispenseItem?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<DispenseItemResponse[]>>(baseQuery);
};

export const createDispenseItem = async (data: DispenseItemRequest): Promise<ApiResponse<DispenseItemResponse>> =>
  api.post<unknown, ApiResponse<DispenseItemResponse>, DispenseItemRequest>("DispenseItem", data);

export const updateDispenseItem = async (data: DispenseItemRequest): Promise<ApiResponse<DispenseItemResponse>> =>
  api.put<unknown, ApiResponse<DispenseItemResponse>, DispenseItemRequest>("DispenseItem", data);

export const deleteDispenseItem = async (id: number): Promise<ApiResponse<DispenseItemResponse>> =>
  api.delete<unknown, ApiResponse<DispenseItemResponse>>(`DispenseItem/${id}`);
