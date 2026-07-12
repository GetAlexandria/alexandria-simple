# Technical Plan: Issue 229 Scoreboard Derivation Spec

- Issue reference: `#229` — `[LIB2-002] Define scoreboard derivation spec`
- Goal: define a stable, repo-aligned scoreboard derivation specification that later renderer and session-start work can implement without re-deciding fill-state logic
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-002.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-2.md`

## Scope

- Add the repo-specific technical plan for issue `#229`
- Create `docs/wizard/scoreboard-derivation.md` as the canonical derivation spec for Phase 2
- Define the on-disk inputs, fill-state decision ladder, ambiguous-case resolutions, bucket aggregates, and clearance rules
- Include worked examples for at least the required representative configurations so later implementers can sanity-check renderer and session-start behavior against concrete outcomes

## Non-Goals

- Implementing the ASCII scoreboard renderer from `LIB2-003`
- Implementing the runtime session-start procedure from `LIB2-006`
- Changing `docs/wizard/wizard-engine.yaml`, current wizard outputs, or the library taxonomy
- Adding new agent or skill behavior, including Raven wizard-mode instructions
- Defining a new persisted scoreboard state file; the spec should preserve derived-from-state semantics

## Linked Product-Plan Summary

- Phase 2 makes the scoreboard the shared reference artifact for `/library`.
- `LIB2-002` is an enabler ticket that produces a specification, not production code.
- Outcome `O-2` requires the fill states to be derived from `wizard-config.json` plus live library state and to remain valid across all wizard configurations.
- The expert-calibration material establishes the five lifecycle markers and the need to distinguish thin source dumps from card-ready material.

## Current Gap

- The repo currently has no `docs/wizard/scoreboard-derivation.md`, so later tickets have no checked-in source of truth for how area fill levels should be computed.
- The upstream ticket leaves several ambiguous cases unresolved: multiple cards per area, partial cards, thin vs. complete source material, and bucket clearance semantics.
- Some upstream planning text still references pre-rename `docs/context-library/` paths, while the active repo surfaces now live under `docs/alexandria/`; the repo spec needs to align with the current checked-in filesystem conventions.
- Existing wizard artifacts record configuration and gap-analysis state, but there is no documented bridge from that state plus live library evidence to the five scoreboard fill levels.

## Architectural Boundaries

- The derivation spec belongs in wizard runtime documentation under `docs/wizard/`; it is a source of truth for future code, not runtime code itself.
- The spec should define a normalized view of library state that future tooling can compute from current repo artifacts, rather than hard-coding one transient report filename or inventing a new persistence layer in this slice.
- The spec should use active repo paths (`docs/alexandria/`, `docs/alexandria/sources/`, queue files under `docs/alexandria/`) and call out where upstream planning text still uses legacy paths.
- This slice should decide algorithmic behavior, not expand the Phase 2 scope into renderer copy, Raven prompt wording, or Sam/Conan file-writing protocols.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/229-scoreboard-derivation-spec/plan.md` | Captures repo-specific scope, boundaries, verification, and eval impact for the issue |
| Wizard runtime documentation | `docs/wizard/scoreboard-derivation.md` | Establishes the canonical derivation algorithm that later renderer and session-start work must follow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Wizard runtime docs | New scoreboard derivation spec becomes the source of truth for future implementation tickets | Later tickets `LIB2-003` and `LIB2-006` should reference this doc directly |
| Raven `/library` behavior | No direct behavior change in this slice; only the future derivation contract is defined | None in this ticket |
| Conan / Sam workflows | No direct behavior change in this slice; spec may reference their existing outputs as evidence inputs | None in this ticket |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown and repo-wide formatting/lint contracts after adding planning and spec docs |
| Full deterministic suite | `bun test` | Confirms the documentation-only change does not accidentally break existing tool or fixture expectations |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Wizard runtime docs | No direct eval-harness coverage for this doc-only derivation spec | No eval rerun in this slice because no product skill or agent behavior changes are implemented yet | none |
| `wizard` skill | Yes (`tests/evals/wizard/*`) | No rerun if `skills/wizard/SKILL.md` remains untouched | none |
| Future `/library` wizard-mode behavior | Explicitly deferred by the Phase 2 release plan until post-smoke-test hardening | Leave eval work to the implementation tickets that make the behavior runnable | defer to later Phase 2 tickets |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The spec could define inputs that do not line up with the repo's current `docs/alexandria/` layout or current wizard-config contract | Anchor the spec to active checked-in paths and name any normalized evidence model as a future implementation concern, not a new file contract |
| The spec could overfit to a hypothetical perfect grading dataset even though Conan often works from sampled or report-based evidence | Define a conservative decision ladder that can operate on partial evidence and falls back to the highest state that can actually be proven |
| Card-to-area matching could remain too vague, leaving `LIB2-003` and `LIB2-006` to re-decide it in code | Include an explicit area-to-evidence matching rule and state how unmatched or ambiguous cards are handled |
| Bucket clearance language could drift from expert-calibration guidance and create misleading unlock semantics | Separate aggregate percentages from clearance gates, and require specific Foundation areas to hit 100% before full Foundation clearance |

## Implementation Steps

1. Write this repo-specific plan for issue `#229`.
2. Author `docs/wizard/scoreboard-derivation.md` with the canonical inputs, terms, and derivation ladder.
3. Resolve the ambiguous cases called out in `LIB2-002` with explicit decisions and rationale.
4. Add worked examples for Factory/High/High and Short-Order-Cook/Low/Low using the current wizard engine tiering model.
5. Run `bun run check`.
6. Run `bun test`.
7. Do a local review pass against the issue, Phase 2 plan, and the new spec to catch path drift or scope creep.

## Acceptance / Exit Criteria

1. `docs/wizard/scoreboard-derivation.md` exists and is readable as both implementation guidance and Raven-facing reference.
2. The five fill states are defined with concrete detection criteria and a deterministic precedence order.
3. The ambiguous cases in `LIB2-002` are resolved with rationale.
4. Bucket-level aggregates, Core lock behavior, and Foundation clearance rules are specified.
5. The spec includes representative worked examples that produce sensible results for the required configurations.
6. `bun run check` passes.
7. `bun test` passes.

## Deferred Follow-Ups

1. Implement the ASCII renderer in `LIB2-003` using this spec as the contract.
2. Implement session-start reconciliation and delta presentation in `LIB2-006`.
3. If implementation uncovers gaps in how Conan grades or Raven logs open questions are surfaced on disk, define the minimal normalized evidence adapter in the implementation ticket rather than expanding this doc-only slice.
