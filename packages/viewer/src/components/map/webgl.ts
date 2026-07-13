// Ported behavior from packages/web/src/components/
// life-map/LifeMap.tsx (supportsWebGL, lifebuild @ bf183a3): probe for a
// WebGL 2 (or WebGL 1) context before mounting the three.js canvas so
// unsupported browsers get a plain message instead of a crash.

let cachedSupport: boolean | undefined;

export function supportsWebGL(): boolean {
  if (cachedSupport !== undefined) {
    return cachedSupport;
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    // Release the throwaway probe context instead of leaving it for GC;
    // browsers cap live WebGL contexts per page.
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    cachedSupport = context != null;
  } catch {
    cachedSupport = false;
  }

  return cachedSupport;
}

/**
 * QA escape hatch for the dev route: `?webgl=off` (or `?webgl=0`) forces the
 * feature check to report no support, so the fallback message can be
 * exercised without disabling WebGL browser-wide.
 */
export function isWebGLForcedOff(search: string): boolean {
  const value = new URLSearchParams(search).get("webgl");
  return value === "off" || value === "0";
}
