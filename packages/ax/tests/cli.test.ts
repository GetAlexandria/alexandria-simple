import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const PACKAGE_JSON_PATH = join(import.meta.dir, "../package.json");
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function runCli(
  args: string[],
  cwd: string = import.meta.dir,
  env: NodeJS.ProcessEnv = process.env,
): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", CLI_PATH, ...args],
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

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-cli-"));
  tempDirs.add(dir);
  return dir;
}

function rawStateEvent(index: number, type: string, payload: Record<string, unknown>) {
  return {
    schemaVersion: 1,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    type,
    at: `2026-05-30T00:00:${String(index).padStart(2, "0")}.000Z`,
    actor: { kind: "process", host: "ax", process: "cli" },
    payload,
  };
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("ax CLI", () => {
  test("prints root help", () => {
    const result = runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe(
      [
        "Usage: ax <subcommand> [args]",
        "",
        "Setup",
        "  init      Initialize Alexandria in the current project",
        "",
        "Running",
        "  start     Start local services",
        "  codex     Launch Codex connected to local Alexandria services",
        "  run       Run Alexandria Product plays through Fabro",
        "  cards     Run deterministic atomic-card support commands",
        "  raven     Run deterministic Raven collaboration commands",
        "  inspect   Inspect events, state, triggers, and runtime state",
        "",
        "Admin",
        "  doctor    Check local orchestration readiness",
        "  version   Print the ax version and build metadata",
        "  upgrade   Download and install the latest Alexandria",
        "",
        "Run `ax <subcommand> --help` for command details.",
        "",
      ].join("\n"),
    );
    for (const removed of [
      "events",
      "host",
      "play",
      "setup",
      "state",
      "triggers",
      "viewer",
      "update",
      "internal",
    ]) {
      expect(result.stdout).not.toContain(`  ${removed}`);
    }
  });

  test("prints init help", () => {
    const result = runCli(["init", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "Usage: ax init [all|project|orchestration] [--workspace <path>] [--acp-provider <provider>] [--json]",
    );
  });

  test("prints inspect help", () => {
    const result = runCli(["inspect", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect <subcommand> [args]");
    expect(result.stdout).toContain("connections");
    expect(result.stdout).toContain("subscriptions");
  });

  test("prints inspect state help", () => {
    const result = runCli(["inspect", "state", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect state [--json]");
  });

  test("inspect state JSON projects Knowledge Bank manifest subjects", () => {
    const cwd = makeTempDir();
    const init = runCli(["init"], cwd);
    expect(init.exitCode).toBe(0);

    const result = runCli(["inspect", "state", "--json"], cwd);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const state = JSON.parse(result.stdout) as {
      raven: {
        knowledgeBank: {
          manifest: Array<{ id: string }>;
          subjects: Record<string, { label: string; status: string }>;
        };
        vision: { status: string };
      };
    };
    expect(state.raven.vision.status).toBe("not_started");
    expect(state.raven.knowledgeBank.manifest.map((subject) => subject.id)).toEqual([
      "vision",
      "vocabulary",
      "bets",
      "guardrails",
      "user-research",
    ]);
    expect(state.raven.knowledgeBank.subjects.vision).toMatchObject({
      label: "Vision",
      status: "available",
    });
    expect(state.raven.knowledgeBank.subjects.vocabulary).toMatchObject({
      label: "Vocabulary",
      status: "locked",
    });
  });

  test("inspect state JSON reports legacy Vision reconfirmation instead of silent in_progress", () => {
    const cwd = makeTempDir();
    const init = runCli(["init"], cwd);
    expect(init.exitCode).toBe(0);

    const events = [
      rawStateEvent(1, "raven.vision.started", {}),
      rawStateEvent(2, "raven.vision.slot.skipped", { slotId: "person" }),
      rawStateEvent(3, "raven.vision.slot.skipped", { slotId: "mechanism" }),
      rawStateEvent(4, "raven.vision.slot.skipped", { slotId: "the-work" }),
      rawStateEvent(5, "raven.vision.slot.skipped", { slotId: "refusal" }),
      rawStateEvent(6, "raven.vision.slot.skipped", { slotId: "named-pain" }),
      rawStateEvent(7, "raven.vision.slot.skipped", { slotId: "discovered-pain" }),
      rawStateEvent(8, "raven.vision.slot.updated", {
        slotId: "shift",
        text: "Legacy approved shift text.",
      }),
      rawStateEvent(9, "raven.vision.slot.approved", { slotId: "shift" }),
      rawStateEvent(10, "raven.vision.slot.skipped", { slotId: "inadequacy" }),
      rawStateEvent(11, "raven.vision.slot.skipped", { slotId: "shape" }),
      rawStateEvent(12, "raven.vision.slot.skipped", { slotId: "felt-experience" }),
      rawStateEvent(13, "raven.vision.slot.skipped", { slotId: "proof" }),
    ];
    writeFileSync(
      join(cwd, "docs/alexandria/ledger/events.jsonl"),
      `${events.map((event) => JSON.stringify(event)).join("\n")}\n`,
    );

    const result = runCli(["inspect", "state", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const state = JSON.parse(result.stdout) as {
      raven: {
        vision: {
          status: string;
          readyToBank: boolean;
          legacy?: {
            status: string;
            wasReadyToBank: boolean;
            needsReconfirmation: boolean;
            retiredSlotIds: string[];
          };
        };
      };
    };
    expect(state.raven.vision.status).toBe("needs_reconfirmation");
    expect(state.raven.vision.readyToBank).toBeFalse();
    expect(state.raven.vision.legacy).toMatchObject({
      status: "needs_reconfirmation",
      wasReadyToBank: true,
      needsReconfirmation: true,
      retiredSlotIds: expect.arrayContaining(["shift"]),
    });
  });

  test("prints inspect triggers help", () => {
    const result = runCli(["inspect", "triggers", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect triggers <subcommand> [args]");
  });

  test("prints inspect subscriptions help", () => {
    const result = runCli(["inspect", "subscriptions", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect subscriptions <subcommand> [args]");
  });

  test("prints inspect connections help", () => {
    const result = runCli(["inspect", "connections", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect connections <subcommand> [args]");
  });

  test("prints inspect connections list help", () => {
    const result = runCli(["inspect", "connections", "list", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect connections list [--json]");
  });

  test("prints inspect subscriptions register help", () => {
    const result = runCli(["inspect", "subscriptions", "register", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "Usage: ax inspect subscriptions register --subscription <id> --connection <id>",
    );
  });

  test("prints inspect triggers list help", () => {
    const result = runCli(["inspect", "triggers", "list", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect triggers list [--limit <n>] [--json]");
  });

  test("prints inspect events append help", () => {
    const result = runCli(["inspect", "events", "append", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax inspect events append --type <type>");
    for (const eventType of ["play.started", "play.completed", "play.failed"]) {
      expect(result.stdout).toContain(eventType);
    }
    expect(result.stdout).toContain("Exit codes:");
    expect(result.stdout).toContain("ax inspect events append --type play.started");
    expect(result.stdout).toContain("canvas.step.saved payload shape");
    expect(result.stdout).toContain(
      '--actor \'{"kind":"agent","host":"claude-code","name":"Claude Code"}\'',
    );
  });

  test("prints inspect events list help", () => {
    const result = runCli(["inspect", "events", "list", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "Usage: ax inspect events list [--type <type>] [--limit <n>] [--json]",
    );
    expect(result.stdout).toContain("ax inspect events list --json --limit 20");
  });

  test("prints inspect events schema help", () => {
    const result = runCli(["inspect", "events", "schema", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax inspect events schema [--json]");
    expect(result.stdout).toContain("--json");
    expect(result.stdout).toContain("Exit codes:");
  });

  test("prints raven vision slot help", () => {
    const result = runCli(["raven", "vision", "slot", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax raven vision slot <subcommand> [args]");
    expect(result.stdout).toContain("approve");
    expect(result.stdout).toContain("skip");
    expect(result.stdout).toContain("update");
  });

  test("prints raven answer help and validates required args", () => {
    const help = runCli(["raven", "answer", "--help"]);
    expect(help.exitCode).toBe(0);
    expect(help.stderr).toBe("");
    expect(help.stdout).toContain("Usage: ax raven answer --run <fabro-run-id>");
    expect(help.stdout).toContain("--select <key>");

    const missing = runCli(["raven", "answer", "--question", "q1", "--yes"]);
    expect(missing.exitCode).toBe(2);
    expect(missing.stderr).toContain("requires --run");
  });

  test("prints raven slot update help", () => {
    const result = runCli(["raven", "vision", "slot", "update", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax raven vision slot update --slot <slot-id>");
    expect(result.stdout).toContain("--notes-file <path>");
    expect(result.stdout).toContain("Valid slot ids:");
    expect(result.stdout).toContain("mechanism");
    expect(result.stdout).toContain("the-work");
    expect(result.stdout).toContain("needs_review");
  });

  test("prints raven slot approve and skip help", () => {
    const approve = runCli(["raven", "vision", "slot", "approve", "--help"]);
    expect(approve.exitCode).toBe(0);
    expect(approve.stderr).toBe("");
    expect(approve.stdout).toContain("Usage: ax raven vision slot approve --slot <slot-id>");
    expect(approve.stdout).toContain("--slot <slot-id>");
    expect(approve.stdout).toContain("--json");
    expect(approve.stdout).toContain("Valid slot ids:");
    expect(approve.stdout).toContain("ax raven vision slot approve --slot the-work --json");
    expect(approve.stdout).toContain("Exit codes:");

    const skip = runCli(["raven", "vision", "slot", "skip", "--help"]);
    expect(skip.exitCode).toBe(0);
    expect(skip.stderr).toBe("");
    expect(skip.stdout).toContain("Usage: ax raven vision slot skip --slot <slot-id>");
    expect(skip.stdout).toContain("--slot <slot-id>");
    expect(skip.stdout).toContain("--json");
    expect(skip.stdout).toContain("Valid slot ids:");
    expect(skip.stdout).toContain("ax raven vision slot skip --slot the-work --json");
    expect(skip.stdout).toContain("Exit codes:");
  });

  test("prints raven vision bank help", () => {
    const result = runCli(["raven", "vision", "bank", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax raven vision bank [--json]");
    expect(result.stdout).toContain("Source of Truth");
    expect(result.stdout).toContain("Exit codes:");
  });

  test("validates raven slot update input before runtime side effects", () => {
    const invalidSlot = runCli([
      "raven",
      "vision",
      "slot",
      "update",
      "--slot",
      "not-a-slot",
      "--text",
      "Nope.",
    ]);
    expect(invalidSlot.exitCode).toBe(2);
    expect(invalidSlot.stdout).toBe("");
    expect(invalidSlot.stderr).toContain("Valid slot ids");

    const invalidApprove = runCli([
      "raven",
      "vision",
      "slot",
      "approve",
      "--slot",
      "not-a-slot",
      "--json",
    ]);
    expect(invalidApprove.exitCode).toBe(2);
    expect(invalidApprove.stdout).toBe("");
    expect(invalidApprove.stderr).toContain("Valid slot ids");

    const invalidSkip = runCli([
      "raven",
      "vision",
      "slot",
      "skip",
      "--slot",
      "not-a-slot",
      "--json",
    ]);
    expect(invalidSkip.exitCode).toBe(2);
    expect(invalidSkip.stdout).toBe("");
    expect(invalidSkip.stderr).toContain("Valid slot ids");

    const missingApproveSlot = runCli(["raven", "vision", "slot", "approve", "--json"]);
    expect(missingApproveSlot.exitCode).toBe(2);
    expect(missingApproveSlot.stdout).toBe("");
    expect(missingApproveSlot.stderr).toContain("Missing required --slot.");

    const missingText = runCli(["raven", "vision", "slot", "update", "--slot", "person"]);
    expect(missingText.exitCode).toBe(2);
    expect(missingText.stderr).toContain("Exactly one of --text or --text-file is required.");

    const missingNotesValue = runCli([
      "raven",
      "vision",
      "slot",
      "update",
      "--slot",
      "person",
      "--text",
      "ok",
      "--notes",
    ]);
    expect(missingNotesValue.exitCode).toBe(2);
    expect(missingNotesValue.stdout).toBe("");
    expect(missingNotesValue.stderr).toContain("Missing value for --notes.");

    const knownOptionAfterText = runCli([
      "raven",
      "vision",
      "slot",
      "update",
      "--slot",
      "person",
      "--text",
      "--notes",
      "Notes",
    ]);
    expect(knownOptionAfterText.exitCode).toBe(2);
    expect(knownOptionAfterText.stdout).toBe("");
    expect(knownOptionAfterText.stderr).toContain("Missing value for --text.");

    const knownOptionAfterNotes = runCli([
      "raven",
      "vision",
      "slot",
      "update",
      "--slot",
      "person",
      "--text",
      "ok",
      "--notes",
      "--json",
    ]);
    expect(knownOptionAfterNotes.exitCode).toBe(2);
    expect(knownOptionAfterNotes.stdout).toBe("");
    expect(knownOptionAfterNotes.stderr).toContain("Missing value for --notes.");

    const conflictingText = runCli([
      "raven",
      "vision",
      "slot",
      "update",
      "--slot",
      "person",
      "--text",
      "Inline.",
      "--text-file",
      "draft.txt",
    ]);
    expect(conflictingText.exitCode).toBe(2);
    expect(conflictingText.stderr).toContain("Exactly one of --text or --text-file is required.");

    const invalidBank = runCli(["raven", "vision", "bank", "--unknown"]);
    expect(invalidBank.exitCode).toBe(2);
    expect(invalidBank.stdout).toBe("");
    expect(invalidBank.stderr).toContain("Unknown option for ax raven vision bank: --unknown");
  });

  test("prints start viewer help", () => {
    const result = runCli(["start", "viewer", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax start viewer [options]");
    expect(result.stdout).toContain("--library-root <path>");
  });

  test("prints codex help", () => {
    const result = runCli(["codex", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax codex [-- <codex-args>]");
  });

  test("prints orchestration command help", () => {
    expect(runCli(["start", "--help"]).stdout).toContain(
      "Usage: ax start [all|server|viewer] [options]",
    );
    const startServerHelp = runCli(["start", "server", "--help"]);
    expect(startServerHelp.exitCode).toBe(0);
    expect(startServerHelp.stderr).toBe("");
    expect(startServerHelp.stdout).toContain(
      "Usage: ax start server [--debug-web] [--library-root <path>] [--json]",
    );
    expect(startServerHelp.stdout).toContain("--debug-web");
    const startAllHelp = runCli(["start", "all", "--help"]);
    expect(startAllHelp.stdout).toContain("Usage: ax start all");
    expect(startAllHelp.stdout).toContain("--library-root <path>");
    expect(runCli(["doctor", "--help"]).stdout).toContain("Usage: ax doctor [--json]");
    expect(runCli(["init", "orchestration", "--help"]).stdout).toContain(
      "Usage: ax init [all|project|orchestration]",
    );
    expect(runCli(["run", "--help"]).stdout).toContain("Usage: ax run <play-id>");
    expect(runCli(["run", "source-assessment", "--help"]).stdout).toContain(
      "Usage: ax run <play-id>",
    );
    expect(runCli(["internal", "host", "claude", "monitor", "--help"]).stdout).toContain(
      "Usage: ax internal host claude monitor",
    );
    expect(runCli(["internal", "host", "codex", "monitor", "--help"]).stdout).toContain(
      "Usage: ax internal host codex monitor",
    );
    expect(runCli(["host", "claude", "monitor", "--help"]).exitCode).toBe(2);
  });

  test("rejects library roots outside the project with field-specific diagnostics", () => {
    const cwd = makeTempDir();
    const env = { ...process.env, ALEXANDRIA_HOME: join(cwd, ".ax-runtime") };
    const configPath = join(cwd, ".alexandria/alexandria-config.json");
    mkdirSync(join(cwd, ".alexandria"), { recursive: true });
    writeFileSync(
      configPath,
      `${JSON.stringify({ schemaVersion: 1, workspace: "docs/alexandria" }, null, 2)}\n`,
      "utf8",
    );

    const invalidFlag = runCli(["start", "server", "--library-root", "../outside"], cwd, env);
    expect(invalidFlag.exitCode).toBe(2);
    expect(invalidFlag.stdout).toBe("");
    expect(invalidFlag.stderr).toContain("--library-root");
    expect(invalidFlag.stderr).toContain("project root");

    const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    config.library = { root: "../outside" };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

    const invalidConfig = runCli(["start", "server", "--json"], cwd, env);
    expect(invalidConfig.exitCode).toBe(2);
    expect(invalidConfig.stdout).toBe("");
    expect(invalidConfig.stderr).toContain("library.root");
    expect(invalidConfig.stderr).toContain("project root");
  });

  test("rejects removed top-level commands", () => {
    for (const removed of [
      "events",
      "host",
      "play",
      "setup",
      "state",
      "triggers",
      "viewer",
      "update",
    ]) {
      const result = runCli([removed, "--help"]);
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(`Unknown subcommand: ${removed}`);
    }
  });

  test("rejects removed play intent route", () => {
    const result = runCli(["play", "intent", "--help"]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown subcommand: play");
  });

  test("treats run intent help as an unknown play id", () => {
    const result = runCli(["run", "intent", "--help"]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown play id: intent");
    expect(result.stderr).toContain("Usage: ax run <play-id>");
  });

  test("keeps internal hidden from root help but callable", () => {
    const root = runCli(["--help"]);
    expect(root.stdout).not.toContain("internal");

    const internal = runCli(["internal", "--help"]);
    expect(internal.exitCode).toBe(0);
    expect(internal.stdout).toContain("Usage: ax internal <subcommand>");
  });

  test("prints upgrade help", () => {
    const result = runCli(["upgrade", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: ax upgrade [options]");
    expect(result.stdout).toContain("Download and install the latest Alexandria");
  });

  test("prints version with build metadata", () => {
    const result = runCli(["version"], import.meta.dir, {
      ...process.env,
      AX_BUILD_VERSION: "1.0.0",
      AX_BUILD_GIT_SHA: "b99895e",
      AX_BUILD_DATE: "2026-05-13",
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toBe(
      ["Version:      1.0.0", "Git SHA:      b99895e", "Build Date:   2026-05-13", ""].join("\n"),
    );
  });

  test("prints package version in dev when build metadata is absent", () => {
    const env = { ...process.env };
    delete env.AX_BUILD_VERSION;
    delete env.AX_BUILD_GIT_SHA;
    delete env.AX_BUILD_DATE;
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
      version: string;
    };

    const result = runCli(["version"], import.meta.dir, env);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain(`Version:      ${packageJson.version}`);
  });

  test("compiled version command works without injected build metadata", () => {
    const outputDir = makeTempDir();
    const binaryPath = join(outputDir, "ax");
    const build = Bun.spawnSync({
      cmd: ["bun", "build", "--compile", "--outfile", binaryPath, CLI_PATH],
      cwd: join(import.meta.dir, "../../.."),
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(build.exitCode).toBe(0);

    const env = { ...process.env };
    delete env.AX_BUILD_VERSION;
    delete env.AX_BUILD_GIT_SHA;
    delete env.AX_BUILD_DATE;
    const result = Bun.spawnSync({
      cmd: [binaryPath, "version"],
      cwd: outputDir,
      env,
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toBe("");
    expect(result.stdout.toString()).toContain("Version:");
    expect(result.stdout.toString()).toContain("Git SHA:");
    expect(result.stdout.toString()).toContain("Build Date:");
  });

  test("rejects unknown subcommands", () => {
    const result = runCli(["unknown"]);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Unknown subcommand: unknown");
  });
});
