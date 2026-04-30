import { nameRoutes } from "../../configs/constants";
import { ForgotPasswordPage } from "./ForgotPasswordPage";

export function AdminForgotPasswordPage() {
  return <ForgotPasswordPage loginRoute={nameRoutes.login} />;
}
