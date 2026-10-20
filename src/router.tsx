import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    basepath: "/FrameForge",
    scrollRestoration: true,
    defaultPreload: "intent",
  });
};
