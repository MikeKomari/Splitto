import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./router";
import { useThemeSync } from "@/lib/theme";

export default function App() {
  useThemeSync();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-pop)",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "var(--success)", secondary: "var(--surface)" } },
          error: { iconTheme: { primary: "var(--danger)", secondary: "var(--surface)" } },
        }}
      />
    </>
  );
}
