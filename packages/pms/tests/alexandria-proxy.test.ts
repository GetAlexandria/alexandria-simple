import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { handleAlexandriaProxyRequest } from "../src/server/alexandria-proxy.js";

// The pms server's read-only proxy of the Alexandria public API: allowlisted
// GET paths only, and never data from a runtime that serves a different
// project (localhost ports are shared across checkouts).

const tempDirs = new Set<string>();
const stubServers = new Set<ReturnType<typeof Bun.serve>>();
const originalEnv = { ...process.env };

function makeProjectRoot(): string {
  const projectRoot = mkdtempSync(join(tmpdir(), "pms-proxy-"));
  tempDirs.add(projectRoot);
  return projectRoot;
}

function serveAlexandria(options: {
  catalogStatus?: number;
  workspacePath: string;
}): ReturnType<typeof Bun.serve> {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/api/state") {
        return Response.json({
          playbook: { plays: [{ id: "source-assessment", name: "Source Assessment" }] },
          workspace: { path: options.workspacePath },
        });
      }
      if (url.pathname === "/api/library/catalog") {
        if (options.catalogStatus != null && options.catalogStatus !== 200) {
          return Response.json({ error: "catalog failure" }, { status: options.catalogStatus });
        }
        return Response.json({
          cards: [],
          libraryRoot: url.searchParams.get("libraryRoot"),
        });
      }
      return new Response("not found", { status: 404 });
    },
  });
  stubServers.add(server);
  process.env.PMS_ALEXANDRIA_ORIGIN = `http://127.0.0.1:${server.port}`;
  return server;
}

async function proxy(pathAndQuery: string, projectRoot: string, method = "GET") {
  const url = new URL(`http://127.0.0.1:4322${pathAndQuery}`);
  return handleAlexandriaProxyRequest(url, new Request(url.toString(), { method }), {
    projectRoot,
  });
}

beforeEach(() => {
  process.env.PMS_ALEXANDRIA_ORIGIN = "http://127.0.0.1:9";
});

afterEach(() => {
  for (const server of stubServers) {
    server.stop(true);
  }
  stubServers.clear();
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs.clear();
  process.env = { ...originalEnv };
});

describe("alexandria proxy allowlist", () => {
  test("returns null for paths outside the allowlist", async () => {
    const projectRoot = makeProjectRoot();
    expect(await proxy("/api/studio/registry", projectRoot)).toBeNull();
    expect(await proxy("/api/library/card?path=x", projectRoot)).toBeNull();
    expect(await proxy("/api/events", projectRoot)).toBeNull();
  });

  test("returns null for non-GET methods on allowlisted paths", async () => {
    const projectRoot = makeProjectRoot();
    expect(await proxy("/api/state", projectRoot, "POST")).toBeNull();
    expect(await proxy("/api/library/catalog", projectRoot, "POST")).toBeNull();
  });
});

describe("alexandria proxy identity guard", () => {
  test("responds 503 when the Alexandria runtime is unreachable", async () => {
    const projectRoot = makeProjectRoot();
    const response = await proxy("/api/state", projectRoot);
    expect(response?.status).toBe(503);
    const body = (await response?.json()) as { error: string };
    expect(body.error).toContain("unreachable");
  });

  test("responds 503 when the runtime serves a different project", async () => {
    const projectRoot = makeProjectRoot();
    const otherProject = makeProjectRoot();
    serveAlexandria({ workspacePath: join(otherProject, "docs", "alexandria") });
    const response = await proxy("/api/library/catalog?libraryRoot=studio/sweeps", projectRoot);
    expect(response?.status).toBe(503);
    const body = (await response?.json()) as { error: string };
    expect(body.error).toContain("different project");
  });

  test("rejects a sibling checkout whose path merely extends the project root", async () => {
    // …/proj vs …/proj-worktree: a bare startsWith prefix check would pass
    // this and leak the sibling's state — the containment must be
    // separator-aware.
    const projectRoot = makeProjectRoot();
    serveAlexandria({ workspacePath: join(`${projectRoot}-worktree`, "docs", "alexandria") });
    const response = await proxy("/api/state", projectRoot);
    expect(response?.status).toBe(503);
    const body = (await response?.json()) as { error: string };
    expect(body.error).toContain("different project");
  });
});

describe("alexandria proxy forwarding", () => {
  test("serves /api/state straight through for the right project", async () => {
    const projectRoot = makeProjectRoot();
    serveAlexandria({ workspacePath: join(projectRoot, "docs", "alexandria") });
    const response = await proxy("/api/state", projectRoot);
    expect(response?.status).toBe(200);
    const body = (await response?.json()) as {
      playbook: { plays: Array<{ id: string }> };
    };
    expect(body.playbook.plays[0]?.id).toBe("source-assessment");
  });

  test("forwards /api/library/catalog with its query string", async () => {
    const projectRoot = makeProjectRoot();
    serveAlexandria({ workspacePath: join(projectRoot, "docs", "alexandria") });
    const response = await proxy(
      "/api/library/catalog?libraryRoot=studio%2Fsweeps%2Fplaymaker-studio",
      projectRoot,
    );
    expect(response?.status).toBe(200);
    const body = (await response?.json()) as { libraryRoot: string };
    expect(body.libraryRoot).toBe("studio/sweeps/playmaker-studio");
  });

  test("passes upstream catalog failures through", async () => {
    const projectRoot = makeProjectRoot();
    serveAlexandria({
      catalogStatus: 404,
      workspacePath: join(projectRoot, "docs", "alexandria"),
    });
    const response = await proxy("/api/library/catalog?libraryRoot=missing", projectRoot);
    expect(response?.status).toBe(404);
  });
});
