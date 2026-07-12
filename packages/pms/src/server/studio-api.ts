import { existsSync } from "fs";
import { readFile, readdir, rename, stat, unlink, writeFile } from "fs/promises";
import { request as httpRequest } from "http";
import { dirname, extname, join, resolve, sep } from "path";
import {
  fetchAlexandriaState,
  mergeProvenance,
  readLocalProvenanceRecords,
  type AlexandriaPlayProvenance,
  type AlexandriaStateView,
} from "../effects/alexandria-client.js";
import {
  commandEnv,
  getRunningFabroStatus,
  resolveFabroBinary,
  resolveFabroRuntimePaths,
  runCommandSync,
} from "../effects/fabro.js";
import { deriveStudioPlayComposition } from "./studio-play-composition.js";

/**
 * Studio API — serves the Play Maker's Studio surfaces in viewer
 * (Studio → Fabro plan, Slice 4; pulled forward by Director ruling
 * 2026-06-12). The studio's records stay files under `studio/` at the
 * project root; this API reads across, it does not own them. Board
 * state keeps the one-fact-one-place contract from the static era:
 * identity comes from registry.js; the Board (board-state.json) is the
 * source of truth for production stage + column order (and the `ready`
 * awaiting-confirm markers).
 */

const STUDIO_FILE_TYPES: Record<string, string> = {
  ".fabro": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jsonl": "text/plain; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".toml": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const MAX_STUDIO_FILE_BYTES = 4 * 1024 * 1024;
const STUDIO_BOARD_STAGES = ["backlog", "sourced", "designed", "built", "proven", "live"] as const;
const LEGACY_BOARD_STAGE_ALIASES: Record<string, (typeof STUDIO_BOARD_STAGES)[number]> = {
  empty: "backlog",
};
const WORK_ORDER_CARD_TYPES = ["testing", "improvement", "bug"] as const;
const WORK_ORDER_CARD_STATUSES = ["open", "in-progress", "done", "wont-do"] as const;
const TERMINAL_WORK_ORDER_CARD_STATUSES = new Set<WorkOrderCardStatus>(["done", "wont-do"]);
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_CARD_FIELDS = [
  "id",
  "type",
  "status",
  "division",
  "function",
  "priority",
  "source",
  "created",
] as const;
const ALLOWED_CARD_FIELDS = new Set([
  ...REQUIRED_CARD_FIELDS,
  "play",
  "terminalAt",
  "archived",
  "pinned",
  "title",
  "detail",
  "checklist",
]);
const ALLOWED_CHECKLIST_FIELDS = new Set(["text", "done"]);
const FABRO_STATE_TIMEOUT_MS = 2_000;

type StudioBoardStage = (typeof STUDIO_BOARD_STAGES)[number];
type WorkOrderCardType = (typeof WORK_ORDER_CARD_TYPES)[number];
type WorkOrderCardStatus = (typeof WORK_ORDER_CARD_STATUSES)[number];

interface WorkOrderChecklistItem {
  done: boolean;
  text: string;
}

interface WorkOrderCard {
  archived?: boolean;
  checklist?: WorkOrderChecklistItem[];
  created: string;
  detail?: string;
  division: string;
  function: string;
  id: string;
  pinned?: boolean;
  play?: string;
  priority: number;
  source: string;
  status: WorkOrderCardStatus;
  terminalAt?: string;
  title?: string;
  type: WorkOrderCardType;
}

// The factory the studio debugs is the EMBEDDED one — the Fabro that
// ax boots for plays (operator ruling 2026-06-12: builder factories
// build Alexandria; plays run on the Fabro inside it). AX_FABRO_SERVER
// remains as an explicit override for development.
interface EmbeddedFabro {
  binary: string;
  env: NodeJS.ProcessEnv;
  target: string;
}

interface StudioActiveRun {
  elapsedMs?: number;
  playId?: string;
  playName?: string;
  runId: string;
  startedAt?: string;
  status: string;
  trackerPath: string;
  workflowName?: string;
  workflowSlug?: string;
}

function embeddedFabro(projectRoot: string): EmbeddedFabro | null {
  const explicit = process.env.AX_FABRO_SERVER?.trim();
  const paths = resolveFabroRuntimePaths();
  const env = commandEnv(paths);
  const binary = resolveFabroBinary();
  if (explicit != null && explicit.length > 0) {
    return { binary, env, target: explicit };
  }
  const status = getRunningFabroStatus({
    cwd: projectRoot,
    env,
    fabroBin: binary,
    storageDir: paths.fabroStorageDir,
  });
  if (status == null) {
    return null;
  }
  return { binary, env, target: status.serverTarget };
}

async function embeddedDevToken(): Promise<string | null> {
  const paths = resolveFabroRuntimePaths();
  if (!existsSync(paths.fabroDevTokenPath)) {
    return null;
  }
  const token = (await readFile(paths.fabroDevTokenPath, "utf8")).trim();
  return token.length > 0 ? token : null;
}

async function fetchHttpText(
  url: string,
  headers: Record<string, string>,
): Promise<{ status: number; statusText: string; text: string } | { error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FABRO_STATE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    return {
      status: response.status,
      statusText: response.statusText,
      text: await response.text(),
    };
  } catch (error) {
    return { error: String(error) };
  } finally {
    clearTimeout(timer);
  }
}

function fetchUnixSocketText(
  socketPath: string,
  path: string,
  headers: Record<string, string>,
): Promise<{ status: number; statusText: string; text: string } | { error: string }> {
  return new Promise((resolve) => {
    const request = httpRequest(
      {
        headers,
        method: "GET",
        path,
        socketPath,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            statusText: response.statusMessage ?? "",
            text: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    request.setTimeout(FABRO_STATE_TIMEOUT_MS, () => {
      request.destroy(new Error("Fabro state request timed out"));
    });
    request.on("error", (error) => {
      resolve({ error: String(error) });
    });
    request.end();
  });
}

async function fetchFabroRunState(
  fabro: EmbeddedFabro,
  runId: string,
): Promise<{ error: string | null; value: unknown | null }> {
  const path = `/api/v1/runs/${encodeURIComponent(runId)}/state`;
  const token = await embeddedDevToken();
  const headers = token == null ? {} : { authorization: `Bearer ${token}` };
  const result = fabro.target.startsWith("http")
    ? await fetchHttpText(new URL(path, fabro.target).toString(), headers)
    : await fetchUnixSocketText(fabro.target, path, headers);

  if ("error" in result) {
    return { error: result.error, value: null };
  }
  if (result.status < 200 || result.status >= 300) {
    const suffix = result.text.length === 0 ? "" : `: ${result.text.slice(0, 300)}`;
    return {
      error: `Fabro state endpoint returned ${result.status} ${result.statusText}${suffix}`,
      value: null,
    };
  }
  try {
    return { error: null, value: JSON.parse(result.text) as unknown };
  } catch (error) {
    return { error: `Fabro state endpoint returned invalid JSON: ${String(error)}`, value: null };
  }
}

function studioRootFor(projectRoot: string): string | null {
  const root = join(projectRoot, "studio");
  return existsSync(root) ? root : null;
}

function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function assertBoardState(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isStudioBoardStage(value: string): value is StudioBoardStage {
  return STUDIO_BOARD_STAGES.some((stage) => stage === value);
}

function normalizeBoardStageKey(value: string): string {
  return LEGACY_BOARD_STAGE_ALIASES[value] ?? value;
}

function emptyBoardStages(): Record<StudioBoardStage, string[]> {
  return {
    backlog: [],
    built: [],
    designed: [],
    live: [],
    proven: [],
    sourced: [],
  };
}

function projectionLike(value: unknown): boolean {
  return isRecord(value) && isRecord(value.spec) && isRecord(value.stages);
}

function inspectWrapperToProjection(value: Record<string, unknown>): Record<string, unknown> {
  return {
    checkpoints: isRecord(value.checkpoint)
      ? [{ checkpoint: value.checkpoint, diff: {}, seq: 0 }]
      : [],
    conclusion: value.conclusion ?? null,
    last_event_at: new Date(0).toISOString(),
    parent_id: value.parent_id ?? null,
    pending_control: null,
    pending_interviews: {},
    pull_request: null,
    sandbox: value.sandbox ?? null,
    spec: isRecord(value.run_spec) ? value.run_spec : {},
    stages: {},
    start: value.start_record ?? null,
    status: value.status ?? { kind: "unknown" },
    status_updated_at: new Date(0).toISOString(),
    superseded_by: null,
  };
}

function normalizeInspectPayload(inspectJson: unknown, stateJson: unknown): unknown {
  if (projectionLike(stateJson)) {
    return [stateJson];
  }
  if (projectionLike(inspectJson)) {
    return [inspectJson];
  }
  const rows = Array.isArray(inspectJson) ? inspectJson : [inspectJson];
  return rows.map((row) => {
    if (projectionLike(row)) {
      return row;
    }
    if (isRecord(row) && isRecord(row.run_spec)) {
      return inspectWrapperToProjection(row);
    }
    return row;
  });
}

function trackerPathForFabroRun(runId: string): string {
  return `/?tab=tracker&run=${encodeURIComponent(runId)}`;
}

// Alexandria's runtime daemon keeps the ledger — and therefore the projected
// `playRuns` — current from Fabro. After the boundary migration (Slice 2) the
// studio server reads that projection through Alexandria's PUBLIC runtime API
// instead of ax source; when the Alexandria runtime is down the runs list
// degrades to empty with a warning instead of failing the studio surface.
async function activeRunsResponse(projectRoot: string): Promise<Response> {
  const active = new Set(["submitted", "running", "needs_human_feedback"]);
  const state = await fetchAlexandriaState({ expectedProjectRoot: projectRoot });
  if (state instanceof Error) {
    return Response.json({ runs: [], source: "projection", warning: state.message });
  }

  const runs: StudioActiveRun[] = state.playRuns.flatMap((playRun): StudioActiveRun[] => {
    if (!active.has(playRun.status) || playRun.fabroRunId == null) {
      return [];
    }
    return [
      {
        playId: playRun.playId,
        playName: state.playNames.get(playRun.playId) ?? playRun.playId,
        runId: playRun.fabroRunId,
        ...(playRun.startedAt == null ? {} : { startedAt: playRun.startedAt }),
        status: playRun.status,
        trackerPath: playRun.trackerPath ?? trackerPathForFabroRun(playRun.fabroRunId),
        workflowSlug: playRun.playId,
      },
    ];
  });

  return Response.json({ runs, source: "projection" });
}

async function reviewFactsForFabroRun(projectRoot: string, runId: string): Promise<unknown | null> {
  const state = await fetchAlexandriaState({ expectedProjectRoot: projectRoot });
  if (state instanceof Error) {
    return null;
  }
  return state.playRuns.find((playRun) => playRun.fabroRunId === runId)?.review ?? null;
}

function withinRoot(root: string, candidate: string): boolean {
  const resolved = resolve(candidate);
  return resolved === root || resolved.startsWith(root + sep);
}

interface StudioRecordEntry {
  bytes: number;
  path: string;
}

async function listRecords(dir: string, base: string, depth: number): Promise<StudioRecordEntry[]> {
  if (depth > 6) {
    return [];
  }
  const out: StudioRecordEntry[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const full = join(dir, entry.name);
    const rel = base.length > 0 ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await listRecords(full, rel, depth + 1)));
    } else if (entry.isFile()) {
      const info = await stat(full);
      out.push({ bytes: info.size, path: rel });
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

interface ParsedStudioRegistry {
  company?: {
    name: string;
  };
  divisions: unknown;
  rungs: unknown;
}

function parseRegistry(source: string): ParsedStudioRegistry {
  // `DIVISIONS` is newer than `RUNGS`; tolerate a registry.js that predates it
  // so the whole Studio surface doesn't 500 — the Catalog just renders empty.
  const factory = new Function(
    [
      `${source};`,
      "return {",
      'company: typeof COMPANY === "undefined" ? undefined : COMPANY,',
      'divisions: typeof DIVISIONS === "undefined" ? {} : DIVISIONS,',
      "rungs: RUNGS",
      "};",
    ].join("\n"),
  );
  const registry = factory() as { company?: unknown; divisions: unknown; rungs: unknown };
  const companyName = typeof registry.company === "string" ? registry.company.trim() : "";
  return {
    ...(companyName.length > 0 ? { company: { name: companyName } } : {}),
    divisions: registry.divisions,
    rungs: registry.rungs,
  };
}

// Decorate each registry rung with `builtBy` (keyed by slug == playId).
// Read-only: it never mutates registry.js or the board.
function decorateRungsWithBuiltBy(
  rungs: unknown,
  provenance: readonly AlexandriaPlayProvenance[],
): unknown {
  if (!Array.isArray(rungs)) {
    return rungs;
  }
  const byPlay = new Map(provenance.map((entry) => [entry.playId, entry]));
  return rungs.map((row) => {
    if (!isRecord(row) || typeof row.slug !== "string") {
      return row;
    }
    const fact = byPlay.get(row.slug);
    if (fact == null) {
      return row;
    }
    return {
      ...row,
      builtBy: {
        agent: fact.factoryAgent,
        division: fact.factoryDivision,
        function: fact.factoryFunction,
      },
    };
  });
}

async function registryResponse(studioRoot: string, projectRoot: string): Promise<Response> {
  const registryPath = join(studioRoot, "plays", "registry.js");
  const boardPath = join(studioRoot, "plays", "board-state.json");
  if (!existsSync(registryPath)) {
    return jsonError(404, "studio registry.js not found");
  }
  let registry: ParsedStudioRegistry;
  try {
    registry = parseRegistry(await readFile(registryPath, "utf8"));
  } catch (error) {
    return jsonError(500, `registry.js did not evaluate: ${String(error)}`);
  }
  let board: unknown = null;
  if (existsSync(boardPath)) {
    try {
      board = JSON.parse(await readFile(boardPath, "utf8"));
    } catch {
      board = null;
    }
  }
  // Built-by is a read-only decoration. Pre-migration facts come from
  // Alexandria's ledger through the public runtime API; facts recorded after
  // the Slice 1 eviction come from PMS's own studio/records/provenance
  // (which wins on conflict). Either source may be absent — rungs then
  // render without built-by.
  const alexandriaState = await fetchAlexandriaState({ expectedProjectRoot: projectRoot });
  const localProvenance = await readLocalProvenanceRecords(projectRoot);
  const provenance = mergeProvenance(
    alexandriaState instanceof Error ? [] : alexandriaState.playProvenance,
    localProvenance,
  );
  return Response.json({
    board,
    ...(registry.company === undefined ? {} : { company: registry.company }),
    divisions: registry.divisions,
    rungs: decorateRungsWithBuiltBy(registry.rungs, provenance),
  });
}

function normalizeBoardStages(value: unknown): {
  slugs: Set<string>;
  stages: Record<StudioBoardStage, string[]>;
} {
  assertBoardState(isRecord(value), "body.stages must be an object");
  const normalized = emptyBoardStages();
  const seenKeys = new Set<StudioBoardStage>();
  const seenSlugs = new Set<string>();

  for (const [rawKey, column] of Object.entries(value)) {
    const key = normalizeBoardStageKey(rawKey);
    assertBoardState(isStudioBoardStage(key), `unknown stage key ${rawKey}`);
    assertBoardState(!seenKeys.has(key), `duplicate stage key ${key}`);
    seenKeys.add(key);
    assertBoardState(Array.isArray(column), `${rawKey} must be a list`);
    for (const slug of column) {
      assertBoardState(typeof slug === "string" && slug.length > 0, "slugs must be strings");
      assertBoardState(!seenSlugs.has(slug), `duplicate slug ${slug}`);
      seenSlugs.add(slug);
      normalized[key].push(slug);
    }
  }

  const missing = STUDIO_BOARD_STAGES.filter((stage) => !seenKeys.has(stage));
  assertBoardState(
    missing.length === 0,
    `body.stages keys must be exactly: ${STUDIO_BOARD_STAGES.join(
      ", ",
    )} (legacy empty accepted for backlog)`,
  );
  return { slugs: seenSlugs, stages: normalized };
}

// `ready` is the per-card awaiting-confirm marker: an array of non-empty
// slug strings matching the board-state contract.
function isBoardReady(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((slug) => typeof slug === "string" && slug.length > 0);
}

function readySlugsAreOnBoard(
  stages: Record<string, readonly string[]>,
  ready: readonly string[],
): boolean {
  const boardSlugs = new Set(Object.values(stages).flat());
  return ready.every((slug) => boardSlugs.has(slug));
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function isTerminalWorkOrderStatus(status: WorkOrderCardStatus): boolean {
  return TERMINAL_WORK_ORDER_CARD_STATUSES.has(status);
}

function normalizeCardStatusTransition(
  existingCard: WorkOrderCard | undefined,
  nextCard: WorkOrderCard,
  today: string,
): WorkOrderCard {
  const next = { ...nextCard };
  if (!isTerminalWorkOrderStatus(next.status)) {
    delete next.terminalAt;
    return next;
  }
  if (next.terminalAt != null) {
    return next;
  }
  if (existingCard != null && isTerminalWorkOrderStatus(existingCard.status)) {
    if (existingCard.terminalAt != null) {
      next.terminalAt = existingCard.terminalAt;
    } else if (DATE_ONLY_PATTERN.test(next.created)) {
      next.terminalAt = next.created;
    } else {
      next.terminalAt = today;
    }
    return next;
  }
  next.terminalAt = today;
  return next;
}

function normalizeGraduatedSlugs(value: unknown): string[] {
  assertBoardState(Array.isArray(value), "body.graduated must be a string[] of non-empty slugs");
  const graduated: string[] = [];
  const seen = new Set<string>();
  for (const slug of value) {
    assertBoardState(
      typeof slug === "string" && slug.length > 0,
      "body.graduated must be a string[] of non-empty slugs",
    );
    if (!seen.has(slug)) {
      seen.add(slug);
      graduated.push(slug);
    }
  }
  return graduated;
}

// Only validates dates for slugs in `kept`; stale submitted keys (not graduated)
// are pruned during normalization, so a malformed date on one of them must not
// reject the save.
function parseSubmittedGraduatedAt(value: unknown, kept: ReadonlySet<string>): Map<string, string> {
  assertBoardState(isRecord(value), "body.graduatedAt must be an object of YYYY-MM-DD dates");
  const dates = new Map<string, string>();
  for (const [slug, date] of Object.entries(value)) {
    if (!kept.has(slug)) {
      continue;
    }
    assertBoardState(
      typeof date === "string" && DATE_ONLY_PATTERN.test(date),
      `body.graduatedAt.${slug} must be YYYY-MM-DD`,
    );
    dates.set(slug, date);
  }
  return dates;
}

function collectExistingGraduatedAt(value: unknown): Map<string, string> {
  const dates = new Map<string, string>();
  if (!isRecord(value)) {
    return dates;
  }
  for (const [slug, date] of Object.entries(value)) {
    if (slug.length > 0 && typeof date === "string" && DATE_ONLY_PATTERN.test(date)) {
      dates.set(slug, date);
    }
  }
  return dates;
}

function normalizeGraduatedAt(
  bodyValue: unknown,
  existingValue: unknown,
  graduated: readonly string[],
  today: string,
): Record<string, string> {
  const graduatedSet = new Set(graduated);
  const submittedDates =
    bodyValue === undefined
      ? new Map<string, string>()
      : parseSubmittedGraduatedAt(bodyValue, graduatedSet);
  const existingDates = collectExistingGraduatedAt(existingValue);
  const graduatedAt: Record<string, string> = {};
  for (const slug of graduated) {
    graduatedAt[slug] = submittedDates.get(slug) ?? existingDates.get(slug) ?? today;
  }
  return graduatedAt;
}

function removeSlugsFromStages(
  stages: Record<StudioBoardStage, string[]>,
  slugs: ReadonlySet<string>,
): Record<StudioBoardStage, string[]> {
  const next = emptyBoardStages();
  for (const stage of STUDIO_BOARD_STAGES) {
    next[stage] = stages[stage].filter((slug) => !slugs.has(slug));
  }
  return next;
}

function cardRef(card: unknown, index: number): string {
  if (isRecord(card) && typeof card.id === "string" && card.id.length > 0) {
    return card.id;
  }
  return `card ${index}`;
}

function hasOnlyAllowedFields(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): string[] {
  return Object.keys(record).filter((key) => !allowed.has(key));
}

function validateCardChecklist(card: Record<string, unknown>, ref: string): void {
  if (card.type === "testing") {
    const checklist = card.checklist;
    assertBoardState(Array.isArray(checklist), `${ref} testing checklist must be a list`);
    checklist.forEach((item, index) => {
      assertBoardState(isRecord(item), `${ref} checklist item ${index + 1} must be an object`);
      const unknown = hasOnlyAllowedFields(item, ALLOWED_CHECKLIST_FIELDS);
      assertBoardState(
        unknown.length === 0,
        `${ref} checklist item ${index + 1} has unknown fields`,
      );
      assertBoardState(
        typeof item.text === "string" && item.text.trim().length > 0,
        `${ref} checklist item ${index + 1} text must be a string`,
      );
      assertBoardState(
        typeof item.done === "boolean",
        `${ref} checklist item ${index + 1} done must be a boolean`,
      );
    });
    return;
  }
  assertBoardState(!hasOwn(card, "checklist"), `${ref} checklist is only allowed on testing cards`);
}

function validateBoardCards(
  cards: unknown,
  cardPlaySlugs: ReadonlySet<string>,
  options: {
    label?: string;
    requireTesting?: boolean;
    requiredTestingSlugs?: ReadonlySet<string>;
  } = {},
): WorkOrderCard[] {
  const label = options.label ?? "cards";
  const requireTesting = options.requireTesting ?? true;
  assertBoardState(Array.isArray(cards), `${label} must be a list`);

  const seenIds = new Set<string>();
  const testingByPlay = new Map<string, number>();
  const validCards: WorkOrderCard[] = [];

  cards.forEach((card, index) => {
    const ref = cardRef(card, index + 1);
    assertBoardState(isRecord(card), `${label} must contain objects`);
    const unknown = hasOnlyAllowedFields(card, ALLOWED_CARD_FIELDS);
    assertBoardState(
      unknown.length === 0,
      `${ref} has unknown fields: ${JSON.stringify(unknown.sort())}`,
    );
    const missing = REQUIRED_CARD_FIELDS.filter((field) => !hasOwn(card, field));
    assertBoardState(
      missing.length === 0,
      `${ref} is missing fields: ${JSON.stringify(missing.sort())}`,
    );

    assertBoardState(
      typeof card.id === "string" && card.id.length > 0,
      `${ref} id must be a string`,
    );
    assertBoardState(!seenIds.has(card.id), `duplicate card id ${card.id}`);
    seenIds.add(card.id);
    assertBoardState(
      WORK_ORDER_CARD_TYPES.some((type) => type === card.type),
      `${ref} type must be one of ${JSON.stringify([...WORK_ORDER_CARD_TYPES].sort())}`,
    );
    assertBoardState(
      WORK_ORDER_CARD_STATUSES.some((status) => status === card.status),
      `${ref} status must be one of ${JSON.stringify([...WORK_ORDER_CARD_STATUSES].sort())}`,
    );
    assertBoardState(
      typeof card.division === "string" && card.division.length > 0,
      `${ref} division must be a string`,
    );
    assertBoardState(
      typeof card.function === "string" && card.function.length > 0,
      `${ref} function must be a string`,
    );
    assertBoardState(Number.isInteger(card.priority), `${ref} priority must be an integer`);
    assertBoardState(
      typeof card.source === "string" && card.source.length > 0,
      `${ref} source must be a string`,
    );
    assertBoardState(
      typeof card.created === "string" && DATE_ONLY_PATTERN.test(card.created),
      `${ref} created must be YYYY-MM-DD`,
    );
    if (hasOwn(card, "terminalAt")) {
      assertBoardState(
        typeof card.terminalAt === "string" && DATE_ONLY_PATTERN.test(card.terminalAt),
        `${ref} terminalAt must be YYYY-MM-DD`,
      );
    }
    if (hasOwn(card, "archived")) {
      assertBoardState(typeof card.archived === "boolean", `${ref} archived must be a boolean`);
    }
    if (hasOwn(card, "pinned")) {
      assertBoardState(typeof card.pinned === "boolean", `${ref} pinned must be a boolean`);
    }
    if (hasOwn(card, "title")) {
      assertBoardState(
        typeof card.title === "string" && card.title.trim().length > 0,
        `${ref} title must be a string`,
      );
    }
    if (hasOwn(card, "detail")) {
      assertBoardState(typeof card.detail === "string", `${ref} detail must be a string`);
    }
    if (hasOwn(card, "play")) {
      assertBoardState(
        typeof card.play === "string" && card.play.length > 0,
        `${ref} play must be a string`,
      );
      assertBoardState(
        cardPlaySlugs.has(card.play),
        `${ref} links unknown board play ${card.play}`,
      );
    }
    if (card.type === "testing") {
      assertBoardState(
        typeof card.play === "string" && card.play.length > 0,
        `${ref} testing card must link a play`,
      );
      testingByPlay.set(card.play, (testingByPlay.get(card.play) ?? 0) + 1);
    }

    validateCardChecklist(card, ref);
    validCards.push({ ...card } as unknown as WorkOrderCard);
  });

  for (const [play, count] of testingByPlay) {
    assertBoardState(count === 1, `play ${play} has ${count} testing cards`);
  }
  if (requireTesting) {
    const requiredTestingSlugs = options.requiredTestingSlugs ?? cardPlaySlugs;
    for (const slug of requiredTestingSlugs) {
      assertBoardState(
        testingByPlay.get(slug) === 1,
        `play ${slug} must have exactly one testing card`,
      );
    }
  }

  return validCards;
}

function mergeBoardCards(
  existingCards: unknown,
  postedCards: unknown,
  cardPlaySlugs: ReadonlySet<string>,
  requiredTestingSlugs: ReadonlySet<string>,
  today: string,
): WorkOrderCard[] {
  const existing = validateBoardCards(existingCards, cardPlaySlugs, {
    label: "existing cards",
    requireTesting: false,
  });
  const posted = validateBoardCards(postedCards, cardPlaySlugs, {
    label: "cards",
    requireTesting: false,
  });
  const byId = new Map(existing.map((card) => [card.id, card]));
  const order = existing.map((card) => card.id);
  for (const card of posted) {
    byId.set(card.id, normalizeCardStatusTransition(byId.get(card.id), card, today));
    if (!order.includes(card.id)) {
      order.push(card.id);
    }
  }
  const merged = order.flatMap((id) => {
    const card = byId.get(id);
    return card == null ? [] : [card];
  });
  return validateBoardCards(merged, cardPlaySlugs, {
    requireTesting: true,
    requiredTestingSlugs,
  });
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const tmpPath = join(
    dirname(path),
    `.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );
  try {
    await writeFile(tmpPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(tmpPath, path);
  } catch (error) {
    try {
      await unlink(tmpPath);
    } catch {
      // Best-effort cleanup; preserve the original write/rename failure.
    }
    throw error;
  }
}

async function boardWriteResponse(studioRoot: string, request: Request): Promise<Response> {
  const boardPath = join(studioRoot, "plays", "board-state.json");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "body is not JSON");
  }
  if (!isRecord(body)) {
    return jsonError(400, "body must be an object");
  }
  let normalizedBoard: ReturnType<typeof normalizeBoardStages>;
  try {
    normalizedBoard = normalizeBoardStages(body.stages);
  } catch (error) {
    return jsonError(400, `invalid board state: ${messageFromError(error)}`);
  }

  let existing: Record<string, unknown> = {};
  if (existsSync(boardPath)) {
    try {
      const parsed: unknown = JSON.parse(await readFile(boardPath, "utf8"));
      existing = isRecord(parsed) ? parsed : {};
    } catch {
      existing = {};
    }
  }

  let graduated: string[];
  try {
    graduated = normalizeGraduatedSlugs(
      body.graduated === undefined
        ? hasOwn(existing, "graduated")
          ? existing.graduated
          : []
        : body.graduated,
    );
  } catch (error) {
    return jsonError(400, `invalid board state: ${messageFromError(error)}`);
  }
  const graduatedSet = new Set(graduated);
  const activeStages = removeSlugsFromStages(normalizedBoard.stages, graduatedSet);
  const activeSlugs = new Set(Object.values(activeStages).flat());
  const cardPlaySlugs = new Set([...activeSlugs, ...graduated]);

  // `ready` is optional: when present it must be a string[] of non-empty
  // slugs and we persist it; when absent we preserve the on-disk value.
  const rawReady =
    body.ready === undefined ? (hasOwn(existing, "ready") ? existing.ready : []) : body.ready;
  if (!isBoardReady(rawReady)) {
    return jsonError(400, "body.ready must be a string[] of non-empty slugs");
  }
  const ready = rawReady.filter((slug) => !graduatedSet.has(slug));
  if (!readySlugsAreOnBoard(activeStages, ready)) {
    return jsonError(400, "body.ready slugs must be present on the board");
  }

  const updated = todayDateOnly();
  let graduatedAt: Record<string, string>;
  try {
    graduatedAt = normalizeGraduatedAt(body.graduatedAt, existing.graduatedAt, graduated, updated);
  } catch (error) {
    return jsonError(400, `invalid board state: ${messageFromError(error)}`);
  }

  let cards: unknown;
  try {
    const existingCards = hasOwn(existing, "cards") ? existing.cards : [];
    cards =
      body.cards === undefined
        ? existingCards
        : mergeBoardCards(existingCards, body.cards, cardPlaySlugs, activeSlugs, updated);
  } catch (error) {
    return jsonError(400, `invalid board state: ${messageFromError(error)}`);
  }

  const next = {
    ...existing,
    cards,
    graduated,
    graduatedAt,
    ready,
    stages: activeStages,
    updated,
  };
  await writeJsonAtomic(boardPath, next);
  return Response.json({ ok: true, updated });
}

async function recordsResponse(studioRoot: string, slug: string): Promise<Response> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonError(400, "bad slug");
  }
  const playDir = join(studioRoot, "plays", slug);
  if (!withinRoot(studioRoot, playDir) || !existsSync(playDir)) {
    return jsonError(404, `no play directory for ${slug}`);
  }
  const records = await listRecords(playDir, "", 0);
  return Response.json({ records, slug });
}

async function compositionResponse(studioRoot: string, slug: string): Promise<Response> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonError(400, "bad slug");
  }
  const playDir = join(studioRoot, "plays", slug);
  if (!withinRoot(studioRoot, playDir) || !existsSync(playDir)) {
    return jsonError(404, `no play directory for ${slug}`);
  }
  try {
    return Response.json(await deriveStudioPlayComposition(studioRoot, slug));
  } catch (error) {
    return jsonError(
      500,
      `could not derive play composition for ${slug}: ${messageFromError(error)}`,
    );
  }
}

async function fileResponse(studioRoot: string, relPath: string): Promise<Response> {
  const full = resolve(studioRoot, relPath);
  if (!withinRoot(studioRoot, full)) {
    return jsonError(400, "path escapes studio root");
  }
  if (!existsSync(full)) {
    return jsonError(404, `no studio file at ${relPath}`);
  }
  const info = await stat(full);
  if (!info.isFile()) {
    return jsonError(400, "not a file");
  }
  if (info.size > MAX_STUDIO_FILE_BYTES) {
    return jsonError(413, "file too large for the studio viewer");
  }
  const contentType = STUDIO_FILE_TYPES[extname(full).toLowerCase()] ?? "text/plain; charset=utf-8";
  const body = await readFile(full);
  return new Response(new Uint8Array(body), {
    headers: { "content-type": contentType },
  });
}

async function runEventsResponse(projectRoot: string, runId: string): Promise<Response> {
  if (!/^[A-Z0-9]+$/i.test(runId)) {
    return jsonError(400, "bad run id");
  }
  const fabro = embeddedFabro(projectRoot);
  if (fabro == null) {
    return jsonError(
      503,
      "embedded Fabro factory is not running — launch a play (ax run <slug>) and retry",
    );
  }
  const inspect = runCommandSync({
    args: ["inspect", "--server", fabro.target, runId, "--json"],
    command: fabro.binary,
    cwd: projectRoot,
    env: fabro.env,
  });
  const events = runCommandSync({
    args: ["events", "--server", fabro.target, runId],
    command: fabro.binary,
    cwd: projectRoot,
    env: fabro.env,
  });
  let inspectJson: unknown = null;
  try {
    inspectJson = JSON.parse(inspect.stdout);
  } catch {
    inspectJson = null;
  }
  const state = await fetchFabroRunState(fabro, runId);
  const review = await reviewFactsForFabroRun(projectRoot, runId);
  const inspectFailed = inspect.exitCode !== 0;
  const inspectErrorParts = [
    inspectFailed ? inspect.stderr.slice(0, 500) : null,
    // `fabro inspect` is authoritative; the supplementary /state fetch is only a
    // fallback for normalizeInspectPayload. Surface its error only when inspect
    // itself failed, so a flaky/unauthorized /state route never paints a
    // spurious error banner over a run that inspected cleanly.
    inspectFailed && state.error != null && state.value == null ? state.error.slice(0, 500) : null,
  ].filter((part): part is string => part != null && part.length > 0);
  const eventLines = events.stdout.split("\n");
  return Response.json({
    events: eventLines.slice(-300),
    inspect: normalizeInspectPayload(inspectJson, state.value),
    inspectError: inspectErrorParts.length === 0 ? null : inspectErrorParts.join("\n"),
    review,
    runId,
  });
}

// `fabro validate` is standalone — no server, model, or factory: it parses the
// workflow graph and applies Fabro's own build-validity rules, returning JSON
// (`{ valid, nodes, edges, diagnostics }`). It is the authoritative source for
// the Play Testing Preflight "Builds cleanly" check (plan §9.5). Runs the same
// resolved binary as the run-events endpoint, but needs no running factory.
function validateResponse(studioRoot: string, projectRoot: string, slug: string): Response {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return jsonError(400, "bad slug");
  }
  const workflowPath = join(studioRoot, "plays", slug, "workflow.fabro");
  if (!withinRoot(studioRoot, workflowPath) || !existsSync(workflowPath)) {
    return jsonError(404, `no workflow.fabro for ${slug}`);
  }
  const result = runCommandSync({
    args: ["validate", "--json", "--no-upgrade-check", workflowPath],
    command: resolveFabroBinary(),
    cwd: projectRoot,
    env: commandEnv(resolveFabroRuntimePaths()),
  });
  // `fabro validate` exits 0 even on a hard parse failure, so trust the JSON
  // `valid` field, never the exit code.
  try {
    return Response.json(JSON.parse(result.stdout));
  } catch {
    const detail = (result.stderr || result.stdout || "no output").slice(0, 500);
    return jsonError(502, `fabro validate produced no JSON: ${detail}`);
  }
}

async function fabroProxyResponse(projectRoot: string, rest: string): Promise<Response> {
  if (!/^[a-zA-Z0-9/_.-?=&]*$/.test(rest) || rest.includes("..")) {
    return jsonError(400, "bad proxy path");
  }
  const fabro = embeddedFabro(projectRoot);
  if (fabro == null) {
    return jsonError(503, "embedded Fabro factory is not running");
  }
  if (!fabro.target.startsWith("http")) {
    return jsonError(501, "embedded factory is on a unix socket; use the run events endpoint");
  }
  const token = await embeddedDevToken();
  const target = `${fabro.target}/api/v1/${rest}`;
  try {
    const upstream = await fetch(target, {
      headers: token != null ? { authorization: `Bearer ${token}` } : {},
    });
    const text = await upstream.text();
    return new Response(text, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
      status: upstream.status,
    });
  } catch (error) {
    return jsonError(502, `fabro server unreachable: ${String(error)}`);
  }
}

export async function handleStudioRequest(
  url: URL,
  request: Request,
  options: { projectRoot: string },
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/studio/")) {
    return null;
  }
  const studioRoot = studioRootFor(options.projectRoot);
  if (studioRoot == null) {
    return jsonError(404, "no studio/ directory at the project root");
  }

  if (url.pathname === "/api/studio/registry" && request.method === "GET") {
    return registryResponse(studioRoot, options.projectRoot);
  }
  if (url.pathname === "/api/studio/board" && request.method === "POST") {
    return boardWriteResponse(studioRoot, request);
  }
  if (url.pathname === "/api/studio/runs" && request.method === "GET") {
    return activeRunsResponse(options.projectRoot);
  }
  const recordsMatch = url.pathname.match(/^\/api\/studio\/plays\/([a-z0-9-]+)\/records$/);
  if (recordsMatch != null && request.method === "GET") {
    return recordsResponse(studioRoot, recordsMatch[1] ?? "");
  }
  const compositionMatch = url.pathname.match(/^\/api\/studio\/plays\/([a-z0-9-]+)\/composition$/);
  if (compositionMatch != null && request.method === "GET") {
    return compositionResponse(studioRoot, compositionMatch[1] ?? "");
  }
  const validateMatch = url.pathname.match(/^\/api\/studio\/plays\/([a-z0-9-]+)\/validate$/);
  if (validateMatch != null && request.method === "GET") {
    return validateResponse(studioRoot, options.projectRoot, validateMatch[1] ?? "");
  }
  if (url.pathname === "/api/studio/file" && request.method === "GET") {
    const relPath = url.searchParams.get("path");
    if (relPath == null || relPath.length === 0) {
      return jsonError(400, "path query param required");
    }
    return fileResponse(studioRoot, relPath);
  }
  const runMatch = url.pathname.match(/^\/api\/studio\/runs\/([A-Za-z0-9]+)\/events$/);
  if (runMatch != null && request.method === "GET") {
    return runEventsResponse(options.projectRoot, runMatch[1] ?? "");
  }
  if (url.pathname.startsWith("/api/studio/fabro/") && request.method === "GET") {
    return fabroProxyResponse(
      options.projectRoot,
      url.pathname.slice("/api/studio/fabro/".length) + url.search,
    );
  }
  return jsonError(404, "unknown studio endpoint");
}
