---
id: POLISH-004
title: "Create sync-tickets skill wrapper"
outcome: O-2
tier: must
enabler: false
blocked-by: [POLISH-001]
blocks: [POLISH-005]
cards: []
---

## Motivation

The `bin/alexandria-sync-issues` CLI tool syncs plan tickets to GitHub issues but
requires manual invocation with directory arguments. Wrapping it as a skill makes
it discoverable in the plugin surface and invocable by agents. Users who just
finished planning can sync without leaving the conversation.

## Description

Create `skills/sync-tickets/SKILL.md` wrapping the existing
`bin/alexandria-sync-issues` CLI tool. The skill procedure should:

1. Detect which plan to sync -- ask the user or infer from context (e.g., if the
   user just finished planning, use that plan's directory)
2. Run `bin/alexandria-sync-issues <plan-dir> --dry-run` and present what would
   happen (tickets to create, already existing, etc.)
3. Confirm with the user before proceeding
4. Run `bin/alexandria-sync-issues <plan-dir>` (and optionally `--update` if
   issues already exist and need updating)
5. Report results: created, exists, updated, failed

Default sync target is GitHub. Future targets can be added via arguments.

The skill's `name:` field should be `sync-tickets`. Include a `requires:` block
in frontmatter assessing capability needs across the four dimensions (adherence,
reasoning, precision, volume).

## Context

The CLI tool at `bin/alexandria-sync-issues` (implemented in
`src/tools/sync-issues.ts`) already handles the mechanical work: parsing plan
tickets, creating/updating GitHub issues via `gh`, and reporting results. The
skill adds the conversational layer: context detection, dry-run preview, user
confirmation, and results summary.

## Acceptance Criteria

- [ ] `skills/sync-tickets/SKILL.md` exists with proper YAML frontmatter
- [ ] Skill `name:` is `sync-tickets`
- [ ] Skill includes a `requires:` block
- [ ] Skill procedure includes: plan detection, dry-run preview, confirmation, execution, results
- [ ] Skill is invocable as `/alexandria:sync-tickets`
- [ ] `bun run check` passes (markdown lint, frontmatter format, etc.)

## Implementation Notes

Study the existing skill files for frontmatter format conventions. The
`requires:` block should assess this as low-reasoning (wrapper), medium-adherence
(must follow the dry-run/confirm/execute protocol), low-precision, low-volume.
