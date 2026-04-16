import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { NotificationLogResponse } from "../types/NotificationLogResponse";

export const getNotificationLogs = async ({
  pageNumber = 1,
  pageSize = 10,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<NotificationLogResponse[]>> => {
  let baseQuery = `NotificationLog?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<NotificationLogResponse[]>>(baseQuery);
};

export const getNotificationLogById = async (id: number): Promise<ApiResponse<NotificationLogResponse>> =>
  api.get<unknown, ApiResponse<NotificationLogResponse>>(`NotificationLog/${id}`);
