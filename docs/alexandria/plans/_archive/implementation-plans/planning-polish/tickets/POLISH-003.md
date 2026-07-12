---
id: POLISH-003
title: "Move release skill to contributor-skills/"
outcome: O-1
tier: must
enabler: false
blocked-by: [POLISH-001]
blocks: []
cards: []
---

## Motivation

The `release` skill cuts releases of Alexandria itself. It is a repo-maintainer
workflow, not a product surface that end users invoke. Shipping it as a plugin
skill would expose it to every Alexandria user, which is confusing and
potentially dangerous. Contributor skills live in `contributor-skills/` and are
only installed for local development via `scripts/setup-dev`.

## Description

Move `skills/release/` to `contributor-skills/release/`. Remove the `requires:`
block from the skill's frontmatter since contributor-skills don't participate in
model routing. Verify that `scripts/setup-dev` handles contributor-skills
discovery (it should already -- check the existing pattern).

## Context

The `contributor-skills/` directory is for repo-maintainer workflows that are
exposed locally via `scripts/setup-dev` but not shipped as plugin skills to end
users. The release skill fits this pattern exactly.

## Acceptance Criteria

- [ ] `skills/release/` no longer exists
- [ ] `contributor-skills/release/SKILL.md` exists and contains the release procedure
- [ ] `requires:` block is removed from the skill's frontmatter
- [ ] `scripts/setup-dev` registers contributor-skills for local development
- [ ] No other files reference `skills/release/` by path
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Check `scripts/setup-dev` for the contributor-skills registration pattern. It
should glob `contributor-skills/*/SKILL.md` or similar. If it doesn't handle the
new skill automatically, update the script.
