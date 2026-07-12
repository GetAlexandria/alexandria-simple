import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const readRepoFile = (path: string): string => readFileSync(resolve(repoRoot, path), "utf8");

const workflowFile = ".fabro/workflows/ax-feature/workflow.fabro";
const workflowConfigFile = ".fabro/workflows/ax-feature/workflow.toml";

const verifierPromptContractPhrases = [
  "Do not assume the technical plan's verification section is sufficient.",
  "write an independent verification plan",
  "verification-artifacts/verification-plan.md",
  "verification-artifacts/report.md",
  "for every package or surface changed by the implementation",
  "Create a throwaway sample project under `/tmp/fabro-verify-*`",
  "Install or invoke `ax`",
  "Capture CLI output transcripts",
  "Capture JSON output snapshots",
  "Capture screenshots",
  "Do not edit implementation source",
  "checked-in tests",
  "outside `verification-artifacts/`",
  "do not patch it in this stage",
  "boundary",
  "violation",
] as const;

const judgePromptContractPhrases = [
  "Assess both verification plans",
  "Was the technical plan's verification section sufficient",
  "Was the verifier's independent verification plan sufficient",
  "Reject weak verification.",
  "Do not approve only because tests passed.",
  "Route based on the smallest next step",
  "Route to `Re-verify`",
  "Route to `Fix implementation`",
  "failed to create an",
  "independent verification plan",
  "Assess stage boundaries",
  "verification-stage tracked file change",
  "validation and review rerun",
  "test-only",
  "tracked-file boundary",
  "violation",
  '"verification_ready":true',
  '"verification_ready":false',
  '"verification_route":"verify"',
  '"verification_route":"implement"',
] as const;

describe("Fabro verification workflow contract", () => {
  test(`${workflowFile} routes review through verification`, () => {
    const workflow = readRepoFile(workflowFile);

    expect(workflow).toContain("validate_impacted [");
    expect(workflow).toContain('label="Validate changed packages"');
    expect(workflow).toContain('script="./scripts/fabro-validate-impacted-if-changed"');
    expect(workflow).toContain("verify [");
    expect(workflow).toContain('prompt="@prompts/verify.md"');
    expect(workflow).toContain("verification_judge [");
    expect(workflow).toContain('prompt="@prompts/verification-judge.md"');
    expect(workflow).not.toContain("review_followup");
    expect(workflow).toContain("implement -> validate_impacted");
    expect(workflow).not.toContain("Retry transient validation");
    expect(workflow).not.toContain("loop_restart=true");
    expect(workflow).toContain(
      'validate_impacted -> implement [label="Fix validation", condition="outcome=failed"]',
    );
    expect(workflow).toContain(
      'validate_impacted -> review    [label="Validation OK", condition="outcome=succeeded"]',
    );
    expect(workflow).toContain('review -> implement [label="Fix", condition="review_ready=false"]');
    expect(workflow).toContain(
      'review -> verify    [label="Ready", condition="review_ready=true"]',
    );
    expect(workflow).toContain("verify -> verification_judge");
    expect(workflow).toContain(
      'verification_judge -> verify    [label="Re-verify", condition="verification_route=verify"]',
    );
    expect(workflow).toContain(
      'verification_judge -> implement [label="Fix implementation", condition="verification_route=implement"]',
    );
    expect(workflow).toContain(
      'verification_judge -> handoff   [label="Verified", condition="verification_ready=true"]',
    );
  });

  test("implement prompt follows approved package scope", () => {
    const prompt = readRepoFile(".fabro/workflows/ax-feature/prompts/implement.md");

    expect(prompt).toContain("Implement the Alexandria feature plan.");
    expect(prompt).toContain("Stay scoped to the plan, its named package/surface boundaries");
    expect(prompt).toContain("Do not broaden the plan during implementation.");
    expect(prompt).toContain("When changing `packages/ax`");
    expect(prompt).toContain("When changing `packages/alexandria-plugin`");
    expect(prompt).toContain("When changing `packages/viewer`");
    expect(prompt).toContain("Do not freehand-edit `docs/alexandria/library`");
    expect(prompt).toContain("approved plan explicitly owns a");
    expect(prompt).toContain("library migration or generated card update");
    expect(prompt).toContain("This stage no longer routes");
    expect(prompt).toContain("do not turn the stage into plan-only work");
    expect(prompt).toContain("Run the deterministic validation and eval checks named in the plan");
    expect(prompt).not.toContain("Stay scoped to the approved plan");
    expect(prompt).not.toContain("Stay scoped to `packages/ax`, `packages/alexandria-plugin`");
    expect(prompt).not.toContain("Do not mutate `packages/alexandria-plugin`.");
    expect(prompt).not.toContain("stop for human approval");
  });

  test("review prompt keeps review read-only and routes fixes back to implementation", () => {
    const prompt = readRepoFile(".fabro/workflows/ax-feature/prompts/review.md");

    expect(prompt).toContain("No files under `docs/alexandria/library` were freehand-edited");
    expect(prompt).toContain("approved library migration or generated card update");
    expect(prompt).toContain("Do not make implementation, prompt, config, or test edits");
    expect(prompt).toContain("route back to implementation");
    expect(prompt).not.toContain("You may make small fixes");
  });

  test("impacted validator covers the canonical package surfaces", () => {
    const script = readRepoFile("scripts/fabro-validate-impacted-if-changed");

    expect(script).toContain('has_changes_under "packages/ax/"');
    expect(script).toContain('has_changes_under "packages/viewer/"');
    expect(script).toContain('has_changes_under "packages/alexandria-plugin/"');
    expect(script).toContain('has_changes_under "packages/factory/"');
    expect(script).toContain("pnpm --filter @alexandria/viewer run test:e2e");
    expect(script).toContain("./scripts/fabro-validate-plugin-if-changed");
    expect(script).toContain("pnpm run lint:markdown");
  });

  test("API workflow uses a literal API backend", () => {
    const workflow = readRepoFile(".fabro/workflows/ax-feature/workflow.fabro");

    expect(workflow).toContain('backend="api"');
    expect(workflow).not.toContain("{{ inputs.agent_backend }}");
  });

  test("API workflow does not inherit the local default Docker environment", () => {
    const config = readRepoFile(".fabro/workflows/ax-feature/workflow.toml");

    expect(config).toContain('id = "daytona"');
    expect(config).toContain("[environments.daytona]");
    expect(config).toContain('provider = "daytona"');
    expect(config).not.toContain("[environments.default]");
  });

  test(`${workflowConfigFile} collects verification artifacts without checkpointing them`, () => {
    const config = readRepoFile(workflowConfigFile);

    expect(config).toContain("[run.checkpoint]");
    expect(config).toContain("[run.artifacts]");
    expect(config).toContain('"verification-artifacts/**"');
    expect(config).toContain('"screenshots/**"');
    expect(config).toContain('"test-results/**"');
    expect(config).toContain('"playwright-report/**"');
    expect(config).toContain('"*.trace.zip"');
  });

  test("local server stays paused until a replacement auth design lands", () => {
    const script = readRepoFile("scripts/fabro-local-server");
    const marker = readRepoFile(".fabro/LOCAL_FACTORY_PAUSED.md");

    expect(script).toContain('PAUSE_MARKER="$REPO_ROOT/.fabro/LOCAL_FACTORY_PAUSED.md"');
    expect(script).toContain("The local Fabro factory is intentionally paused");
    expect(marker).toContain("No replacement agent-authentication design has been selected");
    expect(marker).toContain("without restoring the retired credential-bearing image pattern");
  });

  test("retired ACP auth artifacts are absent", () => {
    const retiredPaths = [
      ".fabro/docker/codex-acp.Dockerfile",
      ".fabro/environments/default.toml",
      ".fabro/workflows/ax-feature/codex-acp-docker.toml",
      ".fabro/workflows/ax-feature/workflow-acp.fabro",
      "scripts/fabro-build-codex-acp-auth",
      "scripts/fabro-build-codex-acp-base",
      "scripts/fabro-local-codex-acp-run",
    ];

    for (const path of retiredPaths) {
      expect(existsSync(resolve(repoRoot, path))).toBe(false);
    }
  });

  test("verifier prompt requires an independent plan and evidence artifacts", () => {
    const prompt = readRepoFile(".fabro/workflows/ax-feature/prompts/verify.md");

    for (const phrase of verifierPromptContractPhrases) {
      expect(prompt).toContain(phrase);
    }
  });

  test("judge prompt rejects weak verification and routes with verification_ready", () => {
    const prompt = readRepoFile(".fabro/workflows/ax-feature/prompts/verification-judge.md");

    for (const phrase of judgePromptContractPhrases) {
      expect(prompt).toContain(phrase);
    }
    expect(prompt).not.toContain("invoke `ax` or `ax`");
  });

  test("handoff prompt describes API-backed PR finalization", () => {
    const prompt = readRepoFile(".fabro/workflows/ax-feature/prompts/handoff.md");

    expect(prompt).toContain("`[run.pull_request]` finalization");
    expect(prompt).not.toContain("ACP workflow");
  });
});
