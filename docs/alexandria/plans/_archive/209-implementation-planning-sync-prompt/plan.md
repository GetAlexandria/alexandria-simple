# Technical Plan: Issue 209 Implementation Planning Sync Prompt

- Issue reference: `#209` — `[POLISH-005] Add sync prompt to implementation planning Step 9`
- Goal: make the implementation-planning skill surface the next-step ticket-sync workflow in its Step 9 summary so users can discover `/alexandria:sync-tickets` immediately after a plan is written
- Linked product plan: none linked from the issue; product intent comes from the issue summary and adjacent planning-polish work

## Scope

- Update the Step 9 summary template in `skills/implementation-planning/SKILL.md`
  to include an optional follow-up line pointing users to `/alexandria:sync-tickets`
- Keep the prompt phrased as a discoverability hint after planning completes, not as
  an automatic next step or required action
- Validate the change with the repo build gates plus the required eval coverage for
  the implementation-planning skill surface

## Non-Goals

- Changing the implementation-planning artifact format beyond the Step 9 summary text
- Changing `skills/sync-tickets/SKILL.md` or `src/tools/sync-issues.ts`
- Auto-running ticket sync from the planning skill
- Broad README or design-doc edits; active docs already mention `/alexandria:sync-tickets`
- Adding new eval cases unless the existing implementation-planning coverage proves insufficient

## Linked Product-Plan Summary

- The issue describes planning and ticket sync as a natural sequential workflow
- The requested behavior is a light-touch summary addition that makes syncing discoverable
  without forcing it
- The user-facing wording should point to `/alexandria:sync-tickets` as the follow-up
  command for syncing the generated `tickets/` directory to GitHub issues

## Current Gap

- `skills/implementation-planning/SKILL.md` already has a Step 9 summary block, but it
  stops at `See release.md for full details.`
- The repo now ships a dedicated `sync-tickets` product skill, but the planning skill does
  not mention it at the point where users most naturally need it
- Users can finish planning without discovering the checked-in ticket-sync workflow unless
  they already know to look for it in the README or skill list

## Architectural Boundaries

- Keep the change inside the implementation-planning skill prompt text; do not duplicate
  sync CLI mechanics or merge planning and syncing into one workflow
- Preserve the planning/library boundary: Step 9 should still summarize the written plan,
  with the sync line framed as an optional next step after artifacts exist
- Keep the wording general-purpose for any Alexandria project, not specific to this repo’s
  labels, ticket prefixes, or GitHub process
- Rely on existing eval coverage for the planning skill surface unless the changed behavior
  exposes a missing gap

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product planning skill | `skills/implementation-planning/SKILL.md` | Step 9 summary now explicitly offers `/alexandria:sync-tickets` as the follow-up path for syncing plan tickets to GitHub issues |
| Repo technical planning | `docs/alexandria/plans/209-implementation-planning-sync-prompt/plan.md` | Records repo-specific scope, tests, evals, and risks for this issue slice |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `implementation-planning` | Final summary includes an optional sync prompt after `release.md` guidance | Rerun implementation-planning eval coverage and review checked-in eval outputs for transcript or scoring drift |
| `ticket-writer` | No direct prompt change, but this skill is part of the same eval-backed planning surface per repo policy | Rerun `ticket-writer/all` to satisfy the checked-in eval rule for implementation-planning surface changes |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo lint/type/doc gate | `bun run check` | Validates the modified skill markdown and repo-wide formatting/lint/type checks |
| Full deterministic suite | `bun test` | Confirms the planning-skill text change does not regress checked-in deterministic tests |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/implementation-planning/SKILL.md` | `implementation-planning/taskflow-realtime` | Rerun existing coverage because the user-facing summary behavior changes | `bin/alexandria-eval run implementation-planning/all` |
| Implementation-planning companion surface | `ticket-writer/standard-format` | Rerun per repo eval guidance for `skills/implementation-planning/*.md` changes | `bin/alexandria-eval run ticket-writer/all` |
| New eval coverage | Existing planning evals already exercise summary output | No new case expected unless current coverage fails to reach Step 9 or misses the sync discoverability behavior | none initially |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The summary text could imply ticket sync is mandatory or automatic | Phrase the line as an optional next step using “Want to…” language and keep it outside the core plan summary counts |
| The prompt could drift from the actual product-surface command name | Use the checked-in wrapper name exactly: `/alexandria:sync-tickets` |
| The Step 9 addition could degrade the planning skill’s eval-backed closing behavior | Rerun the implementation-planning and ticket-writer evals and inspect results before PR handoff |

## Implementation Steps

1. Add this repo-specific technical plan for issue `#209`.
2. Update the Step 9 summary template in `skills/implementation-planning/SKILL.md` to mention `/alexandria:sync-tickets` as an optional follow-up.
3. Review the prompt text for wording accuracy, optionality, and product-generic phrasing.
4. Run `bun run check`.
5. Run `bun test`.
6. Run `bin/alexandria-eval run implementation-planning/all`.
7. Run `bin/alexandria-eval run ticket-writer/all`.
8. Review eval `results` and `compare` output, then check in any required baseline updates.
9. Open or update the PR against `main` with the plan path, implementation summary, and verification notes.

## Acceptance / Exit Criteria

1. `docs/alexandria/plans/209-implementation-planning-sync-prompt/plan.md` exists with repo-specific scope, test, and eval guidance.
2. The Step 9 summary block in `skills/implementation-planning/SKILL.md` includes a discoverability line for `/alexandria:sync-tickets`.
3. The sync prompt is clearly optional and does not imply auto-sync behavior.
4. `bun run check` passes.
5. `bun test` passes.
6. `implementation-planning/all` and `ticket-writer/all` evals are rerun and reviewed.
7. A PR against `main` is opened or updated with the implementation and verification details.

## Deferred Follow-Ups

1. Consider a future planning-surface refinement if users need the Step 9 summary to include plan-path-specific sync guidance rather than a generic command hint.
2. Consider adding or tightening eval assertions around Step 9 discoverability if this kind of closing guidance keeps evolving.
