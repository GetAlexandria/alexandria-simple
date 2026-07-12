import { useCallback, useEffect, useState } from "react";
import {
  homeRoute,
  isLegacyLibraryPath,
  parseViewerRoute,
  serializeViewerRoute,
  type ViewerNavigationAction,
  type ViewerRoute,
} from "../viewer-routes";

function readBrowserRoute(): ViewerRoute {
  if (typeof window === "undefined") {
    return homeRoute();
  }

  return parseViewerRoute(window.location.pathname, window.location.search);
}

// A legacy flat library path (predating the section tier, issue #610) parses
// to the same route as its canonical `/library/<section>/<mode>` form; this
// rewrites the visible URL to that canonical form in place, so the browser
// never shows a stale path and back/forward doesn't re-visit the legacy one.
function canonicalizeLegacyLibraryPath(): void {
  if (typeof window === "undefined" || !isLegacyLibraryPath(window.location.pathname)) {
    return;
  }

  const canonicalUrl = serializeViewerRoute(
    parseViewerRoute(window.location.pathname, window.location.search),
  );
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (canonicalUrl !== currentUrl) {
    window.history.replaceState(null, "", canonicalUrl);
  }
}

export interface ViewerRouteState {
  navigate(nextRoute: ViewerRoute, action?: ViewerNavigationAction): void;
  route: ViewerRoute;
}

export function useViewerRoute(): ViewerRouteState {
  const [route, setRoute] = useState<ViewerRoute>(() => {
    canonicalizeLegacyLibraryPath();
    return readBrowserRoute();
  });

  useEffect(() => {
    const handlePopState = (): void => {
      canonicalizeLegacyLibraryPath();
      setRoute(readBrowserRoute());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback(
    (nextRoute: ViewerRoute, action: ViewerNavigationAction = "push"): void => {
      if (typeof window === "undefined") {
        setRoute(nextRoute);
        return;
      }

      const nextUrl = serializeViewerRoute(nextRoute);
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl !== currentUrl) {
        if (action === "replace") {
          window.history.replaceState(null, "", nextUrl);
        } else {
          window.history.pushState(null, "", nextUrl);
        }
      }
      setRoute(readBrowserRoute());
    },
    [],
  );

  return { navigate, route };
}
