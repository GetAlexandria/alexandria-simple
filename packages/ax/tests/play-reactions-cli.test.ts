import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { runFrontOfHouseCli } from "../src/commands/front-of-house.js";
import { parseRunArgs, runPlay } from "../src/commands/play.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SMALL_EL2_FIXTURE_DIR = join(
  REPO_ROOT,
  "studio/plays/front-of-house-walk/fixtures/small-el2",
);
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface LedgerEvent {
  actor: Record<string, unknown>;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  type: string;
}

interface FakeFabroAnswer {
  body: unknown;
  questionId: string;
}

interface FakeFabroState {
  answers: FakeFabroAnswer[];
  labels: Record<string, string>;
  pendingIndex: number;
  questions: string[];
  runId: string;
  sourceDirectory: string;
  status: "not_started" | "running" | "succeeded" | "failed";
}

interface AnswerObservation {
  answerEventCountBeforeSubmit: number;
  body: unknown;
  questionId: string;
  receiptExistedBeforeSubmit: boolean | null;
}

function makeTempDir(): string {
  // realpath the temp dir: on macOS tmpdir() is a /var -> /private/var symlink.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-reactions-cli-")));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function writeExecutable(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { mode: 0o755 });
}

function initProject(cwd: string): void {
  writeFile(
    join(cwd, ".alexandria/alexandria-config.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        sourcesPath: "sources",
        workspace: "docs/alexandria",
      },
      null,
      2,
    )}\n`,
  );
  writeFile(join(cwd, "docs/alexandria/ledger/events.jsonl"), "");
}

function readEvents(cwd: string): LedgerEvent[] {
  const content = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as LedgerEvent);
}

function appendLedgerEvent(cwd: string, event: Record<string, unknown>): void {
  const path = join(cwd, "docs/alexandria/ledger/events.jsonl");
  const existing = readFileSync(path, "utf8");
  writeFile(path, `${existing}${JSON.stringify(event)}\n`);
}

function seedThreadEventsFromFixture(cwd: string, bundle: string): void {
  const content = readFileSync(join(bundle, "thread-events.jsonl"), "utf8").trim();
  if (content.length === 0) {
    return;
  }
  for (const line of content.split("\n")) {
    appendLedgerEvent(cwd, JSON.parse(line) as Record<string, unknown>);
  }
}

function readFakeState(path: string): FakeFabroState {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<FakeFabroState>;
  return {
    answers: parsed.answers ?? [],
    labels: parsed.labels ?? {},
    pendingIndex: parsed.pendingIndex ?? 0,
    questions: parsed.questions ?? [],
    runId: parsed.runId ?? "01SCRIPTED",
    sourceDirectory: parsed.sourceDirectory ?? "",
    status: parsed.status ?? "not_started",
  };
}

function writeFakeState(path: string, state: FakeFabroState): void {
  writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function writeFakeFabro(path: string): void {
  writeExecutable(
    path,
    `#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

const args = process.argv.slice(2);
const statePath = process.env.ALEXANDRIA_FAKE_FABRO_STATE;
const serverUrl = process.env.ALEXANDRIA_FAKE_FABRO_SERVER;
const runId = process.env.ALEXANDRIA_FAKE_FABRO_RUN_ID || "01SCRIPTED";

if (!statePath || !serverUrl) {
  console.error("fake Fabro missing state/server env");
  process.exit(2);
}

function readState() {
  if (!existsSync(statePath)) {
    return {};
  }
  return JSON.parse(readFileSync(statePath, "utf8"));
}

function writeState(state) {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\\n");
}

function labelsFromArgs() {
  const labels = {};
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--label") {
      continue;
    }
    const raw = args[index + 1] || "";
    const separator = raw.indexOf("=");
    if (separator > 0) {
      labels[raw.slice(0, separator)] = raw.slice(separator + 1);
    }
  }
  return labels;
}

if (args[0] === "--version") {
  console.log("fabro 0.0.0-test");
  process.exit(0);
}

if (args[0] === "server" && args[1] === "status") {
  console.log(JSON.stringify({ status: "running", pid: 123, bind: serverUrl }));
  process.exit(0);
}

if (args[0] === "auth" && args[1] === "login") {
  process.exit(0);
}

if (args[0] === "validate") {
  process.exit(0);
}

if (args[0] === "graph") {
  process.stdout.write('<svg xmlns="http://www.w3.org/2000/svg"><text>fake graph</text></svg>');
  process.exit(0);
}

if (args[0] === "run") {
  const state = readState();
  const labels = labelsFromArgs();
  writeState({
    ...state,
    answers: Array.isArray(state.answers) ? state.answers : [],
    labels,
    pendingIndex: Number.isInteger(state.pendingIndex) ? state.pendingIndex : 0,
    runId,
    sourceDirectory: labels["alexandria.project_id"] || process.cwd(),
    status: "running"
  });
  console.log(JSON.stringify({ event: "run.created", run_id: runId }));
  process.exit(0);
}

if (args[0] === "ps") {
  const state = readState();
  console.log(JSON.stringify([
    {
      labels: state.labels || {},
      run_id: state.runId || runId,
      source_directory: state.sourceDirectory || process.cwd(),
      status: state.status || "running"
    }
  ]));
  process.exit(0);
}

console.error("unexpected fabro args: " + args.join(" "));
process.exit(2);
`,
  );
}

function runFrontOfHouse(args: string[], cwd: string): Promise<TestCliResult> {
  return Effect.runPromise(runFrontOfHouseCli(args, cwd).pipe(Effect.provide(NodeFileSystem)));
}

function runPlayCommand(args: string[], cwd: string): Promise<TestCliResult> {
  const parsed = parseRunArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Promise.resolve(parsed);
  }
  return Effect.runPromise(runPlay(parsed).pipe(Effect.provide(NodeFileSystem)));
}

async function withEnv<T>(env: Record<string, string>, run: () => Promise<T>): Promise<T> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(env)) {
    previous.set(key, process.env[key]);
    process.env[key] = value;
  }

  try {
    return await run();
  } finally {
    for (const [key, value] of previous) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function withFakeFabro<T>(
  options: {
    cwd: string;
    onAcceptedAnswer?: (input: { acceptedCount: number; questionId: string }) => Promise<void>;
    questions: readonly string[];
    receiptRoot?: string | undefined;
    runId?: string | undefined;
  },
  run: (context: { observations: AnswerObservation[]; statePath: string }) => Promise<T>,
): Promise<T> {
  const toolDir = makeTempDir();
  const runtimeDir = makeTempDir();
  const fakeFabro = join(toolDir, "fabro");
  const statePath = join(toolDir, "fake-fabro-state.json");
  const runId = options.runId ?? "01SCRIPTED";
  const observations: AnswerObservation[] = [];
  let serverError: Error | null = null;

  writeFakeState(statePath, {
    answers: [],
    labels: {},
    pendingIndex: 0,
    questions: [...options.questions],
    runId,
    sourceDirectory: options.cwd,
    status: "not_started",
  });

  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      try {
        const url = new URL(request.url);
        const stateMatch = url.pathname.match(/^\/api\/v1\/runs\/([^/]+)\/state$/);
        if (request.method === "GET" && stateMatch != null) {
          const state = readFakeState(statePath);
          if (decodeURIComponent(stateMatch[1]!) !== state.runId) {
            return jsonResponse({ error: "unknown run" }, 404);
          }
          const pendingEntries =
            state.status === "running"
              ? state.questions.slice(state.pendingIndex).map((questionId) => [
                  questionId,
                  {
                    question: {
                      options: [{ key: "approve" }, { key: "hold" }],
                      prompt: `Scripted question ${questionId}`,
                      text: `Scripted question ${questionId}`,
                    },
                  },
                ])
              : [];
          return jsonResponse({ pending_interviews: Object.fromEntries(pendingEntries) });
        }

        const answerMatch = url.pathname.match(
          /^\/api\/v1\/runs\/([^/]+)\/questions\/([^/]+)\/answer$/,
        );
        if (request.method === "POST" && answerMatch != null) {
          const state = readFakeState(statePath);
          const requestRunId = decodeURIComponent(answerMatch[1]!);
          const questionId = decodeURIComponent(answerMatch[2]!);
          if (requestRunId !== state.runId) {
            return jsonResponse({ error: "unknown run" }, 404);
          }
          const expectedQuestionId = state.questions[state.pendingIndex];
          if (questionId !== expectedQuestionId) {
            return jsonResponse(
              { error: `expected ${expectedQuestionId ?? "no question"}, got ${questionId}` },
              409,
            );
          }

          const body = (await request.json()) as unknown;
          const receiptPath =
            options.receiptRoot == null
              ? null
              : join(options.receiptRoot, "runtime/front-of-house/answers", `${questionId}.json`);
          observations.push({
            answerEventCountBeforeSubmit: readEvents(options.cwd).filter(
              (event) => event.type === "library.front_of_house.answer_recorded",
            ).length,
            body,
            questionId,
            receiptExistedBeforeSubmit: receiptPath == null ? null : existsSync(receiptPath),
          });

          const acceptedCount = state.pendingIndex + 1;
          const nextState: FakeFabroState = {
            ...state,
            answers: [...state.answers, { body, questionId }],
            pendingIndex: acceptedCount,
            status: acceptedCount >= state.questions.length ? "succeeded" : "running",
          };
          writeFakeState(statePath, nextState);
          if (options.onAcceptedAnswer != null) {
            await options.onAcceptedAnswer({ acceptedCount, questionId });
          }
          return new Response(null, { status: 204 });
        }

        return jsonResponse({ error: `unexpected ${request.method} ${url.pathname}` }, 404);
      } catch (error) {
        serverError = error instanceof Error ? error : new Error(String(error));
        return new Response(serverError.message, { status: 500 });
      }
    },
  });

  writeFakeFabro(fakeFabro);

  try {
    const result = await withEnv(
      {
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_FABRO_BIN: fakeFabro,
        ALEXANDRIA_FAKE_FABRO_RUN_ID: runId,
        ALEXANDRIA_FAKE_FABRO_SERVER: server.url.toString(),
        ALEXANDRIA_FAKE_FABRO_STATE: statePath,
        ALEXANDRIA_HOME: runtimeDir,
      },
      () => run({ observations, statePath }),
    );
    if (serverError != null) {
      throw serverError;
    }
    return result;
  } finally {
    server.stop(true);
  }
}

async function stageSmallEl2Fixture(
  cwd: string,
  playRunId: string,
): Promise<{
  bundle: string;
  reactionsPath: string;
}> {
  const fixtureDir = join(cwd, "studio/plays/front-of-house-walk/fixtures/small-el2");
  cpSync(SMALL_EL2_FIXTURE_DIR, fixtureDir, { recursive: true });
  const bundle = join(fixtureDir, "bundle");
  seedThreadEventsFromFixture(cwd, bundle);
  const prepared = await runFrontOfHouse(
    ["prepare-agenda", "--bundle", bundle, "--play-run-id", playRunId, "--json"],
    cwd,
  );
  expect(prepared.exitCode).toBe(0);
  const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
  expect(staged.exitCode).toBe(0);
  return {
    bundle,
    reactionsPath: "studio/plays/front-of-house-walk/fixtures/small-el2/reactions.json",
  };
}

function writeReactions(path: string, reactions: unknown[]): void {
  writeFile(path, `${JSON.stringify(reactions, null, 2)}\n`);
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

// Skipped: this suite stages studio/plays/front-of-house-walk/fixtures/
// small-el2 from the real repo tree, and studio/ was removed in the
// alexandria-simple pare-back. Needs a fixture rewrite (or removal) before
// re-enabling.
describe.skip("ax run --reactions CLI behavior", () => {
  test("front-of-house-walk fixture seeds thread events idempotently before workflow submission", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const fixtureDir = join(cwd, "studio/plays/front-of-house-walk/fixtures/small-el2");
    cpSync(SMALL_EL2_FIXTURE_DIR, fixtureDir, { recursive: true });
    const bundle = join(fixtureDir, "bundle");
    const playRunId = "foh-fixture-seed-run";

    async function runFixtureSeed(runId: string): Promise<void> {
      await withFakeFabro(
        {
          cwd,
          questions: [],
          runId,
        },
        async () => {
          const result = await runPlayCommand(
            [
              "front-of-house-walk",
              "--fixture",
              "small-el2",
              "--wait",
              "--play-run-id",
              playRunId,
              "--json",
            ],
            cwd,
          );

          expect(result.exitCode).toBe(0);
          expect(result.stderr).toBe("");
        },
      );
    }

    await runFixtureSeed("01FOHSEED");
    await runFixtureSeed("01FOHSEED2");

    const seededThreadEvents = readEvents(cwd).filter(
      (event) => event.type === "library.thread_opened",
    );
    expect(seededThreadEvents.map((event) => event.payload.threadId).sort()).toEqual([
      "frame-small-el2-search-frame",
      "gap-small-el2-director-review",
      "hot-spot-small-el2-runtime-boundary",
      "prior-small-el2-raven-ops",
    ]);
    expect(seededThreadEvents.map((event) => event.idempotencyKey).sort()).toEqual([
      "fixture:front-of-house-walk:frame-small-el2-search-frame",
      "fixture:front-of-house-walk:gap-small-el2-director-review",
      "fixture:front-of-house-walk:hot-spot-small-el2-runtime-boundary",
      "fixture:front-of-house-walk:prior-small-el2-raven-ops",
    ]);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", playRunId, "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 4, status: "prepared" });
  });

  test("front-of-house-walk fixture rejects malformed thread events without writing the ledger", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const fixtureDir = join(cwd, "studio/plays/front-of-house-walk/fixtures/small-el2");
    cpSync(SMALL_EL2_FIXTURE_DIR, fixtureDir, { recursive: true });
    const eventPath = join(fixtureDir, "bundle/thread-events.jsonl");
    const firstEvent = JSON.parse(readFileSync(eventPath, "utf8").trim().split("\n")[0]!) as {
      payload: Record<string, unknown>;
    };
    firstEvent.payload.concerns = [{ type: "card" }];
    writeFile(eventPath, `${JSON.stringify(firstEvent)}\n`);

    await withFakeFabro(
      {
        cwd,
        questions: [],
        runId: "01FOHBADSEED",
      },
      async () => {
        const result = await runPlayCommand(
          [
            "front-of-house-walk",
            "--fixture",
            "small-el2",
            "--wait",
            "--play-run-id",
            "foh-bad-fixture-seed-run",
            "--json",
          ],
          cwd,
        );

        expect(result.exitCode).toBe(2);
        expect(result.stdout).toBe("");
        expect(result.stderr).toContain("library.thread_opened payload");
      },
    );

    expect(readEvents(cwd)).toEqual([]);
  });

  test("front-of-house-walk fixture banks scripted answers before Fabro submit and reports completion", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const playRunId = "foh-scripted-run";
    const questions = ["foh-q1", "foh-q2", "foh-q3", "foh-q4"];
    const { bundle, reactionsPath } = await stageSmallEl2Fixture(cwd, playRunId);

    await withFakeFabro(
      {
        cwd,
        onAcceptedAnswer: async ({ acceptedCount }) => {
          if (acceptedCount < questions.length) {
            const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
            expect(staged.exitCode).toBe(0);
          }
        },
        questions,
        receiptRoot: bundle,
        runId: "01FOHREACT",
      },
      async ({ observations }) => {
        const result = await runPlayCommand(
          [
            "front-of-house-walk",
            "--fixture",
            "small-el2",
            "--reactions",
            reactionsPath,
            "--play-run-id",
            playRunId,
            "--json",
          ],
          cwd,
        );

        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe("");
        const output = JSON.parse(result.stdout) as {
          fabroRunId: string;
          mode: string;
          play: string;
          playRunId: string;
          reactionsAnswered: number;
          status: string;
        };
        expect(output).toMatchObject({
          fabroRunId: "01FOHREACT",
          mode: "reactions",
          play: "front-of-house-walk",
          playRunId,
          reactionsAnswered: 4,
          status: "completed",
        });

        expect(observations.map((entry) => entry.questionId)).toEqual(questions);
        expect(observations.every((entry) => entry.receiptExistedBeforeSubmit)).toBeTrue();
        expect(observations.map((entry) => entry.answerEventCountBeforeSubmit)).toEqual([
          1, 2, 3, 4,
        ]);

        const events = readEvents(cwd).filter(
          (event) => event.type === "library.front_of_house.answer_recorded",
        );
        expect(events).toHaveLength(4);
        expect(events.map((event) => event.payload.questionId)).toEqual(questions);
        expect(new Set(events.map((event) => event.payload.agendaItemId))).toHaveLength(4);
        expect(
          events.every(
            (event) =>
              event.actor.kind === "user" &&
              event.actor.host === "claude-code" &&
              event.actor.name === "Director",
          ),
        ).toBeTrue();

        for (const questionId of questions) {
          const receipt = JSON.parse(
            readFileSync(
              join(bundle, "runtime/front-of-house/answers", `${questionId}.json`),
              "utf8",
            ),
          ) as Record<string, unknown>;
          expect(receipt).toMatchObject({ playRunId, questionId });
        }
      },
    );
  });

  test("front-of-house-walk reports exhausted when scripted reactions run out", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const playRunId = "foh-exhausted-run";
    const questions = ["foh-q1", "foh-q2"];
    const { bundle } = await stageSmallEl2Fixture(cwd, playRunId);
    const reactionsPath = "one-reaction.json";
    writeReactions(join(cwd, reactionsPath), [
      { kind: "text", text: "Answer only the first gate." },
    ]);

    await withFakeFabro(
      {
        cwd,
        onAcceptedAnswer: async ({ acceptedCount }) => {
          if (acceptedCount < questions.length) {
            const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
            expect(staged.exitCode).toBe(0);
          }
        },
        questions,
        receiptRoot: bundle,
        runId: "01FOHEXHAUST",
      },
      async ({ observations }) => {
        const result = await runPlayCommand(
          [
            "front-of-house-walk",
            "--fixture",
            "small-el2",
            "--reactions",
            reactionsPath,
            "--play-run-id",
            playRunId,
            "--json",
          ],
          cwd,
        );

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toBe("");
        const output = JSON.parse(result.stdout) as {
          message: string;
          reactionsAnswered: number;
          status: string;
        };
        expect(output).toMatchObject({
          reactionsAnswered: 1,
          status: "exhausted",
        });
        expect(output.message).toContain("foh-q2");
        expect(observations.map((entry) => entry.questionId)).toEqual(["foh-q1"]);
        expect(existsSync(join(bundle, "runtime/front-of-house/answers/foh-q1.json"))).toBeTrue();
        expect(existsSync(join(bundle, "runtime/front-of-house/answers/foh-q2.json"))).toBeFalse();
        expect(
          readEvents(cwd).filter(
            (event) => event.type === "library.front_of_house.answer_recorded",
          ),
        ).toHaveLength(1);
      },
    );
  });
});
