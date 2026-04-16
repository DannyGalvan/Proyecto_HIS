import type { RouteObject } from "react-router-dom";

import ProtectedPatient from "./middlewares/ProtectedPatient";
import { PortalPage } from "../pages/portal/PortalPage";
import { PortalLoginPage } from "../pages/portal/PortalLoginPage";
import { PortalRegisterPage } from "../pages/portal/PortalRegisterPage";
import { PatientDashboardPage } from "../pages/portal/PatientDashboardPage";
import { BookAppointmentPage } from "../pages/portal/BookAppointmentPage";
import { PortalPaymentPage } from "../pages/portal/PortalPaymentPage";
import { ConfirmationPage } from "../pages/portal/ConfirmationPage";
import { MyAppointmentsPage } from "../pages/portal/MyAppointmentsPage";

export const PortalRoutes: RouteObject[] = [
  // Rutas públicas del portal
  {
    index: true,
    element: <PortalPage />,
  },
  {
    path: "login",
    element: <PortalLoginPage />,
  },
  {
    path: "register",
    element: <PortalRegisterPage />,
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
