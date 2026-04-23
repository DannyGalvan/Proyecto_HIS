import { nameRoutes } from "../../configs/constants";
import ResetPasswordPage from "./ResetPasswordPage";

/** Admin reset password wrapper */
export function AdminResetPasswordPage() {
  return (
    <ResetPasswordPage
      forgotRoute={nameRoutes.forgotPassword}
      loginRoute={nameRoutes.login}
    />
  );
}
