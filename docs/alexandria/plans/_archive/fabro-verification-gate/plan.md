# Fabro Verification Gate Plan

## Goal

Add a post-review verification phase to the local Fabro factory workflow so
feature runs do not move directly from implementation review to PR handoff.

The verification phase should independently test whether the requested feature
works, capture durable evidence, and route back to implementation when the
evidence or verification process is not satisfactory.

## Workflow Shape

The `ax-next-feature` workflow should become:

```text
review -> verify -> verification_judge -> handoff -> create_pr
```

Failure routing:

```text
verification_judge -> implement [verification_ready=false]
verification_judge -> handoff [label=Verified]
```

The verifier is an execution-oriented agent stage. The judge is a separate
assessment-oriented agent stage.

The handoff edge is the unconditional success/default edge because Fabro
workflow validation requires at least one non-conditional outgoing edge. The
judge still emits explicit routing JSON with `verification_ready=true` for a
verified run and `verification_ready=false` for a fix-needed run.

## Verifier Contract

The verifier must not assume the scope plan's verification section is
sufficient. It must:

- Read the GitHub issue goal, checked-in technical plan, and implementation
  diff.
- Assess the technical plan's verification section for gaps.
- Write its own verification plan before executing checks.
- Execute the technical plan's verification steps when applicable.
- Execute additional checks needed to establish feature correctness.
- Prefer black-box user-level tests over implementation-only inspection.
- Use a throwaway sample project under `/tmp/fabro-verify-*` when the feature
  can be exercised outside the repository. If the sandbox does not permit that,
  use another scratch location and document the fallback.
- Install or invoke `ax` / `ax2` the way a user would, when applicable.
- Exercise browser or viewer behavior when the feature affects a web surface.
- Save all meaningful evidence under `verification-artifacts/`.

Required verifier outputs:

- `verification-artifacts/verification-plan.md`
- `verification-artifacts/report.md`
- `verification-artifacts/cli/` for CLI transcripts
- `verification-artifacts/json/` for structured output snapshots
- `verification-artifacts/screenshots/` for browser or UI screenshots
- `verification-artifacts/videos/` for browser videos when practical

The verifier's final response must summarize what it verified, what artifacts
it produced, and any unresolved risk. It should not route the workflow by
claiming success. The judge owns the routing decision.

## Verification Judge Contract

The judge must evaluate verification sufficiency, not just whether tests passed.
It must inspect:

- The GitHub issue goal.
- The implementation diff and changed files.
- The checked-in technical plan.
- The technical plan's verification instructions.
- The verifier's independent verification plan.
- The verifier's report and captured artifacts.
- CLI transcripts, JSON snapshots, screenshots, and videos when present.

The judge must answer these questions:

- Was the technical plan's verification section sufficient?
- Did the verifier identify and compensate for gaps in that plan?
- Was the verifier's own verification plan sufficient for the feature?
- Did the verifier actually execute the planned verification?
- Does the evidence support the claim that the feature works?
- Are remaining gaps acceptable for this slice, or should implementation resume?

The judge must end with exactly one routing JSON object:

```json
{"preferred_next_label":"Verified","context_updates":{"verification_ready":true}}
```

or:

```json
{"preferred_next_label":"Fix","context_updates":{"verification_ready":false}}
```

## Artifact Collection

Enable Fabro artifact collection for verifier outputs:

```toml
[run.artifacts]
include = [
  "verification-artifacts/**",
  "screenshots/**",
  "test-results/**",
  "playwright-report/**",
  "*.trace.zip"
]
```

Verifier-generated artifacts are evidence for the judge and should appear in
Fabro's run artifact surfaces.

## Browser Environment

The verification environment should be capable of browser testing. The ACP
Docker image should include browser automation dependencies, Playwright, and
Chromium browser binaries so verification can capture screenshots and videos
without requiring ad hoc setup in every run.

Video can remain best-effort. Screenshots, CLI transcripts, and JSON snapshots
are required evidence when relevant.

## Testing Strategy

### Static Contract Tests

Add package-level tests that read the workflow graph, TOML config, and prompt
files from disk. These tests should assert:

- The `verify` and `verification_judge` stages exist in both workflow graphs.
- The route is `review -> verify -> verification_judge -> handoff`.
- The judge has a failure route back to `implement`.
- Artifact collection includes `verification-artifacts/**`.
- Verifier prompt requires an independent verification plan.
- Verifier prompt requires artifact output under `verification-artifacts/`.
- Judge prompt requires assessing both the technical plan verification and the
  verifier's additional plan.
- Judge prompt requires routing JSON with `verification_ready`.

These are deterministic checks for prompt and workflow contracts.

### Fabro Validation Smoke

Run:

```bash
fabro validate .fabro/workflows/ax-next-feature/codex-acp-docker.toml
fabro validate .fabro/workflows/ax-next-feature/workflow.toml
```

This proves the supported ACP Docker and API/Daytona run configs parse after
the workflow change.

### Verification Prompt Trial

Use a controlled dry-run or manual run where the implementation can be simple.
Confirm the verifier creates:

- `verification-artifacts/verification-plan.md`
- `verification-artifacts/report.md`
- at least one CLI transcript or JSON snapshot

For this slice, a deterministic prompt contract test is acceptable if a live
LLM trial is too expensive or blocked, but the intended operating test is a
real Fabro workflow run.

### Judge Prompt Trial

Create synthetic positive and negative fixture evidence sets for the judge:

- Positive fixture: strong technical plan verification, independent verifier
  plan, executed checks, and matching artifacts.
- Negative fixture: weak or missing independent verifier plan, skipped
  technical-plan checks, or unsupported success claims.

Use deterministic tests to ensure the judge prompt contains the rubric needed
to reject the negative case and accept only sufficient evidence. A live LLM
trial can be added later as an eval if judge quality becomes a recurring risk.

## Implementation Scope

Files expected to change:

- `.fabro/workflows/ax-next-feature/workflow-acp.fabro`
- `.fabro/workflows/ax-next-feature/workflow.fabro`
- `.fabro/workflows/ax-next-feature/codex-acp-docker.toml`
- `.fabro/workflows/ax-next-feature/workflow.toml`
- `.fabro/workflows/ax-next-feature/prompts/verify.md`
- `.fabro/workflows/ax-next-feature/prompts/verification-judge.md`
- `.fabro/docker/codex-acp.Dockerfile`
- `packages/factory/src/*verification*.test.ts`

## Risks

- A verifier may overfit to the technical plan and fail to test user-visible
  behavior. The prompt and tests must require independent verification planning.
- A judge may rubber-stamp "tests passed." The prompt must grade sufficiency and
  evidence quality explicitly.
- Browser/video support can make the image heavier. Start with Chromium and
  screenshots as the reliable baseline; keep video best-effort.
- Verifier artifacts could accidentally pollute implementation commits. The
  workflow should store them as Fabro artifacts and rely on artifact directories
  excluded from checkpoint commits where possible.

## Acceptance Criteria

- Workflow validation passes for supported ACP Docker and API/Daytona configs.
- Factory tests cover the new workflow and prompt contracts.
- Artifact collection is enabled for verification evidence.
- The ACP Docker image can support browser screenshot verification.
- The verifier prompt requires an independent verification plan and artifacts.
- The judge prompt assesses both verification plans and execution evidence.
- The judge routes success to handoff and failure back to implementation.
