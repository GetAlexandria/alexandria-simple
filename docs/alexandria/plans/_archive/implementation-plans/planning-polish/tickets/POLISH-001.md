---
id: POLISH-001
title: "Rename skill name: fields to short names"
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [POLISH-002, POLISH-003, POLISH-004]
cards: []
---

## Motivation

Claude Code auto-prefixes plugin skills as `/alexandria:<name>`. Long hyphenated
names like `implementation-planning` become awkward invocations. Short names like
`plan` leverage the namespace cleanly. This must land first so downstream tickets
work against the final naming scheme.

## Description

Change the `name:` field in each SKILL.md frontmatter:

- `skills/initialize/SKILL.md`: `wizard` -- stays `wizard` (Danvers will rename to `library` later)
- `skills/implementation-planning/SKILL.md`: `implementation-planning` --> `plan`
- `skills/context-briefing/SKILL.md`: `context-briefing` --> `briefing`
- `skills/alexandria-upgrade/SKILL.md`: `alexandria-upgrade` --> `upgrade`

Also update `description:` fields if they reference old invocation names (e.g.,
"run `/implementation-planning`" should become "run `/alexandria:plan`").

Verify no agent files reference these skills by their old `/name` invocation
pattern. Check all files in `agents/` and `skills/` for stale references.

## Context

Claude Code plugin auto-namespacing means the `name:` field is the local part of
a namespaced invocation. The plugin manifest name is `alexandria`, so a skill
with `name: plan` becomes `/alexandria:plan`. No manual prefixing is needed.

## Acceptance Criteria

- [ ] Each renamed skill's `name:` field uses the new short name
- [ ] `description:` fields updated where they reference old invocation names
- [ ] No agent or skill files reference old invocation names
- [ ] Each renamed skill is invocable as `/alexandria:<short-name>`
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Use `grep -r` across agents/ and skills/ to find references to old names before
and after the change. The wizard skill name stays as-is per decision.
