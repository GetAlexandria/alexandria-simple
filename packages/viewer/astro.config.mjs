import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Dev-only SPA fallback. The viewer is a client-routed single page (only `/` is
// a real Astro route), but the ax host serves index.html for any unknown path.
// Mirror that in `astro dev` so deep-links like /studio resolve instead of 404.
// The browser URL is untouched — only the internal request is rewritten — so the
// React router still reads /studio from window.location and renders it.
const devSpaFallback = {
  apply: "serve",
  name: "viewer-dev-spa-fallback",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const path = (req.url ?? "/").split("?")[0];
      const isAssetOrApi =
        path === "/" ||
        path.startsWith("/api") ||
        path.startsWith("/@") ||
        path.startsWith("/_") ||
        path.startsWith("/src/") ||
        path.startsWith("/node_modules/") ||
        path.includes(".");
      if (req.method === "GET" && !isAssetOrApi) {
        req.url = "/";
      }
      next();
    });
  },
};

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), tailwind()],
  output: "static",
  // Dev-only: the viewer's /api/* calls are served by the ax host, not the
  // static dev server. Proxy them to a running `ax start viewer` so `astro dev`
  // gets HMR *and* live studio data. Override the target with AX_HOST.
  // No effect on the production build (ax serves dist + /api from one origin).
  vite: {
    plugins: [devSpaFallback],
    server: {
      proxy: {
        "/api": {
          target: process.env.AX_HOST ?? "http://localhost:4324",
          changeOrigin: true,
        },
      },
    },
  },
});
