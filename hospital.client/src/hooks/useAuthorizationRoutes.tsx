import { createBrowserRouter } from "react-router";

import { nameRoutes } from "../configs/constants";
import { Root } from "../containers/Root";
import { PortalLayout } from "../containers/PortalLayout";
import { ErrorRoutes } from "../routes/ErrorRoutes";
import { PublicRoutes } from "../routes/PublicRoutes";
import { PortalRoutes } from "../routes/PortalRoutes";
import { useAuth } from "./useAuth";

export const useAuthorizationRoutes = () => {
  const { allOperations } = useAuth();

  const routes = createBrowserRouter([
    {
      path: nameRoutes.root,
      element: <Root />,
      children: [],
    },
    {
      path: nameRoutes.root,
      element: <Root />,
      children: [...PublicRoutes, ...ErrorRoutes],
    },
    {
      path: nameRoutes.portalHome,
      element: <PortalLayout />,
      children: PortalRoutes,
    },
  ]);

  const operations = new Set(
    allOperations.map((operation) => operation.path.toLowerCase()),
  );

  const routesFiltered = routes.routes[0].children?.filter((route) =>
    operations.has(route.path ?? ""),
  );

  routes.routes[0].children = routesFiltered as [] | undefined;

  return routes;
};
