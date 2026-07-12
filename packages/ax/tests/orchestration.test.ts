import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { writeFileSync } from "fs";
import {
  ensureFabroHome,
  parseFabroRunResult,
  renderFabroSettings,
  resolveAlexandriaRuntimePaths,
  resolveWorkflowTemplatePath,
  renderWorkflowTemplate,
  workflowTemplatePathCandidates,
} from "../src/domain/orchestration.js";

const tempDirs = new Set<string>();

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("renderWorkflowTemplate", () => {
  test("front-of-house workflow routes patch success through degraded triage", () => {
    const repoRoot = resolve(import.meta.dir, "../../..");
    const workflow = readFileSync(
      join(repoRoot, "packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro"),
      "utf8",
    );

    expect(workflow).toContain("prepare_agenda_triage");
    expect(workflow).toContain("plan_agenda_triage");
    expect(workflow).toContain("apply_agenda_triage");
    expect(workflow).toContain('prepare_agenda_triage -> plan_agenda_triage [label="TRIAGE_READY"');
    // Degraded triage = absent/invalid ACP output skips forward via
    // apply-triage validation; a failed ACP node itself must fail loudly
    // (the studio edge guard forbids advance-on-failure ACP edges).
    expect(workflow).toContain('plan_agenda_triage -> acp_failed [label="ACP failed"');
    expect(workflow).toContain('apply_agenda_triage -> stage_next [label="TRIAGE_SKIPPED"');
  });

  test("substitutes input values containing dollar sequences literally", () => {
    const cwd = makeTempDir("ax-orchestration-");
    const workspacePath = join(cwd, "docs", "alexandria");
    writeFile(
      join(cwd, ".claude", "plugins", "alexandria", "workflows", "test-play", "workflow.fabro"),
      "note: '__AX_INPUT_NOTE__'\nroot: '__AX_PROJECT_ROOT__'\n",
    );

    const result = renderWorkflowTemplate({
      acpCommand: null,
      cwd,
      env: { HOME: cwd },
      inputs: { note: "costs $$100 and $& and $` and $1" },
      playId: "test-play",
      workspacePath,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const rendered = readFileSync(result.workflowPath, "utf8");
    expect(rendered).toContain("note: 'costs $$100 and $& and $` and $1'");
    expect(rendered).toContain(`root: '${cwd}'`);
  });

  test("keeps apostrophes in prompt inputs and shell-escapes them in the workflow", () => {
    const cwd = makeTempDir("ax-orchestration-");
    const workspacePath = join(cwd, "docs", "alexandria");
    const templateDir = join(cwd, ".claude", "plugins", "alexandria", "workflows", "test-play");
    // workflow.fabro: input lands inside an authored single-quoted shell string.
    writeFile(join(templateDir, "workflow.fabro"), "note: '__AX_INPUT_NOTE__'\n");
    // prompt: input lands in prose passed verbatim to the agent.
    writeFile(join(templateDir, "prompts", "move.md"), 'material: "__AX_INPUT_NOTE__"\n');

    const result = renderWorkflowTemplate({
      acpCommand: null,
      cwd,
      env: { HOME: cwd },
      inputs: { note: "it's the customer's problem" },
      playId: "test-play",
      workspacePath,
    });

    // Previously the run was rejected outright for containing an apostrophe.
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const workflow = readFileSync(result.workflowPath, "utf8");
    expect(workflow).toContain(`note: 'it'\\''s the customer'\\''s problem'`);

    const prompt = readFileSync(join(dirname(result.workflowPath), "prompts", "move.md"), "utf8");
    expect(prompt).toContain(`material: "it's the customer's problem"`);
  });

  test("renders front-of-house draftLog as an optional workflow input", () => {
    const cwd = makeTempDir("ax-orchestration-");
    const workspacePath = join(cwd, "docs", "alexandria");
    writeFile(
      join(
        cwd,
        ".claude",
        "plugins",
        "alexandria",
        "workflows",
        "front-of-house-walk",
        "workflow.fabro",
      ),
      ["bundle: '__AX_INPUT_BUNDLE__'", "draft: '--draft-log=__AX_INPUT_DRAFTLOG__'", ""].join(
        "\n",
      ),
    );

    const omitted = renderWorkflowTemplate({
      acpCommand: null,
      cwd,
      env: { HOME: cwd },
      inputs: { bundle: "/tmp/bundle" },
      playId: "front-of-house-walk",
      workspacePath,
    });
    expect(omitted.ok).toBe(true);
    if (!omitted.ok) {
      return;
    }
    expect(readFileSync(omitted.workflowPath, "utf8")).toContain("draft: '--draft-log='");

    const supplied = renderWorkflowTemplate({
      acpCommand: null,
      cwd,
      env: { HOME: cwd },
      inputs: { bundle: "/tmp/bundle", draftLog: "/tmp/drafts/patches.json" },
      playId: "front-of-house-walk",
      workspacePath,
    });
    expect(supplied.ok).toBe(true);
    if (!supplied.ok) {
      return;
    }
    expect(readFileSync(supplied.workflowPath, "utf8")).toContain(
      "draft: '--draft-log=/tmp/drafts/patches.json'",
    );

    const missingBundle = renderWorkflowTemplate({
      acpCommand: null,
      cwd,
      env: { HOME: cwd },
      inputs: {},
      playId: "front-of-house-walk",
      workspacePath,
    });
    expect(missingBundle.ok).toBe(false);
    if (missingBundle.ok) {
      return;
    }
    expect(missingBundle.error.message).toContain("Missing workflow inputs");
    expect(missingBundle.error.message).toContain("bundle");
    expect(missingBundle.error.message).not.toContain("draftlog");
  });
});

describe("workflowTemplatePathCandidates", () => {
  test("prepends the workspace runtime workflow candidate when workspacePath is provided", () => {
    const home = makeTempDir("ax-home-");
    const cwd = makeTempDir("ax-project-");
    const workspacePath = join(cwd, "custom-workspace");
    const runtimeCandidate = join(
      workspacePath,
      ".ax-runtime",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );
    const projectPluginCandidate = join(
      cwd,
      ".claude",
      "plugins",
      "alexandria",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );

    const candidates = workflowTemplatePathCandidates("make-a-play", { HOME: home }, cwd, {
      workspacePath,
    });

    expect(candidates[0]).toBe(runtimeCandidate);
    expect(candidates).toContain(projectPluginCandidate);
    expect(candidates.indexOf(projectPluginCandidate)).toBeGreaterThan(0);
  });

  test("keeps candidate order unchanged when workspacePath is not provided", () => {
    const home = makeTempDir("ax-home-");
    const cwd = makeTempDir("ax-project-");
    const runtimeCandidate = join(
      cwd,
      "docs",
      "alexandria",
      ".ax-runtime",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );
    const projectPluginCandidate = join(
      cwd,
      ".claude",
      "plugins",
      "alexandria",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );

    const candidates = workflowTemplatePathCandidates("make-a-play", { HOME: home }, cwd);

    expect(candidates[0]).toBe(projectPluginCandidate);
    expect(candidates).not.toContain(runtimeCandidate);
  });

  test("resolves the workspace runtime workflow ahead of the project plugin", () => {
    const home = makeTempDir("ax-home-");
    const cwd = makeTempDir("ax-project-");
    const workspacePath = join(cwd, "docs", "alexandria");
    const runtimePath = join(
      workspacePath,
      ".ax-runtime",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );
    const projectPluginPath = join(
      cwd,
      ".claude",
      "plugins",
      "alexandria",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );
    writeFile(runtimePath, "runtime workflow\n");
    writeFile(projectPluginPath, "plugin workflow\n");

    expect(resolveWorkflowTemplatePath("make-a-play", { HOME: home }, cwd, { workspacePath })).toBe(
      runtimePath,
    );
    expect(resolveWorkflowTemplatePath("make-a-play", { HOME: home }, cwd)).toBe(projectPluginPath);
  });

  test("falls back to the project plugin when the workspace runtime workflow is absent", () => {
    const home = makeTempDir("ax-home-");
    const cwd = makeTempDir("ax-project-");
    const workspacePath = join(cwd, "docs", "alexandria");
    const projectPluginPath = join(
      cwd,
      ".claude",
      "plugins",
      "alexandria",
      "workflows",
      "make-a-play",
      "workflow.fabro",
    );
    writeFile(projectPluginPath, "plugin workflow\n");

    expect(resolveWorkflowTemplatePath("make-a-play", { HOME: home }, cwd, { workspacePath })).toBe(
      projectPluginPath,
    );
  });

  test("orders plugin cache versions by semver with numeric prereleases", () => {
    const home = makeTempDir("ax-home-");
    const cwd = makeTempDir("ax-project-");
    const cacheRoot = join(home, ".claude", "plugins", "cache", "alexandria", "alexandria");
    for (const version of ["1.2.0-rc.9", "1.2.0-rc.10", "1.1.9", "1.2.0", "1.2.0-rc.2"]) {
      mkdirSync(join(cacheRoot, version), { recursive: true });
    }

    const candidates = workflowTemplatePathCandidates("test-play", { HOME: home }, cwd);
    const cacheCandidates = candidates
      .filter((candidate) => candidate.startsWith(cacheRoot))
      .map((candidate) => candidate.slice(cacheRoot.length + 1).split("/")[0]);
    const orderedVersions = [...new Set(cacheCandidates)];

    expect(orderedVersions).toEqual(["1.2.0", "1.2.0-rc.10", "1.2.0-rc.9", "1.2.0-rc.2", "1.1.9"]);
  });
});

describe("Fabro settings", () => {
  test("does not forward Anthropic API keys outside Railway", () => {
    const settings = renderFabroSettings({
      ANTHROPIC_API_KEY: "sk-local-test",
    });

    expect(settings).not.toContain("ANTHROPIC_API_KEY");
    expect(settings).not.toContain("sk-local-test");
  });

  test("forwards Anthropic API key secret placeholder for Railway Claude ACP", () => {
    const settings = renderFabroSettings({
      ANTHROPIC_API_KEY: "sk-railway-test",
      RAILWAY_PROJECT_ID: "project-id",
    });

    expect(settings).toContain("[run.environment.env]");
    expect(settings).toContain('ANTHROPIC_API_KEY = "{{ secrets.ANTHROPIC_API_KEY }}"');
    expect(settings).not.toContain("sk-railway-test");
  });

  test("updates existing Fabro settings with Railway Anthropic API key secret placeholder", () => {
    const home = makeTempDir("ax-home-");
    const paths = resolveAlexandriaRuntimePaths({ ALEXANDRIA_HOME: home });

    ensureFabroHome(paths, {
      HOME: home,
    });
    let settings = readFileSync(paths.fabroSettingsPath, "utf8");
    expect(settings).not.toContain("ANTHROPIC_API_KEY");

    ensureFabroHome(paths, {
      ANTHROPIC_API_KEY: "sk-railway-test",
      HOME: home,
      RAILWAY_SERVICE_ID: "service-id",
    });

    settings = readFileSync(paths.fabroSettingsPath, "utf8");
    expect(settings).toContain('ANTHROPIC_API_KEY = "{{ secrets.ANTHROPIC_API_KEY }}"');
    expect(settings).not.toContain("sk-railway-test");
  });

  test("replaces legacy Railway Anthropic env placeholder with secret placeholder", () => {
    const home = makeTempDir("ax-home-");
    const paths = resolveAlexandriaRuntimePaths({ ALEXANDRIA_HOME: home });
    ensureFabroHome(paths, {
      ANTHROPIC_API_KEY: "sk-railway-test",
      HOME: home,
      RAILWAY_SERVICE_ID: "service-id",
    });
    writeFileSync(
      paths.fabroSettingsPath,
      readFileSync(paths.fabroSettingsPath, "utf8").replace(
        "{{ secrets.ANTHROPIC_API_KEY }}",
        "{{ env.ANTHROPIC_API_KEY }}",
      ),
    );

    ensureFabroHome(paths, {
      ANTHROPIC_API_KEY: "sk-railway-test",
      HOME: home,
      RAILWAY_SERVICE_ID: "service-id",
    });

    const settings = readFileSync(paths.fabroSettingsPath, "utf8");
    expect(settings).toContain('ANTHROPIC_API_KEY = "{{ secrets.ANTHROPIC_API_KEY }}"');
    expect(settings).not.toContain("{{ env.ANTHROPIC_API_KEY }}");
    expect(settings).not.toContain("sk-railway-test");
  });
});

describe("parseFabroRunResult", () => {
  test("recovers the run id from a detached pretty-printed JSON object", () => {
    // `fabro run --detach --json` prints a single pretty object spanning
    // multiple lines, not the compact per-line event stream. The parser must
    // still return a usable run handle instead of null.
    const result = parseFabroRunResult({
      stdout: '{\n  "run_id": "01KVEKAMYYC540R43C50FZRNFS"\n}\n',
      stderr: "",
      exitCode: 0,
    });

    expect(result.runId).toBe("01KVEKAMYYC540R43C50FZRNFS");
    expect(result.status).toBe("unknown"); // detached: no run.completed line
  });

  test("reads the run id and terminal status from an attached event stream", () => {
    const result = parseFabroRunResult({
      stdout: [
        '{"event":"run.created","run_id":"01TEST"}',
        '{"event":"run.completed","run_id":"01TEST","properties":{"status":"succeeded"}}',
        "",
      ].join("\n"),
      stderr: "",
      exitCode: 0,
    });

    expect(result.runId).toBe("01TEST");
    expect(result.status).toBe("succeeded");
  });

  test("marks the run failed on a non-zero exit", () => {
    const result = parseFabroRunResult({
      stdout: '{\n  "run_id": "01TEST"\n}\n',
      stderr: "boom",
      exitCode: 1,
    });

    expect(result.runId).toBe("01TEST");
    expect(result.status).toBe("failed");
  });
});
