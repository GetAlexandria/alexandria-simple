# Technical Plan: Issue 228 Library Skill Entry Point

- Issue reference: `#228` — `[LIB2-001] Create /library skill entry point`
- Goal: add a real product-facing `/library` skill entry point that registers cleanly, establishes Raven wizard-mode context, and preserves the existing `/wizard` surface
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-001.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-1.md`

## Scope

- Create `skills/library/SKILL.md` as a thin product skill with the required `requires:` frontmatter and the Phase 2 `/library` description
- Keep the new skill intentionally thin: it establishes Raven wizard-mode context and points at the Raven wizard-mode job without embedding orchestration steps
- Update the narrow set of active docs and deterministic tests that should now recognize `/library` as a registered product entry point
- Preserve `/wizard` as an additive, still-supported path for the existing scripted and eval-backed workflow

## Non-Goals

- Implementing Raven's wizard-mode job or its procedure file (`LIB2-004`)
- Moving orchestration logic, scoreboard logic, or artifact-writing instructions out of `skills/wizard/SKILL.md`
- Replacing `/wizard` as the current CI or eval entry surface
- Changing wizard engine YAML, tier-assignment logic, or downstream agent behavior
- Introducing full wizard-mode eval coverage before the Phase 2 smoke-test work called for in the upstream release plan

## Linked Product-Plan Summary

- Phase 2 makes `/library` the persistent room entry point while keeping `/wizard` functional.
- `LIB2-001` requires a new `skills/library/SKILL.md` that is thin, uses wizard-mode capability requirements, and hands off to Raven's wizard-mode job.
- Outcome `O-1` treats discoverability, clean routing intent, and no `/wizard` regression as the success bar for this slice.

## Current Gap

- The repo currently exposes `skills/wizard/SKILL.md` as the only top-level library-configuration skill.
- There is no `skills/library/` directory, so `/library` is not registered or installable as a product skill today.
- Active docs and a few deterministic tests still assume `wizard` is the only user-facing entry point for this flow.
- Raven's current checked-in agent definition has no wizard-mode job yet, so this issue can only land the thin entry-point layer and forward reference the future job surface.

## Architectural Boundaries

- The new `skills/library/SKILL.md` belongs to the product skill surface and should behave like a context-establisher, not a full procedure.
- Capability routing belongs in the skill frontmatter; the new skill should declare the wizard-mode requirements from `LIB2-001`.
- Runtime discoverability and packaging should continue to flow from the existing top-level `skills/*` directory conventions; avoid adding installer special cases.
- Because `LIB2-004` has not landed, the skill should reference Raven's wizard-mode job as the intended procedure boundary without inventing the missing implementation in this slice.
- Historical plans, frozen eval transcripts, and unrelated docs should not be churned just to replace every `wizard` mention with `library`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product skill registration | `skills/library/SKILL.md` | Adds a new discoverable `/library` entry point with wizard-mode routing intent |
| Capability routing | `src/tools/route.test.ts` | Verifies the new skill's `requires:` block resolves to the intended model tier |
| Setup/install discoverability | `tests/setup.test.ts` | Confirms the new top-level skill is symlinked into Claude skill discovery on setup |
| Runtime packaging | `tests/build-tarball.test.ts` | Confirms the packaged runtime includes the new skill entry point |
| User-facing docs | `README.md`, `setup` | Active guidance points users at `/library` as the Phase 2 entry while keeping `/wizard` compatibility clear |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `library` | New thin product skill that frames Raven as operating in wizard-mode and points to Raven's future wizard-mode job | Add deterministic coverage for routing, setup symlinks, and packaging; update active docs that present the entry point |
| `wizard` | No procedural change; remains the existing scripted/configuration surface | Preserve existing files and behavior; make sure docs do not imply `/wizard` was removed |
| `raven` | No direct agent change in this slice | None now; `LIB2-004` will carry the actual job-table and procedure updates |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, shell, and typed surfaces after skill/doc/test edits |
| Full deterministic suite | `bun test` | Confirms the additive entry point does not break setup, packaging, routing, or existing wizard behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `library` skill entry point | No dedicated eval coverage | No new eval case in this slice; validate via deterministic tests because this issue adds registration and thin handoff copy, not runnable wizard-mode behavior yet | none |
| `wizard` skill | Yes (`tests/evals/wizard/*`) | No rerun if `skills/wizard/SKILL.md` remains untouched | none |
| Future wizard-mode behavior | Explicitly deferred by `library-phase-2/release.md` until post-smoke-test hardening | Document the defer rather than inventing premature eval coverage | defer to later Phase 2 tickets |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new `/library` skill accidentally starts duplicating wizard procedure logic, blurring the boundary with `LIB2-004` | Keep the skill body short and review it specifically for references that belong in Raven's job procedure instead |
| Active docs overcorrect and imply `/wizard` is gone, creating confusion for scripted or eval-backed flows | Update docs narrowly and state that `/library` is additive while `/wizard` still works |
| The new skill is added but not actually surfaced by setup or packaging paths | Add deterministic assertions in `tests/setup.test.ts` and `tests/build-tarball.test.ts` rather than relying on convention alone |
| Missing or wrong `requires:` values quietly route the new skill to the wrong model tier | Add a route test for `skills/library/SKILL.md` and match the capability levels specified in `LIB2-001` |
| A new product-facing skill is added without meaningful eval coverage | Record the explicit defer from the upstream Phase 2 plan and limit this slice to the thin registration surface; later wizard-mode tickets should add coverage once runnable behavior exists |

## Implementation Steps

1. Write this repo-specific plan for issue `#228`.
2. Add `skills/library/SKILL.md` with the required frontmatter, description, and thin wizard-mode handoff copy.
3. Update the narrow set of active docs that should now mention `/library` as the user-facing entry point.
4. Add or update deterministic tests for routing, setup symlinks, and packaged runtime contents.
5. Run `bun run check`.
6. Run `bun test`.
7. Do a local review pass focused on thin-skill boundaries and `/wizard` compatibility.
8. Update or open the PR against `main` from `symphony/228`.

## Acceptance / Exit Criteria

1. `skills/library/SKILL.md` exists as a registered top-level product skill.
2. The skill has the `requires:` block described in `LIB2-001` and routes to the expected model tier.
3. The skill body clearly establishes Raven wizard-mode context without embedding session orchestration logic.
4. Active deterministic coverage proves the new skill is discoverable through setup and packaged runtime paths.
5. Active docs present `/library` as the Phase 2 entry point without claiming `/wizard` was removed.
6. `bun run check` passes.
7. `bun test` passes.

## Deferred Follow-Ups

1. Add Raven's wizard-mode job and procedure in `LIB2-004`.
2. Add wizard-mode session-start, scoreboard, and delegation logic in the later Phase 2 tickets.
3. Add dedicated eval coverage for `/library` once the wizard-mode experience is actually runnable and smoke-tested.
