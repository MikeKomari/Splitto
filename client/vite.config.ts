/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  // "artifact": sandboxed claude.ai preview. Relative paths, no service worker.
  base: mode === "artifact" ? "./" : "/",
  plugins: [
    tailwindcss(),
    react(),
    mode !== "artifact" && VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
        globIgnores: ["ocr/**", "PWA/**"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // OCR engine + English model (~7 MB): fetched on first scan,
            // then served from cache so scanning works offline.
            urlPattern: ({ url }) => url.pathname.startsWith("/ocr/"),
            handler: "CacheFirst",
            options: { cacheName: "ocr-assets", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
        ],
      },
      manifest: {
        name: "Splitto",
        short_name: "Splitto",
        description: "Scan a receipt, tap who had what, done.",
        start_url: "/app",
        display: "standalone",
        background_color: "#FBFAFD",
        theme_color: "#FBFAFD",
        orientation: "portrait-primary",
        icons: [
          { src: "/Splitto_logo.png", type: "image/png", sizes: "192x192", purpose: "any" },
          { src: "/Splitto_logo.png", type: "image/png", sizes: "512x512", purpose: "any" },
        ],
        screenshots: [
          { src: "/PWA/bg-2.png", sizes: "1280x720", type: "image/png", form_factor: "wide" },
          { src: "/PWA/bg-1.png", sizes: "375x667", type: "image/png" },
        ],
        lang: "en",
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
