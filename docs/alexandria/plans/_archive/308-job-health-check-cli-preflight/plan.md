# Issue 308 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#308`
- Goal: refactor Conan's health-check skill so it runs
  `alxndr health-check <library-path>` as a pre-flight, consumes the
  existing JSON report for the mechanical parts of the workflow, and
  falls back cleanly when the CLI is unavailable
- Linked product plan:
  [FEAT-032](../../implementation-plans/nit-cli-hardening/tickets/FEAT-032.md),
  [FEAT-031](../../implementation-plans/nit-cli-hardening/tickets/FEAT-031.md),
  [O-2](../../implementation-plans/nit-cli-hardening/outcomes/O-2.md),
  [nit-cli-hardening release](../../implementation-plans/nit-cli-hardening/release.md)

## Scope

- Add a `CLI Pre-flight` section to `skills/conan/job-health-check.md` before Phase 1.
- Name the exact command Conan should run and the exact JSON sections and
  fields the skill should read.
- Refactor Phases 2, 3, and 5 so Conan consumes CLI-computed substrate
  first and only performs judgment where the CLI cannot.
- Document graceful degradation for environments where `alxndr` is
  unavailable or the command fails.
- Add or refine wording only inside the skill file and this issue plan.

## Non-Goals

- Changing `alxndr health-check` schema or CLI behavior; FEAT-031
  already owns that contract.
- Rewriting the six-phase health-check flow or changing Conan's output
  template shape.
- Updating higher-level design docs or library cards unless the skill
  edit reveals a concrete contradiction that blocks this issue.
- Adding a new dedicated health-check eval case in this slice.

## Current Gap

- `skills/conan/job-health-check.md` still describes a fully manual
  six-phase procedure.
- The skill does not tell Conan to run the now-available
  `alxndr health-check` subcommand.
- Phases that now have deterministic substrate from the CLI still
  instruct Conan to perform manual counting and reconciliation.
- The skill has no written fallback contract for CLI absence or failure.

## Architectural Boundaries

- Keep this slice in the Conan skill layer. The CLI schema is already
  implemented; this issue only teaches Conan how to consume it.
- Preserve the six-phase structure and keep source alignment, rationale
  review, and cascade analysis judgment-led.
- Use the CLI only for mechanical substrate: inventory reconciliation,
  Standards structural checks, and product-layer sampling inputs.
- Do not blur deterministic counts with judgment. Where the CLI reports
  structure only, Conan must still assess content quality separately.
- Keep the wording general to any product library; do not introduce
  product-specific examples or repository-specific paths beyond the
  canonical Alexandria library layout already used by the CLI.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Conan health-check skill | `skills/conan/job-health-check.md` | Conan now runs a CLI pre-flight, reads structured JSON for mechanical phases, and falls back to manual work when the CLI is unavailable |
| Repo technical planning | `docs/alexandria/plans/308-job-health-check-cli-preflight/plan.md` | Captures the repo-specific scope, schema mapping, verification, and eval stance for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/conan/job-health-check.md` | Add explicit `alxndr health-check <library-path>` pre-flight, schema-field mapping, and fallback instructions | Verify the wording matches the implemented CLI schema and preserves the existing inline health-report output contract |
| Conan health-check workflow | Phase 2 reads `inventory`; Phase 3 reads `standards_health`; Phase 5 uses `metrics` as sampling substrate before grading | No code changes expected; deterministic CLI coverage already exists from FEAT-031 |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Markdown and repo quality gate | `bun run check` | Validates the edited Markdown skill file under the repo's required quality gate |
| Regression suite | `bun test` | Confirms the existing CLI and repo test suite still pass after the skill/doc slice |
| Existing health-check CLI contract | `bun test src/cli/main.test.ts` | Re-confirms the exact JSON surface the skill now references |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Conan product-skill surface | Conan has existing eval coverage (`inventory`, `grade`, `surgery`), but no dedicated health-check eval case | Rerun Conan evals for collateral regressions per repo policy; no new health-check eval case in this slice because the linked product plan explicitly treats deterministic CLI coverage as the primary gate | `bin/alexandria-eval run conan/all` |
| Health-check-specific reusable behavior | No direct eval case exists for `job-health-check.md` | Note the residual coverage gap if the Conan suite passes without exercising the new path | No new case planned in this issue |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The skill could reference shorthand field names from planning docs instead of the actual FEAT-031 schema | Anchor the wording to the implemented JSON shape in `src/tools/health-check.ts` and `src/cli/main.test.ts` before editing |
| Conan could over-trust the CLI and skip judgment-only checks | State explicitly which phases use CLI substrate and which checks still require Conan's assessment |
| Fallback behavior could be underspecified, leaving hosts without `alxndr` in a broken state | Include an explicit manual fallback path in the pre-flight section and in each affected phase |
| Repo policy could be violated if evals are skipped just because the touched skill lacks dedicated coverage | Run `conan/all`, then document that the suite does not directly cover health-check behavior |

## Implementation Steps

1. Create the issue-specific technical plan for `#308`.
2. Read the current `job-health-check.md` procedure against the
   implemented FEAT-031 JSON schema.
3. Add a `CLI Pre-flight` section before Phase 1 with the exact command,
   expected top-level sections, and fallback behavior.
4. Refactor Phases 2, 3, and 5 to consume CLI output first while
   preserving manual fallback instructions.
5. Review the edited skill for wording drift, output-template
   preservation, and schema accuracy.
6. Run targeted deterministic checks, then rerun `conan/all` to satisfy
   the repo eval gate for Conan skill changes.

## Acceptance / Exit Criteria

1. `skills/conan/job-health-check.md` contains a `CLI Pre-flight` section before Phase 1.
2. The skill names `alxndr health-check <library-path>` explicitly and
   tells Conan which JSON sections to read.
3. Phase 2 references the `inventory` section instead of manual
   counting when CLI output is available.
4. Phase 3 references `standards_health` for mechanical structural
   checks while preserving content judgment work.
5. Phase 5 uses `metrics` as sampling substrate and preserves Conan's grading role.
6. Graceful degradation is documented both in the pre-flight section and
   the affected phases.
7. `bun run check`, `bun test`, and `bin/alexandria-eval run conan/all`
   complete without introducing regressions.

## Deferred Follow-Ups

1. Add dedicated health-check eval coverage if this workflow becomes
   unstable or if future Conan changes touch the same path again.
2. Revisit higher-level health-check docs only if the skill refactor
   proves the current playbook or library-card wording is materially
   inaccurate.
