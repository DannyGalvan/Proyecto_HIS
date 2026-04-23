import { nameRoutes } from "../../configs/constants";
import ResetPasswordPage from "./ResetPasswordPage";

/** Portal reset password wrapper */
export function PortalResetPasswordPage() {
  return (
    <ResetPasswordPage
      forgotRoute={nameRoutes.portalForgotPassword}
      loginRoute={nameRoutes.portalLogin}
    />
  );
}
