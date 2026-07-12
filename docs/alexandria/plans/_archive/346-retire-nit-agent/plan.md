# Issue 346 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#346`
- Goal: retire the Nit runtime surface by deleting the Nit agent and skill files, removing the eval and routing references that depend on them, and updating the current docs/library summaries so Alexandria presents a five-agent active roster
- Linked product plan: [FEAT-046](../../implementation-plans/architecture-review-hardening/tickets/FEAT-046.md), [O-4](../../implementation-plans/architecture-review-hardening/outcomes/O-4.md), [architecture-review-hardening release](../../implementation-plans/architecture-review-hardening/release.md)

## Scope

- Add the issue-specific repo plan for the Nit retirement slice.
- Delete `agents/nit.md` and the `skills/nit/` directory.
- Delete Nit-only eval fixtures and checked-in eval results that would otherwise reference removed files.
- Update deterministic tests and routing/config documentation so no active repo checks depend on the deleted Nit files.
- Update the current user-facing summaries and the library cards explicitly called out by the ticket so the active roster is five agents and mechanical checks are described as CLI-owned behavior.

## Non-Goals

- Broadly rewriting historical design docs, archived release notes, or past technical plans that mention Nit as part of Alexandria history.
- Reworking `alxndr lint` behavior, changing lint targets, or revisiting the FEAT-043 CLI migration itself.
- Exhaustively scrubbing every library card that mentions Nit; this slice only updates the cards needed to make the current roster and current ownership summaries truthful.
- Standardizing agent file format; that belongs to FEAT-047.

## Current Gap

- The repo still ships `agents/nit.md` and `skills/nit/*`, even though FEAT-043 already moved active mechanical-check execution to `alxndr lint`.
- Deterministic tests, eval metadata, and routing guidance still point at Nit-specific files, so deleting the runtime surface without cleanup would break the repo.
- Current summary docs and the two library cards named by the ticket still present Nit as an active agent rather than a retired surface absorbed into the CLI.

## Architectural Boundaries

- Treat the CLI as the surviving authority for mechanical lint behavior; the Nit prompt/spec files are being retired, not replaced with new prompt surfaces.
- Keep the repo slice reviewable by updating only the active runtime, active validation assets, and current roster/capability summaries. Historical product-library discussion can remain as historical context unless it blocks truthful present-tense documentation.
- Preserve plugin behavior for Claude Code hosts: removing `agents/nit.md` should de-register Nit through auto-discovery without changing how the remaining five agents load.
- Do not invent a replacement Nit stub or archive directory in the live plugin surface; git history is the archive.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/346-retire-nit-agent/plan.md` | Records repo-specific scope, validation, and retirement boundaries for FEAT-046 |
| Agent / skill runtime | `agents/nit.md`, `skills/nit/` | Nit is no longer a loadable Claude Code agent or routed skill surface |
| Eval fixtures and baselines | `tests/eval-cases/nit/`, `tests/evals/nit/`, `EVALS.md`, `contributor-skills/targeted-evals/impact-matrix.md` | Repo eval guidance no longer advertises or stores Nit coverage for a removed surface |
| Deterministic routing and CLI docs | `src/tools/route.test.ts`, `config/model-routing.yaml`, `src/cli/main.ts` | Tests and help text stop depending on Nit-specific files or describing `lint` as Nit-owned |
| User-facing repo docs | `CLAUDE.md`, `README.md` | Active repo guidance and the published agent roster reflect five active agents and CLI-owned mechanical checks |
| Library cards | `docs/alexandria/library/product/governance/Governance - Agent Capability Matrix.md`, `docs/alexandria/library/product/artifacts/Artifact - Decision 5: Four Agents, Not One.md`, `docs/alexandria/library/product/agents/Agent - Nit the Picker.md` | Current product-library summaries shift from active Nit ownership to a historical retirement note and a five-agent current state |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Nit runtime surface | Removed entirely; there is no active Nit agent or routed Nit skill after this slice | Delete dependent eval assets, route tests, and help/config references |
| Remaining five agents | No new behavior; they continue using CLI-driven mechanical checks established by FEAT-043 | Keep current roster/count summaries aligned in README and library governance docs |
| Eval guidance | Nit is removed from the list of runnable product-surface evals | Delete Nit eval fixtures/baselines and document that no targeted rerun survives for a removed surface |
| Library roster summaries | Governance and decision cards describe the current five-agent active roster and record Nit as retired into CLI | Keep the Nit agent card historical rather than active so the library does not contradict the runtime surface |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Real lint surface | `bin/alxndr lint all . --json` | Confirms the repo still passes the shipped lint CLI after Nit file deletion and doc updates |
| Repo quality gate | `bun run check` | Required formatting, markdown, shell, lint, and typecheck gate for the touched surfaces |
| Regression suite | `bun test` | Ensures routing/tests/eval harness paths still work after removing Nit fixtures and references |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Nit agent / skill surface | Existing `nit/*` eval cases cover the surface being intentionally removed | Do not rerun; remove the obsolete cases and baselines because there is no surviving product surface to evaluate | Delete `tests/eval-cases/nit/` and `tests/evals/nit/` |
| Remaining agents and skills | Not behaviorally changed in this slice beyond previously completed FEAT-043 CLI ownership work | No targeted rerun planned | N/A |
| Contributor targeted-eval guidance | Currently advertises `nit/all` as runnable coverage | Update guidance to remove the retired surface | Covered by deterministic checks |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Deleting Nit files could leave hidden hard dependencies in tests or routing docs | Grep for `agents/nit`, `skills/nit`, and `nit/all` before and after edits, then run full deterministic gates |
| The slice could balloon into a whole-library Nit rewrite because many historical cards mention Nit | Limit library edits to the current roster/capability summaries and convert the Nit agent card into historical retirement context instead of chasing every historical reference |
| Removing eval assets could accidentally leave the repo advertising stale Nit coverage | Update both `EVALS.md` and the contributor impact matrix in the same slice, then verify no active docs still point to `nit/all` |
| User-facing docs could mix “five active agents” with present-tense Nit language | Update README, CLAUDE, CLI help text, and the key library cards together, then grep active surfaces for remaining present-tense Nit ownership wording |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/346-retire-nit-agent/`.
2. Delete `agents/nit.md`, `skills/nit/`, and the Nit-only eval fixture/baseline directories.
3. Update routing tests, CLI help text, model-routing comments, and eval guidance so no active validation or operator docs depend on Nit files.
4. Update `CLAUDE.md`, `README.md`, and the targeted library cards so the current roster is five agents and Nit is described as retired into the CLI rather than active.
5. Grep the active touched surfaces for stale Nit runtime references, then run `bin/alxndr lint all . --json`, `bun run check`, and `bun test`.
6. Perform a local diff review, push the issue branch, and open or update the PR against `main` with the validation summary.

## Acceptance / Exit Criteria

1. `agents/nit.md` and `skills/nit/` no longer exist in the live plugin surface.
2. No active agent or skill file references Nit as a living runtime agent.
3. Deterministic tests, routing guidance, and eval docs no longer depend on Nit-specific files or `nit/all`.
4. README/CLAUDE/current roster summaries present five active agents and CLI-owned mechanical checks.
5. The library cards named by FEAT-046 reflect the five-agent current state, and the Nit agent card is no longer written as an active runtime surface.
6. `bin/alxndr lint all . --json`, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. Broader cleanup of historical library/design content that still discusses Nit as part of Alexandria’s earlier architecture can be handled in a dedicated documentation follow-up if needed.
2. FEAT-047 can standardize the remaining five agent files once the retired Nit surface is gone.
