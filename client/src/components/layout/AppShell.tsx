import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

/** Tab screens: content + bottom nav. Keyed by path so each screen animates in. */
export function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh bg-bg">
      <main key={pathname} className="animate-page-in mx-auto max-w-md px-4 pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
