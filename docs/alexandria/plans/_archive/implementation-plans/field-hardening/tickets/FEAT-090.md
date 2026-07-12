---
id: FEAT-090
title: "Upgrade migration for plugin rename"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-088, FEAT-089]
blocks: [FEAT-091]
cards: [Artifact - Decision - Skill Naming Convention]
---

## Motivation

Users who installed Alexandria under the `alexandria` plugin name and muscle-memorized `/library` will hit "unknown command" or "plugin not found" after the rename unless the upgrade path handles both sides.

## Description

Two upgrade surfaces:
1. **Plugin-name migration** — `ax update` (or the installer) detects an existing `alexandria` plugin install and either migrates it to `ax` or prints a clear manual-migration hint.
2. **Command redirect** — old slash commands (`/library`, `/alexandria:plan`, etc.) produce a deprecation message with the new command to use. Redirect, not silent failure.

## Context

Depends on FEAT-088, FEAT-089. Breaking-change discipline: users deserve a clear signal, not a broken session.

## Acceptance Criteria

- [ ] `ax update` surfaces a migration path for old-name installs.
- [ ] Old slash commands produce a deprecation message listing the new command.
- [ ] Migration is documented in the release note (FEAT-091).
- [ ] Install smoke tests cover: clean install under new name, upgrade from old name, old-command deprecation message.

## Implementation Notes

Deprecation message is temporary — likely removed a release or two after the rename. Document the removal target in the skill deprecation beat.
