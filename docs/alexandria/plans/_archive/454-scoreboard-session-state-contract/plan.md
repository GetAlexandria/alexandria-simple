# Technical Plan: Issue 454 Scoreboard Session-State Contract

- Issue reference: `#454` — `[FEAT] Align alxndr scoreboard with Raven's real session-state contract`
- Goal: upgrade `alxndr scoreboard` from a narrow slot-coverage view into a deterministic session-state surface Raven can trust when opening `/library`, while staying honest about what the repo can and cannot currently prove from disk
- Linked product plan: `docs/initialize/scoreboard-derivation.md`, `docs/alexandria/implementation-plans/library-phase-2/release.md`, `docs/alexandria/implementation-plans/library-phase-2/tickets/LIB2-006.md`, `docs/alexandria/plans/380-scoreboard-derivation-cli/plan.md`

## Scope

- Add the repo-specific technical plan for issue `#454`
- Extend scoreboard derivation so it reads more of the real session-state evidence already present on disk:
  - attributed source material under `docs/alexandria/sources/`
  - manifest-backed area-to-card mapping evidence
  - config intake and gap-analysis state from `alexandria-config.json`
  - unresolved claim evidence from `signal-queue.jsonl`
- Preserve the current fill bars, but make the derived JSON and rendered output expose why an area is at its current state and what still blocks it
- Add deterministic tests with realistic Alexandria fixtures that prove the richer contract: raw source present, ready-to-build via manifest, cards present but blocked, unresolved signal pressure, and explicitly unknown quality state
- Update the scoreboard docs/help text where necessary so the shipped contract no longer over-promises “progress” when only narrow coverage is known

## Non-Goals

- Replacing Raven’s conversational synthesis or room-open copy
- Adding LLM judgment or heuristic inference beyond deterministic on-disk evidence
- Inventing a new persisted Conan grade artifact or a generalized scoreboard state file
- Solving every historical vocabulary mismatch between initialize areas, manifests, and card taxonomy beyond the minimum parser/adapters needed for this issue
- Running product-surface evals unless the work expands into agent or skill behavior

## Linked Product-Plan Summary

- The checked-in derivation spec already defines a richer scoreboard contract than the current CLI implements: source readiness, explicit area mapping, unresolved-question caps, and conservative “functioning” criteria.
- The `/library` session-start ticket expects Raven to read current state, render the scoreboard, and speak honestly about what is blocked, thin, or ready next.
- The shipped derivation CLI from `#380` intentionally deferred that richer contract in favor of a narrow filesystem coverage slice; this issue is the corrective slice that closes the gap without pretending grade artifacts already exist.

## Current Gap

- `src/tools/scoreboard-derive.ts` currently derives fill only from hard-coded matcher-slot coverage against cards on disk.
- The shipped JSON does not tell Raven whether an area has attributed source, whether the source is ready for construction, whether card mapping is explicitly backed by a manifest, whether unresolved claims target the area, or whether quality is simply unknown.
- The renderer currently shows bars plus a bucket-average sentence. It does not surface the “why” behind a stalled area or tell the user what state is intentionally unknown.
- The repo does have deterministic evidence for several richer signals already, but the scoreboard ignores them:
  - source file attribution lines
  - inventory manifests
  - initialize intake/gap-analysis data in `alexandria-config.json`
  - unresolved claim queues
- Persisted Conan grade artifacts are not reliably present on disk in the current repo contract, so the scoreboard must surface that absence explicitly instead of silently implying grade-backed readiness.

## Architectural Boundaries

- Keep the derivation logic in `src/tools/scoreboard-derive.ts` and supporting helpers. Do not move Raven procedure logic into the CLI.
- Keep the renderer in `src/tools/scoreboard.ts` focused on displaying a pre-derived view model. It can render richer evidence summaries, but it should not discover filesystem state itself.
- Prefer explicit, deterministic evidence adapters over broad natural-language parsing. Source attribution lines, manifest tables, config JSON, and signal-queue JSONL are acceptable inputs; free-form prose scraping should stay minimal and tightly bounded.
- Treat persisted quality as a tri-state: proven passing, proven blocked, or unknown. In this slice, “unknown” is the expected honest default because grade artifacts are not a stable repo primitive yet.
- Keep the current fill bar model conservative. The richer contract should explain the fill and blockers, not replace the bar scale with a new scoring system.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/454-scoreboard-session-state-contract/plan.md` | Captures the repo-specific scope, evidence sources, verification, and follow-ups for issue `#454` |
| Scoreboard derivation tool | `src/tools/scoreboard-derive.ts` plus new helper code if needed | Derives richer per-area and per-bucket session-state evidence from sources, manifests, config intake/gap state, and signal queues |
| Scoreboard renderer | `src/tools/scoreboard.ts` | Renders not just fill bars but succinct truthful state reasons and blockers that Raven can reuse during room open |
| CLI surface | `src/cli/scoreboard.ts` | Keeps help/contract aligned with the richer derived output, especially what is deterministic vs intentionally unknown |
| Deterministic tests | `src/tools/scoreboard-derive.test.ts`, `src/tools/scoreboard.test.ts`, and possibly `src/cli/main.test.ts` | Covers realistic richer contract scenarios and ensures help/output shape stay aligned |
| Scoreboard docs | `docs/initialize/scoreboard-derivation.md` only if the shipped contract wording now needs clarification | Documents any intentionally out-of-scope quality evidence so the command does not silently over-promise |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `alxndr scoreboard` | The CLI becomes a truthful room-open session-state surface rather than just a config-to-card coverage counter | Keep help text, JSON shape, and renderer output aligned with the richer evidence model |
| Raven returning-session workflow | No direct prompt change in this slice, but Raven can now rely on stronger deterministic scoreboard output | Later Raven work should reuse the richer scoreboard fields instead of re-deriving parallel state |
| Initialize / scoreboard derivation docs | Clarifies which signals are in-scope now and which quality signals remain intentionally unknown without persisted Conan artifacts | Update docs if implementation adds or narrows any contract details |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Focused scoreboard coverage | `bun test src/tools/scoreboard-derive.test.ts src/tools/scoreboard.test.ts` | Fast iteration loop for richer derivation and renderer behavior |
| CLI routing/help | `bun test src/cli/main.test.ts` | Confirms the `alxndr` surface stays discoverable and accurate |
| Repo checks | `bun run check` | Required lint/type/format gate after TypeScript and docs changes |
| Full deterministic suite | `bun test` | Required repo baseline; proves the broader CLI/tool surface still holds |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Scoreboard CLI and renderer | Deterministic tests only | No eval rerun needed if work stays inside CLI/tool/docs surfaces | none |
| Raven `/library` behavior | Eval-backed elsewhere, but not edited in this slice | Do not rerun until agent/skill behavior changes directly | defer |
| Scoreboard docs | No direct eval coverage | No eval rerun needed for doc-only clarification | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The implementation could silently overfit to the repo’s own manifests and stop working for initialized downstream projects with thinner artifacts | Keep evidence adapters additive and fail closed to “unknown” or lower readiness when artifacts are absent |
| Parsing free-form source-assessment or assessment prose could become brittle and hard to trust | Prefer explicit signals first: source attribution headers, manifest expected-card tables, config JSON, and signal-queue JSONL. Limit prose parsing or avoid it entirely unless needed for one bounded field |
| The richer renderer could become noisy and unreadable in the terminal | Keep the bars, add only a compact reason line per area, and cover layout in deterministic tests |
| Users could misread missing grade evidence as “quality is fine” | Render missing persisted grade evidence explicitly as unknown when it matters to the area state |
| This slice could drift into a full Raven session-start rewrite | Keep all work inside deterministic CLI/tooling and docs, leaving conversational synthesis to Raven |

## Implementation Steps

1. Write this repo-specific plan for issue `#454`.
2. Extend scoreboard path/config parsing to collect intake and gap-analysis signals from `alexandria-config.json`.
3. Add source attribution parsing for `docs/alexandria/sources/` and manifest-backed area-to-card mapping extraction from manifest files.
4. Add unresolved-claim parsing for `signal-queue.jsonl` and map claim pressure onto affected areas/cards when evidence exists.
5. Refactor the derivation model so each area exposes fill plus compact session-state evidence: source presence/readiness, mapping basis, mapped-card status, unresolved blockers, and quality awareness (`passing` / `blocked` / `unknown`).
6. Update renderer output to show short truthful reason lines beneath each area or bucket without discarding the current bar layout.
7. Add realistic deterministic tests for raw-material, build-ready, card-built-but-blocked, unresolved-claim, and quality-unknown cases.
8. Run focused scoreboard tests, then `bun run check`, then `bun test`.
9. Perform a local diff review against the issue, the derivation spec, and the renderer output.
10. Update or open the PR against `main` from `symphony/454`.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/454-scoreboard-session-state-contract/plan.md` exists and matches the repo slice.
2. `alxndr scoreboard derive` emits richer deterministic session-state evidence beyond bucket averages and slot fill.
3. `alxndr scoreboard render` surfaces missing/blocked/thin/unknown state clearly enough for Raven room-open use.
4. The command is explicit about which quality signals are unknown because persisted Conan grade evidence is absent.
5. Deterministic tests prove realistic session-state cases rather than only synthetic fill percentages.
6. Relevant repo checks pass locally.

## Deferred Follow-Ups

1. Introduce a stable persisted Conan grade artifact if the product wants scoreboard quality awareness to move beyond `unknown` / queue-blocked / inferred card presence.
2. Wire the richer scoreboard fields directly into Raven’s returning-session and first-session room-open procedures.
3. Revisit whether health-check and scoreboard should share a common state-evidence helper once both surfaces stabilize on the same operational artifacts.
