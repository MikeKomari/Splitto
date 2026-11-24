import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, createMemoryRouter, Navigate, type RouteObject } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Onboarding from "@/pages/Onboarding";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

// The scanner pulls in Tesseract; load it only when someone scans.
const Scan = lazy(() => import("@/pages/Scan"));
const Activity = lazy(() => import("@/pages/Activity"));
const Friends = lazy(() => import("@/pages/Friends"));
const Items = lazy(() => import("@/pages/bill/Items"));
const People = lazy(() => import("@/pages/bill/People"));
const Summary = lazy(() => import("@/pages/bill/Summary"));
const HistoryDetail = lazy(() => import("@/pages/HistoryDetail"));

const Loading = () => (
  <div className="mx-auto max-w-md space-y-3 px-4 pt-16" aria-busy="true" aria-label="Loading">
    <div className="skeleton h-8 w-40 rounded-md" />
    <div className="skeleton h-40 rounded-[20px]" />
    <div className="skeleton h-20 rounded-[16px]" />
  </div>
);
const s = (el: ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

const routes: RouteObject[] = [
  { path: "/", element: <Landing /> },
  { path: "/welcome", element: <Onboarding /> },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: "activity", element: s(<Activity />) },
      { path: "friends", element: s(<Friends />) },
    ],
  },
  { path: "/scan", element: s(<Scan />) },
  { path: "/bill/items", element: s(<Items />) },
  { path: "/bill/people", element: s(<People />) },
  { path: "/bill/summary", element: s(<Summary />) },
  { path: "/history/:id", element: s(<HistoryDetail />) },
  // Old URLs from the previous version
  { path: "/landingpage", element: <Navigate to="/" replace /> },
  { path: "/onboarding", element: <Navigate to="/welcome" replace /> },
  { path: "/app/camera", element: <Navigate to="/scan" replace /> },
  { path: "*", element: <NotFound /> },
];

// The claude.ai preview build runs in a sandboxed frame without real URLs.
export const router = import.meta.env.VITE_ROUTER === "memory" ? createMemoryRouter(routes) : createBrowserRouter(routes);
