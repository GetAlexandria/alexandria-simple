import { readFile, readdir } from "fs/promises";
import { join, resolve, sep } from "path";

// PMS's read-only client for Alexandria runtime state. After the boundary
// migration (Slice 2), PMS reads Alexandria data ONLY through the public
// runtime API — never by importing ax source or touching Alexandria's
// private storage. If the Alexandria runtime is not running, callers degrade
// (empty runs, no built-by decoration) rather than fail.

export interface AlexandriaPlayRun {
  fabroRunId?: string;
  playId: string;
  review?: unknown;
  startedAt?: string;
  status: string;
  trackerPath?: string;
}

export interface AlexandriaPlayProvenance {
  factoryAgent: string;
  factoryDivision: string;
  factoryFunction: string;
  playId: string;
  playRunId: string;
  producedByPlayId: string;
}

export interface AlexandriaStateView {
  playNames: Map<string, string>;
  playProvenance: AlexandriaPlayProvenance[];
  playRuns: AlexandriaPlayRun[];
}

export function alexandriaRuntimeOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.PMS_ALEXANDRIA_ORIGIN?.trim();
  return explicit == null || explicit.length === 0 ? "http://127.0.0.1:4321" : explicit;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parsePlayRuns(value: unknown): AlexandriaPlayRun[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const runs: AlexandriaPlayRun[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const playId = stringField(entry, "playId");
    const status = stringField(entry, "status");
    if (playId == null || status == null) {
      continue;
    }
    const fabroRunId = stringField(entry, "fabroRunId");
    const startedAt = stringField(entry, "startedAt");
    const trackerPath = stringField(entry, "trackerPath");
    runs.push({
      playId,
      status,
      ...(fabroRunId == null ? {} : { fabroRunId }),
      ...(startedAt == null ? {} : { startedAt }),
      ...(trackerPath == null ? {} : { trackerPath }),
      ...(entry.review == null ? {} : { review: entry.review }),
    });
  }
  return runs;
}

function parseProvenance(value: unknown): AlexandriaPlayProvenance[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const facts: AlexandriaPlayProvenance[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const playId = stringField(entry, "playId");
    const factoryAgent = stringField(entry, "factoryAgent");
    const factoryDivision = stringField(entry, "factoryDivision");
    const factoryFunction = stringField(entry, "factoryFunction");
    if (playId == null || factoryAgent == null || factoryDivision == null) {
      continue;
    }
    facts.push({
      factoryAgent,
      factoryDivision,
      factoryFunction: factoryFunction ?? "",
      playId,
      playRunId: stringField(entry, "playRunId") ?? "",
      producedByPlayId: stringField(entry, "producedByPlayId") ?? "",
    });
  }
  return facts;
}

function parsePlayNames(value: unknown): Map<string, string> {
  const names = new Map<string, string>();
  if (!isRecord(value) || !Array.isArray(value.plays)) {
    return names;
  }
  for (const play of value.plays) {
    if (!isRecord(play)) {
      continue;
    }
    const id = stringField(play, "id");
    const name = stringField(play, "name");
    if (id != null && name != null) {
      names.set(id, name);
    }
  }
  return names;
}

// Fetch the Alexandria runtime's public state. Returns an Error (not a
// throw) when the runtime is unreachable so callers can degrade explicitly.
// When `expectedProjectRoot` is given, a runtime serving a DIFFERENT project
// on the same port reads as unreachable — localhost ports are shared across
// checkouts, and cross-project state must never leak into the studio views.
export async function fetchAlexandriaState(options?: {
  expectedProjectRoot?: string;
  origin?: string;
}): Promise<AlexandriaStateView | Error> {
  const origin = options?.origin ?? alexandriaRuntimeOrigin();
  let payload: unknown;
  try {
    const response = await fetch(`${origin}/api/state`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) {
      return new Error(`Alexandria runtime returned ${response.status} for /api/state`);
    }
    payload = await response.json();
  } catch (error) {
    return new Error(
      `Alexandria runtime unreachable at ${origin}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!isRecord(payload)) {
    return new Error("Alexandria /api/state returned a non-object payload.");
  }

  const expectedRoot = options?.expectedProjectRoot;
  if (expectedRoot != null) {
    const workspacePath =
      isRecord(payload.workspace) && typeof payload.workspace.path === "string"
        ? payload.workspace.path
        : null;
    const root = resolve(expectedRoot);
    // Boundary-aware containment: a sibling checkout whose path merely
    // extends the root (…/proj vs …/proj-worktree) must NOT pass.
    const resolvedWorkspace = workspacePath == null ? null : resolve(workspacePath);
    const insideRoot =
      resolvedWorkspace != null &&
      (resolvedWorkspace === root || resolvedWorkspace.startsWith(root + sep));
    if (!insideRoot) {
      return new Error(
        `Alexandria runtime at ${origin} serves a different project (workspace ${workspacePath ?? "unknown"}).`,
      );
    }
  }

  return {
    playNames: parsePlayNames(payload.playbook),
    playProvenance: parseProvenance(payload.playProvenance),
    playRuns: parsePlayRuns(payload.playRuns),
  };
}

const PROVENANCE_RECORDS_DIR = "studio/records/provenance";

// New provenance facts recorded by `pms run make-a-play:prove` after the
// Slice 1 eviction live as PMS JSON records; Alexandria's ledger carries the
// pre-migration frozen history. The registry decoration merges both, with
// PMS records winning for the same play.
export async function readLocalProvenanceRecords(
  projectRoot: string,
): Promise<AlexandriaPlayProvenance[]> {
  const dir = resolve(projectRoot, PROVENANCE_RECORDS_DIR);
  let entries: string[];
  try {
    entries = (await readdir(dir)).filter((name) => name.endsWith(".json"));
  } catch {
    return [];
  }

  const facts: AlexandriaPlayProvenance[] = [];
  for (const name of entries) {
    try {
      const parsed: unknown = JSON.parse(await readFile(join(dir, name), "utf8"));
      if (!isRecord(parsed) || !isRecord(parsed.payload)) {
        continue;
      }
      facts.push(...parseProvenance([parsed.payload]));
    } catch {
      // A malformed record must not take down the registry view.
    }
  }
  return facts;
}

export function mergeProvenance(
  alexandria: readonly AlexandriaPlayProvenance[],
  local: readonly AlexandriaPlayProvenance[],
): AlexandriaPlayProvenance[] {
  const byPlay = new Map(alexandria.map((fact) => [fact.playId, fact]));
  for (const fact of local) {
    byPlay.set(fact.playId, fact);
  }
  return [...byPlay.values()];
}
