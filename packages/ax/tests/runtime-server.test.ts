import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "crypto";
import { Effect } from "effect";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import {
  connectionPathForWorkspacePath,
  infoHubBoardPathForWorkspacePath,
} from "../src/domain/paths.js";
import {
  LIBRARY_CATALOG_DRAFT_MANIFEST_FILE,
  LIBRARY_CATALOG_MANIFEST_FILE,
  PRODUCT_CARD_SCHEMA_VERSION,
} from "../src/domain/library-catalog.js";
import { LibraryGateError } from "../src/domain/library-confirmation.js";
import { RAVEN_VISION_SLOT_IDS } from "../src/domain/raven-vision.js";
import { StateLogAccessError } from "../src/domain/state-store.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";
import { loadLibraryCatalog } from "../src/effects/library-graph-loader.js";
import { loadAlexandriaProjectState } from "../src/effects/project-state-loader.js";
import {
  libraryCardDetailHttpStatus,
  libraryGraphHttpStatus,
  startAlexandriaRuntimeServer,
  type StartedAlexandriaRuntimeServer,
} from "../src/effects/runtime-server.js";
import { createConnectionLease, createWakeSubscription } from "../src/domain/wake-subscriptions.js";
import { writeConnectionLease, writeWakeSubscription } from "../src/effects/runtime-registry.js";

function unwrap<T>(value: T | Error): T {
  if (value instanceof Error) {
    throw value;
  }
  return value;
}

const cliPath = join(import.meta.dir, "../src/cli/main.ts");
const repoRoot = resolve(import.meta.dir, "../../..");
const productLedgerThreadEventsFixture = join(
  import.meta.dir,
  "fixtures/library-backfill/product-ledger-thread-events.jsonl",
);
const expectedProductCatalogAuthoredThreadIds = [
  "gap-living-business-plan",
  "gap-operating-plane-category",
  "gap-federation-mechanism",
] as const;
// Route-level golden, re-pinned after #760's evidence-map linking pass piped
// the last bare `principles` wikilink in `Entity - Strategy Plane` through to
// `Entity - Principle`, following the A3 WHY fill and #762's piped-lead
// treatment of the other 4 plane-concept cards' bare context wikilinks
// (#730/#733): zero missing-card threads remain.
const expectedProductCatalogDerivedThreadIds: string[] = [];
const expectedProductCatalogThreadCount =
  expectedProductCatalogAuthoredThreadIds.length + expectedProductCatalogDerivedThreadIds.length;
const expectedResolvedProductCatalogThreadCount = expectedProductCatalogThreadCount - 1;
const tempDirs = new Set<string>();
const missingLedgerMessage = "State log file is missing. Run `ax init` to repair it.";

function markdownFileCount(root: string): number {
  return readdirSync(root, { withFileTypes: true }).reduce((total, entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      return total + markdownFileCount(path);
    }
    return total + (entry.isFile() && entry.name.endsWith(".md") ? 1 : 0);
  }, 0);
}

interface ParsedSse {
  data: unknown;
  event: string;
  id?: string;
}

interface RuntimeErrorBody {
  error: {
    code?: string;
    message: string;
  };
}

interface SseReader {
  read(): Promise<{ done: boolean; value?: unknown }>;
}

interface RuntimeVisionSlotProjection {
  id: string;
  reviewedAt?: string;
  status: string;
  text: string;
  updatedAt?: string;
}

interface RuntimeVisionProjection {
  readyToBank: boolean;
  sourceItemIds: string[];
  sourceItems: Array<{ id: string; title: string; sourcePath: string }>;
  slotCount: number;
  slots: RuntimeVisionSlotProjection[];
  status: string;
}

function makeProjectDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-runtime-"));
  tempDirs.add(dir);
  return dir;
}

function initProject(cwd: string): void {
  const result = Bun.spawnSync({
    cmd: ["bun", cliPath, "init"],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  expect(result.exitCode).toBe(0);
}

function runCli(
  args: string[],
  cwd: string,
): {
  exitCode: number | null;
  stderr: string;
  stdout: string;
} {
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
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString(),
  };
}

function workspacePath(cwd: string): string {
  return resolve(cwd, "docs/alexandria");
}

function metadataPath(cwd: string): string {
  return join(cwd, "docs/alexandria/.runtime/server.json");
}

function ledgerPath(cwd: string): string {
  return join(cwd, "docs/alexandria/ledger/events.jsonl");
}

function sourcesPath(cwd: string): string {
  return join(cwd, ".alexandria/sources.jsonl");
}

function sourceOriginalsPath(cwd: string): string {
  return join(cwd, "docs/alexandria/sources/originals");
}

function configPath(cwd: string): string {
  return join(cwd, ".alexandria/alexandria-config.json");
}

function ravenSourceOfTruthPath(cwd: string): string {
  return join(cwd, "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md");
}

function expectedHash(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function sortedIds(ids: readonly string[]): string[] {
  return [...ids].sort((left, right) => left.localeCompare(right));
}

function writeEmptyLibraryBundle(bundle: string): void {
  mkdirSync(bundle, { recursive: true });
  writeFileSync(
    join(bundle, "STAGE-2-BRIEF.md"),
    "# Stage-2 Brief\n\n## Q1 Confirm Raven (`product/agents/Agent - Raven.md`)\n",
    "utf8",
  );
  writeFileSync(join(bundle, "HOT-SPOTS.md"), "# Hot Spots\n", "utf8");
  mkdirSync(join(bundle, "product/agents"), { recursive: true });
  writeFileSync(
    join(bundle, "product/agents/Agent - Raven.md"),
    `---
type: Agent
prefLabel: Raven
context: Product
plane: Product
status: stub
confidence: high
proposed_by: Raven scanner
source_evidence:
  - docs/source.md
---
EL4 must not show or approve this body text.
`,
    "utf8",
  );
}

function appendRuntimeThreadOpened(cwd: string, bundle: string): void {
  const event = {
    actor: { kind: "process", host: "ax", process: "cli" },
    at: "2026-07-08T00:00:00.000Z",
    id: "00000000-0000-4000-8000-000000006891",
    payload: {
      threadId: "gap-confirm-raven",
      family: "gap",
      kind: "missing_card",
      concerns: [{ type: "card", cardId: "Agent - Raven" }],
      confidence: "high",
      severity: "medium",
      question: "Confirm Raven?",
      reason: "Confirm Raven.",
      emittingMove: "runtime-server-fixture",
      sourceEvidence: ["product/agents/Agent - Raven.md"],
      backfill: {
        bundle,
        sourceKey: "gap-confirm-raven",
        sourcePath: "runtime/front-of-house/thread-events.jsonl",
      },
    },
    schemaVersion: 1,
    type: "library.thread_opened",
  };
  const existing = readFileSync(ledgerPath(cwd), "utf8");
  writeFileSync(ledgerPath(cwd), `${existing}${JSON.stringify(event)}\n`, "utf8");
}

function readThreadEventFixtures(path: string): Array<{
  actor: Record<string, unknown>;
  payload: Record<string, unknown>;
  type: string;
}> {
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const event = JSON.parse(line) as {
        actor: Record<string, unknown>;
        payload: Record<string, unknown>;
        type: string;
      };
      return {
        actor: event.actor,
        payload: event.payload,
        type: event.type,
      };
    });
}

async function appendThreadEventFixtures(
  server: StartedAlexandriaRuntimeServer,
  path: string,
): Promise<void> {
  for (const event of readThreadEventFixtures(path)) {
    await postEvent(server, {
      actor: event.actor,
      idempotencyKey: `runtime-fixture:${event.type}:${String(event.payload.threadId)}`,
      payload: event.payload,
      type: event.type,
    });
  }
}

function writeDraftOverlayLibrary(cwd: string): void {
  const patches = [
    {
      schemaVersion: 1,
      patchId: "runtime-draft-001",
      agendaItemId: "thread:runtime-draft",
      answerEventId: "answer:runtime-draft",
      resolution: "resolved",
      cardUpdates: [
        {
          cardPath: "product/Surface - Library.md",
          set: { prefLabel: "Draft Library", status: "confirmed" },
          relationships: { related_to: ["[[Entity - Signal]]"] },
        },
      ],
    },
    {
      schemaVersion: 1,
      patchId: "runtime-missing-card",
      agendaItemId: "thread:runtime-missing-card",
      answerEventId: "answer:runtime-missing-card",
      resolution: "resolved",
      cardUpdates: [
        {
          cardPath: "product/Missing - Card.md",
          set: { status: "confirmed" },
        },
      ],
    },
    {
      schemaVersion: 1,
      patchId: "runtime-invalid-altitude",
      agendaItemId: "thread:runtime-invalid-altitude",
      answerEventId: "answer:runtime-invalid-altitude",
      resolution: "resolved",
      cardUpdates: [
        {
          cardPath: "product/Surface - Library.md",
          set: { altitude: "not allowed" },
        },
      ],
    },
  ];
  mkdirSync(join(cwd, "library/product"), { recursive: true });
  writeFileSync(join(cwd, "library/library.json"), '{"schemaVersion":"product-card.v1"}\n', "utf8");
  writeFileSync(
    join(cwd, "library/product/Surface - Library.md"),
    `---
type: Surface
prefLabel: Library
plane: product
context: catalog
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - docs/source.md
---

## WHAT

Library fixture.

## WHY

Library fixture exists to exercise runtime catalog projection.

## WHERE

Catalog.

## HOW

Fixture.
`,
    "utf8",
  );
  writeFileSync(
    join(cwd, "library/product/Entity - Signal.md"),
    `---
type: Entity
prefLabel: Signal
plane: product
context: catalog
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - docs/source.md
---

## WHAT

Signal fixture.

## WHY

Signal fixture exists to exercise draft overlay projection.

## WHERE

Catalog.

## HOW

Fixture.
`,
    "utf8",
  );
  mkdirSync(join(cwd, "drafts"), { recursive: true });
  writeFileSync(join(cwd, "drafts/patches.json"), `${JSON.stringify(patches, null, 2)}\n`, "utf8");
}

function writeManifestCatalogLibrary(cwd: string, manifests: Record<string, string>): void {
  mkdirSync(join(cwd, "library/product"), { recursive: true });
  for (const [fileName, content] of Object.entries(manifests)) {
    writeFileSync(join(cwd, "library", fileName), `${content}\n`, "utf8");
  }
  writeFileSync(
    join(cwd, "library/product/Surface - Library.md"),
    `---
type: Surface
prefLabel: Library
plane: product
context: catalog
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - docs/source.md
---

## WHAT

Library fixture.

## WHERE

Catalog.

## HOW

Fixture.
`,
    "utf8",
  );
}

function prepareEmptyLibraryBundle(cwd: string): string {
  const bundle = join(cwd, "draft-bundle");
  writeEmptyLibraryBundle(bundle);
  appendRuntimeThreadOpened(cwd, bundle);
  expect(
    runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-runtime",
        "--json",
      ],
      cwd,
    ).exitCode,
  ).toBe(0);
  expect(
    runCli(["internal", "front-of-house", "finalize", "--bundle", bundle, "--json"], cwd).exitCode,
  ).toBe(0);
  return bundle;
}

function appendInput(idempotencyKey?: string) {
  return {
    type: "play.started",
    actor: { kind: "process", host: "ax", process: "cli" },
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    payload: {
      agentId: "raven",
      playId: "source-assessment",
      playRunId: `run-${idempotencyKey ?? "default"}`,
    },
  };
}

async function readVision(
  server: StartedAlexandriaRuntimeServer,
): Promise<RuntimeVisionProjection> {
  const response = await fetch(new URL("/api/raven/onboarding/vision", server.url));
  expect(response.status).toBe(200);
  return (await response.json()) as RuntimeVisionProjection;
}

function readLedgerEvents(cwd: string): Array<{
  actor?: { host?: string; kind?: string; name?: string; process?: string };
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  type: string;
}> {
  const content = readFileSync(ledgerPath(cwd), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map(
        (line) =>
          JSON.parse(line) as {
            payload: Record<string, unknown>;
            type: string;
          },
      );
}

function slotSnapshot(
  vision: RuntimeVisionProjection,
  slotIds: string[],
): Record<
  string,
  {
    reviewedAt?: string;
    status: string;
    text: string;
    updatedAt?: string;
  }
> {
  const slotsById = new Map(vision.slots.map((slot) => [slot.id, slot]));

  return Object.fromEntries(
    slotIds.map((slotId) => {
      const slot = slotsById.get(slotId);
      if (slot == null) {
        throw new Error(`Missing Vision slot in projection: ${slotId}`);
      }

      const snapshot: {
        reviewedAt?: string;
        status: string;
        text: string;
        updatedAt?: string;
      } = {
        status: slot.status,
        text: slot.text,
      };
      if (slot.reviewedAt != null) {
        snapshot.reviewedAt = slot.reviewedAt;
      }
      if (slot.updatedAt != null) {
        snapshot.updatedAt = slot.updatedAt;
      }

      return [slotId, snapshot];
    }),
  );
}

async function startVision(server: StartedAlexandriaRuntimeServer) {
  const response = await fetch(new URL("/api/raven/onboarding/vision/start", server.url), {
    method: "POST",
  });
  expect(response.status).toBe(200);
  return (await response.json()) as {
    readyToBank: boolean;
    slotCount: number;
    slots: Array<{ id: string; status: string; text: string }>;
    status: string;
  };
}

async function requestVisionDrafting(server: StartedAlexandriaRuntimeServer) {
  const response = await fetch(
    new URL("/api/raven/onboarding/vision/drafting-request", server.url),
    {
      method: "POST",
    },
  );
  expect(response.status).toBe(200);
  return (await response.json()) as RuntimeVisionProjection;
}

async function updateVisionSlot(
  server: StartedAlexandriaRuntimeServer,
  slotId: string,
  text: string,
) {
  const response = await fetch(
    new URL(`/api/raven/onboarding/vision/slots/${encodeURIComponent(slotId)}`, server.url),
    {
      body: JSON.stringify({ text }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    },
  );
  expect(response.status).toBe(200);
  return (await response.json()) as {
    readyToBank: boolean;
    slots: Array<{ id: string; status: string; text: string }>;
    status: string;
  };
}

async function reviewVisionSlot(
  server: StartedAlexandriaRuntimeServer,
  slotId: string,
  action: "approve" | "skip",
  body?: Record<string, unknown>,
) {
  const response = await fetch(
    new URL(
      `/api/raven/onboarding/vision/slots/${encodeURIComponent(slotId)}/${action}`,
      server.url,
    ),
    {
      ...(body == null
        ? {}
        : {
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" },
          }),
      method: "POST",
    },
  );
  expect(response.status).toBe(200);
  return (await response.json()) as {
    readyToBank: boolean;
    slots: Array<{ id: string; status: string; text: string }>;
    status: string;
  };
}

async function bankVision(server: StartedAlexandriaRuntimeServer) {
  const response = await fetch(new URL("/api/raven/onboarding/vision/bank", server.url), {
    method: "POST",
  });
  expect(response.status).toBe(200);
  return (await response.json()) as {
    events: {
      sourceConversionStarted: { id: string; type: string };
      sourceConversionReadyToFreeze: { id: string; type: string };
      sourceOfTruthFrozen: { id: string; type: string };
      sourceConversionCompleted: { id: string; type: string };
      sourceOfTruthUpdated: { id: string; type: string };
      visionBanked: { id: string; type: string };
    };
    knowledgeBank: {
      subjects: {
        vision: {
          sourceOfTruth?: { contentHash: string };
          status: string;
        };
        vocabulary: { status: string };
      };
    };
    sourceOfTruth: {
      path: string;
      contentHash: string;
      createdAt: string;
      updatedAt: string;
    };
    vision: RuntimeVisionProjection;
  };
}

async function startApiServer(
  cwd: string,
  options: { libraryRoot?: string } = {},
): Promise<StartedAlexandriaRuntimeServer> {
  return Effect.runPromise(
    startAlexandriaRuntimeServer({
      host: "127.0.0.1",
      ...(options.libraryRoot == null ? {} : { libraryRoot: options.libraryRoot }),
      mode: "api",
      port: 0,
      projectRoot: cwd,
      workspacePath: workspacePath(cwd),
    }),
  );
}

function writeSingleCardLibrary(
  cwd: string,
  relativeRoot: string,
  card: { id: string; prefLabel: string },
): void {
  const root = join(cwd, relativeRoot);
  mkdirSync(join(root, "product"), { recursive: true });
  writeFileSync(join(root, "library.json"), '{"schemaVersion":"product-card.v1"}\n', "utf8");
  writeFileSync(
    join(root, "product", `${card.id}.md`),
    `---
type: Surface
prefLabel: ${card.prefLabel}
plane: product
context: library-root-precedence
status: stub
confidence: high
proposed_by: test
source_evidence:
  - tests/runtime-server.test.ts
---

## WHAT

${card.prefLabel}.

## WHY

${card.prefLabel} exists to prove library root precedence.

## WHERE

Runtime precedence test.

## HOW

Loaded from ${relativeRoot}.
`,
    "utf8",
  );
}

async function fetchCatalogCardIds(server: StartedAlexandriaRuntimeServer, search = "") {
  const response = await fetch(new URL(`/api/library/catalog${search}`, server.url));
  expect(response.status).toBe(200);
  const catalog = (await response.json()) as { cards: Array<{ id: string }> };
  return catalog.cards.map((card) => card.id);
}

async function expectLedgerUnavailableResponse(response: Response): Promise<void> {
  expect(response.status).toBe(503);
  const body = (await response.json()) as RuntimeErrorBody;
  expect(body).toEqual({
    error: {
      code: "ledger_unavailable",
      message: missingLedgerMessage,
    },
  });
}

function expectStateLogAccessError(error: unknown): void {
  expect(error).toBeInstanceOf(StateLogAccessError);
  expect((error as { _tag?: string })._tag).toBe("StateLogAccessError");
  expect(error instanceof Error ? error.message : String(error)).toBe(missingLedgerMessage);
}

async function postEvent(
  server: StartedAlexandriaRuntimeServer,
  input: Record<string, unknown>,
): Promise<{
  status: string;
  event: { at: string; id: string; type: string };
}> {
  const response = await fetch(new URL("/api/events", server.url), {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  expect(response.status).toBe(200);
  return (await response.json()) as {
    status: string;
    event: { at: string; id: string; type: string };
  };
}

function cursorPath(cwd: string, cursorId: string): string {
  return join(cwd, "docs/alexandria/.runtime/cursors", `${cursorId}.json`);
}

async function readNextSse(reader: SseReader, state: { buffer: string }): Promise<ParsedSse> {
  const decoder = new TextDecoder();

  while (true) {
    const boundary = state.buffer.indexOf("\n\n");
    if (boundary >= 0) {
      const raw = state.buffer.slice(0, boundary);
      state.buffer = state.buffer.slice(boundary + 2);
      const parsed: ParsedSse = { event: "message", data: null };

      for (const line of raw.split("\n")) {
        if (line.startsWith("id: ")) {
          parsed.id = line.slice("id: ".length);
          continue;
        }
        if (line.startsWith("event: ")) {
          parsed.event = line.slice("event: ".length);
          continue;
        }
        if (line.startsWith("data: ")) {
          parsed.data = JSON.parse(line.slice("data: ".length)) as unknown;
        }
      }

      return parsed;
    }

    const chunk = await reader.read();
    if (chunk.done) {
      throw new Error("SSE stream ended before the expected event arrived.");
    }
    state.buffer += decoder.decode(chunk.value as Uint8Array, {
      stream: true,
    });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("Alexandria runtime server", () => {
  test("serves state and events APIs and removes matching metadata on stop", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      expect(existsSync(metadataPath(cwd))).toBeTrue();

      const health = (await (await fetch(new URL("/api/health", server.url))).json()) as {
        libraryRoot: string;
        serverId: string;
        status: string;
        workspacePath: string;
      };
      expect(health.status).toBe("ok");
      expect(health.serverId).toBe(server.metadata.serverId);
      expect(health.libraryRoot).toBe(join(cwd, "docs/alexandria/library"));
      expect(health.workspacePath).toBe(workspacePath(cwd));

      const stateResponse = await fetch(new URL("/api/state", server.url));
      expect(stateResponse.status).toBe(200);
      const state = (await stateResponse.json()) as {
        ledger: { eventCount: number };
      };
      expect(state.ledger.eventCount).toBe(0);

      const append = await postEvent(server, appendInput());
      expect(append.status).toBe("appended");

      const eventsResponse = await fetch(new URL("/api/events?limit=1", server.url));
      expect(eventsResponse.status).toBe(200);
      const events = (await eventsResponse.json()) as {
        events: Array<{ id: string }>;
        returnedCount: number;
      };
      expect(events.returnedCount).toBe(1);
      expect(events.events[0]!.id).toBe(append.event.id);

      const legacyResponse = await fetch(new URL("/api/alexandria/ledger", server.url));
      expect(legacyResponse.status).toBe(200);
      const legacy = (await legacyResponse.json()) as { events: unknown[]; workspacePath: string };
      expect(legacy.events).toHaveLength(1);
      expect(legacy.workspacePath).toBe(workspacePath(cwd));
    } finally {
      await Effect.runPromise(server.stop);
    }

    expect(existsSync(metadataPath(cwd))).toBeFalse();
  });

  test("resolves default library root through config, process override, and query override", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeSingleCardLibrary(cwd, "docs/alexandria/library", {
      id: "Card - Derived Default",
      prefLabel: "Derived Default",
    });
    writeSingleCardLibrary(cwd, "config-library", {
      id: "Card - Config Root",
      prefLabel: "Config Root",
    });
    writeSingleCardLibrary(cwd, "process-library", {
      id: "Card - Process Root",
      prefLabel: "Process Root",
    });
    writeSingleCardLibrary(cwd, "query-library", {
      id: "Card - Query Root",
      prefLabel: "Query Root",
    });
    const config = JSON.parse(readFileSync(configPath(cwd), "utf8")) as Record<string, unknown>;
    config.library = { extraBuilderSetting: true, root: "config-library" };
    writeFileSync(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`, "utf8");

    const configServer = await startApiServer(cwd);
    try {
      const health = (await (await fetch(new URL("/api/health", configServer.url))).json()) as {
        libraryRoot: string;
      };
      expect(health.libraryRoot).toBe(join(cwd, "config-library"));
      expect(await fetchCatalogCardIds(configServer)).toEqual(["Card - Config Root"]);
      expect(await fetchCatalogCardIds(configServer, "?libraryRoot=query-library")).toEqual([
        "Card - Query Root",
      ]);
    } finally {
      await Effect.runPromise(configServer.stop);
    }

    const processServer = await startApiServer(cwd, { libraryRoot: "process-library" });
    try {
      const health = (await (await fetch(new URL("/api/health", processServer.url))).json()) as {
        libraryRoot: string;
      };
      expect(health.libraryRoot).toBe(join(cwd, "process-library"));
      expect(await fetchCatalogCardIds(processServer)).toEqual(["Card - Process Root"]);
      expect(await fetchCatalogCardIds(processServer, "?libraryRoot=query-library")).toEqual([
        "Card - Query Root",
      ]);
    } finally {
      await Effect.runPromise(processServer.stop);
    }
  });

  test("returns ledger unavailable for missing ledger read routes without repairing state", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    rmSync(ledgerPath(cwd));
    const server = await startApiServer(cwd);

    try {
      await expectLedgerUnavailableResponse(await fetch(new URL("/api/state", server.url)));
      await expectLedgerUnavailableResponse(
        await fetch(new URL("/api/events?limit=5", server.url)),
      );
      await expectLedgerUnavailableResponse(
        await fetch(new URL("/api/events?cursor=test:cursor&limit=5", server.url)),
      );
      await expectLedgerUnavailableResponse(await fetch(new URL("/api/events-stream", server.url)));
      await expectLedgerUnavailableResponse(
        await fetch(new URL("/api/alexandria/ledger", server.url)),
      );
      await expectLedgerUnavailableResponse(await fetch(new URL("/api/state", server.url)));

      expect(existsSync(ledgerPath(cwd))).toBeFalse();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("keeps malformed and unknown failures out of ledger-unavailable classification", async () => {
    const malformedProject = makeProjectDir();
    initProject(malformedProject);
    writeFileSync(ledgerPath(malformedProject), "{bad json}\n", "utf8");
    const malformedServer = await startApiServer(malformedProject);

    try {
      const response = await fetch(new URL("/api/state", malformedServer.url));
      expect(response.status).toBe(422);
      const body = (await response.json()) as RuntimeErrorBody;
      expect(body.error.code).toBeUndefined();
      expect(body.error.message).toContain("Invalid state event at line");
    } finally {
      await Effect.runPromise(malformedServer.stop);
    }

    const unknownProject = makeProjectDir();
    initProject(unknownProject);
    writeFileSync(configPath(unknownProject), "{bad json}\n", "utf8");

    await expect(startApiServer(unknownProject)).rejects.toThrow(
      "Failed to read Alexandria config",
    );
  });

  test("preserves typed missing-ledger state-store errors through loaders", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    const bundle = join(cwd, "draft-bundle");
    writeEmptyLibraryBundle(bundle);
    rmSync(ledgerPath(cwd));

    const stateResult = await Effect.runPromise(
      loadAlexandriaProjectState(cwd).pipe(Effect.provide(NodeFileSystem), Effect.either),
    );
    expect(stateResult._tag).toBe("Left");
    if (stateResult._tag === "Left") {
      expectStateLogAccessError(stateResult.left);
    }

    const catalogResult = await Effect.runPromise(
      loadLibraryCatalog(cwd, { bundlePath: bundle }).pipe(
        Effect.provide(NodeFileSystem),
        Effect.either,
      ),
    );
    expect(catalogResult._tag).toBe("Left");
    if (catalogResult._tag === "Left") {
      expectStateLogAccessError(catalogResult.left);
    }
  });

  test("serves draft overlay catalogs through the runtime API", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeDraftOverlayLibrary(cwd);
    const server = await startApiServer(cwd);

    try {
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:runtime-draft",
          bundlePath: "library",
          contentHash: "sha256:runtime-draft",
          patchId: "patch-thread:runtime-draft",
          playRunId: "run-runtime-draft",
          touchedCardPaths: ["product/Surface - Library.md"],
        },
        type: "library.front_of_house.bundle_patch_applied",
      });
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:stale",
          cards: ["Surface - Library"],
          context: "catalog",
          plane: "product",
          playRunId: "run-stale-draft",
          prefLabel: "Stale Library Surface",
          summary: "This stale section must not label the current draft.",
          unknowns: [],
        },
        type: "library.front_of_house.section_confirmed",
      });
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:runtime-draft",
          cards: ["Surface - Library"],
          context: "catalog",
          plane: "product",
          playRunId: "run-runtime-draft",
          prefLabel: "Runtime-confirmed Library Surface",
          summary: "The runtime catalog carries the confirmed section summary.",
          unknowns: [],
        },
        type: "library.front_of_house.section_confirmed",
      });

      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      catalogUrl.searchParams.set("draftPatchLog", "drafts/patches.json");
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        cards: Array<{
          draftTrail?: Array<{ agendaItemId: string; patchId: string }>;
          links?: { related_to?: string[] };
          prefLabel: string;
          status: string;
        }>;
        draftOverlay?: {
          appliedPatchCount: number;
          appliedUpdateCount: number;
          invalidPatches: Array<{ patchIndex: number; reason: string }>;
          patchLogPath: string;
          sectionConfirmations: Array<{ prefLabel: string; summary: string }>;
          unresolvedUpdates: Array<{ patchId: string; reason: string }>;
        };
      };
      const card = catalog.cards.find((candidate) => candidate.prefLabel === "Draft Library");

      expect(card).toMatchObject({
        status: "confirmed",
      });
      expect(card?.links?.related_to).toEqual(["[[Entity - Signal]]"]);
      expect(card?.draftTrail?.[0]).toMatchObject({
        agendaItemId: "thread:runtime-draft",
        patchId: "patch-thread:runtime-draft",
      });
      expect(catalog.draftOverlay).toMatchObject({
        appliedPatchCount: 1,
        appliedUpdateCount: 1,
        invalidPatches: [
          {
            patchIndex: 2,
            reason: "cardUpdates[0].set.altitude is not allowed.",
          },
        ],
        patchLogPath: "drafts/patches.json",
        sectionConfirmations: [
          {
            prefLabel: "Runtime-confirmed Library Surface",
            summary: "The runtime catalog carries the confirmed section summary.",
          },
        ],
        unresolvedUpdates: [
          {
            patchId: "patch-thread:runtime-missing-card",
            reason: "Card path does not resolve against the Back library.",
          },
        ],
      });

      const badUrl = new URL("/api/library/catalog", server.url);
      badUrl.searchParams.set("libraryRoot", "library");
      badUrl.searchParams.set("draftPatchLog", "library/patches.json");
      const badResponse = await fetch(badUrl);
      expect(badResponse.status).toBe(400);

      const outsideUrl = new URL("/api/library/catalog", server.url);
      outsideUrl.searchParams.set("libraryRoot", "library");
      outsideUrl.searchParams.set("draftPatchLog", "../outside.json");
      const outsideResponse = await fetch(outsideUrl);
      expect(outsideResponse.status).toBe(400);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves draft manifest catalog identity through the runtime API", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeManifestCatalogLibrary(cwd, {
      [LIBRARY_CATALOG_DRAFT_MANIFEST_FILE]: JSON.stringify({
        schemaVersion: PRODUCT_CARD_SCHEMA_VERSION,
        draftOf: "x",
        playRunId: "y",
      }),
    });
    const server = await startApiServer(cwd);

    try {
      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      const response = await fetch(catalogUrl);
      expect(response.status).toBe(200);
      const catalog = (await response.json()) as {
        fillReadiness?: unknown;
        meta: { draftOf?: string; metadataIssues: string[]; playRunId?: string };
      };

      expect(catalog.fillReadiness).toBeDefined();
      expect(catalog.meta.draftOf).toBe("x");
      expect(catalog.meta.playRunId).toBe("y");
      expect(catalog.meta.metadataIssues).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves malformed draft manifests as legacy catalogs with metadata issues", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeManifestCatalogLibrary(cwd, {
      [LIBRARY_CATALOG_DRAFT_MANIFEST_FILE]: "{bad",
      [LIBRARY_CATALOG_MANIFEST_FILE]: JSON.stringify({
        schemaVersion: PRODUCT_CARD_SCHEMA_VERSION,
      }),
    });
    const server = await startApiServer(cwd);

    try {
      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      const response = await fetch(catalogUrl);
      expect(response.status).toBe(200);
      const catalog = (await response.json()) as {
        fillReadiness?: unknown;
        meta: { draftOf?: string; metadataIssues: string[]; playRunId?: string };
      };

      expect(catalog.fillReadiness).toBeUndefined();
      expect(catalog.meta.draftOf).toBeUndefined();
      expect(catalog.meta.playRunId).toBeUndefined();
      expect(catalog.meta.metadataIssues).toEqual([
        `Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: invalid JSON.`,
      ]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves zero-card draft rulings and section confirmations from answer events", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeDraftOverlayLibrary(cwd);
    const server = await startApiServer(cwd);

    try {
      const answer = await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          agendaItemId: "thread:frame-search-space",
          agendaItemKind: "stage2_question",
          answerText:
            "Director ruling: collapse the eight provisional containers into five named frame shelves before any card diff is applied.",
          fabroRunId: "fabro-frame-ruling",
          playRunId: "run-frame-ruling",
          questionId: "frame-search-space",
        },
        type: "library.front_of_house.answer_recorded",
      });
      writeFileSync(
        join(cwd, "drafts/patches.json"),
        `${JSON.stringify(
          [
            {
              schemaVersion: 1,
              patchId: "patch-frame-search-space",
              agendaItemId: "thread:frame-search-space",
              answerEventId: answer.event.id,
              resolution: "resolved",
              cardUpdates: [],
              containerMapping: [
                {
                  basis: "The library shelf still names the work.",
                  disposition: "keep",
                  from: "library",
                },
                {
                  basis: "The old search-space name hid the frame decision.",
                  disposition: "rename",
                  from: "search-space",
                  to: "frame-rulings",
                },
              ],
              keystoneDraft: {
                body: "## WHAT\n\nThe frame ruling names the index before card fan-out.",
                context: "library-index",
                plane: "product",
                prefLabel: "Frame Ruling Index",
                status: "stub",
              },
            },
          ],
          null,
          2,
        )}\n`,
        "utf8",
      );
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:stale",
          cards: ["Surface - Library"],
          context: "catalog",
          plane: "product",
          playRunId: "run-stale-frame-ruling",
          prefLabel: "Stale Frame Section",
          summary: "This stale section must not render for the current walk.",
          unknowns: [],
        },
        type: "library.front_of_house.section_confirmed",
      });
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: answer.event.id,
          cards: [],
          context: "catalog",
          plane: "product",
          playRunId: "run-frame-ruling",
          prefLabel: "Frame-confirmed Catalog",
          summary: "The frame ruling closes the catalog section without a card diff.",
          unknowns: [],
        },
        type: "library.front_of_house.section_confirmed",
      });

      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      catalogUrl.searchParams.set("draftPatchLog", "drafts/patches.json");
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        cards: Array<{ draftTrail?: unknown[]; prefLabel: string }>;
        draftOverlay?: {
          appliedPatchCount: number;
          appliedUpdateCount: number;
          rulings: Array<{
            cardUpdateCount: number;
            containerMapping: Array<{
              basis: string;
              disposition: string;
              from: string;
              to?: string;
            }>;
            keystoneDraft?: { body: string; prefLabel?: string };
            patchId: string;
            rulingExcerpt?: string;
          }>;
          sectionConfirmations: Array<{ prefLabel: string; summary: string }>;
        };
      };

      expect(catalog.cards.some((card) => (card.draftTrail ?? []).length > 0)).toBe(false);
      expect(catalog.draftOverlay).toMatchObject({
        appliedPatchCount: 0,
        appliedUpdateCount: 0,
        rulings: [
          {
            cardUpdateCount: 0,
            containerMapping: [
              {
                basis: "The library shelf still names the work.",
                disposition: "keep",
                from: "library",
              },
              {
                basis: "The old search-space name hid the frame decision.",
                disposition: "rename",
                from: "search-space",
                to: "frame-rulings",
              },
            ],
            keystoneDraft: {
              prefLabel: "Frame Ruling Index",
            },
            patchId: "patch-thread:frame-search-space",
            rulingExcerpt:
              "Director ruling: collapse the eight provisional containers into five named frame shelves before any card diff is applied.",
          },
        ],
        sectionConfirmations: [
          {
            prefLabel: "Frame-confirmed Catalog",
            summary: "The frame ruling closes the catalog section without a card diff.",
          },
        ],
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves product-root authored threads from ledger events and removes resolved threads", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    rmSync(join(cwd, "docs/alexandria/library"), { force: true, recursive: true });
    cpSync(join(repoRoot, "docs/alexandria/library"), join(cwd, "docs/alexandria/library"), {
      recursive: true,
    });
    const server = await startApiServer(cwd);

    try {
      const readCatalog = async (search = "") =>
        (await (await fetch(new URL(`/api/library/catalog${search}`, server.url))).json()) as {
          threads?: Array<{ id: string; source: string; status: string }>;
        };

      const baselineCatalog = await readCatalog();
      const baselineDerivedIds = (baselineCatalog.threads ?? [])
        .filter((thread) => thread.source === "derived")
        .map((thread) => thread.id);
      expect(sortedIds(baselineDerivedIds)).toEqual(
        sortedIds(expectedProductCatalogDerivedThreadIds),
      );
      expect(baselineCatalog.threads).toHaveLength(expectedProductCatalogDerivedThreadIds.length);
      expect(baselineCatalog.threads).toHaveLength(
        expectedProductCatalogThreadCount - expectedProductCatalogAuthoredThreadIds.length,
      );

      await appendThreadEventFixtures(server, productLedgerThreadEventsFixture);

      const catalog = await readCatalog();
      const authored = (catalog.threads ?? []).filter((thread) => thread.source === "authored");
      const derivedIds = (catalog.threads ?? [])
        .filter((thread) => thread.source === "derived")
        .map((thread) => thread.id);
      expect(authored.map((thread) => [thread.id, thread.status])).toEqual(
        expectedProductCatalogAuthoredThreadIds.map((threadId) => [threadId, "open"]),
      );
      expect(sortedIds(derivedIds)).toEqual(sortedIds(expectedProductCatalogDerivedThreadIds));
      expect(catalog.threads).toHaveLength(expectedProductCatalogThreadCount);

      const explicitProduct = await readCatalog("?libraryRoot=docs/alexandria/library");
      expect(
        explicitProduct.threads
          ?.filter((thread) => thread.source === "authored")
          .map((thread) => thread.id),
      ).toEqual([...expectedProductCatalogAuthoredThreadIds]);

      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          resolution: "Director ruled the thread closed.",
          rulingEventId: "ruling:gap-living-business-plan",
          threadId: "gap-living-business-plan",
        },
        type: "library.thread_resolved",
      });

      const resolvedCatalog = await readCatalog();
      const resolvedDerivedIds = (resolvedCatalog.threads ?? [])
        .filter((thread) => thread.source === "derived")
        .map((thread) => thread.id);
      expect(
        resolvedCatalog.threads
          ?.filter((thread) => thread.source === "authored")
          .map((thread) => thread.id),
      ).toEqual(["gap-operating-plane-category", "gap-federation-mechanism"]);
      expect(sortedIds(resolvedDerivedIds)).toEqual(
        sortedIds(expectedProductCatalogDerivedThreadIds),
      );
      expect(resolvedCatalog.threads).toHaveLength(expectedResolvedProductCatalogThreadCount);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("suppresses product-authored thread events for Builder bundle catalog reads", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    const bundle = prepareEmptyLibraryBundle(cwd);
    const server = await startApiServer(cwd);
    try {
      await appendThreadEventFixtures(server, productLedgerThreadEventsFixture);

      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("bundlePath", bundle);
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        threads?: Array<{ id: string; source: string }>;
      };
      expect((catalog.threads ?? []).filter((thread) => thread.source === "authored")).toEqual([]);
      expect((catalog.threads ?? []).map((thread) => thread.id)).not.toContain(
        "gap-living-business-plan",
      );
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("ignores stale section confirmations for reused draft patch ids", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeDraftOverlayLibrary(cwd);
    const server = await startApiServer(cwd);

    try {
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:older-runtime-draft",
          bundlePath: "library",
          contentHash: "sha256:older-runtime-draft",
          patchId: "patch-thread:runtime-draft",
          playRunId: "run-older-runtime-draft",
          touchedCardPaths: ["product/Surface - Library.md"],
        },
        type: "library.front_of_house.bundle_patch_applied",
      });
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:runtime-draft",
          bundlePath: "library",
          contentHash: "sha256:runtime-draft",
          patchId: "patch-thread:runtime-draft",
          playRunId: "run-runtime-draft",
          touchedCardPaths: ["product/Surface - Library.md"],
        },
        type: "library.front_of_house.bundle_patch_applied",
      });
      await postEvent(server, {
        actor: { host: "ax", kind: "process", process: "cli" },
        payload: {
          answerEventId: "answer:older-runtime-draft",
          cards: ["Surface - Library"],
          context: "catalog",
          plane: "product",
          playRunId: "run-older-runtime-draft",
          prefLabel: "Older Runtime Library Surface",
          summary: "This older section must not label the current draft.",
          unknowns: [],
        },
        type: "library.front_of_house.section_confirmed",
      });

      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      catalogUrl.searchParams.set("draftPatchLog", "drafts/patches.json");
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        cards: Array<{
          draftTrail?: Array<{ answerEventId: string; patchId: string }>;
          prefLabel: string;
        }>;
        draftOverlay?: {
          sectionConfirmations: Array<{ prefLabel: string; summary: string }>;
        };
      };

      expect(
        catalog.cards.find((candidate) => candidate.prefLabel === "Draft Library")?.draftTrail?.[0],
      ).toMatchObject({
        answerEventId: "answer:runtime-draft",
        patchId: "patch-thread:runtime-draft",
      });
      expect(catalog.draftOverlay?.sectionConfirmations).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves all-invalid draft patch logs as degraded overlays", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeDraftOverlayLibrary(cwd);
    writeFileSync(
      join(cwd, "drafts/patches.json"),
      `${JSON.stringify(
        [
          {
            schemaVersion: 1,
            patchId: "runtime-invalid-altitude",
            agendaItemId: "thread:runtime-invalid-altitude",
            answerEventId: "answer:runtime-invalid-altitude",
            resolution: "resolved",
            cardUpdates: [
              {
                cardPath: "product/Surface - Library.md",
                set: { altitude: "not allowed" },
              },
            ],
          },
          {
            schemaVersion: 2,
            patchId: "runtime-invalid-schema",
            agendaItemId: "thread:runtime-invalid-schema",
            answerEventId: "answer:runtime-invalid-schema",
            resolution: "resolved",
            cardUpdates: [
              {
                cardPath: "product/Surface - Library.md",
                set: { status: "confirmed" },
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
      "utf8",
    );
    const server = await startApiServer(cwd);

    try {
      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "library");
      catalogUrl.searchParams.set("draftPatchLog", "drafts/patches.json");
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        cards: Array<{ prefLabel: string; status: string }>;
        draftOverlay?: {
          appliedPatchCount: number;
          appliedUpdateCount: number;
          invalidPatches: Array<{ patchIndex: number; reason: string }>;
          sectionConfirmations: Array<unknown>;
        };
      };

      expect(catalog.cards.find((card) => card.prefLabel === "Library")?.status).toBe("stub");
      expect(catalog.draftOverlay).toMatchObject({
        appliedPatchCount: 0,
        appliedUpdateCount: 0,
        invalidPatches: [
          {
            patchIndex: 0,
            reason: "cardUpdates[0].set.altitude is not allowed.",
          },
          {
            patchIndex: 1,
            reason: "schemaVersion must be 1.",
          },
        ],
        sectionConfirmations: [],
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("rejects structurally unusable draft patch logs through the runtime API", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    writeDraftOverlayLibrary(cwd);
    writeFileSync(join(cwd, "drafts/not-json.json"), "{", "utf8");
    writeFileSync(join(cwd, "drafts/not-array.json"), '{"patches":[]}\n', "utf8");
    const server = await startApiServer(cwd);

    try {
      for (const patchLog of ["drafts/not-json.json", "drafts/not-array.json"]) {
        const catalogUrl = new URL("/api/library/catalog", server.url);
        catalogUrl.searchParams.set("libraryRoot", "library");
        catalogUrl.searchParams.set("draftPatchLog", patchLog);
        const catalogResponse = await fetch(catalogUrl);
        expect(catalogResponse.status).toBe(400);
      }
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves bundle catalog gate metadata and confirms through the runtime API", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    const bundle = prepareEmptyLibraryBundle(cwd);
    const server = await startApiServer(cwd);

    try {
      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("bundlePath", bundle);
      const catalogResponse = await fetch(catalogUrl);
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        cards: Array<{ prefLabel: string }>;
        gate: { approved: boolean; bundlePath: string; libraryVersion: number; status: string };
      };
      expect(catalog.cards).toHaveLength(1);
      expect(JSON.stringify(catalog)).not.toContain("EL4 must not show or approve this body text");
      expect(catalog.gate).toMatchObject({
        approved: false,
        bundlePath: bundle,
        libraryVersion: 1,
        status: "not_approved",
      });

      const confirmResponse = await fetch(new URL("/api/library/confirmations", server.url), {
        body: JSON.stringify({
          action: "confirm",
          actor: { kind: "user", host: "viewer" },
          bundlePath: bundle,
          libraryVersion: 1,
          product: "alexandria",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(confirmResponse.status).toBe(200);
      const confirm = (await confirmResponse.json()) as {
        approved: boolean;
        event: { actor: { kind: string }; type: string };
        eventStatus: string;
        libraryVersion: number;
      };
      expect(confirm).toMatchObject({
        approved: true,
        event: { actor: { kind: "user" }, type: "library.confirmed" },
        eventStatus: "appended",
        libraryVersion: 1,
      });

      const eventsResponse = await fetch(
        new URL("/api/events?type=library.confirmed&limit=5", server.url),
      );
      expect(eventsResponse.status).toBe(200);
      const eventsPage = (await eventsResponse.json()) as { events: unknown[] };
      expect(eventsPage.events).toHaveLength(1);

      const approvedCatalogResponse = await fetch(catalogUrl);
      expect(approvedCatalogResponse.status).toBe(200);
      const approvedCatalog = (await approvedCatalogResponse.json()) as {
        gate: { approved: boolean; confirmationEventId?: string; status: string };
      };
      expect(approvedCatalog.gate).toMatchObject({
        approved: true,
        status: "approved",
      });
      expect(approvedCatalog.gate.confirmationEventId).toBeString();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  // Skipped: stages studio/library from the real repo tree, and studio/ was
  // removed in the alexandria-simple pare-back. Needs a fixture rewrite (or
  // removal) before re-enabling.
  test.skip("serves schema-declaring Studio library catalogs by libraryRoot", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    cpSync(join(repoRoot, "studio/library"), join(cwd, "studio/library"), { recursive: true });
    const server = await startApiServer(cwd);

    try {
      const catalogUrl = new URL("/api/library/catalog", server.url);
      catalogUrl.searchParams.set("libraryRoot", "studio/library");
      const response = await fetch(catalogUrl);
      expect(response.status).toBe(200);
      const catalog = (await response.json()) as {
        areas: Array<{ cardIds: string[]; id: string; plane: string }>;
        cards: Array<{
          diagram?: {
            connectors?: Array<{ targetCardId?: string; targetLabel: string }>;
            flow?: string[];
            kind: string;
          };
          id: string;
          path: string;
          plane: string;
          status: string;
          storyBuckets?: { how: string; what: string; when: string; why: string };
        }>;
        fillReadiness?: {
          areas: Array<{
            areaId: string;
            cardCount: number;
            context: string;
            fillableCount: number;
            gapCount: number;
            hotSpotCount: number;
            plane: string;
          }>;
          cards: Array<{
            blockingThreadIds: string[];
            cardId: string;
            fillable: boolean;
            gapThreadIds: string[];
            missingSections: string[];
          }>;
          fillableCardCount: number;
          gapCount: number;
          hotSpotCount: number;
          ready: boolean;
          threadCount: number;
          totalCardCount: number;
        };
        meta: {
          cardCount: number;
          metadataIssues: string[];
          planes: string[];
        };
        threads?: Array<{
          concerns: Array<{ cardId?: string; label?: string; sourceCardId?: string; type: string }>;
          family: string;
          id: string;
          kind: string;
          severity: string;
          source: string;
        }>;
        workflows?: Array<{
          id: string;
          steps: Array<{
            activity: string;
            cardRefs?: string[];
            context: string;
            gate?: boolean;
            order: number;
            stateAfter?: string;
          }>;
          unit: string;
        }>;
      };
      const libraryFileCount = markdownFileCount(join(cwd, "studio/library"));
      const stagedFlowIssue =
        "Invalid card board/Value - Stage.md: staged flow is valid only on Pattern or Mechanism cards";

      expect(catalog.meta.metadataIssues).toEqual([stagedFlowIssue]);
      expect(catalog.workflows).toBeUndefined();
      expect(catalog.meta.cardCount).toBe(libraryFileCount);
      expect(catalog.cards).toHaveLength(libraryFileCount);
      expect(catalog.cards.map((card) => card.plane)).toEqual(
        Array.from({ length: libraryFileCount }, () => "product"),
      );
      expect(catalog.cards.every((card) => card.status === "stub")).toBeTrue();
      expect(catalog.cards.map((card) => card.id)).toContain("Aggregate - Board");
      expect(catalog.cards.map((card) => card.id)).toContain("Value - Stage");
      expect(catalog.cards.map((card) => card.id)).toContain("Value - Empty HOW Fixture");
      const board = catalog.cards.find((card) => card.id === "Aggregate - Board");
      const stage = catalog.cards.find((card) => card.id === "Value - Stage");
      const registry = catalog.cards.find((card) => card.id === "Read-Model - Play Registry");
      expect(board?.storyBuckets?.what).toContain("Work Board exists");
      expect(board?.storyBuckets?.how).toContain("[[Stage]]");
      // WHY and WHEN are their own first-class buckets (learning-plane
      // reshape, flight board #672 / director ruling 2026-07-08) — they no
      // longer ride the how bucket.
      expect(board?.storyBuckets?.why).toContain("The Board is *the* Director surface");
      expect(board?.storyBuckets?.when).toContain("Used at every gate decision");
      expect(board?.storyBuckets?.how).not.toContain("The Board is *the* Director surface");
      expect(board?.storyBuckets?.how).not.toContain("Used at every gate decision");
      expect(board?.diagram?.kind).toBe("hub");
      expect(board?.diagram?.connectors?.map((connector) => connector.targetCardId)).toContain(
        "Value - Stage",
      );
      expect(stage?.diagram).toMatchObject({
        flow: ["Backlog", "Sourced", "Designed", "Built", "Proven"],
        kind: "lifecycle",
      });
      expect(registry?.diagram?.kind).toBe("feeds");
      expect(catalog.cards.every((card) => card.path.endsWith(".md"))).toBeTrue();
      expect(catalog.areas).toContainEqual(
        expect.objectContaining({
          cardIds: expect.arrayContaining(["Aggregate - Board", "Value - Stage"]),
          id: "area:product:board",
          plane: "product",
        }),
      );
      expect(catalog.areas).toContainEqual(
        expect.objectContaining({
          cardIds: ["Value - Empty HOW Fixture"],
          context: "readiness-fixture",
          id: "area:product:readiness-fixture",
          plane: "product",
        }),
      );
      expect(catalog.meta.planes).toEqual(["product"]);
      expect(catalog.threads?.filter((thread) => thread.source === "authored")).toEqual([]);
      expect(catalog.threads?.map((thread) => thread.id)).toContain(
        "thread:derived:missing-card:Aggregate - Board:Director",
      );
      expect(catalog.threads?.map((thread) => thread.id)).not.toContain(
        "thread:derived:missing-card:Aggregate - Board:Component - Play Registry",
      );
      expect(catalog.threads?.map((thread) => thread.id)).toContain(
        "thread:derived:missing-material:Value - Empty HOW Fixture",
      );
      const fillReadiness = catalog.fillReadiness;
      expect(fillReadiness).toBeDefined();
      if (fillReadiness == null) {
        throw new Error("expected Studio catalog fillReadiness");
      }
      expect(typeof fillReadiness.gapCount).toBe("number");
      expect(fillReadiness.hotSpotCount).toBe(0);
      expect(fillReadiness.ready).toBe(false);
      expect(fillReadiness.totalCardCount).toBe(libraryFileCount);
      expect(fillReadiness.gapCount).toBeGreaterThanOrEqual(2);
      expect(fillReadiness.fillableCardCount).toBe(libraryFileCount - 1);
      expect(fillReadiness.cards.find((card) => card.cardId === "Aggregate - Board")).toMatchObject(
        {
          blockingThreadIds: [],
          fillable: true,
          gapThreadIds: expect.arrayContaining([
            "thread:derived:missing-card:Aggregate - Board:Director",
          ]),
          missingSections: [],
        },
      );
      expect(
        fillReadiness.cards.find((card) => card.cardId === "Value - Empty HOW Fixture"),
      ).toMatchObject({
        blockingThreadIds: ["thread:derived:missing-material:Value - Empty HOW Fixture"],
        fillable: false,
        gapThreadIds: ["thread:derived:missing-material:Value - Empty HOW Fixture"],
        missingSections: ["HOW"],
      });
      expect(
        fillReadiness.areas.find((area) => area.areaId === "area:product:board"),
      ).toMatchObject({
        cardCount: 8,
        context: "board",
        fillableCount: 8,
        plane: "product",
      });
      expect(
        fillReadiness.areas.find((area) => area.areaId === "area:product:readiness-fixture"),
      ).toMatchObject({
        cardCount: 1,
        context: "readiness-fixture",
        fillableCount: 0,
        plane: "product",
      });

      writeFileSync(
        join(cwd, "studio/library/workflows.json"),
        `${JSON.stringify(
          {
            schemaVersion: "library-workflows.v1",
            workflows: [
              {
                id: "play-production",
                unit: "Play",
                steps: [
                  {
                    order: 6,
                    activity: "Dry-run",
                    context: "readiness-fixture",
                    stateAfter: "built",
                    cardRefs: ["Value - Empty HOW Fixture"],
                  },
                  {
                    order: 3,
                    activity: "Confirm design",
                    context: "board",
                    gate: true,
                    stateAfter: "designed",
                    cardRefs: ["Aggregate - Board"],
                  },
                  {
                    order: 8,
                    activity: "Return to board",
                    context: "board",
                    stateAfter: "ready",
                    cardRefs: ["Value - Stage"],
                  },
                ],
              },
            ],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const workflowResponse = await fetch(catalogUrl);
      expect(workflowResponse.status).toBe(200);
      const workflowCatalog = (await workflowResponse.json()) as typeof catalog;

      expect(workflowCatalog.meta.metadataIssues).toEqual([stagedFlowIssue]);
      expect(workflowCatalog.workflows).toBeUndefined();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves /api/library/catalog for the real product library with no metadata issues", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    rmSync(join(cwd, "docs/alexandria/library"), { recursive: true, force: true });
    cpSync(join(repoRoot, "docs/alexandria/library"), join(cwd, "docs/alexandria/library"), {
      recursive: true,
    });
    const server = await startApiServer(cwd);

    try {
      const catalogResponse = await fetch(new URL("/api/library/catalog", server.url));
      expect(catalogResponse.status).toBe(200);
      const catalog = (await catalogResponse.json()) as {
        meta: {
          cardCount: number;
          metadataIssues: string[];
        };
      };

      expect(catalog.meta.cardCount).toBe(171);
      expect(catalog.meta.metadataIssues).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("launches play runs through the API (the run bridge records lifecycle events)", async () => {
    const cwd = realpathSync(makeProjectDir());
    initProject(cwd);
    const fakeFabro = join(cwd, "fake-fabro");
    writeFileSync(
      fakeFabro,
      `#!/bin/sh
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
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  exit 0
fi
if [ "\${1:-}" = "validate" ]; then
  exit 0
fi
if [ "\${1:-}" = "graph" ]; then
  printf '<svg xmlns="http://www.w3.org/2000/svg"><text>fake graph</text></svg>'
  exit 0
fi
if [ "\${1:-}" = "run" ]; then
  sleep 1
  printf '{"event":"run.created","run_id":"01RUNTIME"}\\n'
  printf '{"event":"run.completed","run_id":"01RUNTIME","properties":{"status":"succeeded"}}\\n'
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
      { mode: 0o755 },
    );
    const previousAcpCommand = process.env.ALEXANDRIA_CODEX_ACP_COMMAND;
    const previousFabroBin = process.env.ALEXANDRIA_FABRO_BIN;
    const previousNextHome = process.env.ALEXANDRIA_HOME;
    process.env.ALEXANDRIA_CODEX_ACP_COMMAND = "true";
    process.env.ALEXANDRIA_FABRO_BIN = fakeFabro;
    process.env.ALEXANDRIA_HOME = join(cwd, ".ax-runtime");
    const server = await startApiServer(cwd);

    try {
      const response = await fetch(new URL("/api/plays/source-assessment/runs", server.url), {
        method: "POST",
      });
      expect(response.status).toBe(202);
      const launch = (await response.json()) as {
        playId: string;
        playRunId: string;
        status: string;
      };
      expect(launch).toMatchObject({
        playId: "source-assessment",
        status: "launching",
      });
      expect(launch.playRunId.length).toBeGreaterThan(0);

      const duplicateResponse = await fetch(
        new URL("/api/plays/source-assessment/runs", server.url),
        { method: "POST" },
      );
      expect(duplicateResponse.status).toBe(409);
      const duplicateLaunch = (await duplicateResponse.json()) as {
        error: {
          playId: string;
          playRunId: string;
        };
      };
      expect(duplicateLaunch.error).toMatchObject({
        playId: "source-assessment",
        playRunId: launch.playRunId,
      });

      // ax run is start-only now; the daemon's run bridge — not the CLI —
      // emits the play.* lifecycle events from Fabro. That emission is covered
      // by run-bridge.test.ts; here we assert the launch contract (202 + the
      // 409 duplicate guard) the API endpoint owns.
    } finally {
      if (previousAcpCommand == null) {
        delete process.env.ALEXANDRIA_CODEX_ACP_COMMAND;
      } else {
        process.env.ALEXANDRIA_CODEX_ACP_COMMAND = previousAcpCommand;
      }
      if (previousFabroBin == null) {
        delete process.env.ALEXANDRIA_FABRO_BIN;
      } else {
        process.env.ALEXANDRIA_FABRO_BIN = previousFabroBin;
      }
      if (previousNextHome == null) {
        delete process.env.ALEXANDRIA_HOME;
      } else {
        process.env.ALEXANDRIA_HOME = previousNextHome;
      }
      await Effect.runPromise(server.stop);
    }
  }, 10_000);

  test("serves Raven Vision onboarding mutations and projects reducer state from the ledger", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    writeFileSync(
      configPath(cwd),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          workspace: "docs/alexandria",
          codex: { enabled: true },
          agents: { otherAgent: { preserved: true } },
        },
        null,
        2,
      )}\n`,
    );
    const server = await startApiServer(cwd);

    try {
      const notStarted = await readVision(server);
      expect(notStarted.status).toBe("not_started");
      expect(notStarted.readyToBank).toBeFalse();
      expect(notStarted.slots).toEqual([]);

      const started = await startVision(server);
      expect(started.status).toBe("in_progress");
      expect(started.slotCount).toBe(4);
      expect(started.slots).toHaveLength(4);
      expect(started.slots[0]).toMatchObject({
        id: "person",
        status: "empty",
        text: "",
      });

      const reopened = await startVision(server);
      expect(reopened.slots).toEqual(started.slots);

      const shifted = await updateVisionSlot(server, "mechanism", "A clear product vision.");
      expect(shifted.status).toBe("in_progress");
      expect(shifted.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "needs_review",
        text: "A clear product vision.",
      });

      const approved = await reviewVisionSlot(server, "mechanism", "approve");
      expect(approved.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "approved",
        text: "A clear product vision.",
      });

      const personText = await updateVisionSlot(server, "person", "Temporary person text.");
      expect(personText.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "needs_review",
        text: "Temporary person text.",
      });

      const skippedPerson = await reviewVisionSlot(server, "person", "skip");
      expect(skippedPerson.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "skipped",
        text: "",
      });

      let ready = skippedPerson;
      for (const slotId of RAVEN_VISION_SLOT_IDS.filter(
        (candidate) => candidate !== "mechanism" && candidate !== "person",
      )) {
        ready = await reviewVisionSlot(server, slotId, "skip");
      }
      expect(ready.status).toBe("ready_to_bank");
      expect(ready.readyToBank).toBeTrue();

      const reopenedPerson = await updateVisionSlot(server, "person", "A reopened person slot.");
      expect(reopenedPerson.status).toBe("in_progress");
      expect(reopenedPerson.readyToBank).toBeFalse();
      expect(reopenedPerson.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "needs_review",
        text: "A reopened person slot.",
      });

      const runtimeState = (await (await fetch(new URL("/api/state", server.url))).json()) as {
        raven: {
          vision: {
            status: string;
            slots: Array<{ id: string; status: string; text: string }>;
          };
        };
      };
      expect(runtimeState.raven.vision.status).toBe("in_progress");
      expect(runtimeState.raven.vision.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "needs_review",
        text: "A reopened person slot.",
      });

      const configText = readFileSync(configPath(cwd), "utf8");
      const config = JSON.parse(configText) as {
        agents?: Record<string, unknown>;
        codex?: { enabled?: boolean };
      };
      expect(config.codex).toEqual({ enabled: true });
      expect(config.agents?.otherAgent).toEqual({ preserved: true });
      expect(configText).not.toContain('"raven"');
      expect(configText).not.toContain('"A reopened person slot."');
      expect(configText).not.toContain("The Mechanism");
      expect(configText).not.toContain("What the product does");

      const events = readFileSync(ledgerPath(cwd), "utf8")
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map(
          (line) =>
            JSON.parse(line) as {
              actor: { host?: string; kind?: string; name?: string };
              payload: Record<string, unknown>;
              type: string;
            },
        );
      expect(events.filter((event) => event.type === "raven.vision.started")).toHaveLength(1);
      expect(events.map((event) => event.type)).toContain("raven.vision.slot.updated");
      expect(events.map((event) => event.type)).toContain("raven.vision.slot.approved");
      expect(events.map((event) => event.type)).toContain("raven.vision.slot.skipped");
      expect(
        events.find(
          (event) =>
            event.type === "raven.vision.slot.approved" && event.payload.slotId === "mechanism",
        ),
      ).toMatchObject({
        actor: { kind: "user", host: "viewer" },
      });
      expect(
        events.find(
          (event) =>
            event.type === "raven.vision.slot.skipped" && event.payload.slotId === "person",
        ),
      ).toMatchObject({
        actor: { kind: "user", host: "viewer" },
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("rejects invalid Raven Vision runtime mutations", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const beforeStart = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person", server.url),
        {
          body: JSON.stringify({ text: "Too early." }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(beforeStart.status).toBe(409);

      const approveBeforeStart = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person/approve", server.url),
        {
          body: JSON.stringify({
            actor: { kind: "user", host: "claude-code", name: "Director" },
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );
      expect(approveBeforeStart.status).toBe(409);

      const bankBeforeStart = await fetch(
        new URL("/api/raven/onboarding/vision/bank", server.url),
        { method: "POST" },
      );
      expect(bankBeforeStart.status).toBe(409);
      expect(existsSync(ravenSourceOfTruthPath(cwd))).toBeFalse();

      await startVision(server);

      const bankBeforeReady = await fetch(
        new URL("/api/raven/onboarding/vision/bank", server.url),
        { method: "POST" },
      );
      expect(bankBeforeReady.status).toBe(409);

      const unknownSlot = await fetch(
        new URL("/api/raven/onboarding/vision/slots/not-a-slot", server.url),
        {
          body: JSON.stringify({ text: "Nope." }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(unknownSlot.status).toBe(400);
      expect(await unknownSlot.text()).toContain("Valid slot ids");

      const malformed = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person", server.url),
        {
          body: "{bad",
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(malformed.status).toBe(400);

      const statusReviewField = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person/approve", server.url),
        {
          body: JSON.stringify({
            actor: { kind: "user", host: "claude-code", name: "Director" },
            status: "approved",
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );
      expect(statusReviewField.status).toBe(400);
      expect(await statusReviewField.text()).toContain(
        "Unsupported Vision slot review field: status.",
      );

      const invalidReviewActor = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person/skip", server.url),
        {
          body: JSON.stringify({ actor: { kind: "robot" } }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );
      expect(invalidReviewActor.status).toBe(400);
      expect(await invalidReviewActor.text()).toContain("actor");

      const statusField = await fetch(
        new URL("/api/raven/onboarding/vision/slots/person", server.url),
        {
          body: JSON.stringify({ status: "approved", text: "Nope." }),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(statusField.status).toBe(400);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("banks ready Raven Vision into Source of Truth, ledger, and projected state", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(
        server,
        "person",
        "\r\nThe category changed shape.\r\n\r\nRaven should remember it.\r\n",
      );
      await reviewVisionSlot(server, "person", "approve");
      for (const slotId of RAVEN_VISION_SLOT_IDS.filter((candidate) => candidate !== "person")) {
        await reviewVisionSlot(server, slotId, "skip");
      }

      const banked = await bankVision(server);
      expect(banked.vision.status).toBe("banked");
      expect(banked.vision.readyToBank).toBeFalse();
      expect(banked.knowledgeBank.subjects.vision.status).toBe("ready_for_atomization");
      expect(banked.knowledgeBank.subjects.vocabulary.status).toBe("locked");
      expect(banked.sourceOfTruth.path).toBe(
        "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
      );
      expect(banked.events.sourceConversionStarted.type).toBe("source_conversion.started");
      expect(banked.events.sourceConversionReadyToFreeze.type).toBe(
        "source_conversion.ready_to_freeze",
      );
      expect(banked.events.sourceOfTruthFrozen.type).toBe("source_of_truth.frozen");
      expect(banked.events.sourceConversionCompleted.type).toBe("source_conversion.completed");
      expect(banked.events.sourceOfTruthUpdated.type).toBe("raven.source_of_truth.updated");
      expect(banked.events.visionBanked.type).toBe("raven.vision.banked");

      const sourceOfTruth = readFileSync(ravenSourceOfTruthPath(cwd), "utf8");
      expect(sourceOfTruth).toBe(
        [
          "# Raven Product Context",
          "",
          "Generated from approved Raven Vision slots.",
          "",
          "## Vision",
          "",
          "### The Person",
          "",
          "The category changed shape.",
          "",
          "Raven should remember it.",
          "",
        ].join("\n"),
      );
      expect(banked.sourceOfTruth.contentHash).toBe(expectedHash(sourceOfTruth));

      const config = JSON.parse(readFileSync(configPath(cwd), "utf8")) as {
        agents?: {
          raven?: {
            sourceOfTruth?: { path: string; contentHash: string };
            knowledgeBank?: {
              playUnlocks?: unknown;
              subjects?: Record<string, { status?: string }>;
            };
            onboarding?: { vision?: { status?: string; bankedAt?: string } };
          };
        };
      };
      expect(config.agents?.raven?.sourceOfTruth).toBeUndefined();
      expect(config.agents?.raven?.onboarding?.vision).toBeUndefined();
      expect(config.agents?.raven?.knowledgeBank).toBeUndefined();

      const events = readLedgerEvents(cwd);
      const conversionStartedEventIndex = events.findIndex(
        (event) => event.type === "source_conversion.started",
      );
      const readyToFreezeEventIndex = events.findIndex(
        (event) => event.type === "source_conversion.ready_to_freeze",
      );
      const frozenEventIndex = events.findIndex((event) => event.type === "source_of_truth.frozen");
      const conversionCompletedEventIndex = events.findIndex(
        (event) => event.type === "source_conversion.completed",
      );
      const sourceEventIndex = events.findIndex(
        (event) => event.type === "raven.source_of_truth.updated",
      );
      const bankedEventIndex = events.findIndex((event) => event.type === "raven.vision.banked");
      expect(conversionStartedEventIndex).toBeGreaterThanOrEqual(0);
      expect(readyToFreezeEventIndex).toBeGreaterThan(conversionStartedEventIndex);
      expect(frozenEventIndex).toBeGreaterThan(readyToFreezeEventIndex);
      expect(conversionCompletedEventIndex).toBeGreaterThan(frozenEventIndex);
      expect(sourceEventIndex).toBeGreaterThan(conversionCompletedEventIndex);
      expect(bankedEventIndex).toBeGreaterThan(sourceEventIndex);
      expect(events[frozenEventIndex]?.payload).toMatchObject({
        sourceOfTruthId: expect.any(String),
        sourceConversionId: expect.any(String),
        agentId: "raven",
        knowledgeBankAreaId: "vision",
        path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
        contentHash: banked.sourceOfTruth.contentHash,
      });
      expect(events[bankedEventIndex]?.payload).toEqual({
        sourceOfTruthPath: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
        contentHash: banked.sourceOfTruth.contentHash,
      });

      const retry = await bankVision(server);
      expect(retry.sourceOfTruth.contentHash).toBe(banked.sourceOfTruth.contentHash);
      expect(
        readLedgerEvents(cwd).filter(
          (event) =>
            event.type === "raven.source_of_truth.updated" ||
            event.type === "raven.vision.banked" ||
            event.type === "source_conversion.started" ||
            event.type === "source_conversion.ready_to_freeze" ||
            event.type === "source_of_truth.frozen" ||
            event.type === "source_conversion.completed",
        ),
      ).toHaveLength(6);

      const inspected = runCli(["inspect", "state", "--json"], cwd);
      expect(inspected.exitCode).toBe(0);
      const projected = JSON.parse(inspected.stdout) as {
        raven: {
          knowledgeBank: {
            subjects: {
              vision: {
                sourceOfTruth?: { contentHash: string };
                status: string;
              };
              vocabulary: { status: string };
            };
          };
          sourceOfTruth: { path: string; contentHash: string };
          vision: { status: string };
        };
        knowledgeBankAreas: Array<{
          frozenSourceOfTruthIds: string[];
          id: string;
          status: string;
        }>;
        sourceConversions: Array<{
          id: string;
          sourceOfTruthIds: string[];
          status: string;
        }>;
        sourceOfTruths: Array<{
          id: string;
          path: string;
        }>;
      };
      expect(projected.raven.vision.status).toBe("banked");
      expect(projected.raven.knowledgeBank.subjects.vision.status).toBe("ready_for_atomization");
      expect(projected.raven.knowledgeBank.subjects.vocabulary.status).toBe("locked");
      expect(projected.raven.knowledgeBank.subjects.vision.sourceOfTruth?.contentHash).toBe(
        banked.sourceOfTruth.contentHash,
      );
      expect(projected.raven.sourceOfTruth.contentHash).toBe(banked.sourceOfTruth.contentHash);
      expect(projected.sourceConversions).toEqual([
        expect.objectContaining({
          sourceOfTruthIds: [expect.any(String)],
          status: "completed",
        }),
      ]);
      expect(projected.sourceOfTruths).toEqual([
        expect.objectContaining({
          path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
        }),
      ]);
      expect(projected.knowledgeBankAreas.find((area) => area.id === "vision")).toMatchObject({
        frozenSourceOfTruthIds: [projected.sourceOfTruths[0]!.id],
        status: "ready_for_atomization",
      });
      expect(existsSync(join(cwd, "docs/alexandria/library"))).toBeFalse();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("CLI Raven Vision bank uses runtime banking and reports Source of Truth metadata", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    let server: StartedAlexandriaRuntimeServer | null = await startApiServer(cwd);

    try {
      await startVision(server);
      await Effect.runPromise(server.stop);
      server = null;

      const notReadyCliBank = runCli(["raven", "vision", "bank", "--json"], cwd);
      expect(notReadyCliBank.exitCode).toBe(1);
      expect(notReadyCliBank.stdout).toBe("");
      expect(notReadyCliBank.stderr).toContain("Vision must be ready_to_bank before banking.");
      expect(existsSync(ravenSourceOfTruthPath(cwd))).toBeFalse();

      server = await startApiServer(cwd);
      await updateVisionSlot(server, "person", "CLI banked Vision text.");
      await reviewVisionSlot(server, "person", "approve");
      for (const slotId of RAVEN_VISION_SLOT_IDS.filter((candidate) => candidate !== "person")) {
        await reviewVisionSlot(server, slotId, "skip");
      }

      await Effect.runPromise(server.stop);
      server = null;

      const cliBank = runCli(["raven", "vision", "bank", "--json"], cwd);
      expect(cliBank.exitCode).toBe(0);
      expect(cliBank.stderr).toBe("");
      const output = JSON.parse(cliBank.stdout) as {
        command: string;
        events: {
          sourceConversionStarted: { id: string; type: string };
          sourceConversionReadyToFreeze: { id: string; type: string };
          sourceOfTruthFrozen: { id: string; type: string };
          sourceConversionCompleted: { id: string; type: string };
          sourceOfTruthUpdated: { id: string; type: string };
          visionBanked: { id: string; type: string };
        };
        knowledgeBank: { subjects: { vision: { status: string } } };
        sourceOfTruth: { path: string; contentHash: string };
        vision: { status: string };
      };
      expect(output.command).toBe("ax raven vision bank");
      expect(output.vision.status).toBe("banked");
      expect(output.sourceOfTruth.path).toBe(
        "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
      );
      expect(output.sourceOfTruth.contentHash).toStartWith("sha256:");
      expect(output.knowledgeBank.subjects.vision.status).toBe("ready_for_atomization");
      expect(output.events.sourceConversionStarted.type).toBe("source_conversion.started");
      expect(output.events.sourceConversionReadyToFreeze.type).toBe(
        "source_conversion.ready_to_freeze",
      );
      expect(output.events.sourceOfTruthFrozen.type).toBe("source_of_truth.frozen");
      expect(output.events.sourceConversionCompleted.type).toBe("source_conversion.completed");
      expect(output.events.sourceOfTruthUpdated.type).toBe("raven.source_of_truth.updated");
      expect(output.events.visionBanked.type).toBe("raven.vision.banked");
      expect(existsSync(ravenSourceOfTruthPath(cwd))).toBeTrue();
    } finally {
      if (server != null) {
        await Effect.runPromise(server.stop);
      }
    }
  });

  test("CLI Raven slot approve and skip use runtime review actor and projected state", async () => {
    const notStartedCwd = makeProjectDir();
    initProject(notStartedCwd);
    const notStartedApprove = runCli(
      ["raven", "vision", "slot", "approve", "--slot", "the-work", "--json"],
      notStartedCwd,
    );
    expect(notStartedApprove.exitCode).toBe(1);
    expect(notStartedApprove.stdout).toBe("");
    expect(notStartedApprove.stderr).toContain("Vision onboarding has not started.");
    const notStartedEvents = existsSync(ledgerPath(notStartedCwd))
      ? readLedgerEvents(notStartedCwd)
      : [];
    expect(
      notStartedEvents.filter(
        (event) =>
          event.type === "raven.vision.slot.approved" || event.type === "raven.vision.slot.skipped",
      ),
    ).toHaveLength(0);

    const cwd = makeProjectDir();
    initProject(cwd);
    let server: StartedAlexandriaRuntimeServer | null = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(server, "the-work", "A work step worth preserving.");
      await updateVisionSlot(server, "person", "A person slot to skip.");
      await Effect.runPromise(server.stop);
      server = null;

      const approve = runCli(
        ["raven", "vision", "slot", "approve", "--slot", "the-work", "--json"],
        cwd,
      );
      expect(approve.exitCode).toBe(0);
      expect(approve.stderr).toBe("");
      const approveOutput = JSON.parse(approve.stdout) as {
        actor: { host: string; kind: string; name: string };
        command: string;
        runtime: { lifecycle: string; url: string };
        slot: { id: string; status: string; text: string };
        vision: { readyToBank: boolean; slotCount: number; status: string };
      };
      expect(approveOutput.command).toBe("ax raven vision slot approve");
      expect(approveOutput.actor).toEqual({
        kind: "user",
        host: "claude-code",
        name: "Director",
      });
      expect(approveOutput.slot).toMatchObject({
        id: "the-work",
        status: "approved",
        text: "A work step worth preserving.",
      });
      expect(approveOutput.vision.slotCount).toBe(4);
      expect(["existing", "temporary"]).toContain(approveOutput.runtime.lifecycle);

      const skip = runCli(["raven", "vision", "slot", "skip", "--slot", "person", "--json"], cwd);
      expect(skip.exitCode).toBe(0);
      expect(skip.stderr).toBe("");
      const skipOutput = JSON.parse(skip.stdout) as {
        actor: { host: string; kind: string; name: string };
        command: string;
        slot: { id: string; status: string; text: string };
      };
      expect(skipOutput.command).toBe("ax raven vision slot skip");
      expect(skipOutput.actor).toEqual({
        kind: "user",
        host: "claude-code",
        name: "Director",
      });
      expect(skipOutput.slot).toMatchObject({
        id: "person",
        status: "skipped",
        text: "",
      });

      const state = runCli(["inspect", "state", "--json"], cwd);
      expect(state.exitCode).toBe(0);
      expect(state.stderr).toBe("");
      const projected = JSON.parse(state.stdout) as {
        raven: {
          vision: {
            slots: Array<{ id: string; status: string; text: string }>;
          };
        };
      };
      expect(projected.raven.vision.slots.find((slot) => slot.id === "the-work")).toMatchObject({
        status: "approved",
        text: "A work step worth preserving.",
      });
      expect(projected.raven.vision.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "skipped",
        text: "",
      });

      const events = readLedgerEvents(cwd);
      expect(
        events.find(
          (event) =>
            event.type === "raven.vision.slot.approved" && event.payload.slotId === "the-work",
        ),
      ).toMatchObject({
        actor: { kind: "user", host: "claude-code", name: "Director" },
      });
      expect(
        events.find(
          (event) =>
            event.type === "raven.vision.slot.skipped" && event.payload.slotId === "person",
        ),
      ).toMatchObject({
        actor: { kind: "user", host: "claude-code", name: "Director" },
      });
    } finally {
      if (server != null) {
        await Effect.runPromise(server.stop);
      }
    }
  });

  test("records Raven-authored slot updates and preserves review/source state", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(server, "the-work", "Approved the-work.");
      await reviewVisionSlot(server, "the-work", "approve");
      await updateVisionSlot(server, "person", "Skipped person.");
      await reviewVisionSlot(server, "person", "skip");
      await updateVisionSlot(server, "refusal", "Still waiting.");

      const noteCreate = await fetch(new URL("/api/sources", server.url), {
        body: JSON.stringify({
          type: "note",
          attachToVision: true,
          title: "Raven source",
          text: "A source attached before Raven writes.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(noteCreate.status).toBe(200);
      const beforeRaven = await readVision(server);
      expect(beforeRaven.sourceItemIds).toHaveLength(1);

      const body = {
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        idempotencyKey: "raven:vision:mechanism:test",
        text: "Raven writes one mechanism draft.",
      };
      const response = await fetch(
        new URL("/api/raven/onboarding/vision/slots/mechanism", server.url),
        {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(response.status).toBe(200);
      const projection = (await response.json()) as {
        sourceItemIds: string[];
        slots: Array<{ id: string; status: string; text: string }>;
      };

      expect(projection.sourceItemIds).toEqual(beforeRaven.sourceItemIds);
      expect(projection.slots.find((slot) => slot.id === "the-work")).toMatchObject({
        status: "approved",
        text: "Approved the-work.",
      });
      expect(projection.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "skipped",
        text: "",
      });
      expect(projection.slots.find((slot) => slot.id === "refusal")).toMatchObject({
        status: "needs_review",
        text: "Still waiting.",
      });
      expect(projection.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "needs_review",
        text: "Raven writes one mechanism draft.",
      });

      const approvedMechanism = await reviewVisionSlot(server, "mechanism", "approve");
      expect(approvedMechanism.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "approved",
      });

      const retry = await fetch(
        new URL("/api/raven/onboarding/vision/slots/mechanism", server.url),
        {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          method: "PATCH",
        },
      );
      expect(retry.status).toBe(200);
      const retryProjection = (await retry.json()) as {
        slots: Array<{ id: string; status: string; text: string }>;
      };
      expect(retryProjection.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "approved",
        text: "Raven writes one mechanism draft.",
      });

      const events = readLedgerEvents(cwd);
      const ravenUpdates = events.filter(
        (event) =>
          event.type === "raven.vision.slot.updated" &&
          event.idempotencyKey === "raven:vision:mechanism:test",
      );
      expect(ravenUpdates).toHaveLength(1);
      expect(ravenUpdates[0]).toMatchObject({
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        payload: {
          slotId: "mechanism",
          text: "Raven writes one mechanism draft.",
        },
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("requests Raven drafting separately from source attachment", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      await startVision(server);

      const prematureRequest = await fetch(
        new URL("/api/raven/onboarding/vision/drafting-request", server.url),
        {
          method: "POST",
        },
      );
      expect(prematureRequest.status).toBe(409);

      const sourceResponse = await fetch(new URL("/api/sources", server.url), {
        body: JSON.stringify({
          type: "note",
          attachToVision: true,
          title: "Drafting source",
          text: "A source attached before explicit drafting begins.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(sourceResponse.status).toBe(200);
      const source = (await sourceResponse.json()) as {
        sourceItem: { id: string };
        vision: RuntimeVisionProjection;
      };
      expect(source.vision.sourceItemIds).toEqual([source.sourceItem.id]);
      expect(source.vision.slots.every((slot) => slot.status === "empty")).toBeTrue();

      const beforeRequestEvents = readLedgerEvents(cwd);
      expect(
        beforeRequestEvents.some((event) => event.type === "raven.vision.drafting_requested"),
      ).toBeFalse();

      const requested = await requestVisionDrafting(server);
      expect(requested.sourceItemIds).toEqual([source.sourceItem.id]);
      expect(requested.slots.every((slot) => slot.status === "empty")).toBeTrue();

      const events = readLedgerEvents(cwd);
      const sourceAttachedIndex = events.findIndex(
        (event) =>
          event.type === "raven.vision.source_attached" &&
          event.payload.sourceId === source.sourceItem.id,
      );
      const draftRequestedIndex = events.findIndex(
        (event) => event.type === "raven.vision.drafting_requested",
      );
      expect(sourceAttachedIndex).toBeGreaterThanOrEqual(0);
      expect(draftRequestedIndex).toBeGreaterThan(sourceAttachedIndex);
      expect(events[draftRequestedIndex]).toMatchObject({
        actor: { kind: "user", host: "viewer" },
        payload: {},
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("adds a later source during mixed review and preserves state through Raven continuation", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);
    let serverStopped = false;
    let restartedServer: StartedAlexandriaRuntimeServer | null = null;

    try {
      await startVision(server);

      const initialSourceResponse = await fetch(new URL("/api/sources", server.url), {
        body: JSON.stringify({
          type: "note",
          attachToVision: true,
          title: "Initial source",
          text: "A source attached before mixed review begins.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(initialSourceResponse.status).toBe(200);
      const initialSource = (await initialSourceResponse.json()) as {
        sourceItem: { id: string };
      };

      await updateVisionSlot(server, "the-work", "Approved the-work.");
      await reviewVisionSlot(server, "the-work", "approve");
      await updateVisionSlot(server, "person", "Person context to skip.");
      await reviewVisionSlot(server, "person", "skip");
      await updateVisionSlot(server, "refusal", "Still waiting.");

      const beforeLateSource = await readVision(server);
      const beforeSourceIds = [...beforeLateSource.sourceItemIds];
      const mixedSlotIds = ["the-work", "person", "refusal"];
      const beforeMixedSlots = slotSnapshot(beforeLateSource, mixedSlotIds);

      expect(beforeSourceIds).toEqual([initialSource.sourceItem.id]);
      expect(beforeMixedSlots["the-work"]).toMatchObject({
        status: "approved",
        text: "Approved the-work.",
      });
      expect(beforeMixedSlots.person).toMatchObject({
        status: "skipped",
        text: "",
      });
      expect(beforeMixedSlots.refusal).toMatchObject({
        status: "needs_review",
        text: "Still waiting.",
      });
      expect(beforeLateSource.status).toBe("in_progress");
      expect(beforeLateSource.readyToBank).toBeFalse();

      const streamResponse = await fetch(new URL("/api/events-stream", server.url));
      expect(streamResponse.status).toBe(200);
      const reader = streamResponse.body!.getReader();
      const sseState = { buffer: "" };
      const ready = await readNextSse(reader, sseState);
      expect(ready.event).toBe("ready");

      const lateSourceResponse = await fetch(new URL("/api/sources", server.url), {
        body: JSON.stringify({
          type: "note",
          attachToVision: true,
          title: "Late review source",
          text: "A source discovered during slot review.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(lateSourceResponse.status).toBe(200);
      const lateSource = (await lateSourceResponse.json()) as {
        sourceItem: { id: string; title: string };
        sourceItems: Array<{ id: string }>;
        status: string;
        vision: RuntimeVisionProjection;
      };
      const expandedSourceIds = [...beforeSourceIds, lateSource.sourceItem.id];

      const sourceEvent = await readNextSse(reader, sseState);
      const attachEvent = await readNextSse(reader, sseState);
      const projectState = await readNextSse(reader, sseState);
      await reader.cancel().catch(() => undefined);

      expect(sourceEvent).toMatchObject({
        event: "state-event",
        data: {
          event: {
            payload: { sourceId: lateSource.sourceItem.id },
            type: "source.added",
          },
          status: "appended",
        },
      });
      expect(attachEvent).toMatchObject({
        event: "state-event",
        data: {
          event: {
            payload: { sourceId: lateSource.sourceItem.id },
            type: "raven.vision.source_attached",
          },
          status: "appended",
        },
      });
      expect(projectState).toMatchObject({
        event: "project-state",
        data: {
          raven: {
            vision: {
              sourceItemIds: expandedSourceIds,
            },
          },
        },
      });

      expect(lateSource.status).toBe("appended");
      expect(lateSource.vision.sourceItemIds).toEqual(expandedSourceIds);
      expect(lateSource.vision.sourceItems.map((item) => item.id)).toEqual(expandedSourceIds);
      expect(slotSnapshot(lateSource.vision, mixedSlotIds)).toEqual(beforeMixedSlots);

      const afterLateSource = await readVision(server);
      expect(afterLateSource.sourceItemIds).toEqual(expandedSourceIds);
      expect(afterLateSource.sourceItems.map((item) => item.id)).toEqual(expandedSourceIds);
      expect(slotSnapshot(afterLateSource, mixedSlotIds)).toEqual(beforeMixedSlots);
      expect(afterLateSource.status).toBe("in_progress");
      expect(afterLateSource.readyToBank).toBeFalse();

      const sourceProjection = readFileSync(sourcesPath(cwd), "utf8")
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as { id: string });
      expect(sourceProjection.map((item) => item.id)).toEqual(expandedSourceIds);

      const config = JSON.parse(readFileSync(configPath(cwd), "utf8")) as {
        agents?: {
          raven?: {
            onboarding?: {
              vision?: { sourceItemIds?: string[] };
            };
          };
        };
      };
      expect(config.agents?.raven?.onboarding?.vision).toBeUndefined();

      const inspected = runCli(["inspect", "state", "--json"], cwd);
      expect(inspected.exitCode).toBe(0);
      expect(inspected.stderr).toBe("");
      const projected = JSON.parse(inspected.stdout) as {
        raven: { vision: RuntimeVisionProjection };
        sourceItems: Array<{ id: string }>;
      };
      expect(projected.sourceItems.map((item) => item.id)).toEqual(expandedSourceIds);
      expect(projected.raven.vision.sourceItemIds).toEqual(expandedSourceIds);
      expect(projected.raven.vision.sourceItems.map((item) => item.id)).toEqual(expandedSourceIds);
      expect(slotSnapshot(projected.raven.vision, mixedSlotIds)).toEqual(beforeMixedSlots);

      const listed = runCli(["inspect", "events", "list", "--json", "--limit", "20"], cwd);
      expect(listed.exitCode).toBe(0);
      expect(listed.stderr).toBe("");
      const listedEvents = JSON.parse(listed.stdout) as {
        events: Array<{ payload: Record<string, unknown>; type: string }>;
      };
      expect(
        listedEvents.events.find(
          (event) =>
            event.type === "source.added" && event.payload.sourceId === lateSource.sourceItem.id,
        ),
      ).toBeDefined();
      expect(
        listedEvents.events.find(
          (event) =>
            event.type === "raven.vision.source_attached" &&
            event.payload.sourceId === lateSource.sourceItem.id,
        ),
      ).toBeDefined();

      await Effect.runPromise(server.stop);
      serverStopped = true;

      const draftPath = join(cwd, "raven-mechanism-draft.txt");
      writeFileSync(draftPath, "Raven writes one mechanism draft after the late source.\n");
      const ravenUpdate = runCli(
        [
          "raven",
          "vision",
          "slot",
          "update",
          "--slot",
          "mechanism",
          "--text-file",
          draftPath,
          "--json",
        ],
        cwd,
      );
      expect(ravenUpdate.exitCode).toBe(0);
      expect(ravenUpdate.stderr).toBe("");
      const ravenOutput = JSON.parse(ravenUpdate.stdout) as {
        command: string;
        slot: { id: string; status: string; text: string };
      };
      expect(ravenOutput.command).toBe("ax raven vision slot update");
      expect(ravenOutput.slot).toMatchObject({
        id: "mechanism",
        status: "needs_review",
        text: "Raven writes one mechanism draft after the late source.\n",
      });

      restartedServer = await startApiServer(cwd);
      const afterRaven = await readVision(restartedServer);
      expect(afterRaven.sourceItemIds).toEqual(expandedSourceIds);
      expect(afterRaven.sourceItems.map((item) => item.id)).toEqual(expandedSourceIds);
      expect(slotSnapshot(afterRaven, mixedSlotIds)).toEqual(beforeMixedSlots);
      expect(slotSnapshot(afterRaven, ["mechanism"]).mechanism).toMatchObject({
        status: "needs_review",
        text: "Raven writes one mechanism draft after the late source.\n",
      });

      const ledgerEvents = readLedgerEvents(cwd);
      const lateSourceIndex = ledgerEvents.findIndex(
        (event) =>
          event.type === "source.added" && event.payload.sourceId === lateSource.sourceItem.id,
      );
      const lateAttachIndex = ledgerEvents.findIndex(
        (event) =>
          event.type === "raven.vision.source_attached" &&
          event.payload.sourceId === lateSource.sourceItem.id,
      );
      const ravenUpdateIndex = ledgerEvents.findIndex(
        (event) =>
          event.type === "raven.vision.slot.updated" &&
          event.payload.slotId === "mechanism" &&
          event.payload.text === "Raven writes one mechanism draft after the late source.\n",
      );
      expect(lateSourceIndex).toBeGreaterThanOrEqual(0);
      expect(lateAttachIndex).toBeGreaterThan(lateSourceIndex);
      expect(ravenUpdateIndex).toBeGreaterThan(lateAttachIndex);
    } finally {
      if (!serverStopped) {
        await Effect.runPromise(server.stop);
      }
      if (restartedServer != null) {
        await Effect.runPromise(restartedServer.stop);
      }
    }
  });

  test("CLI Raven slot update accepts dash-prefixed inline text and notes", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    let server: StartedAlexandriaRuntimeServer | null = await startApiServer(cwd);

    try {
      await startVision(server);
      await Effect.runPromise(server.stop);
      server = null;

      const notesUpdate = runCli(
        [
          "raven",
          "vision",
          "slot",
          "update",
          "--slot",
          "person",
          "--text",
          "ok",
          "--notes",
          "- Sources: founder brain-dump",
          "--json",
        ],
        cwd,
      );
      if (notesUpdate.exitCode !== 0) {
        throw new Error(`Raven slot update command failed: ${JSON.stringify(notesUpdate)}`);
      }
      expect(notesUpdate.exitCode).toBe(0);
      expect(notesUpdate.stderr).toBe("");
      const notesOutput = JSON.parse(notesUpdate.stdout) as {
        command: string;
        slot: { id: string; ravenNotes?: string; status: string; text: string };
      };
      expect(notesOutput.command).toBe("ax raven vision slot update");
      expect(notesOutput.slot).toMatchObject({
        id: "person",
        ravenNotes: "- Sources: founder brain-dump",
        status: "needs_review",
        text: "ok",
      });

      const textUpdate = runCli(
        [
          "raven",
          "vision",
          "slot",
          "update",
          "--slot",
          "mechanism",
          "--text",
          "- ok",
          "--notes",
          "Notes",
          "--json",
        ],
        cwd,
      );
      if (textUpdate.exitCode !== 0) {
        throw new Error(`Raven slot update command failed: ${JSON.stringify(textUpdate)}`);
      }
      expect(textUpdate.exitCode).toBe(0);
      expect(textUpdate.stderr).toBe("");
      const textOutput = JSON.parse(textUpdate.stdout) as {
        command: string;
        slot: { id: string; ravenNotes?: string; status: string; text: string };
      };
      expect(textOutput.command).toBe("ax raven vision slot update");
      expect(textOutput.slot).toMatchObject({
        id: "mechanism",
        ravenNotes: "Notes",
        status: "needs_review",
        text: "- ok",
      });
    } finally {
      if (server != null) {
        await Effect.runPromise(server.stop);
      }
    }
  });

  test("CLI Raven slot update uses runtime ledger and can read review feedback", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    let server: StartedAlexandriaRuntimeServer | null = await startApiServer(cwd);

    try {
      await startVision(server);
      await Effect.runPromise(server.stop);
      server = null;

      const update = runCli(
        [
          "raven",
          "vision",
          "slot",
          "update",
          "--slot",
          "person",
          "--text",
          "Raven drafts one person slot.",
          "--notes",
          "Drawn from the source set; user should verify the composite.",
          "--json",
        ],
        cwd,
      );
      if (update.exitCode !== 0) {
        throw new Error(`Raven slot update command failed: ${JSON.stringify(update)}`);
      }
      expect(update.exitCode).toBe(0);
      expect(update.stderr).toBe("");
      const output = JSON.parse(update.stdout) as {
        actor: { host: string; kind: string; name: string };
        command: string;
        runtime: { lifecycle: string; url: string };
        slot: {
          id: string;
          ravenDraftedAt?: string;
          ravenNotes?: string;
          ravenNotesUpdatedAt?: string;
          status: string;
          text: string;
        };
        vision: { readyToBank: boolean; status: string };
      };
      expect(output.command).toBe("ax raven vision slot update");
      expect(output.actor).toEqual({
        kind: "agent",
        host: "claude-code",
        name: "Raven",
      });
      expect(output.slot).toMatchObject({
        id: "person",
        ravenNotes: "Drawn from the source set; user should verify the composite.",
        status: "needs_review",
        text: "Raven drafts one person slot.",
      });
      expect(output.slot.ravenDraftedAt).toBeString();
      expect(output.slot.ravenNotesUpdatedAt).toBe(output.slot.ravenDraftedAt);
      expect(output.vision.status).toBe("in_progress");
      expect(["existing", "temporary"]).toContain(output.runtime.lifecycle);

      server = await startApiServer(cwd);
      await reviewVisionSlot(server, "person", "skip");
      await Effect.runPromise(server.stop);
      server = null;

      const mechanismUpdate = runCli(
        [
          "raven",
          "vision",
          "slot",
          "update",
          "--slot",
          "mechanism",
          "--text",
          "Raven drafts one mechanism slot.",
          "--json",
        ],
        cwd,
      );
      expect(mechanismUpdate.exitCode).toBe(0);

      server = await startApiServer(cwd);
      await updateVisionSlot(server, "mechanism", "User edits Raven's mechanism draft.");
      await Effect.runPromise(server.stop);
      server = null;

      const state = runCli(["inspect", "state", "--json"], cwd);
      expect(state.exitCode).toBe(0);
      const projected = JSON.parse(state.stdout) as {
        raven: {
          vision: {
            slots: Array<{
              id: string;
              ravenNotes?: string;
              status: string;
              text: string;
            }>;
          };
        };
      };
      expect(projected.raven.vision.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "skipped",
        text: "",
      });
      expect(
        projected.raven.vision.slots.find((slot) => slot.id === "person")?.ravenNotes,
      ).toBeUndefined();
      expect(projected.raven.vision.slots.find((slot) => slot.id === "mechanism")).toMatchObject({
        status: "needs_review",
        text: "User edits Raven's mechanism draft.",
      });

      const listed = runCli(["inspect", "events", "list", "--json", "--limit", "20"], cwd);
      expect(listed.exitCode).toBe(0);
      const eventsOutput = JSON.parse(listed.stdout) as {
        events: Array<{
          actor: { host?: string; kind?: string; name?: string };
          payload: Record<string, unknown>;
          type: string;
        }>;
      };
      expect(
        eventsOutput.events.find(
          (event) =>
            event.type === "raven.vision.slot.updated" && event.payload.slotId === "person",
        ),
      ).toMatchObject({
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        payload: {
          ravenNotes: "Drawn from the source set; user should verify the composite.",
        },
      });
      expect(
        eventsOutput.events.find(
          (event) =>
            event.type === "raven.vision.slot.skipped" && event.payload.slotId === "person",
        ),
      ).toBeDefined();
      expect(
        eventsOutput.events.find(
          (event) =>
            event.type === "raven.vision.slot.updated" &&
            event.payload.slotId === "mechanism" &&
            event.payload.text === "Raven drafts one mechanism slot.",
        ),
      ).toMatchObject({
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
      });
      expect(
        eventsOutput.events.find(
          (event) =>
            event.type === "raven.vision.slot.updated" &&
            event.payload.slotId === "mechanism" &&
            event.payload.text === "User edits Raven's mechanism draft.",
        ),
      ).toMatchObject({
        actor: { kind: "user", host: "viewer" },
      });
    } finally {
      if (server != null) {
        await Effect.runPromise(server.stop);
      }
    }
  });

  test("creates file, URL, and note sources and attaches them to Vision", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const captureServer = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () =>
        new Response("Fetched URL source.\n", {
          headers: { "content-type": "text/plain" },
        }),
    });
    const server = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(server, "person", "Preserve this slot.");

      const fileForm = new FormData();
      fileForm.set("type", "file");
      fileForm.set("attachToVision", "true");
      fileForm.set(
        "file",
        new File(["Uploaded file source.\n"], "vision-notes.txt", {
          type: "text/plain",
        }),
      );
      const fileCreate = (await (
        await fetch(new URL("/api/sources", server.url), {
          body: fileForm,
          method: "POST",
        })
      ).json()) as {
        attachedToVision: boolean;
        sourceItem: { id: string; sourcePath: string; title: string };
        status: string;
      };
      expect(fileCreate.status).toBe("appended");
      expect(fileCreate.attachedToVision).toBeTrue();
      expect(fileCreate.sourceItem.title).toBe("vision-notes.txt");

      const urlCreate = (await (
        await fetch(new URL("/api/sources", server.url), {
          body: JSON.stringify({
            type: "url",
            attachToVision: true,
            title: "Fetched brief",
            url: captureServer.url.toString(),
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        })
      ).json()) as {
        sourceItem: { id: string; sourcePath: string; title: string };
        status: string;
      };
      expect(urlCreate.status).toBe("appended");
      expect(urlCreate.sourceItem.title).toBe("Fetched brief");

      const noteBody = {
        type: "note",
        attachToVision: true,
        title: "Typed note",
        text: "A typed note for the Vision flow.",
      };
      const noteCreate = (await (
        await fetch(new URL("/api/sources", server.url), {
          body: JSON.stringify(noteBody),
          headers: { "content-type": "application/json" },
          method: "POST",
        })
      ).json()) as {
        sourceItem: { id: string; sourcePath: string; title: string };
        status: string;
      };
      expect(noteCreate.status).toBe("appended");

      const retryNote = (await (
        await fetch(new URL("/api/sources", server.url), {
          body: JSON.stringify(noteBody),
          headers: { "content-type": "application/json" },
          method: "POST",
        })
      ).json()) as { status: string };
      expect(retryNote.status).toBe("already_appended");

      const sources = (await (await fetch(new URL("/api/sources", server.url))).json()) as {
        sourceItems: Array<{ id: string; sourcePath: string; status: string }>;
        totalCount: number;
      };
      expect(sources.totalCount).toBe(3);
      expect(sources.sourceItems.map((item) => item.status)).toEqual([
        "unprocessed",
        "unprocessed",
        "unprocessed",
      ]);

      const projectionLines = readFileSync(sourcesPath(cwd), "utf8")
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as { id: string; sourcePath: string });
      expect(projectionLines).toHaveLength(3);
      expect(new Set(projectionLines.map((item) => item.id)).size).toBe(3);

      const originals = readdirSync(sourceOriginalsPath(cwd));
      expect(originals).toHaveLength(3);
      const urlMarkdown = readFileSync(join(cwd, urlCreate.sourceItem.sourcePath), "utf8");
      expect(urlMarkdown).toContain('captureType: "url"');
      expect(urlMarkdown).toContain('title: "Fetched brief"');
      expect(urlMarkdown).toContain("Fetched URL source.");
      const noteMarkdown = readFileSync(join(cwd, noteCreate.sourceItem.sourcePath), "utf8");
      expect(noteMarkdown).toContain('captureType: "typed_note"');
      expect(noteMarkdown).toContain("A typed note for the Vision flow.");

      const vision = await readVision(server);
      expect(vision.sourceItemIds).toEqual(sources.sourceItems.map((item) => item.id));
      expect(vision.sourceItems).toHaveLength(3);
      expect(vision.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "needs_review",
        text: "Preserve this slot.",
      });

      const events = readLedgerEvents(cwd);
      expect(events.filter((event) => event.type === "source.added")).toHaveLength(3);
      expect(events.filter((event) => event.type === "raven.vision.source_attached")).toHaveLength(
        3,
      );
    } finally {
      captureServer.stop(true);
      await Effect.runPromise(server.stop);
    }
  });

  test("serves connection leases with active status", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const workspace = workspacePath(cwd);
    const now = new Date().toISOString();
    const connectionId = "host:claude-code:runtime";
    const subscription = unwrap(
      createWakeSubscription({
        connectionId,
        eventTypes: ["canvas.review.requested"],
        host: "claude-code",
        now,
        subscriptionId: "host:claude-code:runtime:reviews",
      }),
    );
    await Effect.runPromise(writeWakeSubscription({ subscription, workspacePath: workspace }));
    await Effect.runPromise(
      writeConnectionLease({
        lease: unwrap(
          createConnectionLease({
            connectionId,
            cursorId: connectionId,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
            host: "claude-code",
            now,
            pid: process.pid,
          }),
        ),
        workspacePath: workspace,
      }),
    );

    const server = await startApiServer(cwd);

    try {
      const connections = (await (await fetch(new URL("/api/connections", server.url))).json()) as {
        activeCount: number;
        connections: Array<{
          active: boolean;
          connectionId: string;
          subscriptions: Array<{ subscriptionId: string }>;
        }>;
        totalCount: number;
      };

      expect(connections.totalCount).toBe(1);
      expect(connections.activeCount).toBe(1);
      expect(connections.connections[0]).toMatchObject({
        active: true,
        connectionId,
        owner: { host: "claude-code", kind: "process" },
        subscriptions: [{ subscriptionId: "host:claude-code:runtime:reviews" }],
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("deletes connection leases by id", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const workspace = workspacePath(cwd);
    const now = new Date().toISOString();
    const connectionId = "host:freeq-raven:runtime";
    const leasePath = connectionPathForWorkspacePath(workspace, connectionId);
    const lease = createConnectionLease({
      connectionId,
      cursorId: connectionId,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      host: "freeq-raven",
      now,
      pid: process.pid,
    });
    if (lease instanceof Error) {
      throw lease;
    }
    await Effect.runPromise(
      writeConnectionLease({
        lease,
        workspacePath: workspace,
      }),
    );

    const server = await startApiServer(cwd);

    try {
      const response = await fetch(
        new URL(`/api/connections/${encodeURIComponent(connectionId)}`, server.url),
        { method: "DELETE" },
      );
      const connections = (await response.json()) as {
        activeCount: number;
        connections: unknown[];
        rawLeaseCount: number;
        totalCount: number;
      };

      expect(response.status).toBe(200);
      expect(existsSync(leasePath)).toBe(false);
      expect(connections.rawLeaseCount).toBe(0);
      expect(connections.totalCount).toBe(0);
      expect(connections.activeCount).toBe(0);
      expect(connections.connections).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves empty connection summary when no plugin connections exist", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const connections = (await (await fetch(new URL("/api/connections", server.url))).json()) as {
        activeCount: number;
        connections: unknown[];
        rawLeaseCount: number;
        totalCount: number;
      };

      expect(connections.rawLeaseCount).toBe(0);
      expect(connections.totalCount).toBe(0);
      expect(connections.activeCount).toBe(0);
      expect(connections.connections).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves one row per connection with attached subscriptions", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const workspace = workspacePath(cwd);
    const connectionId = "host:claude-code:runtime";
    const subscription = unwrap(
      createWakeSubscription({
        connectionId,
        eventTypes: ["canvas.review.requested"],
        host: "claude-code",
        now: "2026-05-22T00:00:00.000Z",
        subscriptionId: "host:claude-code:runtime:reviews",
      }),
    );
    await Effect.runPromise(writeWakeSubscription({ subscription, workspacePath: workspace }));
    const activeLease = unwrap(
      createConnectionLease({
        connectionId,
        cursorId: connectionId,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        host: "claude-code",
        now: new Date().toISOString(),
        pid: process.pid,
      }),
    );
    await Effect.runPromise(
      writeConnectionLease({
        lease: activeLease,
        workspacePath: workspace,
      }),
    );

    const staleLease = unwrap(
      createConnectionLease({
        connectionId: "host:claude-code:stale",
        cursorId: "host:claude-code:stale",
        expiresAt: "2026-05-22T00:00:01.000Z",
        host: "claude-code",
        now: "2026-05-22T00:00:00.000Z",
        pid: process.pid,
      }),
    );
    writeFileSync(
      connectionPathForWorkspacePath(workspace, staleLease.connectionId),
      `${JSON.stringify(staleLease, null, 2)}\n`,
      "utf8",
    );

    const server = await startApiServer(cwd);

    try {
      const connections = (await (await fetch(new URL("/api/connections", server.url))).json()) as {
        activeCount: number;
        connections: Array<{
          active: boolean;
          connectionId: string;
          subscriptions: Array<{ subscriptionId: string }>;
        }>;
        rawLeaseCount: number;
        totalCount: number;
      };

      expect(connections.rawLeaseCount).toBe(2);
      expect(connections.totalCount).toBe(2);
      expect(connections.activeCount).toBe(1);
      expect(connections.connections[0]).toMatchObject({
        active: true,
        connectionId: activeLease.connectionId,
        subscriptions: [{ subscriptionId: "host:claude-code:runtime:reviews" }],
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("streams appended events and projected state changes over SSE", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const response = await fetch(new URL("/api/events-stream", server.url));
      expect(response.status).toBe(200);
      const reader = response.body!.getReader();
      const sseState = { buffer: "" };

      const ready = await readNextSse(reader, sseState);
      expect(ready.event).toBe("ready");

      const append = await postEvent(server, appendInput("sse-key"));
      const stateEvent = await readNextSse(reader, sseState);
      const projectState = await readNextSse(reader, sseState);

      expect(stateEvent.event).toBe("state-event");
      expect(stateEvent.id).toBe(append.event.id);
      expect(projectState.event).toBe("project-state");
      expect(projectState.id).toBe(append.event.id);
      expect(projectState.data).toMatchObject({
        ledger: { eventCount: 1 },
      });

      await reader.cancel();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("generic Raven Vision slot approval updates projected state before SSE broadcast", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(server, "person", "Generic approval should be visible.");

      const response = await fetch(new URL("/api/events-stream", server.url));
      expect(response.status).toBe(200);
      const reader = response.body!.getReader();
      const sseState = { buffer: "" };

      const ready = await readNextSse(reader, sseState);
      expect(ready.event).toBe("ready");

      const append = await postEvent(server, {
        type: "raven.vision.slot.approved",
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        idempotencyKey: "generic-raven-approval-person",
        payload: { slotId: "person" },
      });
      expect(append.status).toBe("appended");

      const stateEvent = await readNextSse(reader, sseState);
      const projectState = await readNextSse(reader, sseState);
      await reader.cancel().catch(() => undefined);

      expect(stateEvent).toMatchObject({
        event: "state-event",
        id: append.event.id,
        data: {
          event: {
            id: append.event.id,
            payload: { slotId: "person" },
            type: "raven.vision.slot.approved",
          },
          status: "appended",
        },
      });
      expect(projectState.event).toBe("project-state");
      expect(projectState.id).toBe(append.event.id);

      const projected = projectState.data as {
        raven: { vision: RuntimeVisionProjection };
      };
      expect(projected.raven.vision.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "approved",
        text: "Generic approval should be visible.",
      });

      const persisted = await readVision(server);
      expect(persisted.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "approved",
        text: "Generic approval should be visible.",
      });
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("generic Raven Vision slot skip updates projection and duplicate retry does not regress state", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      await startVision(server);
      await updateVisionSlot(server, "person", "Generic skip should clear.");

      const skipInput = {
        type: "raven.vision.slot.skipped",
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        idempotencyKey: "generic-raven-skip-person",
        payload: { slotId: "person" },
      };
      const skippedAppend = await postEvent(server, skipInput);
      expect(skippedAppend.status).toBe("appended");

      const skipped = await readVision(server);
      expect(skipped.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "skipped",
        text: "",
      });

      await updateVisionSlot(server, "person", "Later person draft.");
      const duplicateAppend = await postEvent(server, skipInput);
      expect(duplicateAppend.status).toBe("already_appended");
      expect(duplicateAppend.event.id).toBe(skippedAppend.event.id);

      const afterDuplicate = await readVision(server);
      expect(afterDuplicate.slots.find((slot) => slot.id === "person")).toMatchObject({
        status: "needs_review",
        text: "Later person draft.",
      });

      const events = readLedgerEvents(cwd);
      expect(
        events.filter((event) => event.idempotencyKey === "generic-raven-skip-person"),
      ).toHaveLength(1);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("sends event stream heartbeats before Bun's default idle timeout", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const response = await fetch(new URL("/api/events-stream", server.url));
      expect(response.status).toBe(200);
      const reader = response.body!.getReader();
      const sseState = { buffer: "" };

      const ready = await readNextSse(reader, sseState);
      expect(ready.event).toBe("ready");

      const decoder = new TextDecoder();
      const heartbeat = await Promise.race([
        reader
          .read()
          .then((chunk) => (chunk.done ? "closed" : decoder.decode(chunk.value as Uint8Array)))
          .catch(() => "closed"),
        sleep(6_000).then(() => "timeout"),
      ]);

      await reader.cancel().catch(() => undefined);
      expect(heartbeat).toContain(": heartbeat");
    } finally {
      await Effect.runPromise(server.stop);
    }
  }, 10_000);

  test("serializes concurrent HTTP appends with stable idempotency", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const results = await Promise.all(
        Array.from({ length: 8 }, () => postEvent(server, appendInput("concurrent-key"))),
      );

      expect(results.filter((result) => result.status === "appended")).toHaveLength(1);
      expect(results.filter((result) => result.status === "already_appended")).toHaveLength(7);

      const events = readFileSync(ledgerPath(cwd), "utf8")
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as { idempotencyKey?: string });
      expect(events).toHaveLength(1);
      expect(events[0]!.idempotencyKey).toBe("concurrent-key");
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("rejects duplicate starts and reclaims dead-PID metadata", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const first = await startApiServer(cwd);

    try {
      await expect(startApiServer(cwd)).rejects.toThrow("already running");
      await expect(startApiServer(cwd)).rejects.toThrow(first.url);
    } finally {
      await Effect.runPromise(first.stop);
    }

    mkdirSync(join(cwd, "docs/alexandria/.runtime"), { recursive: true });
    writeFileSync(
      metadataPath(cwd),
      JSON.stringify(
        {
          schemaVersion: 1,
          serverId: "dead-server",
          pid: 99999999,
          url: "http://127.0.0.1:9/",
          host: "127.0.0.1",
          port: 9,
          projectRoot: cwd,
          workspacePath: workspacePath(cwd),
          mode: "api",
          startedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    const reclaimed = await startApiServer(cwd);
    try {
      expect(reclaimed.metadata.serverId).not.toBe("dead-server");
      expect(existsSync(metadataPath(cwd))).toBeTrue();
    } finally {
      await Effect.runPromise(reclaimed.stop);
    }
  });

  test("does not reuse live metadata for a different workspace", async () => {
    const firstProject = makeProjectDir();
    const secondProject = makeProjectDir();
    initProject(firstProject);
    initProject(secondProject);
    const firstServer = await startApiServer(firstProject);

    try {
      mkdirSync(join(secondProject, "docs/alexandria/.runtime"), {
        recursive: true,
      });
      writeFileSync(
        metadataPath(secondProject),
        `${JSON.stringify(firstServer.metadata, null, 2)}\n`,
      );

      const append = runCli(
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
            playRunId: "run-runtime-1",
          }),
          "--json",
        ],
        secondProject,
      );

      expect(append.exitCode).toBe(1);
      expect(append.stderr).toContain("does not match configured workspace");
      expect(readFileSync(ledgerPath(firstProject), "utf8")).toBe("");
      expect(readFileSync(ledgerPath(secondProject), "utf8")).toBe("");
    } finally {
      await Effect.runPromise(firstServer.stop);
    }
  });

  test("initializes, lists, advances, and rejects conflicting cursor updates", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const historical = await postEvent(server, appendInput("historical"));
      const initializedResponse = await fetch(
        new URL("/api/events?cursor=test:cursor&limit=10", server.url),
      );
      expect(initializedResponse.status).toBe(200);
      const initialized = (await initializedResponse.json()) as {
        cursor: { afterEventId: string | null; status: string };
        events: unknown[];
      };

      expect(initialized.cursor.status).toBe("initialized");
      expect(initialized.cursor.afterEventId).toBe(historical.event.id);
      expect(initialized.events).toEqual([]);

      const next = await postEvent(server, {
        type: "play.started",
        actor: { kind: "process", host: "ax", process: "cli" },
        idempotencyKey: "cursor-play-run",
        payload: {
          agentId: "raven",
          playId: "source-assessment",
          playRunId: "run-cursor",
        },
      });
      const readyResponse = await fetch(
        new URL("/api/events?cursor=test:cursor&limit=10", server.url),
      );
      expect(readyResponse.status).toBe(200);
      const ready = (await readyResponse.json()) as {
        cursor: { afterEventId: string | null; status: string };
        events: Array<{ id: string; type: string }>;
      };
      expect(ready.cursor.status).toBe("ready");
      expect(ready.events.map((event) => event.id)).toEqual([next.event.id]);

      const conflict = await fetch(new URL("/api/cursors/test:cursor/advance", server.url), {
        body: JSON.stringify({
          eventAt: "2026-05-20T00:00:00.000Z",
          eventId: next.event.id,
          expectedAfterEventId: "wrong",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(conflict.status).toBe(409);

      const advance = (await (
        await fetch(new URL("/api/cursors/test:cursor/advance", server.url), {
          body: JSON.stringify({
            eventAt: next.event.at,
            eventId: next.event.id,
            expectedAfterEventId: ready.cursor.afterEventId,
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        })
      ).json()) as { cursor: { afterEventId: string | null }; status: string };
      expect(advance.status).toBe("advanced");
      expect(advance.cursor.afterEventId).toBe(next.event.id);

      const emptyResponse = await fetch(
        new URL("/api/events?cursor=test:cursor&limit=10", server.url),
      );
      expect(emptyResponse.status).toBe(200);
      const empty = (await emptyResponse.json()) as { events: unknown[] };
      expect(empty.events).toEqual([]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("recovers stale and malformed cursors to the current tail", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const tail = await postEvent(server, appendInput("tail"));
      mkdirSync(join(cwd, "docs/alexandria/.runtime/cursors"), {
        recursive: true,
      });
      writeFileSync(
        cursorPath(cwd, "test:stale"),
        `${JSON.stringify({
          schemaVersion: 1,
          cursorId: "test:stale",
          owner: { kind: "process", host: "ax", process: "host-adapter" },
          afterEventId: "missing-event",
          afterEventAt: "2026-05-20T00:00:00.000Z",
          updatedAt: "2026-05-20T00:00:00.000Z",
        })}\n`,
      );
      const stale = (await (
        await fetch(new URL("/api/events?cursor=test:stale", server.url))
      ).json()) as {
        cursor: { afterEventId: string | null; status: string };
        events: unknown[];
      };
      expect(stale.cursor.status).toBe("stale_recovered");
      expect(stale.cursor.afterEventId).toBe(tail.event.id);
      expect(stale.events).toEqual([]);

      writeFileSync(cursorPath(cwd, "test:malformed"), "{bad json}\n");
      const malformed = (await (
        await fetch(new URL("/api/events?cursor=test:malformed", server.url))
      ).json()) as {
        cursor: { afterEventId: string | null; status: string };
        events: unknown[];
      };
      expect(malformed.cursor.status).toBe("malformed_recovered");
      expect(malformed.cursor.afterEventId).toBe(tail.event.id);
      expect(malformed.events).toEqual([]);
      expect(existsSync(`${cursorPath(cwd, "test:malformed")}.invalid`)).toBeTrue();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("serves a default empty Info Hub board when the file is missing, without creating it", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const response = await fetch(new URL("/api/info-hub/board", server.url));
      expect(response.status).toBe(200);
      const board = (await response.json()) as {
        cards: unknown[];
        comment: string;
        updated: string;
      };
      expect(board.cards).toEqual([]);
      expect(board.comment.length).toBeGreaterThan(0);
      expect(existsSync(infoHubBoardPathForWorkspacePath(workspacePath(cwd)))).toBeFalse();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("creates the Info Hub board file on first POST and merges cards by id on later posts", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const firstPost = await fetch(new URL("/api/info-hub/board", server.url), {
        body: JSON.stringify({
          cards: [
            {
              id: "wo-a",
              type: "task",
              status: "open",
              priority: 15,
              source: "board:director",
              created: "2026-07-01",
              title: "First card",
            },
            {
              id: "wo-b",
              type: "bug",
              status: "open",
              priority: 10,
              source: "board:director",
              created: "2026-07-01",
            },
          ],
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(firstPost.status).toBe(200);
      const firstBoard = (await firstPost.json()) as {
        cards: Array<{ id: string; status: string; terminalAt?: string }>;
      };
      expect(firstBoard.cards.map((card) => card.id)).toEqual(["wo-a", "wo-b"]);
      expect(existsSync(infoHubBoardPathForWorkspacePath(workspacePath(cwd)))).toBeTrue();

      // A second POST that only mentions wo-a and moves it to done must
      // preserve wo-b untouched and auto-stamp terminalAt on wo-a.
      const secondPost = await fetch(new URL("/api/info-hub/board", server.url), {
        body: JSON.stringify({
          cards: [
            {
              id: "wo-a",
              type: "task",
              status: "done",
              priority: 15,
              source: "board:director",
              created: "2026-07-01",
              title: "First card",
            },
          ],
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(secondPost.status).toBe(200);
      const secondBoard = (await secondPost.json()) as {
        cards: Array<{ id: string; status: string; terminalAt?: string }>;
      };
      expect(secondBoard.cards.map((card) => card.id)).toEqual(["wo-a", "wo-b"]);
      const woA = secondBoard.cards.find((card) => card.id === "wo-a");
      expect(woA?.status).toBe("done");
      expect(woA?.terminalAt).toBeTruthy();
      expect(secondBoard.cards.find((card) => card.id === "wo-b")?.status).toBe("open");

      // A direct file edit (as an agent would make) shows up on the next GET.
      const boardPath = infoHubBoardPathForWorkspacePath(workspacePath(cwd));
      const onDisk = JSON.parse(readFileSync(boardPath, "utf8")) as {
        cards: Array<Record<string, unknown>>;
        comment: string;
        updated: string;
      };
      onDisk.cards.push({
        id: "wo-c",
        type: "improvement",
        status: "open",
        priority: 20,
        source: "agent:test",
        created: "2026-07-09",
      });
      writeFileSync(boardPath, `${JSON.stringify(onDisk, null, 2)}\n`, "utf8");

      const afterEdit = (await (
        await fetch(new URL("/api/info-hub/board", server.url))
      ).json()) as { cards: Array<{ id: string }> };
      expect(afterEdit.cards.map((card) => card.id)).toEqual(["wo-a", "wo-b", "wo-c"]);
    } finally {
      await Effect.runPromise(server.stop);
    }
  });

  test("rejects an Info Hub board POST with an unknown field or bad enum as 400", async () => {
    const cwd = makeProjectDir();
    initProject(cwd);
    const server = await startApiServer(cwd);

    try {
      const badField = await fetch(new URL("/api/info-hub/board", server.url), {
        body: JSON.stringify({
          cards: [
            {
              id: "wo-a",
              type: "task",
              status: "open",
              priority: 15,
              source: "board:director",
              created: "2026-07-01",
              play: "not-allowed",
            },
          ],
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(badField.status).toBe(400);
      const badFieldBody = (await badField.json()) as RuntimeErrorBody;
      expect(badFieldBody.error.message).toContain("unknown fields");

      const badEnum = await fetch(new URL("/api/info-hub/board", server.url), {
        body: JSON.stringify({
          cards: [
            {
              id: "wo-a",
              type: "chore",
              status: "open",
              priority: 15,
              source: "board:director",
              created: "2026-07-01",
            },
          ],
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      expect(badEnum.status).toBe(400);

      expect(existsSync(infoHubBoardPathForWorkspacePath(workspacePath(cwd)))).toBeFalse();
    } finally {
      await Effect.runPromise(server.stop);
    }
  });
});

// #612 added libraryRoot/draftPatchLog to the graph and card-detail read routes.
// A root-aware request maps a bad client-supplied root (a typed LibraryGateError)
// to 400; a NO-PARAM request must keep its exact pre-override status. The gate
// keys off error *type*, never the message, so an unrelated internal error stays
// 500 even when its message embeds a gate-sounding word. These pin that back-compat.
describe("library read-route error status back-compat", () => {
  // An ENOENT-style internal error under a `.../product/...` path — its message
  // contains a gate-sounding word ("product"), which a message-based classifier
  // would flip to 400 on a no-param request.
  const keywordInternalError = new Error(
    "ENOENT: no such file or directory, open '/docs/alexandria/library/product/Surface - Library.md'",
  );

  test("no-param graph internal error stays 500, not 400", () => {
    expect(libraryGraphHttpStatus(keywordInternalError, false)).toBe(500);
  });

  test("root-aware graph keeps the bad-client-root 400 mapping", () => {
    // The gate maps to 400 by error *type* (LibraryGateError), never by message.
    expect(
      libraryGraphHttpStatus(
        new LibraryGateError("libraryRoot must be within the project root"),
        true,
      ),
    ).toBe(400);
    // A generic internal error on a root-aware request still falls back to 500,
    // even when its message contains a gate keyword.
    expect(
      libraryGraphHttpStatus(new Error("libraryRoot must be within the project root"), true),
    ).toBe(500);
    expect(libraryGraphHttpStatus(new Error("some unrelated failure"), true)).toBe(500);
  });

  test("no-param card-detail internal error stays 500, not 400", () => {
    expect(
      libraryCardDetailHttpStatus(keywordInternalError, keywordInternalError.message, false),
    ).toBe(500);
  });

  test("card-detail not-found is 404 regardless of root-awareness", () => {
    const notFound = "Library card not found: Surface - Library";
    expect(libraryCardDetailHttpStatus(new Error(notFound), notFound, false)).toBe(404);
    expect(libraryCardDetailHttpStatus(new Error(notFound), notFound, true)).toBe(404);
  });

  test("root-aware card-detail keeps the bad-client-root 400 mapping", () => {
    const badRoot = "draftPatchLog must be within the project root: ../outside.json";
    expect(libraryCardDetailHttpStatus(new LibraryGateError(badRoot), badRoot, true)).toBe(400);
    // A same-message untyped internal error is not a client problem: it stays 500.
    expect(libraryCardDetailHttpStatus(new Error(badRoot), badRoot, true)).toBe(500);
  });
});
