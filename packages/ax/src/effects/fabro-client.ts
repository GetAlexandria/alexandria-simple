import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { request as httpRequest } from "http";
import {
  commandEnv,
  getRunningFabroStatus,
  resolveAlexandriaRuntimePaths,
  resolveFabroBinary,
  runCommandSync,
} from "../domain/orchestration.js";
import {
  FABRO_LABEL_PLAY_ID,
  FABRO_LABEL_PLAY_RUN_ID,
  FABRO_LABEL_PROJECT_ID,
} from "../domain/fabro-labels.js";
import { canonicalizeExistingPath, findAlexandriaProjectRoot } from "../domain/project-root.js";
import { DEFAULT_AGENT_ID, isKnownPlayId, PLAY_MANIFEST, type PlayId } from "../domain/plays.js";
import { LEGACY_EVICTED_PLAY_IDS } from "../domain/state-events.js";
import type { FabroAnswerBody } from "../domain/play-answer.js";
import type { BridgeLifecycle, ObservedQuestion, ObservedRun } from "./run-bridge.js";

/**
 * Fabro client for the runtime daemon's run bridge (#305).
 *
 * `observeAlexandriaRuns` is the bridge's per-tick view of this checkout's
 * Alexandria-owned Fabro runs: `fabro ps --json --all` enumerates machine-global
 * runs, the project identity label scopes them to the current checkout, and the
 * HTTP `/state` endpoint supplies pending interviews (only `/state` carries them
 * — `fabro inspect` zeroes them).
 *
 * NOTE: a parallel, narrower Fabro client lives in PMS
 * (`packages/pms/src/effects/fabro.ts`, serving its studio API) — a
 * deliberate copy under the boundary migration's copy-don't-share ruling.
 */

const STATE_TIMEOUT_MS = 2_000;

interface ResolvedFabro {
  binary: string;
  env: NodeJS.ProcessEnv;
  target: string;
}

function resolveFabro(projectRoot: string): ResolvedFabro | null {
  const explicit = process.env.AX_FABRO_SERVER?.trim();
  const paths = resolveAlexandriaRuntimePaths();
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
  return status == null ? null : { binary, env, target: status.serverTarget };
}

async function devToken(): Promise<string | null> {
  const paths = resolveAlexandriaRuntimePaths();
  if (!existsSync(paths.fabroDevTokenPath)) {
    return null;
  }
  const token = (await readFile(paths.fabroDevTokenPath, "utf8")).trim();
  return token.length > 0 ? token : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function statusKind(value: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (isRecord(value) && typeof value.kind === "string" && value.kind.length > 0) {
    return value.kind;
  }
  return "unknown";
}

// Collapse Fabro's run status into the bridge's base lifecycle. Pending
// interviews (read from /state) are what mark a run "needs human", not the
// status kind, so blocked/paused fold to "running" here.
export function mapLifecycle(kind: string): BridgeLifecycle {
  switch (kind) {
    case "succeeded":
      return "succeeded";
    case "failed":
    case "dead":
      return "failed";
    case "submitted":
      return "submitted";
    default:
      return "running";
  }
}

function labelsOf(row: Record<string, unknown>): Record<string, string> {
  const labels = row.labels;
  if (!isRecord(labels)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(labels)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function parsePsRows(stdout: string): Record<string, unknown>[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return [];
  }
  const rows = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.runs)
      ? parsed.runs
      : [];
  return rows.filter(isRecord);
}

function sourceDirectoryOf(row: Record<string, unknown>): string | null {
  const sourceDirectory = row.source_directory ?? row.sourceDirectory;
  return typeof sourceDirectory === "string" && sourceDirectory.trim().length > 0
    ? sourceDirectory
    : null;
}

export function alexandriaRunBelongsToProject(
  row: Record<string, unknown>,
  canonicalProjectRoot: string,
): boolean {
  const labels = labelsOf(row);
  const projectId = labels[FABRO_LABEL_PROJECT_ID];
  if (projectId != null) {
    return projectId === canonicalProjectRoot;
  }

  const sourceDirectory = sourceDirectoryOf(row);
  if (sourceDirectory == null) {
    return false;
  }
  return canonicalizeExistingPath(sourceDirectory) === canonicalProjectRoot;
}

async function fetchRunState(
  fabro: ResolvedFabro,
  runId: string,
  token: string | null,
): Promise<Record<string, unknown> | null> {
  const path = `/api/v1/runs/${encodeURIComponent(runId)}/state`;
  const headers = token == null ? {} : { authorization: `Bearer ${token}` };
  const result = fabro.target.startsWith("http")
    ? await fetchHttp(new URL(path, fabro.target).toString(), headers)
    : await fetchUnixSocket(fabro.target, path, headers);
  if (result == null || result.status < 200 || result.status >= 300) {
    return null;
  }
  try {
    const value = JSON.parse(result.text) as unknown;
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export function pendingQuestionsFrom(state: Record<string, unknown> | null): ObservedQuestion[] {
  if (state == null || !isRecord(state.pending_interviews)) {
    return [];
  }
  const out: ObservedQuestion[] = [];
  for (const [questionId, record] of Object.entries(state.pending_interviews)) {
    if (!isRecord(record)) {
      continue;
    }
    const question = isRecord(record.question) ? record.question : record;
    const prompt =
      (typeof question.text === "string" && question.text) ||
      (typeof question.prompt === "string" && question.prompt) ||
      "Human input requested";
    const choices = Array.isArray(question.options)
      ? question.options
          .map((option) => (isRecord(option) && typeof option.key === "string" ? option.key : null))
          .filter((key): key is string => key != null)
      : undefined;
    out.push({
      prompt,
      questionId,
      ...(choices != null && choices.length > 0 ? { choices } : {}),
    });
  }
  return out;
}

/** The bridge's per-tick observation of every Alexandria-owned Fabro run. */
export async function observeAlexandriaRuns(projectRoot: string): Promise<ObservedRun[]> {
  const canonicalProjectRoot = findAlexandriaProjectRoot(projectRoot);
  if (canonicalProjectRoot instanceof Error) {
    return [];
  }

  const fabro = resolveFabro(canonicalProjectRoot);
  if (fabro == null) {
    return [];
  }
  const listed = runCommandSync({
    args: ["ps", "--server", fabro.target, "--all", "--json"],
    command: fabro.binary,
    cwd: canonicalProjectRoot,
    env: fabro.env,
  });
  if (listed.exitCode !== 0) {
    return [];
  }

  const token = await devToken();
  const observed: ObservedRun[] = [];
  for (const row of parsePsRows(listed.stdout)) {
    const fabroRunId =
      (typeof row.run_id === "string" && row.run_id) ||
      (typeof row.runId === "string" && row.runId) ||
      null;
    if (fabroRunId == null) {
      continue;
    }
    const labels = labelsOf(row);
    const playRunId = labels[FABRO_LABEL_PLAY_RUN_ID];
    const playId = labels[FABRO_LABEL_PLAY_ID];
    // Accept evicted legacy ids too: a run launched before the PMS eviction
    // (boundary migration, Slice 1) must still reach a terminal status in the
    // ledger instead of staying "active" forever.
    if (playRunId == null || playId == null || !isReadablePlayId(playId)) {
      continue;
    }
    if (!alexandriaRunBelongsToProject(row, canonicalProjectRoot)) {
      continue;
    }
    const lifecycle = mapLifecycle(statusKind(row.status));
    const pendingQuestions =
      lifecycle === "succeeded" || lifecycle === "failed"
        ? []
        : pendingQuestionsFrom(await fetchRunState(fabro, fabroRunId, token));
    observed.push({
      agentId: agentIdFor(playId),
      fabroRunId,
      lifecycle,
      pendingQuestions,
      playId,
      playRunId,
    });
  }
  return observed;
}

const LEGACY_PLAY_ID_SET: ReadonlySet<string> = new Set(LEGACY_EVICTED_PLAY_IDS);

function isReadablePlayId(value: string): value is PlayId {
  return isKnownPlayId(value) || LEGACY_PLAY_ID_SET.has(value);
}

function agentIdFor(playId: PlayId): string {
  const entry: { defaultAgentId: string } | undefined = PLAY_MANIFEST[playId];
  return entry?.defaultAgentId ?? DEFAULT_AGENT_ID;
}

function fetchHttp(
  url: string,
  headers: Record<string, string>,
): Promise<{ status: number; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATE_TIMEOUT_MS);
  return fetch(url, { headers, signal: controller.signal })
    .then(async (response) => ({ status: response.status, text: await response.text() }))
    .catch(() => null)
    .finally(() => clearTimeout(timer));
}

function fetchUnixSocket(
  socketPath: string,
  path: string,
  headers: Record<string, string>,
): Promise<{ status: number; text: string } | null> {
  return new Promise((resolve) => {
    const req = httpRequest({ headers, method: "GET", path, socketPath }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on("end", () => {
        resolve({ status: response.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") });
      });
    });
    req.setTimeout(STATE_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve(null));
    req.end();
  });
}

function postHttp(
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<{ status: number; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATE_TIMEOUT_MS);
  return fetch(url, {
    body,
    headers: { ...headers, "content-type": "application/json" },
    method: "POST",
    signal: controller.signal,
  })
    .then(async (response) => ({ status: response.status, text: await response.text() }))
    .catch(() => null)
    .finally(() => clearTimeout(timer));
}

function postUnixSocket(
  socketPath: string,
  path: string,
  headers: Record<string, string>,
  body: string,
): Promise<{ status: number; text: string } | null> {
  return new Promise((resolve) => {
    const payload = Buffer.from(body, "utf8");
    const req = httpRequest(
      {
        headers: {
          ...headers,
          "content-length": String(payload.byteLength),
          "content-type": "application/json",
        },
        method: "POST",
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
            text: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.setTimeout(STATE_TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    req.on("error", () => resolve(null));
    req.write(payload);
    req.end();
  });
}

function postFabro(
  fabro: ResolvedFabro,
  path: string,
  token: string | null,
  body: string,
): Promise<{ status: number; text: string } | null> {
  const headers = token == null ? {} : { authorization: `Bearer ${token}` };
  if (fabro.target.startsWith("http")) {
    return postHttp(new URL(path, fabro.target).toString(), headers, body);
  }
  return postUnixSocket(fabro.target, path, headers, body);
}

/** Whether a run's pending interview still holds a given question, read from Fabro `/state`. */
export interface PendingInterviewLookup {
  /** false when Fabro is unreachable or `/state` could not be read. */
  reachable: boolean;
  /** true while the question is still pending (false ⇒ already resolved). */
  pending: boolean;
}

/**
 * Check whether a question is still pending on a run's Fabro `/state`. Used by
 * `ax raven answer` to handle an already-resolved question idempotently (and to
 * distinguish an unreachable run before attempting to answer).
 */
export async function fetchPendingInterview(options: {
  fabroRunId: string;
  projectRoot: string;
  questionId: string;
}): Promise<PendingInterviewLookup> {
  const fabro = resolveFabro(options.projectRoot);
  if (fabro == null) {
    return { pending: false, reachable: false };
  }
  const token = await devToken();
  const state = await fetchRunState(fabro, options.fabroRunId, token);
  if (state == null) {
    return { pending: false, reachable: false };
  }
  const pending =
    isRecord(state.pending_interviews) && isRecord(state.pending_interviews[options.questionId]);
  return { pending, reachable: true };
}

/** The outcome of POSTing an answer to Fabro's answer endpoint. */
export type SubmitFabroAnswerResult =
  | { ok: true }
  | { message: string; ok: false; status: number | null };

/**
 * Submit an answer to a pending Fabro interview question via
 * `POST /api/v1/runs/{id}/questions/{qid}/answer`. Emits no ledger events — the
 * runtime daemon's bridge emits `play.human_input_resolved` when it next
 * observes the question cleared (#305).
 */
export async function submitFabroAnswer(options: {
  body: FabroAnswerBody;
  fabroRunId: string;
  projectRoot: string;
  questionId: string;
}): Promise<SubmitFabroAnswerResult> {
  const fabro = resolveFabro(options.projectRoot);
  if (fabro == null) {
    return { message: "No running Fabro server found for this project.", ok: false, status: null };
  }
  const token = await devToken();
  const path = `/api/v1/runs/${encodeURIComponent(options.fabroRunId)}/questions/${encodeURIComponent(
    options.questionId,
  )}/answer`;
  const result = await postFabro(fabro, path, token, JSON.stringify(options.body));
  if (result == null) {
    return { message: "Fabro answer request failed (no response).", ok: false, status: null };
  }
  if (result.status === 204 || (result.status >= 200 && result.status < 300)) {
    return { ok: true };
  }
  return {
    message:
      result.text.trim().length > 0 ? result.text.trim() : `Fabro returned ${result.status}.`,
    ok: false,
    status: result.status,
  };
}
