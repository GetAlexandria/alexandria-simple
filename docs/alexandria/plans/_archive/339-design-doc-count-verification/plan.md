# Issue 339 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#339`
- Goal: complete FEAT-039 by hardening `alxndr lint counts <path>` so sweep 6 verifies designated count claims for knowledge areas, card types, and agents against the repo's actual source-of-truth data.
- Linked product plan: `docs/alexandria/implementation-plans/architecture-review-hardening/release.md` (FEAT-039, Outcome O-2); related earlier slice: `docs/alexandria/plans/304-alxndr-lint-counts/plan.md`

## Scope

- Keep `alxndr lint counts` as the deterministic sweep-6 entry point for prose count verification.
- Replace the current broad directory scanning with an explicit designated-doc rule table so the target can safely expand coverage without auditing every numeric phrase in `docs/` or `skills/`.
- Add agent-count verification based on the real agent definitions on disk.
- Extend knowledge-area/card-type verification to the design and wizard docs that contain canonical structural claims.
- Add black-box tests for matching and mismatching agent claims, designated wizard-doc coverage, and non-designated example content that must stay ignored.

## Non-Goals

- Generic fact checking over arbitrary prose or all markdown in the repo.
- Auto-fixing stale claims.
- Changing agent/skill prose unless a touched doc becomes inaccurate because of the implementation.
- Expanding beyond stable structural counts such as agents, card types, and knowledge areas in this slice.

## Current Gap

- The repo already has `alxndr lint counts`, but it only knows `knowledge areas` and `card types`.
- The current scan roots are `README.md`, `docs/design/`, and `skills/`, which means issue-identified wizard docs are not checked.
- The current implementation relies on broad path scanning plus regex matching. That is acceptable for the first two phrases, but it becomes too noisy for broader issue coverage because wizard docs and templates include example counts that are not canonical claims.
- The issue acceptance explicitly requires agent counts at minimum, and the current implementation has no agent-count source of truth or rule.

## Architectural Boundaries

- Keep count verification in `src/tools/lint-counts.ts` as an explicit deterministic rule engine, not a generalized prose parser.
- Model the rules as designated file + phrase match + count provider tuples so count behavior stays reviewable and testable.
- Count sources of truth must come from real repo state: wizard catalog file for knowledge areas, `KNOWN_TYPES` for card types, and agent definitions on disk for agent counts.
- Do not widen sweep 6 into a repo-wide markdown crawl; designated artifacts should remain opt-in and source controlled.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Sweep-6 count engine | `src/tools/lint-counts.ts` | Count verification shifts from broad scan roots to designated file/rule coverage; adds agent counts and wizard-doc checks |
| Unified lint surface | `src/tools/lint-core.ts`, potentially `src/cli/lint.ts` help text if wording needs accuracy | User-facing target continues to be `counts`, but its described scope may need to reflect wizard-doc and agent coverage |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` if help text changes | Black-box tests cover new matching/mismatching designated claims and protect against noisy false positives |
| Repo planning docs | `docs/alexandria/plans/339-design-doc-count-verification/plan.md` | Captures the repo-specific gap between the existing implementation and FEAT-039 acceptance |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None expected; this is CLI behavior only | None |
| Product skills | `skills/nit/sweeps.md` documents the designated-doc `counts` target and includes agent-count verification in the counts family description | Rerun Nit evals if that skill doc changes |
| Contributor skills | None | None |
| CLI tools | `alxndr lint counts <repo-root>` verifies designated knowledge-area, card-type, and agent claims across the canonical docs in scope | Update tests in the same slice; adjust help text only if the current summary becomes misleading |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Count target coverage | `bun test src/tools/lint.test.ts` | Verifies the target end-to-end with fixture repos and designated docs |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms the subcommand surface still documents and routes `counts` correctly if help text changes |
| Repo quality gate | `bun run check` | Covers formatting, markdown, lint, and typecheck for the touched slice |
| Regression suite | `bun test` | Confirms the expanded count rules do not regress the wider Bun-native test suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Lint CLI behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior only |
| Nit skill wording | `skills/nit/sweeps.md` has eval-backed behavior if edited | Rerun only if that file changes | `bin/alexandria-eval run nit/all` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Expanding scan coverage to wizard docs starts flagging examples or templates instead of canonical structural claims | Move to an explicit designated-doc rule table and add fixture tests proving non-designated example docs stay ignored |
| Agent-count logic drifts from the real plugin state | Count actual agent definition files on disk rather than duplicating a constant |
| Help text or target wording drifts from the implementation scope | Review `counts` target descriptions alongside the implementation and update router/help tests if wording changes |
| Existing count behavior regresses while adding the new rules | Preserve current knowledge-area/card-type cases and extend the same black-box suite with agent and wizard cases |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/339-design-doc-count-verification/`.
2. Refactor `src/tools/lint-counts.ts` to express count checks as explicit designated file/rule entries with per-rule count providers.
3. Add an agent-count provider based on the checked-in `agents/*.md` definitions and wire a matching rule for canonical agent-count docs.
4. Extend designated file coverage to the wizard/design docs that make canonical knowledge-area or card-type claims without pulling in example-heavy docs.
5. Add or adjust black-box tests for matching and mismatching agent claims, wizard-doc claim coverage, and ignored non-designated example content.
6. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint counts <repo-root>` verifies designated count claims for knowledge areas, card types, and agents.
2. At minimum, canonical README/design/wizard docs containing those claims are checked.
3. Mismatching designated claims emit warning findings with claimed and actual values.
4. Matching designated claims emit no findings.
5. Example-heavy or non-designated docs remain out of scope unless explicitly listed.
6. Deterministic CLI tests cover the new designated-rule behavior.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Add more structural count families only when a repo artifact has a clear source of truth and a stable designated surface.
2. If FEAT-043 rewrites Nit references after Nit retirement lands, revisit the agent-count designated docs so stale references do not linger.
