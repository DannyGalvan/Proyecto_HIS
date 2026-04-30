import type { RouteObject } from "react-router";

import { PortalForgotPasswordPage } from "../pages/auth/PortalForgotPasswordPage";

import { PortalChangePasswordPage } from "../pages/portal/PortalChangePasswordPage";

import { PortalResetPasswordPage } from "../pages/auth/PortalResetPasswordPage";
import LoadingPage from "../pages/public/LoadingPage";
import ProtectedPatient from "./middlewares/ProtectedPatient";

export const PortalRoutes: RouteObject[] = [
  // Rutas públicas del portal
  {
    index: true,
    lazy: () => import("../pages/portal/PortalPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  {
    path: "login",
    lazy: () => import("../pages/portal/PortalLoginPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  {
    path: "register",
    lazy: () => import("../pages/portal/PortalRegisterPage"),
    hydrateFallbackElement: <LoadingPage />,
  },
  {
    path: "forgot-password",
    element: <PortalForgotPasswordPage />,
  },
  {
    path: "reset-password",
    element: <PortalResetPasswordPage />,
  },
  // Rutas protegidas del portal (requieren autenticación de paciente)
  {
    element: <ProtectedPatient />,
    children: [
      {
        path: "dashboard",
        lazy: () => import("../pages/portal/PatientDashboardPage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "book",
        lazy: () => import("../pages/portal/BookAppointmentPage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "book/pay",
        lazy: () => import("../pages/portal/PortalPaymentPage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "book/confirm",
        lazy: () => import("../pages/portal/ConfirmationPage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "appointments",
        lazy: () => import("../pages/portal/MyAppointmentsPage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "profile",
        lazy: () => import("../pages/portal/ProfilePage"),
        hydrateFallbackElement: <LoadingPage />,
      },
      {
        path: "change-password",
        element: <PortalChangePasswordPage />,
      },
    ],
  },
];
