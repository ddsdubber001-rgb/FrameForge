import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";

const indexRouteWithParent = indexRoute.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
});

export const routeTree = rootRoute.addChildren([
  indexRouteWithParent,
]);
