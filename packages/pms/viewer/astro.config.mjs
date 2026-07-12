import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Dev-only SPA fallback. The PMS viewer is a client-routed single page (only
// `/` is a real Astro route), but the pms server serves index.html for any
// unknown extensionless path. Mirror that in `astro dev` so deep-links
// resolve instead of 404. The browser URL is untouched — only the internal
// request is rewritten — so the shell still reads window.location.
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
  // Dev-only: the PMS viewer's /api/* calls (studio API + the Alexandria
  // read proxy) are served by the pms server, not the static dev server.
  // Proxy them to a running `pms start` (default 127.0.0.1:4322) so
  // `astro dev` gets HMR *and* live studio data. Override with PMS_HOST.
  // No effect on the production build (pms serves dist + /api from one
  // origin).
  vite: {
    plugins: [devSpaFallback],
    server: {
      proxy: {
        "/api": {
          target: process.env.PMS_HOST ?? "http://127.0.0.1:4322",
          changeOrigin: true,
        },
      },
    },
  },
});
