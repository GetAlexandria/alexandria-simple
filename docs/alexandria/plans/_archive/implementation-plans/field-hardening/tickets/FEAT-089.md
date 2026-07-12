---
id: FEAT-089
title: "Rename user-visible skills to /ax: prefix"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-088]
blocks: [FEAT-090]
cards: [Artifact - Decision - Skill Naming Convention]
---

## Motivation

D-1: rename everything. Every user-typed slash command begins with `/ax:`. No exceptions, including the flagship `/library` → `/ax:library`. Half-measures on namespacing never settle.

## Description

Rename every skill directory and command surface from `alexandria:<skill>` or bare `<skill>` to `ax:<skill>`. Update skill frontmatter, plugin manifest skill declarations, any doc that cites a command. CLI smoke tests must pass against the new names.

Skills to rename (non-exhaustive, verify at implementation):
- `/library` → `/ax:library`
- `/alexandria:plan` → `/ax:plan`
- `/complete-plan` → `/ax:complete-plan`
- `/alexandria:sync-tickets` → `/ax:sync-tickets`
- Every other user-visible skill in `packages/alexandria-plugin/skills/`

## Context

Depends on FEAT-088 (manifest rename). Anchored by [[Artifact - Decision - Skill Naming Convention]]. Reference pattern: Compound Engineering plugin uses `/<namespace>:<skill>` uniformly.

## Acceptance Criteria

- [ ] Every user-visible skill is invokable as `/ax:<skill>`.
- [ ] No skill is invokable under the old prefix unless explicitly aliased (FEAT-090).
- [ ] CLI smoke tests cover the new command surface.
- [ ] Plugin manifest skill declarations match the new names.

## Implementation Notes

The rename is mechanical but wide. Inventory the skill surface first, then apply. Maintainer-only skills under top-level `skills/` are out of scope — this is user-facing only.
