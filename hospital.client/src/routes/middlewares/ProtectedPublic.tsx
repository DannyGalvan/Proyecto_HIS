import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { useErrorsStore } from "../../stores/useErrorsStore";
import { getRoleFromToken } from "../../utils/jwt";

interface ProtectedPublicProps {
  readonly children: ReactNode;
}

function ProtectedPublic({ children }: ProtectedPublicProps) {
  const { isLoggedIn, token } = useAuth();
  const { error } = useErrorsStore();

  if (!isLoggedIn) {
    return <Navigate to={nameRoutes.login} />;
  }

  // Block patients from accessing admin panel — redirect to portal
  if (token) {
    const roleName = getRoleFromToken(token);
    if (roleName === "Paciente") {
      return <Navigate to={nameRoutes.portalDashboard} replace />;
    }
  }

  if (error) {
    return <Navigate to={nameRoutes.error} />;
  }

  return children;
}

export default ProtectedPublic;
