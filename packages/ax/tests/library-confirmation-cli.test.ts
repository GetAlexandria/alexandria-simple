import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeTempDir(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-el4-")));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
}

function initProject(cwd: string): void {
  writeFile(
    join(cwd, ".alexandria/alexandria-config.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        sourcesPath: "sources",
        workspace: "docs/alexandria",
      },
      null,
      2,
    ),
  );
  writeFile(join(cwd, "docs/alexandria/ledger/events.jsonl"), "");
}

function writeBundle(bundle: string): void {
  writeFile(
    join(bundle, "STAGE-2-BRIEF.md"),
    ["# Stage-2 Brief", "", "## Q1 Confirm Raven (`product/agents/Agent - Raven.md`)"].join("\n"),
  );
  writeFile(join(bundle, "HOT-SPOTS.md"), "# Hot Spots\n");
  writeFile(
    join(bundle, "thread-events"),
    `${JSON.stringify(
      {
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "gap-confirm-raven",
            family: "gap",
            kind: "missing_card",
            concerns: [{ type: "card", cardId: "Agent - Raven" }],
            confidence: "high",
            severity: "medium",
            status: "open",
            question: "Confirm Raven?",
            sourceEvidence: ["product/agents/Agent - Raven.md"],
            reason: "Confirm Raven.",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  writeFile(
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
Body text must not be part of EL4 approval.
`,
  );
}

function runCli(args: string[], cwd: string): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", CLI_PATH, ...args],
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

function prepareBundle(cwd: string): string {
  const bundle = join(cwd, "draft-bundle");
  writeBundle(bundle);
  expect(
    runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run",
        "--json",
      ],
      cwd,
    ).exitCode,
  ).toBe(0);
  const finalized = runCli(
    ["internal", "front-of-house", "finalize", "--bundle", bundle, "--json"],
    cwd,
  );
  expect(finalized.exitCode).toBe(0);
  expect(JSON.parse(finalized.stdout)).toMatchObject({
    libraryVersion: 1,
    product: "alexandria",
    status: "finalized",
  });
  return bundle;
}

function readEvents(cwd: string): Array<{
  actor: { kind: string };
  id: string;
  payload: Record<string, unknown>;
  type: string;
}> {
  const content = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as ReturnType<typeof readEvents>[number]);
}

function eventsOfType(cwd: string, type: string): ReturnType<typeof readEvents> {
  return readEvents(cwd).filter((event) => event.type === type);
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("library confirmation CLI", () => {
  test("confirms a bundle idempotently and derives approval from the ledger", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const initialStatus = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(initialStatus.exitCode).toBe(0);
    expect(JSON.parse(initialStatus.stdout)).toMatchObject({
      approved: false,
      libraryVersion: 1,
      product: "alexandria",
      status: "not_approved",
    });

    const confirmed = runCli(
      ["internal", "library-confirm", "confirm", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(confirmed.exitCode).toBe(0);
    expect(JSON.parse(confirmed.stdout)).toMatchObject({
      approved: true,
      eventStatus: "appended",
      libraryVersion: 1,
      product: "alexandria",
      status: "confirmed",
    });

    const confirmedAgain = runCli(
      ["internal", "library-confirm", "confirm", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(confirmedAgain.exitCode).toBe(0);
    expect(JSON.parse(confirmedAgain.stdout)).toMatchObject({
      eventStatus: "already_appended",
      status: "confirmed",
    });

    const events = readEvents(cwd).filter((event) => event.type === "library.confirmed");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actor: { kind: "user" },
      payload: {
        bundlePath: bundle,
        libraryVersion: 1,
        product: "alexandria",
      },
    });

    const freshStatus = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(freshStatus.stdout)).toMatchObject({
      approved: true,
      confirmationEventId: events[0]?.id,
      dirty: false,
      libraryVersion: 1,
      status: "approved",
    });

    const lifecycleOnly = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.front_of_house.answer_recorded",
        "--actor",
        '{"kind":"user","name":"Director"}',
        "--payload",
        JSON.stringify({
          playRunId: "foh-run",
          fabroRunId: "fab-foh",
          questionId: "question-ledger-only",
          agendaItemId: "gap-confirm-raven",
          agendaItemKind: "stage2_question",
          answerText: "Confirmed without rewriting thread-events.",
        }),
        "--json",
      ],
      cwd,
    );
    expect(lifecycleOnly.exitCode).toBe(0);
    const afterLifecycleOnly = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(afterLifecycleOnly.stdout)).toMatchObject({
      approved: true,
      dirty: false,
      libraryVersion: 1,
      status: "approved",
    });

    writeFile(join(bundle, "runtime/front-of-house/agenda.json"), '{"operational":true}\n');
    writeFile(join(bundle, "HOT-SPOTS.md"), "# Hot Spots\n\nOperational report churn.\n");
    const afterOperationalChurn = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(afterOperationalChurn.stdout)).toMatchObject({
      approved: true,
      dirty: false,
      libraryVersion: 1,
      status: "approved",
    });

    writeFile(
      join(bundle, "thread-events"),
      `${JSON.stringify(
        {
          schemaVersion: "library-threads.v1",
          threads: [
            {
              id: "gap-confirm-raven",
              family: "gap",
              kind: "missing_card",
              concerns: [
                {
                  type: "card",
                  cardId: "Agent - Raven",
                  context: "Product Operations",
                  plane: "Product",
                },
              ],
              confidence: "high",
              severity: "medium",
              status: "open",
              question: "Confirm Raven?",
              sourceEvidence: ["product/agents/Agent - Raven.md"],
              reason: "Confirm Raven in the product operations context.",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
    const afterThreadChurn = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(afterThreadChurn.stdout)).toMatchObject({
      approved: false,
      dirty: true,
      libraryVersion: 1,
      readyToConfirm: false,
      status: "not_ready",
    });
  });

  test("rejects with an edit list and appends no confirmation event", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const rejected = runCli(
      [
        "internal",
        "library-confirm",
        "reject",
        "--bundle",
        bundle,
        "--edit-list",
        JSON.stringify([
          {
            kind: "context_boundary",
            target: "Product",
            requestedChange: "Split Raven runtime from product roles.",
          },
        ]),
        "--json",
      ],
      cwd,
    );
    expect(rejected.exitCode).toBe(0);
    expect(JSON.parse(rejected.stdout)).toMatchObject({
      approved: false,
      routeToPlayId: "front-of-house-walk",
      status: "rejected",
    });

    const events = readEvents(cwd);
    expect(events.filter((event) => event.type === "library.confirmed")).toHaveLength(0);
    expect(events.filter((event) => event.type === "library.confirmation_rejected")).toHaveLength(
      1,
    );

    const status = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(status.stdout)).toMatchObject({
      approved: false,
      rejection: {
        routeToPlayId: "front-of-house-walk",
      },
      status: "not_approved",
    });
  });

  test("returns exit 2 with stderr diagnostics for missing required bundle input", () => {
    const cwd = makeTempDir();

    const result = runCli(["internal", "library-confirm", "status", "--json"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Missing required option: --bundle.");
    expect(result.stderr).toContain("Usage: ax internal library-confirm status --bundle <path>");
  });

  test("returns exit 2 when confirm is attempted with a non-user actor", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const result = runCli(
      [
        "internal",
        "library-confirm",
        "confirm",
        "--bundle",
        bundle,
        "--actor",
        '{"kind":"process","host":"ax","process":"cli"}',
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Library confirmation requires actor.kind=user.");
    expect(readEvents(cwd).filter((event) => event.type === "library.confirmed")).toHaveLength(0);
  });

  test("returns exit 2 for body-level rejection edit-list content", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const result = runCli(
      [
        "internal",
        "library-confirm",
        "reject",
        "--bundle",
        bundle,
        "--edit-list",
        JSON.stringify([
          {
            kind: "relationship_topology",
            target: "product/agents/Agent - Raven.md",
            requestedChange: "Rewrite the card body prose for this noun.",
          },
        ]),
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("editList[0]");
    expect(result.stderr).toContain("structure granularity");
    expect(readEvents(cwd).filter((event) => event.type === "library.confirmed")).toHaveLength(0);
    expect(eventsOfType(cwd, "library.confirmation_rejected")).toHaveLength(0);
  });

  test("returns exit 2 when the requested version does not match the bundle manifest", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const result = runCli(
      [
        "internal",
        "library-confirm",
        "status",
        "--bundle",
        bundle,
        "--library-version",
        "2",
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Library version 2 does not match bundle manifest version 1.");
  });

  test("reuses an existing matching user approval instead of appending a duplicate", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const manuallyAppended = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.confirmed",
        "--actor",
        '{"kind":"user","name":"Director"}',
        "--payload",
        JSON.stringify({
          product: "alexandria",
          bundlePath: bundle,
          libraryVersion: 1,
        }),
        "--json",
      ],
      cwd,
    );
    expect(manuallyAppended.exitCode).toBe(0);
    const manualEventId = (JSON.parse(manuallyAppended.stdout) as { event: { id: string } }).event
      .id;

    const confirmed = runCli(
      ["internal", "library-confirm", "confirm", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(confirmed.exitCode).toBe(0);
    expect(JSON.parse(confirmed.stdout)).toMatchObject({
      event: { id: manualEventId },
      eventStatus: "already_appended",
      status: "confirmed",
    });

    expect(readEvents(cwd).filter((event) => event.type === "library.confirmed")).toHaveLength(1);
  });

  test("ignores non-user confirmation events and stale versions", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = prepareBundle(cwd);

    const processConfirm = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.confirmed",
        "--actor",
        '{"kind":"process","host":"ax","process":"cli"}',
        "--payload",
        JSON.stringify({
          product: "alexandria",
          bundlePath: bundle,
          libraryVersion: 1,
        }),
        "--json",
      ],
      cwd,
    );
    expect(processConfirm.exitCode).toBe(0);

    const afterProcessConfirm = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(afterProcessConfirm.stdout)).toMatchObject({
      approved: false,
      status: "not_approved",
    });

    const confirmed = runCli(
      ["internal", "library-confirm", "confirm", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(confirmed.exitCode).toBe(0);

    writeFile(
      join(bundle, "product/agents/Agent - Raven.md"),
      readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8").replace(
        "context: Product",
        "context: Product Ops",
      ),
    );
    const finalizedAgain = runCli(
      ["internal", "front-of-house", "finalize", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(finalizedAgain.exitCode).toBe(0);
    expect(JSON.parse(finalizedAgain.stdout)).toMatchObject({ libraryVersion: 2 });

    const staleStatus = runCli(
      ["internal", "library-confirm", "status", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(JSON.parse(staleStatus.stdout)).toMatchObject({
      approved: false,
      libraryVersion: 2,
      status: "not_approved",
    });
  });
});
