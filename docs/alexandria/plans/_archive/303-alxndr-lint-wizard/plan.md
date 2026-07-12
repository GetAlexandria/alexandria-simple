# Issue 303 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#303`
- Goal: add `alxndr lint wizard <path>` so Nit can verify wizard arithmetic against the checked-in wizard engine and catch drift in `wizard-config.json`.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-027.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a `wizard` lint target under `alxndr lint`.
- Read `wizard-config.json` from the input repo/library context and read `docs/wizard/wizard-engine.yaml` from the Alexandria plugin.
- Verify internal arithmetic in `wizard-config.json`: `pool_size`, `distribution`, and `areas.length` must agree.
- Compute the expected tier distribution from the wizard engine for the recorded `(mode, novelty, complexity)` inputs and compare that expectation against the config’s tier counts.
- Emit critical findings as error-severity lint results and cover the behavior with deterministic black-box CLI tests.

## Non-Goals

- Implementing the other sweep 6 targets still pending after `plans` and `wizard`.
- Auto-rewriting `wizard-config.json` or normalizing tier assignments in place.
- Expanding this slice into broader wizard schema validation beyond the deterministic arithmetic and count checks in FEAT-027.
- Modifying product skills, agents, or wizard prompts; this slice is CLI validation only.

## Linked Product-Plan Summary

- FEAT-027 defines the deterministic Sweep 6 wizard-arithmetic check.
- The CLI must read the generated wizard config plus the source engine table.
- Two validation layers are required:
  - internal config arithmetic must balance
  - tier counts must match the engine table for the recorded configuration inputs
- Any mismatch is critical.

## Current Gap

- `alxndr lint` currently exposes `plans` as the only sweep 6 target.
- The shared lint engine has no wizard-config resolver, no wizard arithmetic checker, and no path validation for a wizard target.
- `src/tools/wizard.ts` keeps its engine parser and tier computation inline, so there is no reusable module for other tools to compare config output against the engine.
- Existing deterministic tests do not cover a wizard lint target, error-severity cross-system arithmetic findings, or `all` target inclusion for wizard checks.

## Architectural Boundaries

- Keep wizard-engine parsing and tier computation in shared TypeScript helpers instead of shelling out from the lint command or duplicating engine logic.
- Limit the lint target to deterministic count verification. Do not infer semantic correctness from prose notes, intake text, or gap-analysis narratives.
- Preserve the shared lint pipeline: the new target should feed the existing `Finding` schema, formatter, and exit-code behavior.
- Keep target path handling explicit so library targets continue to validate library roots while `wizard` can resolve the config from repo-root or library-root style inputs.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/lint.ts`, `src/cli/main.test.ts` | `alxndr lint --help` includes `wizard`, and the router dispatches the new target through the shared lint engine |
| Shared lint engine | `src/tools/lint-core.ts`, new helper such as `src/tools/lint-wizard.ts` | Lint target registry gains deterministic wizard arithmetic verification and target-specific path validation |
| Wizard engine reuse | `src/tools/wizard.ts`, new shared helper such as `src/tools/wizard-engine.ts` | Wizard engine parsing and tier computation become reusable by both the CLI and lint target without behavior drift |
| Deterministic coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` | Black-box tests cover valid config, arithmetic mismatch, engine-table mismatch, and `all` target inclusion |
| Repo planning docs | `docs/alexandria/plans/303-alxndr-lint-wizard/plan.md` | Captures repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint wizard <path>` becomes a new deterministic sweep 6 target that reports critical wizard arithmetic drift as lint errors | Update CLI and lint tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Wizard-target CLI coverage | `bun test src/tools/lint.test.ts` | Verifies valid and invalid wizard configs through the real executable surface |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms `wizard` appears in help and dispatch works via the top-level router |
| Repo quality gate | `bun run check` | Covers linting, formatting, shell checks, markdown checks, and typecheck for the touched slice |
| Regression sweep | `bun test` | Confirms the shared wizard-engine refactor does not regress the broader Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior only |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Reimplementing wizard-engine arithmetic in the lint target drifts from the actual wizard CLI behavior | Extract the engine parser and tier computation into a shared module consumed by both tools |
| Wizard path resolution is too narrow and only works from one invocation root | Add explicit resolution logic and tests for repo-root style invocation, matching how other `alxndr lint` targets are used |
| The target compares only config self-consistency and misses divergence from the engine table | Compute expected tier counts from the engine for the recorded inputs and compare them directly against the config |
| Sweep 6 error severity accidentally changes exit semantics or output formatting | Reuse the existing `Finding` schema and formatter, and cover error exit behavior in black-box tests |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/303-alxndr-lint-wizard/`.
2. Extract reusable wizard-engine parsing and tier computation into a shared helper module.
3. Add a focused wizard lint helper that resolves `wizard-config.json`, validates arithmetic, computes expected counts from the engine, and emits sweep 6 findings.
4. Extend the shared lint target registry, path validation, and `all` target execution to include `wizard`.
5. Add deterministic tests for valid config, arithmetic mismatch, engine-count mismatch, router help, and `all` target behavior.
6. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint wizard <path>` reads `wizard-config.json` and the checked-in wizard engine.
2. A distribution total that does not equal `pool_size` emits an error-severity finding.
3. An `areas` count that does not equal `pool_size` emits an error-severity finding.
4. A config whose tier counts do not match the engine table for its recorded inputs emits an error-severity finding.
5. `alxndr lint --help` lists `wizard`, and `alxndr lint all <path>` includes wizard findings when a config is present.
6. Deterministic black-box tests cover both valid and invalid wizard-config fixtures.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-028 can add documentation count verification on top of the same wizard-engine data.
2. A later sweep 6 slice can extend wizard validation from count parity to ID-level or gap-analysis reconciliation if the product plan calls for it.
