# Technical Plan: Ephemeral Surgery Plans

- Issue reference: `#185` Surgery plans should be ephemeral, not checked in
- Goal: Make Conan-to-Sam surgery plans transient handoffs rather than checked-in implementation-plan artifacts, and align planning/close-out guidance with that contract.
- Linked product plan: None linked from the issue

## Scope

- Remove the checked-in `surgery-plan.md` artifact from the Bun migration plan bundle.
- Update Conan, implementation-planning, and `/complete-plan` guidance so surgery plans are treated as transient handoffs, not durable repo artifacts.
- Update eval fixtures or coverage where the changed prompt contract needs explicit protection.
- Keep repo docs and historical plan guidance aligned with the new contract.

## Non-Goals

- Introducing a new persisted surgery-plan storage subsystem.
- Reworking the six-phase surgery protocol itself.
- Changing the durable role of `library-updates.md`, `release.md`, outcomes, or tickets.
- Refactoring unrelated plan-bundle structure under `docs/alexandria/implementation-plans/`.

## Current Gap

- The repo currently contains a checked-in `docs/alexandria/implementation-plans/bun-typescript-migration/surgery-plan.md`, which treats a Conan-to-Sam repair handoff as a durable artifact.
- Conan’s surgery job already works as an inline report, but the surrounding docs do not clearly say that the handoff is transient and should not be committed.
- `/complete-plan` defines the durable close-out artifact as `release.md`, but it does not explicitly guard against preserving or creating surgery-plan files during close-out.

## Architectural Boundaries

- Conan still owns diagnosis and surgery planning; Sam still owns card edits. This slice only changes artifact durability, not division of labor.
- Durable planning artifacts remain inside the implementation-plan bundle (`release.md`, `library-updates.md`, outcomes, tickets). The surgery handoff does not join that bundle.
- The fix should stay prompt-and-doc driven unless a real implementation surface requires more. No speculative temp-directory system without a concrete caller.
- Existing product-facing wording should remain reusable across products; avoid Alexandria-only operational detail beyond the repo’s own contributor workflow docs.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo plan bundle example | `docs/alexandria/implementation-plans/bun-typescript-migration/` | Removes the stale checked-in surgery artifact from a real plan bundle |
| Conan surgery behavior | `agents/conan.md`, `skills/conan/job-surgery.md` | Clarifies that surgery plans are delivered inline/transiently, not as checked-in files |
| Planning lifecycle guidance | `skills/implementation-planning/SKILL.md`, `skills/implementation-planning/ticket-writer.md`, `README.md`, relevant plan docs | Reframes `library-updates.md` as the durable artifact and Conan’s downstream surgery handoff as transient |
| Close-out workflow | `skills/complete-plan/SKILL.md` | Explicitly prevents `/complete-plan` from creating or preserving `surgery-plan.md` as part of close-out |
| Eval fixtures / baselines | `tests/eval-cases/*`, `tests/evals/*` as needed | Locks in the transient-handoff language where reusable product behavior changed |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `conan` surgery job | Produces the repair handoff inline as a transient report, optionally mirrored to a gitignored workspace but not to a tracked plan file | Conan eval rerun; docs that describe the handoff updated |
| `implementation-planning` | `library-updates.md` remains the durable plan output; user guidance no longer implies a checked-in downstream surgery file | Implementation-planning and ticket-writer eval reruns if wording changes |
| `complete-plan` | Close-out stays focused on `release.md` and must not create or preserve `surgery-plan.md` as a durable artifact | Complete-plan eval rerun if skill wording changes |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Required baseline for touched markdown, tests, and skill files |
| Deterministic tests | `bun test` | Covers eval discovery and any touched structural checks or fixtures |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `agents/conan.md`, `skills/conan/*` | Existing Conan eval suite | Rerun because surgery-job prompt behavior changes | `bin/alexandria-eval run conan/all` |
| `skills/implementation-planning/*` | Existing implementation-planning and ticket-writer eval suites | Rerun if library-update wording changes in product skill files | `bin/alexandria-eval run implementation-planning/all` and `bin/alexandria-eval run ticket-writer/all` |
| `skills/complete-plan/*` | Existing complete-plan eval suite | Rerun if close-out contract changes | `bin/alexandria-eval run complete-plan/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The repo may remove the historical `surgery-plan.md` file but leave prompt text ambiguous, so contributors recreate it later | Update the product skills and Conan job wording in the same slice, not just the artifact |
| Tightening wording in one skill but not the others could split the lifecycle contract | Update Conan, implementation-planning, and complete-plan together and rerun the relevant evals |
| Over-specifying a temp storage location without an actual runtime consumer could add dead process complexity | Default to no persisted file; mention gitignored temp storage only as optional future implementation detail |

## Implementation Steps

1. Remove the checked-in Bun migration `surgery-plan.md` artifact and inspect nearby plan docs for stale references.
2. Update Conan surgery instructions to state that the plan is a transient inline handoff, not a checked-in repository artifact.
3. Update implementation-planning and ticket-writer guidance so `library-updates.md` is the durable handoff precursor and Conan’s downstream surgery plan is explicitly transient.
4. Update `/complete-plan` guidance to preserve durable plan artifacts only and to avoid creating or retaining `surgery-plan.md`.
5. Adjust any eval fixtures or baselines that need the new contract language.
6. Run deterministic checks, then rerun the impacted eval suites and review results.

## Acceptance / Exit Criteria

1. No tracked `surgery-plan.md` remains in implementation-plan bundles.
2. Conan/implementation-planning/complete-plan guidance consistently treats surgery plans as transient handoffs rather than checked-in artifacts.
3. `library-updates.md` remains the durable artifact for plan-to-library follow-up.
4. Relevant deterministic checks and impacted eval suites pass with updated baselines where needed.

## Deferred Follow-Ups

1. If future automation genuinely needs filesystem persistence for surgery handoffs, define a concrete gitignored workspace contract in a separate slice.
2. Historical release notes and library cards that describe surgery plans generically can stay as-is unless they specifically imply checked-in plan artifacts.
