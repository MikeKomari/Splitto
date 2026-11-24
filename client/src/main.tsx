import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/sora/600.css";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
