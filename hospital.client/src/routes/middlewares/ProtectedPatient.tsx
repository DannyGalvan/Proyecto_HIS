import { Navigate, Outlet } from "react-router";

import { usePatientAuthStore } from "../../stores/usePatientAuthStore";

const ProtectedPatient = () => {
  const { isLoggedIn } = usePatientAuthStore();
  return isLoggedIn ? <Outlet /> : <Navigate to="/portal/login" replace />;
};

export default ProtectedPatient;
