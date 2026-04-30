import { Navigate } from "react-router";
import { nameRoutes } from "../configs/constants";
import { getRoleFromToken } from "../utils/jwt";
import { useAuth } from "./useAuth";

export function RootIndex() {
  const { isLoggedIn, token } = useAuth();

  if (!isLoggedIn) {
    const patientAuth = window.localStorage.getItem("@patient-auth");
    if (patientAuth) {
      try {
        const parsed = JSON.parse(patientAuth) as {
          isLoggedIn?: boolean;
          token?: string;
        };
        if (parsed?.isLoggedIn && parsed?.token) {
          return <Navigate replace to={nameRoutes.portalDashboard} />;
        }
      } catch {
        /* ignore */
      }
    }
    return <Navigate replace to={nameRoutes.portalHome} />;
  }

  const role = token ? getRoleFromToken(token) : null;

  switch (role) {
    case "Medico":
      return <Navigate replace to={nameRoutes.doctorDashboard} />;
    case "Enfermero":
      return <Navigate replace to={nameRoutes.nurseDashboard} />;
    case "Paciente":
      return <Navigate replace to={nameRoutes.portalDashboard} />;
    default:
      return <Navigate replace to={nameRoutes.adminDashboard} />;
  }
}

RootIndex.displayName = "RootIndex";
