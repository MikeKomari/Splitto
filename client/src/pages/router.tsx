import { createBrowserRouter } from "react-router-dom";

import billRoutes from "./bill/billRouter"; // <== Modularized
import Main from "./main/Main";
import ErrorPage from "./HandlerPage";
import Login from "./main/Login";
import Landing from "./main/Landing";
import AppLayout from "@/layout/AppLayout";
import CameraScreen from "./main/CameraScreen";
import BillLayout from "@/layout/BillLayout";
import LandingPage from "./LandingPages";
import HandlerPage from "./HandlerPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/landingpage",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/app/camera",
    element: <CameraScreen />,
  },
  {
    path: "/app/bills",
    element: <BillLayout />,
    children: billRoutes,
  },
  {
    path: "*",
    element: <HandlerPage />,
  },
]);
