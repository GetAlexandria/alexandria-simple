import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  atomicCardSectionSummaryInputForEvent,
  latestAtomicCardSectionSummaryInputsByRunAndContextKey,
} from "../src/domain/atomic-cards.js";
import {
  refreshEmptyLibraryBundleManifest,
  type EmptyLibraryBundleManifest,
} from "../src/domain/library-confirmation.js";
import {
  FRONT_OF_HOUSE_AGENDA_FILE,
  FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
} from "../src/domain/library-front-of-house.js";
import { hashText } from "../src/domain/sources.js";
import type { AlexandriaStateEvent } from "../src/domain/state-events.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface StateEvent {
  actor: { kind: string; host?: string; name?: string; process?: string };
  id: string;
  payload: Record<string, unknown>;
  type: string;
}

interface Fixture {
  bundlePath: string;
  candidatePath: string;
  confirmationEventId: string;
  cwd: string;
  lexiconPath: string;
  manifest: EmptyLibraryBundleManifest;
  planPath: string;
  sourceHash: string;
  sourcePath: string;
  stubContent: string;
  stubPath: string;
}

function makeTempDir(): string {
  // realpath the temp dir: on macOS tmpdir() is a /var -> /private/var symlink,
  // and the spawned CLI resolves process.cwd() to the real path, so unresolved
  // fixture paths fail the project-root containment check. Linux CI masks this.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-cards-")));
  tempDirs.push(dir);
  return dir;
}

function runCli(args: string[], cwd: string): TestCliResult {
  return runCliWithEnv(args, cwd);
}

function runCliWithEnv(
  args: string[],
  cwd: string,
  env: Record<string, string | undefined> = {},
): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", CLI_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
      ...env,
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

function writeExecutable(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { mode: 0o755 });
}

function writeCompletingFabro(path: string, runId: string): void {
  writeExecutable(
    path,
    `#!/usr/bin/env bun
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const args = process.argv.slice(2);
const logPath = process.env.ALEXANDRIA_FAKE_FABRO_LOG;
if (logPath) {
  appendFileSync(logPath, JSON.stringify(args) + "\\n");
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function statusForBind(bind) {
  return bind.includes("/")
    ? { status: "running", pid: 123, bind: { unix: bind } }
    : { status: "running", pid: 123, bind: bind === "127.0.0.1" ? "127.0.0.1:43210" : bind };
}

if (args[0] === "--version") {
  console.log("fabro 0.0.0-test");
  process.exit(0);
}
if (args[0] === "server" && args[1] === "status") {
  const storage = valueAfter("--storage-dir");
  if (storage && existsSync(storage + "/server.json")) {
    process.stdout.write(readFileSync(storage + "/server.json", "utf8"));
    process.exit(0);
  }
  process.exit(1);
}
if (args[0] === "server" && args[1] === "start") {
  const storage = valueAfter("--storage-dir");
  const bind = valueAfter("--bind");
  mkdirSync(storage, { recursive: true });
  writeFileSync(storage + "/server.json", JSON.stringify(statusForBind(bind)) + "\\n");
  process.exit(0);
}
if (args[0] === "auth" && args[1] === "login") {
  process.exit(0);
}
if (args[0] === "validate") {
  process.exit(0);
}
if (args[0] === "run") {
  console.log(JSON.stringify({ event: "run.created", run_id: "${runId}" }));
  console.log(JSON.stringify({ event: "run.completed", run_id: "${runId}", properties: { status: "succeeded" } }));
  process.exit(0);
}
console.error("unexpected fabro args: " + args.join(" "));
process.exit(2);
`,
  );
}

function readRecordedFabroArgs(logPath: string): string[][] {
  if (!existsSync(logPath)) return [];
  return readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as string[]);
}

function initProject(cwd: string): void {
  const result = runCli(["init"], cwd);
  expect(result.exitCode).toBe(0);
}

function readEvents(cwd: string): StateEvent[] {
  const content = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as StateEvent);
}

const SECTION_CONFIRMED_DEFAULT_PAYLOAD: Record<string, unknown> = {
  playRunId: "foh-run-1",
  context: "Library Operations",
  plane: "Product",
  prefLabel: "Library Operations",
  summary:
    "Directors use Library Operations to turn confirmed shelves into readable product knowledge.",
  cards: ["product/agents/Agent - Raven.md"],
  unknowns: [],
};

function appendSectionConfirmed(
  cwd: string,
  overrides: Partial<{
    answerEventId: string;
    cards: string[];
    context: string;
    plane: string;
    playRunId: string;
    prefLabel: string;
    scope: string;
    summary: string;
    unknowns: string[];
  }> = {},
): StateEvent {
  const payload = {
    ...SECTION_CONFIRMED_DEFAULT_PAYLOAD,
    answerEventId: "00000000-0000-4000-8000-000000000490",
    ...overrides,
  };
  const result = runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "library.front_of_house.section_confirmed",
      "--payload",
      JSON.stringify(payload),
      "--json",
    ],
    cwd,
  );
  expect(result.stderr).toBe("");
  expect(result.exitCode).toBe(0);
  return (JSON.parse(result.stdout) as { event: StateEvent }).event;
}

function sectionConfirmedDomainEvent(
  extra: Partial<AlexandriaStateEvent> = {},
): AlexandriaStateEvent {
  const { payload, ...eventExtra } = extra;
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000590",
    at: "2026-06-24T00:03:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    type: "library.front_of_house.section_confirmed",
    ...eventExtra,
    payload: {
      ...SECTION_CONFIRMED_DEFAULT_PAYLOAD,
      answerEventId: "00000000-0000-4000-8000-000000000490",
      ...(payload ?? {}),
    },
  };
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function writeFrontOfHouseAgenda(
  fixture: Fixture,
  options: { bundlePath?: string; playRunId?: string } = {},
): void {
  writeText(
    join(fixture.bundlePath, FRONT_OF_HOUSE_AGENDA_FILE),
    `${JSON.stringify(
      {
        schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
        bundlePath: options.bundlePath ?? fixture.bundlePath,
        playRunId: options.playRunId ?? "foh-run-1",
        items: [],
      },
      null,
      2,
    )}\n`,
  );
}

function executePlanWithFakeFabro(
  fixture: Fixture,
  options: { candidateDirName?: string; fabroRunId?: string } = {},
): { candidateDir: string; fabroLog: string; result: TestCliResult } {
  const toolDir = join(fixture.cwd, "tools");
  const fakeFabro = join(toolDir, "fabro");
  const fabroLog = join(toolDir, "fabro-args.jsonl");
  const candidateDir = join(fixture.cwd, options.candidateDirName ?? "candidates");
  writeCompletingFabro(fakeFabro, options.fabroRunId ?? "01EL5SUMMARY");

  const result = runCliWithEnv(
    [
      "cards",
      "execute-plan",
      "--plan",
      fixture.planPath,
      "--candidate-dir",
      candidateDir,
      "--actor",
      JSON.stringify({ kind: "agent", host: "claude-code", name: "Raven" }),
      "--lexicon",
      fixture.lexiconPath,
      "--json",
    ],
    fixture.cwd,
    {
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_LOG: fabroLog,
    },
  );

  return { candidateDir, fabroLog, result };
}

async function refreshManifest(
  cwd: string,
  bundlePath: string,
): Promise<EmptyLibraryBundleManifest> {
  return Effect.runPromise(
    refreshEmptyLibraryBundleManifest({
      bundlePath,
      now: "2026-06-24T00:00:00.000Z",
      product: "alexandria",
      projectRoot: cwd,
    }).pipe(Effect.provide(NodeFileSystem)),
  );
}

function cardPlan(input: Fixture, confirmationEventId: string): Record<string, unknown> {
  return {
    schemaVersion: "atomic-card-build-plan.v1",
    confirmedLibrary: {
      bundlePath: input.bundlePath,
      confirmationEventId,
      contentHash: input.manifest.contentHash,
      libraryVersion: input.manifest.libraryVersion,
      product: input.manifest.product,
    },
    sourceDocuments: [
      {
        id: "source-1",
        path: "source/product.md",
        contentHash: input.sourceHash,
        sourceOfTruthId: "source_of_truth_raven",
      },
    ],
    contracts: [
      {
        contractId: "el5-raven",
        disposition: "write_new",
        actor: { kind: "agent", host: "claude-code", name: "Raven" },
        targetCard: {
          path: "product/agents/Agent - Raven.md",
          shelfPath: "product/agents",
          type: "Agent",
          prefLabel: "Raven",
          context: "Library Operations",
          plane: "Product",
          status: "stub",
          confirmedStubHash: hashText(input.stubContent),
          lexiconMatch: {
            prefLabel: "Raven",
            matchKind: "prefLabel",
            entryPath: "vocabulary/Agent - Raven.md",
          },
        },
        sourceRefs: [
          {
            documentId: "source-1",
            path: "source/product.md",
            contentHash: input.sourceHash,
            range: { start: 0, end: 104 },
            sourceOfTruthId: "source_of_truth_raven",
          },
        ],
      },
    ],
    gapReports: [
      {
        disposition: "gap_report",
        candidateLabel: "Telemetry Sink",
        missingShelf: true,
        missingLexiconEntry: true,
        reason:
          "Source describes a real runtime concept, but no confirmed shelf or lexicon entry resolves it.",
        sourceRefs: [
          {
            documentId: "source-1",
            path: "source/product.md",
            contentHash: input.sourceHash,
            range: { start: 105, end: 173 },
          },
        ],
      },
    ],
    coveredExisting: [],
    deferHuman: [],
    reject: [],
  };
}

async function makeFixture(options: { confirm: boolean }): Promise<Fixture> {
  const cwd = makeTempDir();
  initProject(cwd);
  const bundlePath = join(cwd, "fixtures/el4-bundle");
  const stubPath = join(bundlePath, "product/agents/Agent - Raven.md");
  const stubContent = [
    "---",
    "type: Agent",
    "prefLabel: Raven",
    "context: Library Operations",
    "plane: Product",
    "status: stub",
    "---",
    "",
    "[[Role - Director]]",
    "",
  ].join("\n");
  writeText(stubPath, stubContent);

  const manifest = await refreshManifest(cwd, bundlePath);
  const sourceText = [
    "Raven is the product-facing Library Operations agent that helps directors fill confirmed shelves.",
    "Telemetry Sink is a runtime concept without a confirmed shelf in this fixture.",
    "",
  ].join("\n");
  const sourcePath = join(cwd, "source/product.md");
  writeText(sourcePath, sourceText);
  const sourceHash = hashText(sourceText);

  const lexiconPath = join(cwd, "vocabulary/Agent - Raven.md");
  writeText(
    lexiconPath,
    [
      "---",
      "type: Agent",
      "prefLabel: Raven",
      "altLabels:",
      "  - Product Owner",
      "status: stub",
      "---",
      "",
      "# Raven",
      "",
    ].join("\n"),
  );

  let confirmationEventId = "00000000-0000-4000-8000-000000000000";
  if (options.confirm) {
    const confirmed = runCli(
      ["internal", "library-confirm", "confirm", "--bundle", bundlePath, "--json"],
      cwd,
    );
    expect(confirmed.exitCode).toBe(0);
    const payload = JSON.parse(confirmed.stdout) as { event: { id: string } };
    confirmationEventId = payload.event.id;
  }

  const candidatePath = join(cwd, "candidate.md");
  writeText(
    candidatePath,
    [
      "# Agent - Raven",
      "",
      "## WHAT",
      "Raven is the product-facing Library Operations agent for filling confirmed shelves from source material.",
      "",
      "## WHERE",
      "- [[Role - Director]] - provides the human ruling Raven carries into Library Operations.",
      "",
      "## WHY",
      "Raven exists so the director does not hand-author atomic cards after confirming the empty library.",
      "",
      "## WHEN",
      "Raven acts after EL4 confirmation and before the library enters living-update mode.",
      "",
      "## HOW",
      "Raven turns source-backed concepts into card bodies on confirmed stubs. Anti-example: Raven does not invent a shelf for Telemetry Sink in this fixture.",
      "",
    ].join("\n"),
  );

  const planPath = join(cwd, "plan.json");
  const fixture: Fixture = {
    bundlePath,
    candidatePath,
    confirmationEventId,
    cwd,
    lexiconPath: join(cwd, "vocabulary"),
    manifest,
    planPath,
    sourceHash,
    sourcePath,
    stubContent,
    stubPath,
  };
  writeText(planPath, `${JSON.stringify(cardPlan(fixture, confirmationEventId), null, 2)}\n`);
  return fixture;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax cards", () => {
  test("prints help and validates missing required inputs", () => {
    const cwd = makeTempDir();

    const help = runCli(["cards", "--help"], cwd);
    expect(help.exitCode).toBe(0);
    expect(help.stderr).toBe("");
    expect(help.stdout).toContain("Usage: ax cards <subcommand>");

    const missing = runCli(["cards", "validate-plan"], cwd);
    expect(missing.exitCode).toBe(2);
    expect(missing.stdout).toBe("");
    expect(missing.stderr).toContain("Missing required option: --plan.");

    for (const args of [
      ["cards", "validate-plan", "--plan", "plan.json"],
      ["cards", "verify-plan", "--plan", "plan.json"],
      ["cards", "coverage-audit", "--plan", "plan.json"],
      ["cards", "execute-plan", "--plan", "plan.json", "--candidate-dir", "candidates"],
      [
        "cards",
        "publish",
        "--plan",
        "plan.json",
        "--contract",
        "el5-raven",
        "--candidate",
        "candidate.md",
      ],
    ]) {
      const missingLexicon = runCli(args, cwd);
      expect(missingLexicon.exitCode).toBe(2);
      expect(missingLexicon.stdout).toBe("");
      expect(missingLexicon.stderr).toContain("Missing required option: --lexicon.");
    }
  });

  test("projects section_confirmed events into EL5 section summary inputs", () => {
    const populated = sectionConfirmedDomainEvent({
      payload: {
        scope: "In: director-facing Library Operations. Out: source file names.",
      },
    });
    const populatedInput = atomicCardSectionSummaryInputForEvent(populated);
    expect(populatedInput).toEqual({
      answerEventId: "00000000-0000-4000-8000-000000000490",
      cards: ["product/agents/Agent - Raven.md"],
      context: "Library Operations",
      eventId: "00000000-0000-4000-8000-000000000590",
      plane: "Product",
      prefLabel: "Library Operations",
      scope: "In: director-facing Library Operations. Out: source file names.",
      summary:
        "Directors use Library Operations to turn confirmed shelves into readable product knowledge.",
      unknowns: [],
      schemaVersion: "atomic-card-section-summary.v1",
    });
    expect("playRunId" in populatedInput!).toBeFalse();

    const withoutScope = sectionConfirmedDomainEvent({
      id: "00000000-0000-4000-8000-000000000591",
    });
    expect(atomicCardSectionSummaryInputForEvent(withoutScope)).toEqual({
      answerEventId: "00000000-0000-4000-8000-000000000490",
      cards: ["product/agents/Agent - Raven.md"],
      context: "Library Operations",
      eventId: "00000000-0000-4000-8000-000000000591",
      plane: "Product",
      prefLabel: "Library Operations",
      summary:
        "Directors use Library Operations to turn confirmed shelves into readable product knowledge.",
      unknowns: [],
      schemaVersion: "atomic-card-section-summary.v1",
    });

    const malformed = sectionConfirmedDomainEvent({
      id: "00000000-0000-4000-8000-000000000592",
      payload: {
        summary: undefined,
      },
    });
    expect(atomicCardSectionSummaryInputForEvent(malformed)).toBeNull();
  });

  test("selects latest EL5 section summary inputs within the requested run", () => {
    const oldRunOne = sectionConfirmedDomainEvent({
      id: "00000000-0000-4000-8000-000000000593",
      payload: {
        prefLabel: "Old Library Operations",
        summary: "Old run-one wording.",
      },
    });
    const otherRun = sectionConfirmedDomainEvent({
      id: "00000000-0000-4000-8000-000000000594",
      payload: {
        playRunId: "foh-run-2",
        prefLabel: "Other Run Library Operations",
        summary: "Other-run wording must not win.",
      },
    });
    const latestRunOne = sectionConfirmedDomainEvent({
      id: "00000000-0000-4000-8000-000000000595",
      payload: {
        context: " library operations ",
        prefLabel: "Latest Library Operations",
        summary: "Latest run-one wording.",
      },
    });

    const selected = latestAtomicCardSectionSummaryInputsByRunAndContextKey(
      [oldRunOne, otherRun, latestRunOne],
      "foh-run-1",
    );

    expect([...selected.keys()]).toEqual(["library operations"]);
    expect(selected.get("library operations")).toMatchObject({
      eventId: "00000000-0000-4000-8000-000000000595",
      context: " library operations ",
      prefLabel: "Latest Library Operations",
      summary: "Latest run-one wording.",
      schemaVersion: "atomic-card-section-summary.v1",
    });
    expect(latestAtomicCardSectionSummaryInputsByRunAndContextKey([latestRunOne], null).size).toBe(
      0,
    );
  });

  test("refuses to validate a plan against an unconfirmed bundle", async () => {
    const fixture = await makeFixture({ confirm: false });

    const result = runCli(
      [
        "cards",
        "validate-plan",
        "--plan",
        fixture.planPath,
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Confirmed library gate is not approved");
    expect(
      readEvents(fixture.cwd).some((event) => event.type === "atomic_card.created"),
    ).toBeFalse();
  });

  test("validates a confirmed EL5 plan and reports gap entries without creating files", async () => {
    const fixture = await makeFixture({ confirm: true });

    const valid = runCli(
      [
        "cards",
        "validate-plan",
        "--plan",
        fixture.planPath,
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );
    expect(valid.exitCode).toBe(0);
    expect(valid.stderr).toBe("");
    expect(JSON.parse(valid.stdout)).toMatchObject({
      contractCount: 1,
      gapReportCount: 1,
      valid: true,
    });

    const audit = runCli(
      [
        "cards",
        "coverage-audit",
        "--plan",
        fixture.planPath,
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );
    expect(audit.exitCode).toBe(0);
    const parsed = JSON.parse(audit.stdout) as {
      totals: { filled: number; gapReports: number };
      gapReports: Array<{ candidateLabel: string }>;
    };
    expect(parsed.totals).toMatchObject({ filled: 0, gapReports: 1 });
    expect(parsed.gapReports[0]?.candidateLabel).toBe("Telemetry Sink");
    expect(
      existsSync(join(fixture.bundlePath, "product/systems/System - Telemetry Sink.md")),
    ).toBeFalse();
  });

  test("rejects a plan that cites the wrong lexicon entry path", async () => {
    const fixture = await makeFixture({ confirm: true });
    const plan = JSON.parse(readFileSync(fixture.planPath, "utf8")) as {
      contracts: Array<{ targetCard: { lexiconMatch: { entryPath: string } } }>;
    };
    plan.contracts[0]!.targetCard.lexiconMatch.entryPath = "vocabulary/Missing - Raven.md";
    writeFileSync(fixture.planPath, `${JSON.stringify(plan, null, 2)}\n`);

    const result = runCli(
      [
        "cards",
        "validate-plan",
        "--plan",
        fixture.planPath,
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("lexicon entry is not present");
  });

  test("rejects publish when lexicon proof is missing or mis-cited", async () => {
    const fixture = await makeFixture({ confirm: true });

    const missingLexicon = runCli(
      [
        "cards",
        "publish",
        "--plan",
        fixture.planPath,
        "--contract",
        "el5-raven",
        "--candidate",
        fixture.candidatePath,
        "--actor",
        JSON.stringify({ kind: "agent", host: "claude-code", name: "Raven" }),
        "--json",
      ],
      fixture.cwd,
    );

    expect(missingLexicon.exitCode).toBe(2);
    expect(missingLexicon.stdout).toBe("");
    expect(missingLexicon.stderr).toContain("Missing required option: --lexicon.");

    const plan = JSON.parse(readFileSync(fixture.planPath, "utf8")) as {
      contracts: Array<{ targetCard: { lexiconMatch: { entryPath: string } } }>;
    };
    plan.contracts[0]!.targetCard.lexiconMatch.entryPath = "vocabulary/Missing - Raven.md";
    writeFileSync(fixture.planPath, `${JSON.stringify(plan, null, 2)}\n`);

    const wrongEntry = runCli(
      [
        "cards",
        "publish",
        "--plan",
        fixture.planPath,
        "--contract",
        "el5-raven",
        "--candidate",
        fixture.candidatePath,
        "--actor",
        JSON.stringify({ kind: "agent", host: "claude-code", name: "Raven" }),
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );

    expect(wrongEntry.exitCode).toBe(2);
    expect(wrongEntry.stdout).toBe("");
    expect(wrongEntry.stderr).toContain("lexicon entry is not present");
    expect(
      readEvents(fixture.cwd).some((event) => event.type === "atomic_card.created"),
    ).toBeFalse();
  });

  test("routes grade reports before publish", async () => {
    const fixture = await makeFixture({ confirm: true });
    const gradePath = join(fixture.cwd, "grade.json");
    writeText(
      gradePath,
      `${JSON.stringify(
        {
          schemaVersion: "atomic-card-grade.v1",
          contractId: "el5-raven",
          status: "pass",
          grade: "A-",
          shelfFit: { status: "pass" },
          findings: [],
        },
        null,
        2,
      )}\n`,
    );

    const pass = runCli(
      ["cards", "grade-candidate", "--contract", fixture.planPath, "--grade", gradePath, "--json"],
      fixture.cwd,
    );
    expect(pass.stderr).toBe("");
    expect(pass.exitCode).toBe(0);
    expect(JSON.parse(pass.stdout)).toMatchObject({
      contractId: "el5-raven",
      status: "pass",
      token: "GRADE_PASS",
    });

    writeText(
      gradePath,
      `${JSON.stringify(
        {
          schemaVersion: "atomic-card-grade.v1",
          contractId: "el5-raven",
          status: "pass",
          shelfFit: { status: "fail", reason: "Wrong confirmed shelf." },
          findings: ["Move would violate the confirmed shelf contract."],
        },
        null,
        2,
      )}\n`,
    );
    const revise = runCli(
      ["cards", "grade-candidate", "--contract", fixture.planPath, "--grade", gradePath, "--json"],
      fixture.cwd,
    );
    expect(revise.exitCode).toBe(0);
    expect(JSON.parse(revise.stdout)).toMatchObject({
      status: "revise",
      token: "GRADE_REVISE",
    });

    writeText(
      gradePath,
      `${JSON.stringify(
        {
          schemaVersion: "atomic-card-grade.v1",
          contractId: "el5-raven",
          status: "bail",
          shelfFit: { status: "fail", reason: "Source support is absent." },
          findings: ["Cannot produce a source-backed card."],
        },
        null,
        2,
      )}\n`,
    );
    const bail = runCli(
      ["cards", "grade-candidate", "--contract", fixture.planPath, "--grade", gradePath, "--json"],
      fixture.cwd,
    );
    expect(bail.exitCode).toBe(0);
    expect(JSON.parse(bail.stdout)).toMatchObject({
      status: "bail",
      token: "GRADE_BAIL",
    });
  });

  test("consume-attempt enforces the revision budget across loop iterations", async () => {
    const fixture = await makeFixture({ confirm: true });

    const tokens: string[] = [];
    for (let turn = 0; turn < 4; turn++) {
      const result = runCli(
        ["cards", "consume-attempt", "--contract", fixture.planPath, "--max", "3", "--json"],
        fixture.cwd,
      );
      expect(result.stderr).toBe("");
      expect(result.exitCode).toBe(0);
      tokens.push((JSON.parse(result.stdout) as { token: string }).token);
    }

    // The graph re-invokes with a constant --max; the on-disk counter is what
    // turns that into a real three-turn budget instead of a 60-node-visit loop.
    expect(tokens).toEqual([
      "ATTEMPTS_REMAIN",
      "ATTEMPTS_REMAIN",
      "ATTEMPTS_EXHAUSTED",
      "ATTEMPTS_EXHAUSTED",
    ]);
  });

  test("execute-plan launches build-atomic-card child runs instead of publishing directly", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture);

    const { candidateDir, fabroLog, result } = executePlanWithFakeFabro(fixture, {
      fabroRunId: "01EL5CHILD",
    });

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{
        contractId: string;
        contractPath: string;
        run: { play: string; workflowTargetPath: string };
        sectionSummaryEventId: string | null;
        sectionSummaryPath: string | null;
      }>;
    };
    expect(output.results).toHaveLength(1);
    expect(output.results[0]).toMatchObject({
      contractId: "el5-raven",
      run: { play: "build-atomic-card" },
      sectionSummaryEventId: null,
      sectionSummaryPath: null,
    });
    expect(existsSync(output.results[0]!.contractPath)).toBeTrue();
    expect(existsSync(join(candidateDir, "contracts/el5-raven.section-summary.json"))).toBeFalse();

    const fabroRun = readRecordedFabroArgs(fabroLog).find((args) => args[0] === "run");
    expect(fabroRun).toBeDefined();
    expect(fabroRun).toContain("--label");
    expect(fabroRun).toContain("alexandria.playId=build-atomic-card");

    const renderedPrompt = readFileSync(
      join(dirname(output.results[0]!.run.workflowTargetPath), "prompts/draft_or_repair.md"),
      "utf8",
    );
    expect(renderedPrompt).not.toContain("__AX_INPUT_SECTION_SUMMARY__");
    expect(renderedPrompt).toContain("Optional section summary prior: ``");
    expect(renderedPrompt).toContain(
      "If that path is empty, no section summary input exists; use the source-only",
    );

    expect(readFileSync(fixture.stubPath, "utf8")).toBe(fixture.stubContent);
    expect(
      readEvents(fixture.cwd).some((event) => event.type === "atomic_card.created"),
    ).toBeFalse();
  });

  test("execute-plan materializes the matching section summary from the agenda play run", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    const selected = appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-selected",
      context: "library operations",
      playRunId: "foh-run-1",
      prefLabel: "Human Library Operations",
      scope: "In: director-facing Library Operations. Out: source file names.",
      summary:
        "Library Operations is the director-facing section for turning confirmed shelves into readable product knowledge.",
      unknowns: ["gap-library-operations"],
    });

    const { candidateDir, fabroLog, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{
        contractId: string;
        run: { play: string; workflowTargetPath: string };
        sectionSummaryEventId: string | null;
        sectionSummaryPath: string | null;
      }>;
    };
    expect(output.results).toHaveLength(1);
    const child = output.results[0]!;
    expect(child).toMatchObject({
      contractId: "el5-raven",
      run: { play: "build-atomic-card" },
      sectionSummaryEventId: selected.id,
    });
    expect(child.sectionSummaryPath).toBe(
      join(candidateDir, "contracts/el5-raven.section-summary.json"),
    );
    expect(existsSync(child.sectionSummaryPath!)).toBeTrue();
    const summary = JSON.parse(readFileSync(child.sectionSummaryPath!, "utf8")) as Record<
      string,
      unknown
    >;
    expect(summary).toMatchObject({
      schemaVersion: "atomic-card-section-summary.v1",
      eventId: selected.id,
      context: "library operations",
      plane: "Product",
      prefLabel: "Human Library Operations",
      summary:
        "Library Operations is the director-facing section for turning confirmed shelves into readable product knowledge.",
      scope: "In: director-facing Library Operations. Out: source file names.",
      cards: ["product/agents/Agent - Raven.md"],
      unknowns: ["gap-library-operations"],
      answerEventId: "answer-selected",
    });

    const renderedPrompt = readFileSync(
      join(dirname(child.run.workflowTargetPath), "prompts/draft_or_repair.md"),
      "utf8",
    );
    expect(renderedPrompt).not.toContain("__AX_INPUT_SECTION_SUMMARY__");
    expect(renderedPrompt).toContain(
      `Optional section summary prior: \`${child.sectionSummaryPath}\``,
    );
    expect(renderedPrompt).toContain("Treat it as a prior, not an override");

    const fabroRun = readRecordedFabroArgs(fabroLog).find((args) => args[0] === "run");
    expect(fabroRun).toBeDefined();
    expect(readFileSync(fixture.stubPath, "utf8")).toBe(fixture.stubContent);
    expect(
      readEvents(fixture.cwd).some((event) => event.type === "atomic_card.created"),
    ).toBeFalse();
  });

  test("execute-plan materializes the section summary when event context has edge whitespace", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    const selected = appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-trimmed",
      context: " Library Operations ",
      playRunId: "foh-run-1",
      prefLabel: "Trimmed Library Operations",
      summary: "Whitespace around the confirmed context must not drop this prior.",
    });

    const { candidateDir, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    const child = output.results[0]!;
    expect(child).toMatchObject({
      sectionSummaryEventId: selected.id,
      sectionSummaryPath: join(candidateDir, "contracts/el5-raven.section-summary.json"),
    });
    expect(JSON.parse(readFileSync(child.sectionSummaryPath!, "utf8"))).toMatchObject({
      eventId: selected.id,
      context: " Library Operations ",
      prefLabel: "Trimmed Library Operations",
      answerEventId: "answer-trimmed",
    });
  });

  test("execute-plan ignores later same-context summaries from other runs", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    const runOne = appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-r1",
      playRunId: "foh-run-1",
      prefLabel: "Run One Library Operations",
      summary: "Run one human-approved Library Operations summary.",
    });
    appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-r2",
      playRunId: "foh-run-2",
      prefLabel: "Run Two Library Operations",
      summary: "Run two summary must not leak into run one.",
    });

    const { candidateDir, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    const child = output.results[0]!;
    expect(child.sectionSummaryEventId).toBe(runOne.id);
    expect(child.sectionSummaryPath).toBe(
      join(candidateDir, "contracts/el5-raven.section-summary.json"),
    );
    const summary = JSON.parse(readFileSync(child.sectionSummaryPath!, "utf8")) as Record<
      string,
      unknown
    >;
    expect(summary).toMatchObject({
      eventId: runOne.id,
      prefLabel: "Run One Library Operations",
      summary: "Run one human-approved Library Operations summary.",
      answerEventId: "answer-r1",
    });
    expect(summary).not.toMatchObject({
      prefLabel: "Run Two Library Operations",
      summary: "Run two summary must not leak into run one.",
    });
  });

  test("execute-plan does not fall back to an other-run section summary", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-r2",
      playRunId: "foh-run-2",
      prefLabel: "Run Two Library Operations",
      summary: "Other-run summary must not become a prior.",
    });

    const { candidateDir, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    expect(output.results[0]).toMatchObject({
      sectionSummaryEventId: null,
      sectionSummaryPath: null,
    });
    expect(existsSync(join(candidateDir, "contracts/el5-raven.section-summary.json"))).toBeFalse();
  });

  test("execute-plan stays source-only when this run has no section summary", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-different-context",
      context: "Different Context",
      playRunId: "foh-run-1",
      prefLabel: "Different Context",
      summary: "Same run, different context should not match the Raven card contract.",
    });

    const { candidateDir, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    expect(output.results[0]).toMatchObject({
      sectionSummaryEventId: null,
      sectionSummaryPath: null,
    });
    expect(existsSync(join(candidateDir, "contracts/el5-raven.section-summary.json"))).toBeFalse();
  });

  test("execute-plan keeps latest-wins for superseded same-answer summaries", async () => {
    const fixture = await makeFixture({ confirm: true });
    writeFrontOfHouseAgenda(fixture, { playRunId: "foh-run-1" });
    appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-superseded",
      context: "Library Operations",
      playRunId: "foh-run-1",
      prefLabel: "Old Library Operations",
      summary: "Old run-one wording.",
    });
    const latest = appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-superseded",
      context: "library operations",
      playRunId: "foh-run-1",
      prefLabel: "Latest Library Operations",
      summary: "Latest run-one wording.",
    });

    const first = executePlanWithFakeFabro(fixture, {
      candidateDirName: "candidates-first",
      fabroRunId: "01EL5FIRST",
    }).result;
    const second = executePlanWithFakeFabro(fixture, {
      candidateDirName: "candidates-second",
      fabroRunId: "01EL5SECOND",
    }).result;

    expect(first.stderr).toBe("");
    expect(first.exitCode).toBe(0);
    expect(second.stderr).toBe("");
    expect(second.exitCode).toBe(0);
    const firstOutput = JSON.parse(first.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    const secondOutput = JSON.parse(second.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    expect(firstOutput.results[0]?.sectionSummaryEventId).toBe(latest.id);
    expect(secondOutput.results[0]?.sectionSummaryEventId).toBe(latest.id);
    expect(
      JSON.parse(readFileSync(firstOutput.results[0]!.sectionSummaryPath!, "utf8")),
    ).toMatchObject({
      eventId: latest.id,
      prefLabel: "Latest Library Operations",
      summary: "Latest run-one wording.",
      answerEventId: "answer-superseded",
    });
  });

  test("execute-plan does not use context-only fallback when agenda is missing", async () => {
    const fixture = await makeFixture({ confirm: true });
    appendSectionConfirmed(fixture.cwd, {
      answerEventId: "answer-other-run",
      playRunId: "foh-run-2",
      prefLabel: "Other Run Library Operations",
      summary: "This would match only under the old context-only selector.",
    });

    const { candidateDir, result } = executePlanWithFakeFabro(fixture);

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      results: Array<{ sectionSummaryEventId: string | null; sectionSummaryPath: string | null }>;
    };
    expect(output.results[0]).toMatchObject({
      sectionSummaryEventId: null,
      sectionSummaryPath: null,
    });
    expect(existsSync(join(candidateDir, "contracts/el5-raven.section-summary.json"))).toBeFalse();
  });

  test("publishes by appending to the confirmed stub and appends an agent-authored ledger event", async () => {
    const fixture = await makeFixture({ confirm: true });

    const result = runCli(
      [
        "cards",
        "publish",
        "--plan",
        fixture.planPath,
        "--contract",
        "el5-raven",
        "--candidate",
        fixture.candidatePath,
        "--actor",
        JSON.stringify({ kind: "agent", host: "claude-code", name: "Raven" }),
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );

    expect(result.stderr).toBe("");
    expect(result.exitCode).toBe(0);
    const published = JSON.parse(result.stdout) as {
      contentHash: string;
      eventStatus: string;
      path: string;
    };
    expect(published.eventStatus).toBe("appended");
    expect(published.path).toBe("product/agents/Agent - Raven.md");

    const content = readFileSync(fixture.stubPath, "utf8");
    expect(content.startsWith(fixture.stubContent.trimEnd())).toBeTrue();
    expect(content).toContain('<!-- AX_EL5_ATOMIC_CARD_BODY contractId="el5-raven" -->');
    expect(content).toContain("## WHAT");
    expect(content).not.toContain("proposed_by");
    expect(content).not.toContain("source_evidence");

    const event = readEvents(fixture.cwd).find(
      (candidate) => candidate.type === "atomic_card.created",
    );
    expect(event).toBeDefined();
    expect(event?.actor).toMatchObject({ kind: "agent", host: "claude-code", name: "Raven" });
    expect(event?.payload).toMatchObject({
      confirmationEventId: fixture.confirmationEventId,
      contractId: "el5-raven",
      lexiconPrefLabel: "Raven",
      path: "product/agents/Agent - Raven.md",
      prefLabel: "Raven",
      shelfPath: "product/agents",
    });

    const auditPath = join(fixture.bundlePath, "runtime/atomic-cards/coverage-audit.json");
    expect(existsSync(auditPath)).toBeTrue();
    expect(JSON.parse(readFileSync(auditPath, "utf8"))).toMatchObject({
      totals: { filled: 1, gapReports: 1 },
    });

    const postPublishAudit = runCli(
      [
        "cards",
        "coverage-audit",
        "--plan",
        fixture.planPath,
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );
    expect(postPublishAudit.stderr).toBe("");
    expect(postPublishAudit.exitCode).toBe(0);
    expect(JSON.parse(postPublishAudit.stdout)).toMatchObject({
      totals: { filled: 1, gapReports: 1 },
    });
  });

  test("rejects process-authored publish attempts", async () => {
    const fixture = await makeFixture({ confirm: true });
    const plan = JSON.parse(readFileSync(fixture.planPath, "utf8")) as {
      contracts: Array<{ actor?: unknown }>;
    };
    delete plan.contracts[0]?.actor;
    writeFileSync(fixture.planPath, `${JSON.stringify(plan, null, 2)}\n`);

    const result = runCli(
      [
        "cards",
        "publish",
        "--plan",
        fixture.planPath,
        "--contract",
        "el5-raven",
        "--candidate",
        fixture.candidatePath,
        "--actor",
        JSON.stringify({ kind: "process", host: "ax", process: "cli" }),
        "--lexicon",
        fixture.lexiconPath,
        "--json",
      ],
      fixture.cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("EL5 card publish requires actor.kind=agent");
    expect(
      readEvents(fixture.cwd).some((event) => event.type === "atomic_card.created"),
    ).toBeFalse();
  });
});
