import { resolve, sep } from "path";
import { alexandriaRuntimeOrigin } from "../effects/alexandria-client.js";

// Read-only proxy for the Alexandria runtime's public API. The PMS viewer is
// served from the pms origin (4322), so its browser code cannot call the
// Alexandria runtime (4321) directly without CORS carve-outs in the product
// server. Instead the pms server forwards a small allowlist of GET endpoints
// — the same public API PMS is allowed to read — after verifying the runtime
// on that port serves THIS project (localhost ports are shared across
// checkouts; cross-project state must never leak into studio surfaces).

const PROXIED_GET_PATHS: ReadonlySet<string> = new Set(["/api/state", "/api/library/catalog"]);

const STATE_TIMEOUT_MS = 3_000;
const FORWARD_TIMEOUT_MS = 15_000;

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { "content-type": "application/json; charset=utf-8" },
    status,
  });
}

function workspacePathOf(payload: unknown): string | null {
  if (typeof payload !== "object" || payload == null || Array.isArray(payload)) {
    return null;
  }
  const workspace = (payload as Record<string, unknown>).workspace;
  if (typeof workspace !== "object" || workspace == null || Array.isArray(workspace)) {
    return null;
  }
  const path = (workspace as Record<string, unknown>).path;
  return typeof path === "string" && path.length > 0 ? path : null;
}

// Fetch the runtime's /api/state and verify it serves `projectRoot`. Returns
// the raw state text on success (so /api/state proxying reuses the body), or
// an Error describing why the runtime cannot be used.
async function verifiedStateBody(origin: string, projectRoot: string): Promise<string | Error> {
  let body: string;
  try {
    const response = await fetch(`${origin}/api/state`, {
      signal: AbortSignal.timeout(STATE_TIMEOUT_MS),
    });
    if (!response.ok) {
      return new Error(`Alexandria runtime returned ${response.status} for /api/state`);
    }
    body = await response.text();
  } catch (error) {
    return new Error(
      `Alexandria runtime unreachable at ${origin}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Error("Alexandria /api/state returned non-JSON.");
  }
  const workspacePath = workspacePathOf(payload);
  const root = resolve(projectRoot);
  // Boundary-aware containment: a sibling checkout whose path merely extends
  // the root (…/proj vs …/proj-worktree) must NOT pass.
  const resolvedWorkspace = workspacePath == null ? null : resolve(workspacePath);
  const insideRoot =
    resolvedWorkspace != null &&
    (resolvedWorkspace === root || resolvedWorkspace.startsWith(root + sep));
  if (!insideRoot) {
    return new Error(
      `Alexandria runtime at ${origin} serves a different project (workspace ${workspacePath ?? "unknown"}).`,
    );
  }
  return body;
}

export async function handleAlexandriaProxyRequest(
  url: URL,
  request: Request,
  options: { projectRoot: string },
): Promise<Response | null> {
  if (!PROXIED_GET_PATHS.has(url.pathname) || request.method !== "GET") {
    return null;
  }

  const origin = alexandriaRuntimeOrigin();
  const stateBody = await verifiedStateBody(origin, options.projectRoot);
  if (stateBody instanceof Error) {
    return jsonError(503, stateBody.message);
  }

  if (url.pathname === "/api/state") {
    return new Response(stateBody, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    const upstream = await fetch(`${origin}${url.pathname}${url.search}`, {
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    return new Response(await upstream.arrayBuffer(), {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
      status: upstream.status,
    });
  } catch (error) {
    return jsonError(
      502,
      `Alexandria runtime request failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
