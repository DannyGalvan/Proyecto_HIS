import { createBrowserRouter } from "react-router";

import { nameRoutes } from "../configs/constants";
import { PortalLayout } from "../containers/PortalLayout";
import { Root } from "../containers/Root";
import { ErrorRoutes } from "../routes/ErrorRoutes";
import { PortalRoutes } from "../routes/PortalRoutes";
import { PublicRoutes } from "../routes/PublicRoutes";
import { RootIndex } from "./RootIndex";
import { useAuth } from "./useAuth";

export const useAuthorizationRoutes = () => {
  const { allOperations } = useAuth();

  const routes = createBrowserRouter([
    {
      path: nameRoutes.root,
      element: <Root />,
      children: [
        {
          index: true,
          element: <RootIndex />,
        },
        ...PublicRoutes,
        ...ErrorRoutes,
      ],
    },
    {
      path: nameRoutes.portalHome,
      element: <PortalLayout />,
      children: PortalRoutes,
    },
  ]);

  const operations = new Set(
    allOperations.map((operation) =>
      // Normalize: strip leading slash so "user" matches route path "/user"
      operation.path.toLowerCase().replace(/^\//, ""),
    ),
  );

  const errorPaths = new Set([
    nameRoutes.forbidden,
    nameRoutes.unauthorized,
    nameRoutes.error,
    nameRoutes.notFound,
    nameRoutes.login,
    nameRoutes.changePassword,
    nameRoutes.forgotPassword,
    nameRoutes.resetPassword,
    nameRoutes.register,
    nameRoutes.doctorDashboard,
    nameRoutes.nurseDashboard,
    nameRoutes.adminDashboard,
    nameRoutes.reception,
    nameRoutes.cashier,
    nameRoutes.onlinePayment,
    nameRoutes.roleDashboard,
    nameRoutes.doctorManagement,
    nameRoutes.doctorTransfer,
    nameRoutes.appointmentReassign,
    nameRoutes.doctorCalendar,
  ]);

  const routesFiltered = routes.routes[0].children?.filter((route) => {
    if (route.index) return true;
    if (!route.path) return true;
    if (errorPaths.has(route.path)) return true;

    // Normalize route path:
    // 1. Strip leading slash
    // 2. Remove dynamic segments like /:id so "/specialty/update/:id" → "specialty/update"
    const normalizedPath = route.path
      .toLowerCase()
      .replace(/^\//, "")
      .replace(/\/:[^/]+/g, "") // remove /:param anywhere in the path
      .replace(/:.*$/, ""); // remove :param at the start (edge case)

    if (errorPaths.has(route.path)) return true;
    return operations.has(normalizedPath);
  });

  routes.routes[0].children = routesFiltered as [] | undefined;

  return routes;
};
