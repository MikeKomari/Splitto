import { createBrowserRouter } from "react-router-dom";

import billRoutes from "./bill/billRouter"; // <== Modularized
import Main from "./main/Main";
import ErrorPage from "./ErrorPage";
import Login from "./main/Login";
import Landing from "./main/Landing";
import AppLayout from "@/layout/AppLayout";
import CameraScreen from "./main/CameraScreen";
import BillLayout from "@/layout/BillLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
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
    element: <ErrorPage />,
  },
]);