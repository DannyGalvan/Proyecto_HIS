import { Navigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { getRoleFromToken } from "../../utils/jwt";

interface ProtectedLoginProps {
  readonly children: React.ReactNode;
}

function ProtectedLogin({ children }: ProtectedLoginProps) {
  const { isLoggedIn, token } = useAuth();

  if (isLoggedIn) {
    const role = token ? getRoleFromToken(token) : null;
    switch (role) {
      case "Medico":
        return <Navigate to={nameRoutes.doctorDashboard} replace />;
      case "Enfermero":
        return <Navigate to={nameRoutes.nurseDashboard} replace />;
      case "Paciente":
        return <Navigate to={nameRoutes.portalDashboard} replace />;
      default:
        return <Navigate to={nameRoutes.adminDashboard} replace />;
    }
  }

  return children;
}

export default ProtectedLogin;
