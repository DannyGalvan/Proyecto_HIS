import { Navigate } from "react-router";
import { nameRoutes } from "../../configs/constants";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

// Redirect already-logged-in patients away from login/register
export function GuestOnlyRoute({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { isLoggedIn } = usePatientAuthStore();
  return isLoggedIn ? (
    <Navigate replace to={nameRoutes.portalDashboard} />
  ) : (
    children
  );
}
