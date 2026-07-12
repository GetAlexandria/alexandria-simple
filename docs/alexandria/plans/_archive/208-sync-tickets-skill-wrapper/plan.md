# Technical Plan: Issue 208 Sync Tickets Skill Wrapper

- Issue reference: `#208` — `[POLISH-004] Create sync-tickets skill wrapper`
- Goal: add a product skill that wraps `bin/alexandria-sync-issues` so users can preview and confirm plan-to-GitHub ticket sync from the Claude Code plugin surface
- Linked product plan: none linked from the issue; product intent comes from the issue summary and acceptance criteria for `#208`

## Scope

- Add `skills/sync-tickets/SKILL.md` with repo-standard frontmatter, a short canonical `name:`, and an explicit dry-run → confirm → execute workflow
- Keep the skill grounded in the existing `bin/alexandria-sync-issues` CLI contract instead of introducing a second sync mechanism
- Add the smallest active doc update needed to make the new skill discoverable outside the raw plugin directory layout

## Non-Goals

- Changing `src/tools/sync-issues.ts` or the sync CLI behavior
- Adding non-GitHub sync targets in this slice
- Reworking `skills/implementation-planning/` or auto-invoking sync as part of planning
- Adding eval-harness coverage for this new wrapper in this ticket
- Changing historical plans or frozen docs just to mention the new command

## Linked Product-Plan Summary

- The issue frames this as a wrapper around existing deterministic sync behavior, not a new planning or GitHub subsystem
- The required flow is: detect plan, run dry-run preview, confirm with user, execute sync, and report results
- The issue explicitly requires `name: sync-tickets`, a `requires:` block, and plugin-surface invocation as `/alexandria:sync-tickets`
- Issue comments add a repo execution constraint for this ticket: skip evals and rely on normal deterministic local checks only

## Current Gap

- The repo already ships `bin/alexandria-sync-issues`, which can dry-run or perform GitHub issue sync from a plan directory
- There is no product skill under `skills/` that exposes this capability conversationally through the plugin surface
- Without a wrapper, users must know the CLI exists and manually supply the right plan directory from the shell

## Architectural Boundaries

- Keep the new behavior in a product skill under `skills/`; do not duplicate sync logic in prompt text
- Preserve the CLI as the single mechanical implementation of ticket sync; the skill should only orchestrate user interaction and command selection
- Keep the wording product-agnostic: plan detection and result reporting must work for any project using Alexandria, not one repository’s ticket taxonomy
- Limit doc edits to active user-facing guidance. Do not churn historical implementation plans or eval artifacts

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product skill wrapper | `skills/sync-tickets/SKILL.md` | Adds a new canonical slash-command that guides users through plan selection, dry-run preview, confirmation, execution, and result reporting for ticket sync |
| User-facing docs | `README.md` | Adds a small pointer so the new skill is discoverable in active docs without editing existing eval-backed skills |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `sync-tickets` | New canonical product skill exposed as `/alexandria:sync-tickets` | Keep frontmatter consistent with repo conventions and ground procedure in the current CLI flags |
| Existing planning and briefing skills | No behavior change in this slice | Avoid touching them so no additional eval-backed surfaces move |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown/frontmatter/doc formatting and any repo-wide lint gates impacted by the new skill file |
| Full deterministic suite | `bun test` | Confirms the new skill/doc slice did not accidentally regress packaging, setup, or CLI-adjacent tests |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `skills/sync-tickets/SKILL.md` | None | No eval run in this ticket per issue guidance; validate with deterministic checks and manual review | none |
| Existing eval-backed product skills | Existing suites remain unchanged | No reruns because their files and behavior stay untouched in this slice | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The skill could drift from the actual CLI contract and tell users to run flags or flows the tool does not support | Base the procedure directly on `src/tools/sync-issues.ts` help text and existing dry-run/update behavior |
| The wrapper could become GitHub-specific in a brittle way that blocks future targets | State GitHub as the current default target while keeping the orchestration phrasing target-agnostic where possible |
| Discoverability could still be poor if the skill only exists as a new file with no active docs mention | Add one narrow README note rather than modifying broader eval-backed planning surfaces |

## Implementation Steps

1. Write this repo-specific technical plan for `#208`.
2. Add `skills/sync-tickets/SKILL.md` with `name: sync-tickets`, `requires:`, and a stepwise workflow covering plan detection, dry-run preview, confirmation, execution, and reporting.
3. Add a minimal active README mention so users see the new command in checked-in docs.
4. Review the diff for wording drift, command accuracy, and plugin-surface naming consistency.
5. Run `bun run check`.
6. Run `bun test`.
7. Open or update the PR against `main` with the plan path, implementation summary, and verification notes.

## Acceptance / Exit Criteria

1. `skills/sync-tickets/SKILL.md` exists with valid frontmatter.
2. The skill `name:` is `sync-tickets`.
3. The skill includes a `requires:` block aligned with the issue guidance.
4. The skill procedure explicitly covers plan detection, dry-run preview, confirmation, execution, and results reporting.
5. The skill is exposed via the plugin surface as `/alexandria:sync-tickets`.
6. `bun run check` passes.
7. `bun test` passes.

## Deferred Follow-Ups

1. Add non-GitHub sync targets if a later issue expands the transport surface.
2. Add eval-harness coverage for `sync-tickets` if this wrapper evolves into a more open-ended conversational skill with meaningful prompt risk.
