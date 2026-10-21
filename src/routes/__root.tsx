import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Outlet />
    </div>
  ),
})
