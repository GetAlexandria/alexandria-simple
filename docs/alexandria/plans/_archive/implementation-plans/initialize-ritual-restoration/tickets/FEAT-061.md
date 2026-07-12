---
id: FEAT-061
title: "Split raven.md Job Dispatch into first-session and returning-session jobs"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-062, FEAT-064]
cards: [Agent - Raven the Maven, Artifact - Decision: Single Entry Point]
---

## Motivation

`job-initialize.md` collapsed first-time initialization and returning-session room-management into one procedural blob. The first move is to separate them in the job dispatch surface so each job can be built against its own scope.

## Description

Update `agents/raven.md` Job Dispatch table: replace the `Initialize — Library Configuration` row with two rows: `First Session — Fresh Initialize` (trigger: `alexandria-config.json` absent) and `Returning Session — Room Open` (trigger: `alexandria-config.json` present). Create stub `skills/raven/job-first-session.md` and `skills/raven/job-returning-session.md` with frontmatter + structure only (content lands in FEAT-062 and FEAT-064). Delete `skills/raven/job-initialize.md` after FEAT-062 and FEAT-064 land, OR in the same PR if scope allows a bundled refactor.

## Context

`Artifact - Decision: Single Entry Point` is load-bearing: the human always invokes `/library`, and the router is invisible. This ticket changes internal job dispatch, not the user-facing command surface. The router dispatch lives in the table (existing pattern) — no new `job-router.md` abstraction.

## Acceptance Criteria

- [ ] `agents/raven.md` Job Dispatch has two entries replacing the old Initialize entry, each with explicit trigger condition
- [ ] Stub `job-first-session.md` and `job-returning-session.md` exist with correct frontmatter and placeholder sections
- [ ] No remaining references to `job-initialize.md` in the codebase (`grep` clean)
- [ ] Raven eval coverage still routes correctly — the stubs at minimum exit with `BLOCKED` and a clear message until content lands

## Implementation Notes

The old `job-initialize.md` can be deleted in this ticket as long as the stubs exist and exit cleanly. If you're worried about a bisect window where neither old nor new procedure is functional, keep the old file and land its deletion in FEAT-062/FEAT-064. Check that `skills/raven/expert-calibration.md` and other shared reference files are still loaded by the new stubs (they'll be wired up properly in FEAT-062/FEAT-064).
