---
id: POLISH-005
title: "Add sync prompt to implementation planning Step 9"
outcome: O-3
tier: should
enabler: false
blocked-by: [POLISH-004]
blocks: []
cards: []
---

## Motivation

Planning and ticket sync are naturally sequential. After writing plan files, the
next logical step is often creating GitHub issues. Mentioning
`/alexandria:sync-tickets` in the planning skill's summary makes the workflow
discoverable without forcing it.

## Description

Add a line to the implementation planning skill's Step 9 summary template
offering to sync tickets to GitHub. Something like:

> Want to sync these tickets to GitHub issues? Run `/alexandria:sync-tickets`.

This is informational, not enforced -- the user chooses whether to sync. The
prompt should feel natural in the Step 9 summary context, not bolted on.

## Context

The implementation planning skill's Step 9 is the final summary step where plan
files have been written and the user sees a recap. This is the ideal moment to
surface the sync option because the user has a complete plan and is deciding what
to do next.

## Acceptance Criteria

- [ ] Step 9 template in `skills/implementation-planning/SKILL.md` includes sync prompt
- [ ] The prompt references `/alexandria:sync-tickets` by its correct invocation name
- [ ] The prompt is informational, not mandatory
- [ ] `bun run check` passes

## Implementation Notes

Read the current Step 9 content in the implementation planning skill to find the
right insertion point. The sync prompt should appear after the file-writing
confirmation but before any closing remarks.
