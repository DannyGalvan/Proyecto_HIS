import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router";

import ProtectedPatient from "./middlewares/ProtectedPatient";
import { PortalPage } from "../pages/portal/PortalPage";
import { PortalLoginPage } from "../pages/portal/PortalLoginPage";
import { PortalRegisterPage } from "../pages/portal/PortalRegisterPage";
import { PatientDashboardPage } from "../pages/portal/PatientDashboardPage";
import { BookAppointmentPage } from "../pages/portal/BookAppointmentPage";
import { PortalPaymentPage } from "../pages/portal/PortalPaymentPage";
import { ConfirmationPage } from "../pages/portal/ConfirmationPage";
import { MyAppointmentsPage } from "../pages/portal/MyAppointmentsPage";
import { usePatientAuthStore } from "../stores/usePatientAuthStore";
import { nameRoutes } from "../configs/constants";

// Redirect already-logged-in patients away from login/register
function GuestOnlyRoute({ children }: { readonly children: React.ReactNode }) {
  const { isLoggedIn } = usePatientAuthStore();
  return isLoggedIn ? <Navigate to={nameRoutes.portalDashboard} replace /> : <>{children}</>;
}

export const PortalRoutes: RouteObject[] = [
  // Rutas públicas del portal
  {
    index: true,
    element: <PortalPage />,
  },
  {
    path: "login",
    element: (
      <GuestOnlyRoute>
        <PortalLoginPage />
      </GuestOnlyRoute>
    ),
  },
  {
    path: "register",
    element: (
      <GuestOnlyRoute>
        <PortalRegisterPage />
      </GuestOnlyRoute>
    ),
  },
  // Rutas protegidas del portal (requieren autenticación de paciente)
  {
    element: <ProtectedPatient />,
    children: [
      {
        path: "dashboard",
        element: <PatientDashboardPage />,
      },
      {
        path: "book",
        element: <BookAppointmentPage />,
      },
      {
        path: "book/pay",
        element: <PortalPaymentPage />,
      },
      {
        path: "book/confirm",
        element: <ConfirmationPage />,
      },
      {
        path: "appointments",
        element: <MyAppointmentsPage />,
      },
    ],
  },
];
