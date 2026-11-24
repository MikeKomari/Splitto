/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * Serves api/*.ts during `npm run dev`, the same files Vercel deploys as
 * functions, so the AI scan can be tried locally with a .env.local file.
 */
function devApi(mode: string): Plugin {
  return {
    name: "splitto-dev-api",
    apply: () => !process.env.VITEST,
    configureServer(server) {
      Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
      server.middlewares.use("/api/scan", async (req, res) => {
        try {
          const mod = await server.ssrLoadModule("/api/scan.ts");
          const handler = mod[req.method ?? "GET"];
          if (!handler) return void ((res.statusCode = 405), res.end());
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const request = new Request(`http://${req.headers.host}/api/scan`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (e) {
          server.config.logger.error(String(e));
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  // "artifact": sandboxed claude.ai preview. Relative paths, no service worker.
  base: mode === "artifact" ? "./" : "/",
  plugins: [
    tailwindcss(),
    react(),
    devApi(mode),
    mode !== "artifact" && VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
        globIgnores: ["ocr/**", "PWA/**"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
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
    include: ["src/**/*.test.ts", "api/**/*.test.ts"],
  },
}));
