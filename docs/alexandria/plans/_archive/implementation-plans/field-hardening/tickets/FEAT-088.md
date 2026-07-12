---
id: FEAT-088
title: "Rename plugin manifest name from alexandria to ax"
outcome: O-5
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-089, FEAT-090]
cards: [Artifact - Decision - Skill Naming Convention]
---

## Motivation

D-1 Option B: full namespace alignment. The plugin manifest `name` field becomes `ax`, matching the CLI and the slash-command prefix. This is the anchor for the entire rename — once the manifest is `ax`, every downstream surface follows.

## Description

Update `packages/alexandria-plugin/.claude-plugin/plugin.json` so `name: "ax"`. Propagate to any file or doc that references the plugin name as `alexandria` and should follow. Confirm Claude Code hosts still discover the plugin under the new name.

## Context

Decision recorded in `library-updates.md`. Breaking change — users with the plugin installed under `alexandria` will need migration (FEAT-090).

## Acceptance Criteria

- [ ] `plugin.json` `name` field is `ax`.
- [ ] Plugin loads in Claude Code under the new name.
- [ ] All internal references (docs, scripts, tests) that point at the plugin name have been updated or explicitly left for migration.
- [ ] Tests pass.

## Implementation Notes

This is a find-and-replace scoped tightly to `name` references in the plugin manifest, install scripts, and tests. Do not rename the `packages/alexandria-plugin/` directory in this ticket — that's a larger repo reorganization.
