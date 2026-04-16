import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { LabExamRequest, LabExamResponse } from "../types/LabExamResponse";

export const getLabExams = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<LabExamResponse[]>> => {
  let baseQuery = `LabExam?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<LabExamResponse[]>>(baseQuery);
};

export const getLabExamById = async (id: number): Promise<ApiResponse<LabExamResponse>> =>
  api.get<unknown, ApiResponse<LabExamResponse>>(`LabExam/${id}?Include=Laboratory`);

export const createLabExam = async (data: LabExamRequest): Promise<ApiResponse<LabExamResponse>> =>
  api.post<unknown, ApiResponse<LabExamResponse>, LabExamRequest>("LabExam", data);

export const updateLabExam = async (data: LabExamRequest): Promise<ApiResponse<LabExamResponse>> =>
  api.put<unknown, ApiResponse<LabExamResponse>, LabExamRequest>("LabExam", data);

export const deleteLabExam = async (id: number): Promise<ApiResponse<LabExamResponse>> =>
  api.delete<unknown, ApiResponse<LabExamResponse>>(`LabExam/${id}`);
