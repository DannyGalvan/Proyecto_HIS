import { Navigate, Outlet } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

const ProtectedPatient = () => {
  const { isLoggedIn } = usePatientAuthStore();
  return isLoggedIn ? <Outlet /> : <Navigate to={nameRoutes.portalLogin} replace />;
};

export default ProtectedPatient;
