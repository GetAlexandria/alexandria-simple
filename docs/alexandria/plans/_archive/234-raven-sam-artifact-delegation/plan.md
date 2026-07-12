# Technical Plan: Issue 234 Raven-Sam Artifact Delegation

- Issue reference: `#234` — `[LIB2-007] Implement Raven-to-Sam artifact delegation`
- Goal: define the concrete wizard-mode handoff protocol that lets Raven conduct `/library` conversationally while Sam remains the only artifact writer for starter source cards, `wizard-config.json`, and `assessment.md`
- Linked product plan: `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-007.md`, `docs/alexandria/implementation-plans/library-phase-2/outcomes/O-3.md`, `docs/alexandria/sources/vision-wizard-becomes-raven.md`

## Scope

- Add the repo-specific technical plan for issue `#234`
- Replace the placeholder delegation guidance in `skills/raven/job-wizard-mode.md` with a concrete Raven-to-Sam protocol tied to the shared play pattern
- Define the minimum complete handoff block Raven must produce before calling Sam
- Cover all three artifact classes called out by the product plan: starter source artifacts/cards, `docs/alexandria/wizard-config.json`, and `docs/alexandria/assessment.md`
- Make the user-review and revision loop explicit so Raven presents Sam's work, gathers corrections, and re-directs Sam without taking over authorship herself

## Non-Goals

- Implementing the smoke-test workflow for full `/library` sessions; that belongs to `LIB2-009`
- Adding async or parallel agent execution; Phase 2 remains sequential
- Reworking Sam's card-writing job definitions or broadening Sam into a general-purpose file writer outside wizard-mode needs
- Creating new wizard-mode eval harness coverage in this slice if the existing Phase 2 plan still defers that hardening until after smoke testing
- Changing the wizard engine, scoreboard derivation logic, or assessment schema

## Linked Product-Plan Summary

- The Phase 2 release plan defines Raven-to-Sam delegation as the main new orchestration surface for Outcome `O-3`.
- The ticket requires a natural conversational handoff that still uses the shared play conventions and gives Sam enough context to produce correct artifacts without clarification turns.
- The delegated artifacts are starter source cards, `wizard-config.json`, and `assessment.md`, each with a confirm -> direct Sam -> present -> revise loop.
- Raven's normal "do not direct Sam" rule is intentionally relaxed only inside wizard-mode.

## Current Gap

- `skills/raven/job-wizard-mode.md` currently says artifact production follows a generic pattern and explicitly defers the detailed handoff formatting to `LIB2-007`.
- That leaves wizard-mode without a defined prompt contract for how Raven should summarize, what fields the Sam handoff must include, or how review/revision loops should work.
- `agents/raven.md` already mentions a wizard-mode exception, but the concrete operating protocol is not yet written where Raven's job procedure loads it.
- Without this contract, Phase 2 has no checked-in spec for turning Raven's conversational synthesis into artifacts on disk.

## Architectural Boundaries

- The authoritative protocol belongs in `skills/raven/job-wizard-mode.md`, because this is wizard-mode-specific behavior rather than Raven's general product-conversation job.
- Shared play conventions should be reused by reference rather than copied into a second protocol file.
- Raven remains the orchestrator and reviewer-facing colleague; Sam remains the writer. The protocol should not blur that authorship boundary.
- The slice should define the handoff contract and conversational loop, not the implementation details of how a host runtime invokes agents.
- If `agents/raven.md` needs adjustment, keep it narrow: clarify the wizard-mode exception without weakening the normal product-conversation boundary.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/234-raven-sam-artifact-delegation/plan.md` | Captures repo-specific scope, boundaries, verification, and eval impact for the issue |
| Raven wizard-mode job | `skills/raven/job-wizard-mode.md` | Replaces the placeholder delegation section with a concrete sequential handoff protocol for Sam-produced artifacts |
| Raven agent boundary text | `agents/raven.md` | Clarifies the wizard-mode exception only if needed so the agent-level rules stay aligned with the job-level protocol |
| Phase 2 docs alignment | nearby ticket or design docs only if the implementation reveals wording drift | Keeps checked-in behavior descriptions consistent without widening into unrelated cleanup |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `skills/raven/job-wizard-mode.md` | Raven moves from a generic "use this pattern" note to a concrete handoff protocol with explicit synthesis, confirmation, Sam direction, artifact presentation, and revision loops | Update the job text for all three artifact classes and keep the shared play-protocol references explicit |
| `agents/raven.md` | Wizard-mode exception may need sharper wording so Raven can direct Sam here without weakening the normal non-writer boundary elsewhere | Keep the exception scoped to `/library`; do not loosen product-conversation behavior |
| Sam artifact production in wizard-mode | Sam receives more complete prompt context from Raven, reducing ambiguity around target path, artifact type, synthesis payload, and expected output shape | Validate via local review and later smoke-test readiness; do not change Sam's broader job taxonomy here |
| `/library` product behavior | Users should experience Raven as a conductor who naturally brings Sam in, presents drafts, and loops on feedback without a jarring mode switch | Preserve the conversational feel in the prompt text and avoid host-specific mechanics leaking into user-facing language |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, formatting, linting, and type-check surfaces after plan and prompt updates |
| Full deterministic suite | `bun test` | Confirms the prompt/doc slice does not regress packaging, routing, or test fixtures elsewhere in the repo |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/raven/*` | Yes, via `tests/eval-cases/raven/*`, but current cases exercise product-conversation behavior rather than wizard-mode | Rerun the required Raven eval set per repo policy and note that direct wizard-mode coverage remains deferred to the later smoke-test/hardening work | `bin/alexandria-eval run raven/all` |
| Wizard-mode-specific `/library` flow | No meaningful eval-harness coverage yet | Do not create a new eval case in this slice unless implementation reveals an unavoidable gap the release plan no longer defers | defer unless required during implementation |
| `agents/raven.md` | Indirectly covered by Raven evals if touched | Include in the same Raven rerun set | `bin/alexandria-eval run raven/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The prompt could over-specify host mechanics and make wizard-mode feel like a visible workflow engine instead of a natural conversation | Write the protocol as Raven procedure text with natural language examples, and keep tool/runtime details minimal |
| The handoff could still be too vague for Sam, leading to malformed artifacts or clarification loops | Define a minimum complete handoff block with required fields for artifact type, topic, synthesis payload, target path, and output expectations |
| The wizard-mode exception could leak into general Raven behavior and weaken the normal division of labor | Keep any agent-level wording explicitly scoped to Job 2 and leave product-conversation behavior unchanged |
| Existing Raven evals may not directly validate wizard-mode, leaving a coverage hole after local changes | Run the required Raven evals anyway, document the gap in the plan, and rely on `LIB2-009` smoke testing as the acceptance gate already specified by the product plan |

## Implementation Steps

1. Write this repo-specific technical plan for issue `#234`.
2. Update `skills/raven/job-wizard-mode.md` so Step 5 becomes the concrete Raven-to-Sam artifact delegation protocol instead of a placeholder.
3. Define the shared handoff skeleton Raven uses before each Sam call, including required fields and sequential flow expectations.
4. Spell out the protocol separately for starter source artifacts/cards, `docs/alexandria/wizard-config.json`, and `docs/alexandria/assessment.md`.
5. Make the user review and adjustment loop explicit so Raven presents drafts and re-directs Sam rather than silently rewriting or moving on too early.
6. Review `agents/raven.md` for any wording drift and tighten only the wizard-mode exception if needed.
7. Run `bun run check`.
8. Run `bun test`.
9. Run `bin/alexandria-eval run raven/all`, inspect results, and compare to baselines as needed.
10. Do a local review pass against the issue, plan, and final diff, then update the PR against `main`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/234-raven-sam-artifact-delegation/plan.md` exists and reflects the issue's repo-specific slice.
2. `skills/raven/job-wizard-mode.md` defines the Raven-to-Sam delegation protocol directly rather than deferring it.
3. The protocol covers all three artifact classes required by `LIB2-007`.
4. The protocol reuses the shared play conventions and makes the minimum complete Sam direction explicit.
5. The review/revision loop is clear: Raven confirms synthesis, directs Sam, presents output, gathers changes, and loops until acceptable.
6. Raven's normal non-writer boundary remains intact outside wizard-mode.
7. `bun run check` passes.
8. `bun test` passes.
9. The required Raven eval rerun completes without introducing a regression that blocks merge.

## Deferred Follow-Ups

1. Add direct wizard-mode eval coverage only if the later smoke-test work shows the current gap should no longer remain deferred.
2. Validate the protocol end-to-end in `LIB2-009` with a real `/library` session transcript and artifact checks.
3. Revisit whether Sam needs wizard-mode-specific artifact-writing guidance if smoke testing shows repeated ambiguity despite Raven's richer handoff.
