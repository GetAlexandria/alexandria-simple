---
id: FEAT-064
title: "Build returning-session job with git-log drift detection"
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-061, FEAT-062]
blocks: [FEAT-065, FEAT-066]
cards: [Agent - Raven the Maven]
---

## Motivation

The returning-session path needs its own job, not a branch of first-session. The current 19-step session-start procedure has 8 steps devoted to greenfield-to-brownfield detection via directory heuristics — that's one case of drift detection, over-specified. Replacing it with `git log --since=<config date>` compresses the procedure and generalizes the capability.

## Description

Build `skills/raven/job-returning-session.md` as a returning-session orientation procedure. It runs when `alexandria-config.json` is present. Beats:
1. Read config + library state
2. Render scoreboard — derive + render via the same wiring FEAT-062 establishes
3. Drift detection via `git log --since=<config.date>` — surface what changed in the codebase since last init
4. Check for completed implementation plans (tickets closed since last session) and surface as nudge (per scratchpad line 110)
5. Concierge-style opening that combines state read + top-1 nudge + open invitation (per scratchpad lines 32-33)
6. Dispatch based on what the human says next (product conversation, gap work, plan close-out, etc.)

Steps 1-3 can use `alxndr` subcommands where they exist. Step 4 needs a lightweight check — scan implementation-plans/*/release.md for status:planning with recently-merged ticket PRs.

## Context

Scratchpad findings bearing on this ticket: lines 111 (use git for drift), 113 (drift done differently in two places — unify here), 140 (session-start over-specified), 110 (check completed plans on session-start), 32-34 (three-tier interaction model + concierge greeting).

## Acceptance Criteria

- [ ] `job-returning-session.md` exists with the 6 beats
- [ ] Drift detection uses `git log --since=<config.date>`, not directory heuristics
- [ ] Scoreboard beat displays a real scoreboard derived from config + library state
- [ ] Completed-plan check runs and surfaces as a top-1 nudge when relevant
- [ ] Procedure length is < half of the old session-start in `job-initialize.md`
- [ ] Eval case `initialize/returning-session-with-drift` verifies drift detection surfaces new files and the correct nudge

## Implementation Notes

Concierge greeting pattern (scratchpad 32-33) is state-driven orientation: one-line state read + top-1 nudge + open invitation. Don't over-engineer — this is a returning-session opening beat, not a new capability. Build it inline.

Out of scope here: three-tier interaction model card (scratchpad 31) — that's a separate future card, not required for this ticket's drift-detection + concierge work.
