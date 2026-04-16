import { Navigate } from "react-router";

import { nameRoutes } from "../../configs/constants";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedLoginProps {
  readonly children: React.ReactNode;
}

function ProtectedLogin({ children }: ProtectedLoginProps) {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    // Redirect to admin dashboard instead of root to avoid the portal redirect
    return <Navigate to={nameRoutes.doctorDashboard} replace />;
  }

  return children;
}

export default ProtectedLogin;
