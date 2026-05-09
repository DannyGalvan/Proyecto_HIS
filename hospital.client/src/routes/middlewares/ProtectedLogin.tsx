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
        return <Navigate replace to={nameRoutes.doctorDashboard} />;
      case "Enfermero":
        return <Navigate replace to={nameRoutes.nurseDashboard} />;
      case "Paciente":
        return <Navigate replace to={nameRoutes.portalDashboard} />;
      case "Recepcionista":
      case "Cajero":
      case "Farmaceutico":
      case "Laboratorista":
        return <Navigate replace to={nameRoutes.roleDashboard} />;
      default:
        return <Navigate replace to={nameRoutes.adminDashboard} />;
    }
  }

  return children;
}

export default ProtectedLogin;
