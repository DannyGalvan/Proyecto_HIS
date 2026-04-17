import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { MedicalConsultationRequest, MedicalConsultationResponse } from "../types/MedicalConsultationResponse";

export const getMedicalConsultations = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<MedicalConsultationResponse[]>> => {
  let baseQuery = `MedicalConsultation?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<MedicalConsultationResponse[]>>(baseQuery);
};

export const getMedicalConsultationById = async (id: number): Promise<ApiResponse<MedicalConsultationResponse>> =>
  api.get<unknown, ApiResponse<MedicalConsultationResponse>>(`MedicalConsultation/${id}?include=Doctor`);

export const createMedicalConsultation = async (data: MedicalConsultationRequest): Promise<ApiResponse<MedicalConsultationResponse>> =>
  api.post<unknown, ApiResponse<MedicalConsultationResponse>, MedicalConsultationRequest>("MedicalConsultation", data);

export const updateMedicalConsultation = async (data: MedicalConsultationRequest): Promise<ApiResponse<MedicalConsultationResponse>> =>
  api.put<unknown, ApiResponse<MedicalConsultationResponse>, MedicalConsultationRequest>("MedicalConsultation", data);

export const partialUpdateMedicalConsultation = async (data: MedicalConsultationRequest): Promise<ApiResponse<MedicalConsultationResponse>> =>
  api.patch<unknown, ApiResponse<MedicalConsultationResponse>, MedicalConsultationRequest>("MedicalConsultation", data);

export const deleteMedicalConsultation = async (id: number): Promise<ApiResponse<MedicalConsultationResponse>> =>
  api.delete<unknown, ApiResponse<MedicalConsultationResponse>>(`MedicalConsultation/${id}`);
