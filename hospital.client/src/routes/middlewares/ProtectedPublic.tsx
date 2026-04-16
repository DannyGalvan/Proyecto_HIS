import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";
import { useErrorsStore } from "../../stores/useErrorsStore";

interface ProtectedPublicProps {
  readonly children: ReactNode;
}

const decodeJwtPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

function ProtectedPublic({ children }: ProtectedPublicProps) {
  const { isLoggedIn, token } = useAuth();
  const { error } = useErrorsStore();

  if (!isLoggedIn) {
    return <Navigate to={nameRoutes.login} />;
  }

  // Si el token pertenece a un paciente, redirigir al portal del paciente
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      const roleName =
        (payload["RoleName"] as string | undefined) ??
        (payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as string | undefined);
      if (roleName === "Paciente") {
        return <Navigate to={nameRoutes.portalDashboard} replace />;
      }
    }
  }

  if (error) {
    return <Navigate to={nameRoutes.error} />;
  }

  return children;
}

export default ProtectedPublic;
