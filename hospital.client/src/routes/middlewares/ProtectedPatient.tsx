import { Navigate, Outlet } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

function ProtectedPatient() {
  const { isLoggedIn, loading } = usePatientAuthStore();

  if (loading) return null;

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate replace to={nameRoutes.portalLogin} />
  );
}

export default ProtectedPatient;
