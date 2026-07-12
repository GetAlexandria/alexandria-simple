import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
  symlinkSync,
} from "fs";
import { createServer } from "net";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const cliPath = join(packageRoot, "src/cli/main.ts");
const viewerDistRoot = join(repoRoot, "packages/viewer/dist");
const viewerBuildTimeoutMs = 60_000;
const tempDirs = new Set<string>();
const mockServers = new Set<{ stop(force?: boolean): void }>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeProjectDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-viewer-"));
  tempDirs.add(dir);
  return dir;
}

function runAx(args: string[], cwd: string): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", cliPath, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function runCommand(
  command: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = process.env,
): TestCliResult {
  const result = Bun.spawnSync({
    cmd: command,
    cwd,
    env,
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

async function runCommandAsync(
  command: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<TestCliResult> {
  const proc = Bun.spawn({
    cmd: command,
    cwd,
    env,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  return {
    exitCode,
    stdout,
    stderr,
  };
}

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content, { mode: 0o755 });
}

function writeFakeFabro(path: string): void {
  writeExecutable(
    path,
    `#!/bin/sh
set -eu
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "status" ]; then
  storage=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--storage-dir" ]; then storage="$2"; shift 2; continue; fi
    shift
  done
  if [ -n "$storage" ] && [ -f "$storage/server.json" ]; then
    cat "$storage/server.json"
    exit 0
  fi
  exit 1
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "start" ]; then
  storage=""
  bind=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --storage-dir) storage="$2"; shift 2 ;;
      --bind) bind="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  mkdir -p "$storage"
  printf '{"bind":{"unix":"%s"},"pid":123}\\n' "$bind" > "$storage/server.json"
  echo "Server started"
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  echo "Logged in with dev-token"
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
  );
}

function writeInstalledCodexPlugin(
  pluginRoot: string,
  marketplaceName = "alexandria-installed",
): void {
  mkdirSync(join(pluginRoot, ".codex-plugin"), { recursive: true });
  mkdirSync(join(pluginRoot, ".agents", "plugins"), { recursive: true });
  writeFileSync(
    join(pluginRoot, ".codex-plugin", "plugin.json"),
    `${JSON.stringify(
      {
        name: "alexandria",
        version: "0.12.0",
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(pluginRoot, ".agents", "plugins", "marketplace.json"),
    `${JSON.stringify(
      {
        name: marketplaceName,
        interface: {
          displayName: "Alexandria Installed",
        },
        plugins: [
          {
            name: "alexandria",
            source: {
              source: "local",
              path: "./",
            },
            policy: {
              installation: "AVAILABLE",
              authentication: "ON_INSTALL",
            },
            category: "Coding",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

function writeCatalogFixtureLibrary(projectDir: string): void {
  const libraryRoot = join(projectDir, "docs/alexandria/library");
  mkdirSync(join(libraryRoot, "product/surfaces"), { recursive: true });
  mkdirSync(join(libraryRoot, "product/components"), { recursive: true });

  writeFileSync(
    join(libraryRoot, "product/surfaces/Surface - Library.md"),
    `---
type: Surface
prefLabel: Library
context: library
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/LibraryBrowserApp.tsx
---

## WHERE
- Contains: [[Component - Card Drawer]]
`,
  );

  writeFileSync(
    join(libraryRoot, "product/components/Component - Missing Confidence.md"),
    `---
type: Component
prefLabel: Missing Confidence
context: library
plane: Product
status: stub
proposed_by: scanner
source_evidence: docs/source.md
---`,
  );

  writeFileSync(
    join(libraryRoot, "product/components/Component - Fake Gap.md"),
    `---
type: Component
prefLabel: Fake Gap
context: library
plane: Product
status: gap
confidence: low
proposed_by: scanner
source_evidence: docs/source.md
---`,
  );

  writeFileSync(
    join(libraryRoot, "gaps.json"),
    `${JSON.stringify(
      {
        areas: [
          {
            id: "area-learning-evidence",
            label: "Evidence",
            context: "evidence",
            plane: "Learning",
          },
        ],
        gaps: [
          {
            id: "gap-product-engine-view",
            label: "Engine View",
            context: "library",
            plane: "Product",
            reason: "No Product-plane engine view has been confirmed yet.",
            confidence: "medium",
            provenance: {
              label: "EL4 scan",
              sourceRefs: ["docs/source.md"],
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

function writeSingleCardLibrary(projectDir: string, relativeRoot: string, cardId: string): void {
  const libraryRoot = join(projectDir, relativeRoot);
  mkdirSync(join(libraryRoot, "product/surfaces"), { recursive: true });
  writeFileSync(join(libraryRoot, "library.json"), '{"schemaVersion":"product-card.v1"}\n');
  writeFileSync(
    join(libraryRoot, "product/surfaces", `${cardId}.md`),
    `---
type: Surface
prefLabel: ${cardId}
context: library
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/LibraryBrowserApp.tsx
---

## WHAT

${cardId}.
`,
  );
}

function productCardMarkdown(input: {
  context?: string;
  extra?: string;
  prefLabel: string;
  type: string;
}): string {
  return `---
type: ${input.type}
prefLabel: ${input.prefLabel}
context: ${input.context ?? "playbook"}
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - packages/ax/tests/viewer.test.ts
${input.extra == null ? "" : `${input.extra.trimEnd()}\n`}---

## WHAT
${input.prefLabel} exists.

## WHERE
It lives in the test library.

## HOW
It is filled by test data.
`;
}

function writeWorkflowCardFlowLibrary(projectDir: string): void {
  const libraryRoot = join(projectDir, "docs/alexandria/library");
  mkdirSync(join(libraryRoot, "playbook/Entity"), { recursive: true });
  mkdirSync(join(libraryRoot, "playbook/Mechanism"), { recursive: true });
  writeFileSync(join(libraryRoot, "library.json"), '{"schemaVersion":"product-card.v1"}\n');
  writeFileSync(
    join(libraryRoot, "playbook/Entity/Entity - Play Run.md"),
    productCardMarkdown({
      extra: `altitude: aggregate
flow:
  - activity: Lease the session connection
    doer: Monitor
    stateAfter: connected
    refs: [Entity - Session, Mechanism - Monitor]`,
      prefLabel: "Play Run",
      type: "Entity",
    }),
  );
  writeFileSync(
    join(libraryRoot, "playbook/Entity/Entity - Session.md"),
    productCardMarkdown({ prefLabel: "Session", type: "Entity" }),
  );
  writeFileSync(
    join(libraryRoot, "playbook/Mechanism/Mechanism - Monitor.md"),
    productCardMarkdown({ prefLabel: "Monitor", type: "Mechanism" }),
  );
  writeFileSync(join(libraryRoot, "workflows.json"), "{ malformed sidecar json\n");
}

function compilePackagedAx(): string {
  const packageDir = makeProjectDir();
  const compiledDir = join(packageDir, "bin/.compiled");
  const compiledAx = join(compiledDir, "ax");
  const packagedViewerDist = join(packageDir, "packages/viewer/dist");
  mkdirSync(compiledDir, { recursive: true });
  cpSync(viewerDistRoot, packagedViewerDist, { recursive: true });

  const compileResult = runCommand(
    ["bun", "build", "--compile", cliPath, "--outfile", compiledAx],
    repoRoot,
  );
  expect(compileResult.exitCode).toBe(0);
  expect(existsSync(compiledAx)).toBeTrue();

  return compiledAx;
}

function writeFakeCodexAppServer(path: string, callsFile: string): void {
  writeExecutable(
    path,
    `#!/usr/bin/env bun
import { appendFileSync } from "fs";

const callsFile = ${JSON.stringify(callsFile)};
const args = process.argv.slice(2);
appendFileSync(callsFile, JSON.stringify(args) + "\\n");

if (args[0] === "plugin") {
  process.exit(0);
}

if (args[0] !== "app-server") {
  console.error("unexpected codex args: " + args.join(" "));
  process.exit(2);
}

const listenIndex = args.indexOf("--listen");
const endpoint = args[listenIndex + 1];
const url = new URL(endpoint);
const server = Bun.serve({
  hostname: url.hostname,
  port: Number(url.port),
  fetch(request, server) {
    if (server.upgrade(request)) return undefined;
    return new Response("Expected WebSocket upgrade.", { status: 426 });
  },
  websocket: {
    message(ws, message) {
      const request = JSON.parse(typeof message === "string" ? message : message.toString("utf8"));
      if (typeof request.id !== "number") return;
      ws.send(JSON.stringify({
        id: request.id,
        result: request.method === "thread/loaded/list" ? { data: [], nextCursor: null } : {}
      }));
    }
  }
});
const stop = () => {
  server.stop(true);
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
await new Promise(() => {});
`,
  );
}

function readCodexCalls(path: string): string[][] {
  if (!existsSync(path)) {
    return [];
  }

  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as string[]);
}

function messageText(value: string | Buffer): string {
  return typeof value === "string" ? value : value.toString("utf8");
}

function startMinimalCodexAppServer(): string {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request, server) {
      if (server.upgrade(request)) {
        return undefined;
      }

      return new Response("Expected WebSocket upgrade.", { status: 426 });
    },
    websocket: {
      message(ws, message) {
        const request = JSON.parse(messageText(message)) as {
          id?: number;
          method?: string;
        };
        if (typeof request.id !== "number") {
          return;
        }

        ws.send(
          JSON.stringify({
            id: request.id,
            result: request.method === "thread/loaded/list" ? { data: [], nextCursor: null } : {},
          }),
        );
      },
    },
  });
  mockServers.add(server);
  return `ws://127.0.0.1:${server.port}`;
}

async function getFreePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address == null || typeof address === "string") {
          reject(new Error("Could not allocate a test port."));
          return;
        }
        resolvePort(address.port);
      });
    });
  });
}

async function waitForText(url: string): Promise<string> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
      lastError = new Error(`Unexpected status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 100));
  }

  throw lastError instanceof Error ? lastError : new Error("Timed out waiting for viewer.");
}

async function waitForJsonOutput<T>(
  stream: ReadableStream<Uint8Array>,
  label: string,
  timeoutMs = 10_000,
): Promise<T> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let stdout = "";
  const startedAt = Date.now();
  let lastParseError: unknown;
  // One read claim at a time: an abandoned reader.read() still consumes the
  // next chunk when it lands, so racing a FRESH read against each timeout
  // silently swallows any chunk that arrives after ~250ms.
  let pendingRead: ReturnType<typeof reader.read> | null = null;

  try {
    while (Date.now() - startedAt < timeoutMs) {
      pendingRead ??= reader.read();
      const read = await Promise.race([
        pendingRead,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("read timeout")), 250)),
      ]).catch((error: unknown) => {
        if (error instanceof Error && error.message === "read timeout") {
          return null;
        }
        throw error;
      });

      if (read == null) {
        continue;
      }
      pendingRead = null;

      if (read.done) {
        break;
      }

      stdout += decoder.decode(read.value, { stream: true });
      try {
        return JSON.parse(stdout) as T;
      } catch (error) {
        lastParseError = error;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const detail =
    lastParseError instanceof Error ? ` Last parse error: ${lastParseError.message}` : "";
  throw new Error(`Timed out waiting for ${label}.${detail}`);
}

async function waitForCondition(check: () => boolean, label: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 10_000) {
    if (check()) {
      return;
    }
    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 100));
  }

  throw new Error(`Timed out waiting for ${label}.`);
}

beforeAll(() => {
  const result = Bun.spawnSync({
    cmd: ["pnpm", "--filter", "@alexandria/viewer", "run", "build"],
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });

  if (result.exitCode !== 0) {
    throw new Error(
      [
        `viewer build failed with exit code ${result.exitCode}`,
        result.stdout.toString(),
        result.stderr.toString(),
      ].join("\n"),
    );
  }

  expect(existsSync(join(viewerDistRoot, "index.html"))).toBeTrue();
}, viewerBuildTimeoutMs);

afterEach(() => {
  for (const server of mockServers) {
    server.stop(true);
  }
  mockServers.clear();

  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("ax start viewer", () => {
  test("rejects uninitialized projects", () => {
    const projectDir = makeProjectDir();
    const result = runAx(["start", "viewer"], projectDir);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Run `ax init` first");
  });

  test("rejects maintainer-style build as an end-user command", () => {
    const projectDir = makeProjectDir();
    const result = runAx(["start", "viewer", "build"], projectDir);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Unknown option for ax start viewer: build");
  });

  test("serves the bundled viewer and runtime health endpoint", async () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);
    const initResult = runAx(["init"], projectDir);
    expect(initResult.exitCode).toBe(0);
    cpSync(join(repoRoot, "docs/alexandria/library"), join(projectDir, "docs/alexandria/library"), {
      recursive: true,
    });

    const port = await getFreePort();
    const viewerProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "viewer",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--json",
      ],
      cwd: projectDir,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      const html = await waitForText(`http://127.0.0.1:${port}/`);
      expect(html).toContain("Alexandria Library");
      expect(html).toContain("LibraryBrowserApp");

      for (const deepLinkPath of [
        "/playbook",
        "/library",
        "/library/empty",
        "/library/folders?open=product%2Fagents",
      ]) {
        const deepLinkResponse = await fetch(`http://127.0.0.1:${port}${deepLinkPath}`);
        const deepLinkHtml = await deepLinkResponse.text();
        expect(deepLinkResponse.status).toBe(200);
        expect(deepLinkHtml).toContain("Alexandria Library");
        expect(deepLinkHtml).toContain("LibraryBrowserApp");
        expect(deepLinkHtml).not.toContain("Not found");
      }

      const unknownApiResponse = await fetch(`http://127.0.0.1:${port}/api/unknown-viewer-route`);
      expect(unknownApiResponse.status).toBe(404);

      const healthResponse = await fetch(`http://127.0.0.1:${port}/api/health`);
      const health = (await healthResponse.json()) as {
        libraryRoot: string;
        pid: number;
        projectRoot: string;
        status: string;
        workspacePath: string;
      };

      expect(health.status).toBe("ok");
      expect(health.projectRoot).toBe(resolvedProjectDir);
      expect(health.libraryRoot).toBe(join(resolvedProjectDir, "docs/alexandria/library"));
      expect(health.workspacePath).toBe(join(resolvedProjectDir, "docs/alexandria"));

      const ledgerResponse = await fetch(`http://127.0.0.1:${port}/api/alexandria/ledger`);
      const ledger = (await ledgerResponse.json()) as { events: unknown[] };
      expect(ledger.events).toEqual([]);

      const libraryGraphResponse = await fetch(`http://127.0.0.1:${port}/api/library/graph`);
      const libraryGraph = (await libraryGraphResponse.json()) as {
        cards: Array<{ id: string; subfolder: string; territory: string }>;
        edges: unknown[];
        meta: {
          cardCount: number;
          edgeCount: number;
          subfolders: string[];
          territories: string[];
        };
      };
      // Merged census: main's 133 plus the branch's L2-L4 shelves, the arcs
      // shelf (LP-W4b), and the knowledge-organization plane cards (#730/#733).
      expect(libraryGraph.meta.cardCount).toBe(171);
      expect(libraryGraph.cards).toHaveLength(libraryGraph.meta.cardCount);
      expect(libraryGraph.edges.length).toBe(libraryGraph.meta.edgeCount);
      expect(libraryGraph.meta.territories).toContain("viewer");
      expect(libraryGraph.meta.subfolders).toContain("viewer/Surface");

      const realCatalogResponse = await fetch(`http://127.0.0.1:${port}/api/library/catalog`);
      expect(realCatalogResponse.status).toBe(200);
      const realCatalog = (await realCatalogResponse.json()) as {
        meta: {
          cardCount: number;
          metadataIssues: string[];
        };
        workflows?: Array<{
          id: string;
          plane?: string;
          steps: Array<{
            activity: string;
            cardRefs?: string[];
            context: string;
            doer?: string;
            evidence?: string;
            gate?: boolean;
            order: number;
            stateAfter?: string;
          }>;
          unit: string;
        }>;
      };
      // Workflows are card-sourced since the sidecar was retired (#690):
      // the Play Run aggregate's flow: block projects as entity-play-run.
      expect(realCatalog.meta.cardCount).toBe(171);
      expect(realCatalog.meta.metadataIssues).toEqual([]);
      expect(realCatalog.workflows).toHaveLength(1);
      const playRunWorkflow = realCatalog.workflows?.[0];
      expect(playRunWorkflow).toMatchObject({
        id: "entity-play-run",
        unit: "Play Run",
      });
      expect(playRunWorkflow?.steps).toHaveLength(26);
      // Per-step context/gate/evidence restored from the retired sidecar's
      // data: the lanes are surfaces (viewer, triggers, playbook, library,
      // ledger, canvas), not the owning card's single context.
      expect(playRunWorkflow?.steps[0]).toMatchObject({
        activity: "Initialize the project",
        cardRefs: ["Entity - Project", "Surface - AX CLI", "Entity - Alexandria Config"],
        context: "viewer",
        doer: "Director",
        order: 0,
        stateAfter: "configured",
      });
      expect(playRunWorkflow?.steps).toContainEqual(
        expect.objectContaining({
          activity: "Lease the session connection",
          cardRefs: ["Entity - Session", "Entity - Connection Lease", "Mechanism - Monitor"],
          context: "triggers",
          doer: "Monitor",
          order: 2,
          stateAfter: "connected",
        }),
      );
      expect(playRunWorkflow?.steps.at(-1)).toMatchObject({
        activity: "Rule on the whole draft library",
        cardRefs: ["Mechanism - Confirmation Gate", "Entity - Alexandria Product Library"],
        context: "library",
        doer: "Director",
        gate: true,
        order: 25,
        stateAfter: "confirmed",
      });
      const laneContexts = [...new Set(playRunWorkflow?.steps.map((step) => step.context))];
      expect(laneContexts).toEqual([
        "viewer",
        "triggers",
        "playbook",
        "library",
        "ledger",
        "canvas",
      ]);
      expect(playRunWorkflow?.steps.filter((step) => step.gate === true)).toHaveLength(7);

      const firstCard = libraryGraph.cards[0];
      expect(firstCard).toBeDefined();
      if (firstCard != null) {
        const cardDetailParams = new URLSearchParams({
          subfolder: firstCard.subfolder,
          territory: firstCard.territory,
        });
        const cardDetailResponse = await fetch(
          `http://127.0.0.1:${port}/api/library/cards/${encodeURIComponent(firstCard.id)}?${cardDetailParams.toString()}`,
        );
        const cardDetail = (await cardDetailResponse.json()) as {
          content?: unknown;
          id?: unknown;
        };
        expect(cardDetailResponse.status).toBe(200);
        expect(cardDetail.id).toBe(firstCard.id);
        expect(typeof cardDetail.content).toBe("string");
        expect(String(cardDetail.content).length).toBeGreaterThan(0);
      }

      const duplicate = runAx(
        ["start", "viewer", "--host", "127.0.0.1", "--port", "0", "--json"],
        projectDir,
      );
      expect(duplicate.exitCode).toBe(1);
      expect(duplicate.stderr).toContain("already running");
      expect(duplicate.stderr).toContain(String(health.pid));
      expect(duplicate.stderr).toContain(`http://127.0.0.1:${port}/`);
      expect(duplicate.stderr).toContain(join(resolvedProjectDir, "docs/alexandria"));

      const append = runAx(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "play.started",
          "--payload",
          JSON.stringify({
            agentId: "raven",
            playId: "source-assessment",
            playRunId: "run-viewer-1",
          }),
          "--json",
        ],
        projectDir,
      );
      expect(append.exitCode).toBe(0);
      const appendOutput = JSON.parse(append.stdout) as {
        runtime: { lifecycle: string; url: string };
      };
      expect(appendOutput.runtime.lifecycle).toBe("existing");
      expect(appendOutput.runtime.url).toBe(`http://127.0.0.1:${port}/`);

      const eventsResponse = await fetch(`http://127.0.0.1:${port}/api/events?limit=1`);
      const events = (await eventsResponse.json()) as {
        returnedCount: number;
      };
      expect(events.returnedCount).toBe(1);

      const graphResponse = await fetch(
        `http://127.0.0.1:${port}/api/alexandria/workflows/source-assessment/graph.svg`,
      );
      expect(graphResponse.headers.get("content-type")).toContain("image/svg+xml");
      expect(await graphResponse.text()).toContain("<svg");

      // The graph endpoint is parameterized per play, not hardcoded to one.
      const ftpGraph = await fetch(
        `http://127.0.0.1:${port}/api/alexandria/workflows/frame-the-problem/graph.svg`,
      );
      expect(ftpGraph.headers.get("content-type")).toContain("image/svg+xml");
      expect(await ftpGraph.text()).toContain("<svg");

      const unknownGraph = await fetch(
        `http://127.0.0.1:${port}/api/alexandria/workflows/not-a-play/graph.svg`,
      );
      expect(unknownGraph.status).toBe(404);
    } finally {
      viewerProcess.kill("SIGTERM");
      await viewerProcess.exited;
    }

    const stdout = await new Response(viewerProcess.stdout).text();
    const output = JSON.parse(stdout) as { status: string; url: string };
    expect(output.status).toBe("running");
    expect(output.url).toBe(`http://127.0.0.1:${port}/`);
  });

  test("passes --library-root through to no-query runtime library routes", async () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);
    const initResult = runAx(["init"], projectDir);
    expect(initResult.exitCode).toBe(0);
    writeSingleCardLibrary(projectDir, "config-library", "Card - Config Root");
    writeSingleCardLibrary(projectDir, "override-library", "Card - Override Root");
    writeSingleCardLibrary(projectDir, "query-library", "Card - Query Root");
    const configPath = join(projectDir, ".alexandria/alexandria-config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    config.library = { root: "config-library" };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

    const port = await getFreePort();
    const viewerProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "viewer",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--library-root",
        "override-library",
        "--json",
      ],
      cwd: projectDir,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      await waitForText(`http://127.0.0.1:${port}/api/health`);
      const health = (await (await fetch(`http://127.0.0.1:${port}/api/health`)).json()) as {
        libraryRoot: string;
      };
      expect(health.libraryRoot).toBe(join(resolvedProjectDir, "override-library"));

      const catalog = (await (
        await fetch(`http://127.0.0.1:${port}/api/library/catalog`)
      ).json()) as { cards: Array<{ id: string }> };
      expect(catalog.cards.map((card) => card.id)).toEqual(["Card - Override Root"]);

      const queryCatalog = (await (
        await fetch(`http://127.0.0.1:${port}/api/library/catalog?libraryRoot=query-library`)
      ).json()) as { cards: Array<{ id: string }> };
      expect(queryCatalog.cards.map((card) => card.id)).toEqual(["Card - Query Root"]);
    } finally {
      viewerProcess.kill("SIGTERM");
      await viewerProcess.exited;
      await new Response(viewerProcess.stdout).text();
      await new Response(viewerProcess.stderr).text();
    }
  });

  test("serves the library catalog projection with cards, gaps, and metadata issues", async () => {
    const projectDir = makeProjectDir();
    const initResult = runAx(["init"], projectDir);
    expect(initResult.exitCode).toBe(0);
    writeCatalogFixtureLibrary(projectDir);

    const port = await getFreePort();
    const viewerProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "viewer",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--json",
      ],
      cwd: projectDir,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      await waitForText(`http://127.0.0.1:${port}/api/health`);

      const catalogResponse = await fetch(`http://127.0.0.1:${port}/api/library/catalog`);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        areas: Array<{ cardIds: string[]; gapIds: string[]; id: string; status: string }>;
        cards: Array<{
          confidence?: string;
          id: string;
          provenance?: { label: string; sourceRefs: string[] };
        }>;
        edges: Array<{ from: string; to: string; type: string }>;
        gaps: Array<{ id: string; label: string }>;
        meta: {
          cardCount: number;
          edgeCount: number;
          gapCount: number;
          metadataIssues: string[];
          planes: string[];
        };
      };

      expect(catalog.meta.cardCount).toBe(2);
      expect(catalog.cards).toHaveLength(2);
      expect(catalog.cards).toContainEqual(
        expect.objectContaining({
          confidence: "high",
          id: "Surface - Library",
          provenance: expect.objectContaining({
            label: "scanner",
            sourceRefs: ["packages/viewer/src/components/library/LibraryBrowserApp.tsx"],
          }),
        }),
      );
      expect(catalog.cards).toContainEqual(
        expect.objectContaining({
          id: "Component - Missing Confidence",
        }),
      );
      expect(catalog.gaps).toHaveLength(1);
      expect(catalog.gaps[0]).toMatchObject({
        id: "gap-product-engine-view",
        label: "Engine View",
      });
      expect(catalog.cards.some((card) => card.id === "gap-product-engine-view")).toBeFalse();
      expect(catalog.edges).toHaveLength(1);
      expect(catalog.edges[0]).toMatchObject({
        from: "Surface - Library",
        to: "Component - Card Drawer",
        type: "contains",
      });
      expect(catalog.meta).toMatchObject({
        edgeCount: 1,
        gapCount: 1,
        planes: ["product", "Learning", "Product"],
      });
      expect(catalog.areas).toContainEqual(
        expect.objectContaining({
          cardIds: [],
          gapIds: [],
          id: "area-learning-evidence",
          status: "empty",
        }),
      );
      expect(catalog.meta.metadataIssues.join("\n")).toContain(
        'status "gap" is not one of stub, confirmed, deprecated',
      );
    } finally {
      viewerProcess.kill("SIGTERM");
      await viewerProcess.exited;
    }
  });

  test("serves card-derived workflows and ignores malformed workflows.json when card flow exists", async () => {
    const projectDir = makeProjectDir();
    const initResult = runAx(["init"], projectDir);
    expect(initResult.exitCode).toBe(0);
    writeWorkflowCardFlowLibrary(projectDir);

    const port = await getFreePort();
    const viewerProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "viewer",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--json",
      ],
      cwd: projectDir,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      await waitForText(`http://127.0.0.1:${port}/api/health`);

      const catalogResponse = await fetch(`http://127.0.0.1:${port}/api/library/catalog`);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        meta: { metadataIssues: string[] };
        workflows?: Array<{
          id: string;
          plane?: string;
          steps: Array<{
            activity: string;
            cardRefs?: string[];
            context: string;
            doer?: string;
            evidence?: string;
            gate?: boolean;
            order: number;
            stateAfter?: string;
          }>;
          unit: string;
        }>;
      };

      expect(catalog.meta.metadataIssues).toEqual([]);
      expect(catalog.workflows).toEqual([
        {
          id: "entity-play-run",
          plane: "product",
          unit: "Play Run",
          steps: [
            {
              activity: "Lease the session connection",
              cardRefs: ["Entity - Session", "Mechanism - Monitor"],
              context: "playbook",
              doer: "Monitor",
              order: 0,
              stateAfter: "connected",
            },
          ],
        },
      ]);
    } finally {
      viewerProcess.kill("SIGTERM");
      await viewerProcess.exited;
    }
  });

  test("start all starts server and viewer without monitor events", async () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeExecutable(
      fakeFabro,
      `#!/bin/sh
set -eu
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "status" ]; then
  storage=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--storage-dir" ]; then storage="$2"; shift 2; continue; fi
    shift
  done
  if [ -n "$storage" ] && [ -f "$storage/server.json" ]; then
    cat "$storage/server.json"
    exit 0
  fi
  exit 1
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "start" ]; then
  storage=""
  bind=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --storage-dir) storage="$2"; shift 2 ;;
      --bind) bind="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  mkdir -p "$storage"
  printf '{"bind":{"unix":"%s"},"pid":123}\\n' "$bind" > "$storage/server.json"
  echo "Server started"
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  echo "Logged in with dev-token"
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
    );

    const initResult = runCommand(["bun", cliPath, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    const startProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "all",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--no-codex",
        "--json",
      ],
      cwd: projectDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });

    const outputPromise = waitForJsonOutput<{
      server: {
        debugWeb: { requested: boolean; status: string };
        fabroBin: string;
        status: string;
      };
      status: string;
      viewer: { status: string; url: string };
      codex: { status: string };
    }>(startProcess.stdout, "start all output");
    const stderrPromise = new Response(startProcess.stderr).text();

    let parsedOutput: Awaited<typeof outputPromise>;
    try {
      const health = JSON.parse(await waitForText(`http://127.0.0.1:${port}/api/health`)) as {
        projectRoot: string;
        status: string;
      };
      expect(health.status).toBe("ok");
      expect(health.projectRoot).toBe(realpathSync(projectDir));

      const html = await waitForText(`http://127.0.0.1:${port}/`);
      expect(html).toContain("Alexandria Library");
      // Read the startup JSON before terminating — a kill can truncate the
      // piped stdout before the flush (racy on CI).
      parsedOutput = await outputPromise;
    } finally {
      startProcess.kill("SIGTERM");
      await startProcess.exited;
    }

    const stderr = await stderrPromise;
    const output = parsedOutput as {
      server: {
        debugWeb: { requested: boolean; status: string };
        fabroBin: string;
        status: string;
      };
      status: string;
      viewer: { status: string; url: string };
      codex: { status: string };
    };
    expect(output.status).toBe("running");
    expect(output.server.status).toBe("running");
    expect(output.server.fabroBin).toBe(fakeFabro);
    expect(output.server.debugWeb).toMatchObject({
      requested: false,
      status: "disabled",
    });
    expect(output.viewer.status).toBe("running");
    expect(output.viewer.url).toBe(`http://127.0.0.1:${port}/`);
    expect(output.codex.status).toBe("disabled");
    expect(stderr).toBe("");

    const ledger = readFileSync(join(projectDir, "docs/alexandria/ledger/events.jsonl"), "utf8");
    expect(ledger).not.toContain("session.wake.");
  }, 30_000);

  test("start all starts a managed Codex app-server by default", async () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const projectLink = join(toolDir, "project-link");
    const fakeFabro = join(toolDir, "fabro");
    const fakeCodex = join(toolDir, "codex");
    const installedPluginRoot = join(projectDir, ".claude", "plugins", "alexandria");
    symlinkSync(projectDir, projectLink, "dir");
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_CODEX_BIN: fakeCodex,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_CODEX_THREAD_CWD: projectLink,
      ALEXANDRIA_FAKE_CODEX_THREAD_ID: "codex-test-thread",
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeExecutable(
      fakeFabro,
      `#!/bin/sh
set -eu
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "status" ]; then
  storage=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--storage-dir" ]; then storage="$2"; shift 2; continue; fi
    shift
  done
  if [ -n "$storage" ] && [ -f "$storage/server.json" ]; then
    cat "$storage/server.json"
    exit 0
  fi
  exit 1
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "start" ]; then
  storage=""
  bind=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --storage-dir) storage="$2"; shift 2 ;;
      --bind) bind="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  mkdir -p "$storage"
  printf '{"bind":{"unix":"%s"},"pid":123}\\n' "$bind" > "$storage/server.json"
  echo "Server started"
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  echo "Logged in with dev-token"
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
    );
    writeExecutable(
      fakeCodex,
      `#!/usr/bin/env bun
const args = process.argv.slice(2);
const threadId = process.env.ALEXANDRIA_FAKE_CODEX_THREAD_ID;
const threadCwd = process.env.ALEXANDRIA_FAKE_CODEX_THREAD_CWD;
if (args[0] === "plugin") {
  process.exit(0);
}
if (!args.includes("app-server")) {
  console.error("unexpected codex args: " + args.join(" "));
  process.exit(2);
}
const listenIndex = args.indexOf("--listen");
const endpoint = args[listenIndex + 1];
const url = new URL(endpoint);
const server = Bun.serve({
  hostname: url.hostname,
  port: Number(url.port),
  fetch(request, server) {
    if (server.upgrade(request)) return undefined;
    return new Response("Expected WebSocket upgrade.", { status: 426 });
  },
  websocket: {
    message(ws, message) {
      const request = JSON.parse(typeof message === "string" ? message : message.toString("utf8"));
      if (typeof request.id !== "number") return;
      let result = {};
      if (request.method === "thread/loaded/list") {
        result = { data: threadId ? [threadId] : [], nextCursor: null };
      }
      if (request.method === "thread/read") {
        result = { thread: { id: threadId, cwd: threadCwd } };
      }
      ws.send(JSON.stringify({
        id: request.id,
        result
      }));
    }
  }
});
const stop = () => {
  server.stop(true);
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
await new Promise(() => {});
`,
    );
    writeInstalledCodexPlugin(installedPluginRoot);

    const initResult = runCommand(["bun", cliPath, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    const startProcess = Bun.spawn({
      cmd: [
        "bun",
        cliPath,
        "start",
        "all",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--json",
      ],
      cwd: projectDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });

    try {
      const health = JSON.parse(await waitForText(`http://127.0.0.1:${port}/api/health`)) as {
        status: string;
      };
      expect(health.status).toBe("ok");
      await waitForText(`http://127.0.0.1:${port}/`);
      await waitForCondition(() => {
        const subscriptions = runCommand(
          ["bun", cliPath, "inspect", "subscriptions", "list", "--json"],
          projectDir,
          env,
        );
        return (
          subscriptions.exitCode === 0 &&
          subscriptions.stdout.includes("host:codex:codex-test-thread:reviews")
        );
      }, "Codex subscription reconciliation");

      const append = runCommand(
        [
          "bun",
          cliPath,
          "inspect",
          "events",
          "append",
          "--type",
          "canvas.review.requested",
          "--payload",
          JSON.stringify({
            prompt: "Review managed Codex wake.",
            reviewId: "managed-codex-review",
            stepId: "managed-codex-step",
          }),
          "--idempotency-key",
          "viewer:test:managed-codex-review",
          "--json",
        ],
        projectDir,
        env,
      );
      expect(append.exitCode).toBe(0);

      await waitForCondition(() => {
        const events = runCommand(
          ["bun", cliPath, "inspect", "events", "list", "--json", "--limit", "20"],
          projectDir,
          env,
        );
        return events.exitCode === 0 && events.stdout.includes("session.wake.delivered");
      }, "managed Codex wake delivery");
    } finally {
      startProcess.kill("SIGTERM");
      await startProcess.exited;
    }

    const stdout = await new Response(startProcess.stdout).text();
    const stderr = await new Response(startProcess.stderr).text();
    const output = JSON.parse(stdout) as {
      codex: { endpoint: string; status: string };
      status: string;
    };

    expect(stderr).toBe("");
    expect(output.status).toBe("running");
    expect(output.codex.status).toBe("running");
    expect(output.codex.endpoint).toStartWith("ws://127.0.0.1:");
  }, 15_000);

  test("compiled start all resolves Codex marketplace from an installed plugin payload", async () => {
    const compiledAx = compilePackagedAx();
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const homeDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fakeCodex = join(toolDir, "codex");
    const codexCalls = join(toolDir, "codex-calls.jsonl");
    const installedPluginRoot = join(projectDir, ".claude", "plugins", "alexandria");
    writeFakeFabro(fakeFabro);
    writeFakeCodexAppServer(fakeCodex, codexCalls);
    writeInstalledCodexPlugin(installedPluginRoot);

    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_CODEX_BIN: fakeCodex,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      HOME: homeDir,
    };

    const initResult = runCommand([compiledAx, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    let codexPort = await getFreePort();
    while (codexPort === port) {
      codexPort = await getFreePort();
    }
    const startProcess = Bun.spawn({
      cmd: [
        compiledAx,
        "start",
        "all",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--codex-port",
        String(codexPort),
        "--json",
      ],
      cwd: projectDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });
    const outputPromise = waitForJsonOutput<{
      codex: { endpoint: string; status: string };
      server: { status: string };
      status: string;
      viewer: { status: string; url: string };
    }>(startProcess.stdout, "compiled start all output");
    const stderrPromise = new Response(startProcess.stderr).text();

    let output: {
      codex: { endpoint: string; status: string };
      server: { status: string };
      status: string;
      viewer: { status: string; url: string };
    };
    try {
      const health = JSON.parse(await waitForText(`http://127.0.0.1:${port}/api/health`)) as {
        status: string;
      };
      expect(health.status).toBe("ok");
      await waitForCondition(
        () => readCodexCalls(codexCalls).some((call) => call[0] === "app-server"),
        "installed Codex app-server launch",
      );
      // Read the startup JSON from the live stream BEFORE terminating: with
      // stdout piped, a SIGTERM can drop block-buffered output on Linux, so
      // parsing after exit races the flush (seen on CI, not macOS).
      output = await outputPromise;
    } finally {
      startProcess.kill("SIGTERM");
      await startProcess.exited;
    }

    const stderr = await stderrPromise;
    expect(stderr).toBe("");
    expect(output.status).toBe("running");
    expect(output.server.status).toBe("running");
    expect(output.viewer.status).toBe("running");
    expect(output.viewer.url).toBe(`http://127.0.0.1:${port}/`);
    expect(output.codex.status).toBe("running");
    expect(output.codex.endpoint).toBe(`ws://127.0.0.1:${codexPort}`);
    const resolvedInstalledPluginRoot = realpathSync(installedPluginRoot);
    expect(readCodexCalls(codexCalls)).toContainEqual([
      "plugin",
      "marketplace",
      "add",
      resolvedInstalledPluginRoot,
    ]);
    expect(readCodexCalls(codexCalls)).toContainEqual([
      "plugin",
      "add",
      "alexandria",
      "--marketplace",
      "alexandria-installed",
    ]);
  }, 30_000);

  // A missing Codex CLI degrades `start all` to a warning instead of taking
  // the orchestration server and viewer down (v0.16.0 release-test fix): the
  // process stays up, and the JSON output carries the Codex-specific warning.
  test("start all reports a missing Codex CLI separately from marketplace metadata", async () => {
    const compiledAx = compilePackagedAx();
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const homeDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const missingCodex = join(toolDir, "missing-codex");
    const installedPluginRoot = join(projectDir, ".claude", "plugins", "alexandria");
    writeFakeFabro(fakeFabro);
    writeInstalledCodexPlugin(installedPluginRoot);

    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_CODEX_BIN: missingCodex,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      HOME: homeDir,
    };

    const initResult = runCommand([compiledAx, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    const startProcess = Bun.spawn({
      cmd: [compiledAx, "start", "all", "--port", String(port), "--json"],
      cwd: projectDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });
    const outputPromise = waitForJsonOutput<{
      codex: { status: string; warning?: string };
      status: string;
    }>(startProcess.stdout, "start all output");
    const stderrPromise = new Response(startProcess.stderr).text();

    let output: { codex: { status: string; warning?: string }; status: string };
    try {
      const health = JSON.parse(await waitForText(`http://127.0.0.1:${port}/api/health`)) as {
        status: string;
      };
      expect(health.status).toBe("ok");
      // Read the startup JSON before terminating — SIGTERM can drop
      // block-buffered piped stdout on Linux (seen on CI, not macOS).
      output = await outputPromise;
    } finally {
      startProcess.kill("SIGTERM");
      await startProcess.exited;
    }

    const stderr = await stderrPromise;
    expect(stderr).toBe("");
    expect(output.status).toBe("running");
    expect(output.codex.status).toBe("unavailable");
    const warning = output.codex.warning ?? "";
    expect(warning).toContain("Could not find the Codex CLI");
    expect(warning).toContain(missingCodex);
    expect(warning).toContain("ALEXANDRIA_CODEX_BIN");
    expect(warning).toContain("ax start all --no-codex");
    expect(warning).not.toContain("Could not locate the Alexandria Codex plugin marketplace");
  }, 30_000);

  // Same fail-soft contract for missing marketplace metadata: core services
  // stay up, and Codex is never invoked.
  test("start all reports missing installed Alexandria Codex marketplace metadata", async () => {
    const compiledAx = compilePackagedAx();
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const homeDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fakeCodex = join(toolDir, "codex");
    const codexCalls = join(toolDir, "codex-calls.jsonl");
    mkdirSync(join(projectDir, ".claude", "plugins", "alexandria"), { recursive: true });
    writeFakeFabro(fakeFabro);
    writeFakeCodexAppServer(fakeCodex, codexCalls);

    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_CODEX_BIN: fakeCodex,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      HOME: homeDir,
    };

    const initResult = runCommand([compiledAx, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    const startProcess = Bun.spawn({
      cmd: [compiledAx, "start", "all", "--port", String(port), "--json"],
      cwd: projectDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });
    const outputPromise = waitForJsonOutput<{
      codex: { status: string; warning?: string };
      status: string;
    }>(startProcess.stdout, "start all output");
    const stderrPromise = new Response(startProcess.stderr).text();

    let output: { codex: { status: string; warning?: string }; status: string };
    try {
      const health = JSON.parse(await waitForText(`http://127.0.0.1:${port}/api/health`)) as {
        status: string;
      };
      expect(health.status).toBe("ok");
      // Read the startup JSON before terminating — SIGTERM can drop
      // block-buffered piped stdout on Linux (seen on CI, not macOS).
      output = await outputPromise;
    } finally {
      startProcess.kill("SIGTERM");
      await startProcess.exited;
    }

    const stderr = await stderrPromise;
    expect(stderr).toBe("");
    expect(output.status).toBe("running");
    expect(output.codex.status).toBe("unavailable");
    const warning = output.codex.warning ?? "";
    expect(warning).toContain("Could not locate the Alexandria Codex plugin marketplace");
    expect(warning).toContain("installed Alexandria plugin payload");
    expect(warning).toContain("ax start all --no-codex");
    expect(warning).not.toContain("Could not find the Codex CLI");
    expect(readCodexCalls(codexCalls)).toEqual([]);
  }, 30_000);

  test("ax codex launches Codex TUI against managed app-server metadata", async () => {
    const projectDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeCodex = join(toolDir, "codex");
    const argsFile = join(toolDir, "codex-args.txt");
    const endpoint = startMinimalCodexAppServer();
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_CODEX_BIN: fakeCodex,
      ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
    };

    writeExecutable(
      fakeCodex,
      `#!/bin/sh
set -eu
printf '%s\\n' "$@" > "${argsFile}"
exit 0
`,
    );

    const initResult = runCommand(["bun", cliPath, "init"], projectDir, env);
    expect(initResult.exitCode).toBe(0);

    const workspacePath = join(projectDir, "docs/alexandria");
    const runtimePath = join(workspacePath, ".runtime");
    mkdirSync(runtimePath, { recursive: true });
    writeFileSync(
      join(runtimePath, "codex-app-server.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          appServerId: "test-app-server",
          endpoint,
          host: "127.0.0.1",
          pid: process.pid,
          port: Number(new URL(endpoint).port),
          projectRoot: projectDir,
          startedAt: new Date().toISOString(),
          workspacePath,
        },
        null,
        2,
      )}\n`,
    );

    const result = await runCommandAsync(
      ["bun", cliPath, "codex", "--", "--model", "gpt-test"],
      projectDir,
      env,
    );
    if (result.exitCode !== 0) {
      throw new Error(`ax codex failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    }
    const args = readFileSync(argsFile, "utf8").trim().split("\n");
    expect(args).toContain("--remote");
    expect(args[args.indexOf("--remote") + 1]).toBe(endpoint);
    expect(args).toContain("--cd");
    expect(args[args.indexOf("--cd") + 1]).toBe(realpathSync(projectDir));
    expect(args).toContain("--model");
    expect(args[args.indexOf("--model") + 1]).toBe("gpt-test");
  });

  test("compiled binary resolves viewer assets from a packaged layout", async () => {
    const packageDir = makeProjectDir();
    const compiledDir = join(packageDir, "bin/.compiled");
    const compiledAx = join(compiledDir, "ax");
    const packagedViewerDist = join(packageDir, "packages/viewer/dist");
    mkdirSync(compiledDir, { recursive: true });
    cpSync(viewerDistRoot, packagedViewerDist, { recursive: true });

    const compileResult = runCommand(
      ["bun", "build", "--compile", cliPath, "--outfile", compiledAx],
      repoRoot,
    );
    expect(compileResult.exitCode).toBe(0);
    expect(existsSync(compiledAx)).toBeTrue();

    const projectDir = makeProjectDir();
    const initResult = runCommand([compiledAx, "init"], projectDir, {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
    });
    expect(initResult.exitCode).toBe(0);

    const port = await getFreePort();
    const viewerProcess = Bun.spawn({
      cmd: [compiledAx, "start", "viewer", "--host", "127.0.0.1", "--port", String(port), "--json"],
      cwd: projectDir,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(projectDir, ".ax-runtime"),
      },
      stdout: "pipe",
      stderr: "pipe",
    });
    const outputPromise = waitForJsonOutput<{ status: string; url: string }>(
      viewerProcess.stdout,
      "compiled viewer startup JSON",
      25_000,
    );

    try {
      const html = await waitForText(`http://127.0.0.1:${port}/`);
      expect(html).toContain("Alexandria Library");
      expect(html).toContain("LibraryBrowserApp");
      const output = await outputPromise;
      expect(output.status).toBe("running");
      expect(output.url).toBe(`http://127.0.0.1:${port}/`);
    } finally {
      viewerProcess.kill("SIGTERM");
      await viewerProcess.exited;
      await outputPromise.catch(() => undefined);
    }
  });
});
