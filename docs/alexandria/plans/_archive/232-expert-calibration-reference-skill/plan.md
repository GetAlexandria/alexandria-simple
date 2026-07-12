# Technical Plan: Issue 232 Expert Calibration Reference Skill

- Issue reference: `#232` — `[LIB2-005] Encode expert calibration as Raven reference skill`
- Goal: encode the Phase 2 expert-calibration source material as a loadable Raven reference skill that shapes wizard-mode judgment without collapsing into a user-facing script or pulling later session-start work forward
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-005.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-5.md`

## Scope

- Create `skills/raven/expert-calibration.md` in the same reference-skill style as the existing Raven support files
- Encode all ten sections from `docs/alexandria/sources/expert-calibration-library-construction.md` in directive, internalized working-knowledge form
- Keep Raven's existing wizard-mode references aligned now that the referenced calibration file really exists
- Add or update deterministic coverage only if the new skill surface needs packaging or routing assertions beyond current repo coverage

## Non-Goals

- Changing wizard-engine logic, scoreboard derivation math, or renderer behavior from `LIB2-002` and `LIB2-003`
- Expanding `skills/raven/job-wizard-mode.md` into the full session-start implementation from `LIB2-006`
- Designing new wizard-mode eval cases ahead of the Phase 2 smoke-test hardening work
- Rewriting `skills/wizard/SKILL.md` or other non-Raven product surfaces just to mirror this reference material

## Linked Product-Plan Summary

- Phase 2 needs Raven to load expert calibration on entry to wizard-mode so guidance posture, mismatch detection, and stopping-point calls come from working knowledge rather than an external source doc.
- `LIB2-005` defines ten required sections, including the Frankenstein diagnostic, scoreboard mismatch detection, guidance posture, unlock logic, fill states, PULL, first-five-minutes framing, and cross-cutting principles.
- The output must read like Raven's internal judgment layer, not like a linear checklist or transcript summary.

## Current Gap

- `agents/raven.md` and `skills/raven/job-wizard-mode.md` already point at `skills/raven/expert-calibration.md`, but that file does not exist yet.
- The expert calibration material lives only in `docs/alexandria/sources/expert-calibration-library-construction.md`, which Raven can cite as source context but cannot load as a reusable reference skill.
- Existing Raven evals cover product-conversation behavior, but there is no dedicated wizard-mode eval case yet for this new reference surface.

## Architectural Boundaries

- Keep the new file as a Raven reference skill under `skills/raven/`, with `requires:` metadata like other product skills in that directory.
- Preserve the distinction between reference knowledge and job procedure: `skills/raven/expert-calibration.md` should shape judgment, while `skills/raven/job-wizard-mode.md` remains the procedure boundary.
- Keep the content generic across products. Use reusable examples and heuristics rather than domain-specific cases.
- Do not turn the reference skill into an exhaustive tutorial on the scoreboard system or a substitute for the source document's provenance.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Raven reference knowledge | `skills/raven/expert-calibration.md` | Raven gains a loadable calibration layer for wizard-mode judgment, mismatch detection, guidance posture, and stopping-point calls |
| Raven wizard-mode references | `agents/raven.md`, `skills/raven/job-wizard-mode.md` | Existing references remain accurate now that the calibration file exists and is no longer only a future placeholder |
| Skill metadata / runtime validation | `src/tools/route.test.ts`, packaging tests if needed | Coverage may need to confirm the new skill file routes cleanly and ships in distributable runtime surfaces |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/expert-calibration.md` | New product-facing Raven reference skill that encodes expert library-construction heuristics in directive form | Rerun Raven evals; keep wording consistent with wizard-mode job expectations and Phase 2 docs |
| `agents/raven.md` | Likely no structural change; verify existing reference-skill table wording still matches the landed file | Update only if the loaded-skill description needs to shift from planned to active language |
| `skills/raven/job-wizard-mode.md` | Likely no procedural change; verify fallback wording still makes sense once the file exists | Update only if the "not present yet" fallback now conflicts with the landed slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, and typed metadata after adding the new Raven skill and any adjacent test updates |
| Full deterministic suite | `bun test` | Confirms the additive Raven skill work does not regress packaging, routing, or other plugin behavior |
| Targeted routing or packaging checks | `bun test src/tools/route.test.ts` or specific packaging test if touched | Run directly if implementation shows those surfaces need updates for the new skill file |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/raven/*` | Yes (`tests/eval-cases/raven/*`) | Rerun Raven evals because a Raven skill surface changed | `bin/alexandria-eval run raven/all` |
| Wizard-mode expert calibration behavior | No dedicated wizard-mode eval case yet | Do not create a new eval in this slice; note the Phase 2 defer unless implementation reveals an obvious coverage gap that must land now | defer to later Phase 2 wizard-mode hardening |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new reference skill could read like a checklist or transcript summary, which would weaken Raven's natural wizard-mode behavior | Mirror the concise "recognition vocabulary" style of existing Raven reference skills and write directive guidance rather than narrated explanation |
| Expert-calibration content could duplicate or contradict `skills/raven/job-wizard-mode.md` | Keep procedure in the job file and judgment in the new reference skill, updating adjacent wording only when the boundary is unclear |
| Adding the skill could imply unsupported wizard-mode guarantees beyond the current Phase 2 implementation | Keep unresolved areas framed as judgment guidance, not as claims that the full runtime already exists |
| Raven evals may not exercise the new wizard-mode surface directly, leaving a residual coverage gap | Rerun `raven/all`, inspect for regressions, and call out the still-deferred wizard-mode-specific eval gap in the PR summary if no new case is added |

## Implementation Steps

1. Write this repo-specific plan for issue `#232`.
2. Draft `skills/raven/expert-calibration.md` from the checked-in source document, preserving all ten required sections in Raven-usable directive form.
3. Review `agents/raven.md` and `skills/raven/job-wizard-mode.md` for any wording that should change now that the calibration file exists.
4. Add or update deterministic test coverage only if the new skill file exposes a real packaging or routing gap.
5. Perform a manual diff review focused on style, boundary clarity, and generic wording.
6. Run relevant deterministic verification, including `bun run check` and `bun test`.
7. Run `bin/alexandria-eval run raven/all`, inspect results, and compare against baselines.
8. Update or open the PR from `symphony/232` with the plan path, checks, evals, and any residual wizard-mode coverage note.

## Acceptance / Exit Criteria

1. `skills/raven/expert-calibration.md` exists and includes all ten sections required by `LIB2-005`.
2. The new file reads as Raven's internalized working knowledge, not as a transcript, checklist, or user-facing script.
3. Raven's existing wizard-mode references to expert calibration remain accurate after the file lands.
4. `bun run check` passes.
5. `bun test` passes.
6. `bin/alexandria-eval run raven/all` completes without an unacceptable regression.

## Deferred Follow-Ups

1. Add wizard-mode-specific eval cases after Phase 2 smoke-test work defines the interaction shape worth hardening.
2. Land the full wizard-mode session-start machinery in `LIB2-006`.
3. Land Raven→Sam delegation hardening in `LIB2-007`.
