import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { PaymentRequest, PaymentResponse } from "../types/PaymentResponse";

export const getPayments = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<PaymentResponse[]>> => {
  let baseQuery = `Payment?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<PaymentResponse[]>>(baseQuery);
};

export const getPaymentById = async (id: number): Promise<ApiResponse<PaymentResponse>> =>
  api.get<unknown, ApiResponse<PaymentResponse>>(`Payment/${id}`);

export const createPayment = async (data: PaymentRequest): Promise<ApiResponse<PaymentResponse>> =>
  api.post<unknown, ApiResponse<PaymentResponse>, PaymentRequest>("Payment", data);

export const updatePayment = async (data: PaymentRequest): Promise<ApiResponse<PaymentResponse>> =>
  api.put<unknown, ApiResponse<PaymentResponse>, PaymentRequest>("Payment", data);

export const deletePayment = async (id: number): Promise<ApiResponse<PaymentResponse>> =>
  api.delete<unknown, ApiResponse<PaymentResponse>>(`Payment/${id}`);
