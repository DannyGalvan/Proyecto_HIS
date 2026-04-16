import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { PrescriptionRequest, PrescriptionResponse } from "../types/PrescriptionResponse";
import type { PrescriptionItemRequest, PrescriptionItemResponse } from "../types/PrescriptionItemResponse";

export const getPrescriptions = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<PrescriptionResponse[]>> => {
  let baseQuery = `Prescription?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<PrescriptionResponse[]>>(baseQuery);
};

export const getPrescriptionById = async (id: number): Promise<ApiResponse<PrescriptionResponse>> =>
  api.get<unknown, ApiResponse<PrescriptionResponse>>(`Prescription/${id}?Include=Consultation,Doctor,Items`);

export const createPrescription = async (data: PrescriptionRequest): Promise<ApiResponse<PrescriptionResponse>> =>
  api.post<unknown, ApiResponse<PrescriptionResponse>, PrescriptionRequest>("Prescription", data);

export const updatePrescription = async (data: PrescriptionRequest): Promise<ApiResponse<PrescriptionResponse>> =>
  api.put<unknown, ApiResponse<PrescriptionResponse>, PrescriptionRequest>("Prescription", data);

export const deletePrescription = async (id: number): Promise<ApiResponse<PrescriptionResponse>> =>
  api.delete<unknown, ApiResponse<PrescriptionResponse>>(`Prescription/${id}`);

// Prescription Items
export const getPrescriptionItems = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<PrescriptionItemResponse[]>> => {
  let baseQuery = `PrescriptionItem?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<PrescriptionItemResponse[]>>(baseQuery);
};

export const createPrescriptionItem = async (data: PrescriptionItemRequest): Promise<ApiResponse<PrescriptionItemResponse>> =>
  api.post<unknown, ApiResponse<PrescriptionItemResponse>, PrescriptionItemRequest>("PrescriptionItem", data);

export const updatePrescriptionItem = async (data: PrescriptionItemRequest): Promise<ApiResponse<PrescriptionItemResponse>> =>
  api.put<unknown, ApiResponse<PrescriptionItemResponse>, PrescriptionItemRequest>("PrescriptionItem", data);

export const deletePrescriptionItem = async (id: number): Promise<ApiResponse<PrescriptionItemResponse>> =>
  api.delete<unknown, ApiResponse<PrescriptionItemResponse>>(`PrescriptionItem/${id}`);
