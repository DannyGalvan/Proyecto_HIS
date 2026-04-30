import { nameRoutes } from "../../configs/constants";
import { ForgotPasswordPage } from "./ForgotPasswordPage";

export function PortalForgotPasswordPage() {
  return <ForgotPasswordPage loginRoute={nameRoutes.portalLogin} />;
}
