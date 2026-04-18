import { api } from "../configs/axios/interceptors";
import type { ApiResponse } from "../types/ApiResponse";
import type { filterOptions } from "../types/FilterTypes";
import type { TimezoneResponse } from "../types/TimezoneResponse";

export const getTimezones = async ({
  pageNumber = 1,
  pageSize = 100,
  filters,
  include,
  includeTotal = false,
}: filterOptions): Promise<ApiResponse<TimezoneResponse[]>> => {
  let baseQuery = `Timezone?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (filters) baseQuery += `&filters=${encodeURIComponent(filters as string)}`;
  if (include) baseQuery += `&include=${encodeURIComponent(include as string)}`;
  if (includeTotal) baseQuery += `&includeTotal=${includeTotal}`;
  return api.get<unknown, ApiResponse<TimezoneResponse[]>>(baseQuery);
};
