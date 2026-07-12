---
id: POLISH-002
title: "Remove context-library-upgrade compatibility alias"
outcome: O-1
tier: must
enabler: false
blocked-by: [POLISH-001]
blocks: []
cards: []
---

## Motivation

The `context-library-upgrade` skill was a compatibility alias from the 0.7.0
rename (Alexandria was previously called "context library"). No external users
exist yet -- this is pre-preview. Carrying a dead alias into preview creates
confusion and maintenance burden.

## Description

Delete the `skills/context-library-upgrade/` directory entirely. Then verify no
other files reference `context-library-upgrade` as an invocation target or
redirect.

## Context

This alias was created during the Alexandria rename to preserve backward
compatibility for anyone who had muscle memory for the old name. Since Alexandria
has not yet reached preview release, there are no external users to break.

## Acceptance Criteria

- [ ] Directory `skills/context-library-upgrade/` no longer exists
- [ ] No other files reference `context-library-upgrade` as an invocation target
- [ ] `bun test` passes
- [ ] `bun run check` passes

## Implementation Notes

Search the entire repo for `context-library-upgrade` after deletion to catch any
stale references in docs, agents, or other skills.
