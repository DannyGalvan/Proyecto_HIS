import { api } from "../configs/axios/interceptors";
import type { ChangePasswordForm } from "../pages/auth/ChangePasswordPage";
import type { ApiResponse } from "../types/ApiResponse";
import type { LoginRequest, LoginResponse } from "../types/LoginRequest";
import type { ManualChangePasswordRequest } from "../types/ManualChangePasswordRequest";
import type { ValidationFailure } from "../types/ValidationFailure";

export const authenticateUser = async (login: LoginRequest) => {
  const response = await api.post<
    unknown,
    ApiResponse<LoginResponse>,
    LoginRequest
  >("/auth", login);

  return response;
};

export const changePassword = async (credentials: ChangePasswordForm) => {
  return await api.post<
    unknown,
    ApiResponse<string | ValidationFailure[]>,
    ChangePasswordForm
  >("/Auth/ResetPassword", credentials);
};

export const manualChangePassword = async (
  data: ManualChangePasswordRequest,
): Promise<ApiResponse<string | ValidationFailure[]>> => {
  return api.post<
    unknown,
    ApiResponse<string | ValidationFailure[]>,
    ManualChangePasswordRequest
  >("/Auth/ManualChangePassword", data);
};

/** Send recovery email — POST /api/v1/Auth/RecoveryPassword */
export const recoveryPassword = async (
  email: string,
): Promise<ApiResponse<string>> => {
  return api.post<unknown, ApiResponse<string>, { email: string }>(
    "/Auth/RecoveryPassword",
    { email },
  );
};

/** Validate recovery token — GET /api/v1/Auth/{token} */
export const validateRecoveryToken = async (
  token: string,
): Promise<ApiResponse<string>> => {
  return api.get<unknown, ApiResponse<string>>(
    `/Auth/${encodeURIComponent(token)}`,
  );
};

/** Reset password with token — PUT /api/v1/Auth/ChangePassword */
export const resetPasswordWithToken = async (data: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ApiResponse<string>> => {
  return api.put<unknown, ApiResponse<string>, typeof data>(
    "/Auth/ChangePassword",
    data,
  );
};
