import type { RolResponse } from "./RolResponse";
import type { SpecialtyResponse } from "./SpecialtyResponse";

export interface UserRequest {
  id?: number | null;
  rolId?: number | null;
  email?: string | null;
  name?: string | null;
  userName?: string | null;
  password?: string | null;
  identificationDocument?: string | null;
  number?: string | null;
  nit?: string | null;
  branchId?: number | null;
  insuranceNumber?: string | null;
  state?: number | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  timezoneId?: number | null;

  rol?: RolResponse | null;
  specialtyId?: number | null;
  specialty?: SpecialtyResponse | null;
}
