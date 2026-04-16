import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { LabOrderRequest, LabOrderResponse } from "../types/LabOrderResponse";
import type { LabOrderItemRequest, LabOrderItemResponse } from "../types/LabOrderItemResponse";

export const getLabOrders = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<LabOrderResponse[]>> => {
  let baseQuery = `LabOrder?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<LabOrderResponse[]>>(baseQuery);
};

export const getLabOrderById = async (id: number): Promise<ApiResponse<LabOrderResponse>> =>
  api.get<unknown, ApiResponse<LabOrderResponse>>(`LabOrder/${id}?Include=Consultation,Doctor,Patient,Items`);

export const createLabOrder = async (data: LabOrderRequest): Promise<ApiResponse<LabOrderResponse>> =>
  api.post<unknown, ApiResponse<LabOrderResponse>, LabOrderRequest>("LabOrder", data);

export const updateLabOrder = async (data: LabOrderRequest): Promise<ApiResponse<LabOrderResponse>> =>
  api.put<unknown, ApiResponse<LabOrderResponse>, LabOrderRequest>("LabOrder", data);

export const partialUpdateLabOrder = async (data: LabOrderRequest): Promise<ApiResponse<LabOrderResponse>> =>
  api.patch<unknown, ApiResponse<LabOrderResponse>, LabOrderRequest>("LabOrder", data);

export const deleteLabOrder = async (id: number): Promise<ApiResponse<LabOrderResponse>> =>
  api.delete<unknown, ApiResponse<LabOrderResponse>>(`LabOrder/${id}`);

// Lab Order Items
export const getLabOrderItems = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<LabOrderItemResponse[]>> => {
  let baseQuery = `LabOrderItem?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<LabOrderItemResponse[]>>(baseQuery);
};

export const partialUpdateLabOrderItem = async (data: LabOrderItemRequest): Promise<ApiResponse<LabOrderItemResponse>> =>
  api.patch<unknown, ApiResponse<LabOrderItemResponse>, LabOrderItemRequest>("LabOrderItem", data);

export const createLabOrderItem = async (data: LabOrderItemRequest): Promise<ApiResponse<LabOrderItemResponse>> =>
  api.post<unknown, ApiResponse<LabOrderItemResponse>, LabOrderItemRequest>("LabOrderItem", data);

export const deleteLabOrderItem = async (id: number): Promise<ApiResponse<LabOrderItemResponse>> =>
  api.delete<unknown, ApiResponse<LabOrderItemResponse>>(`LabOrderItem/${id}`);
