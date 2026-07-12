// Ported behavior from quarantine/lifebuild-map/packages/web/src/components/
// life-map/LifeMap.tsx (supportsWebGL, lifebuild @ bf183a3): probe for a
// WebGL 2 (or WebGL 1) context before mounting the three.js canvas so
// unsupported browsers get a plain message instead of a crash.

export function supportsWebGL(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
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
