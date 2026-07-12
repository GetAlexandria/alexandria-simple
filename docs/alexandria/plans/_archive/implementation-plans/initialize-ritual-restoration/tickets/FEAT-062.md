---
id: FEAT-062
title: "Build first-session Initialize job with Task orchestration and restored ritual beats"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-061]
blocks: [FEAT-063, FEAT-064, FEAT-065, FEAT-066]
cards: [Agent - Raven the Maven, System - Wizard Configuration Engine]
---

## Motivation

This is the core deliverable. `job-first-session.md` restores the old wizard's linear ritual — extended with codebase scan and scoreboard display for 9 beats total: opening, scan consent, noun dialogue, configuration with confirmation gate, engine run, gap analysis, starter cards, scoreboard, Conan handoff — orchestrated via Claude Code Task primitives so beat ordering is enforced by the harness rather than prose discipline.

## Description

Build `skills/raven/job-first-session.md` as a linear ritual procedure. Each beat creates a Task via TaskCreate with explicit blocks/blockedBy. Tasks transition through in_progress → completed in order. When Task primitives are unavailable (non-CC harness), the job degrades to prose execution with no user-visible failure.

Beats (in order):
1. Opening — team intro, consent to scan codebase
2. Codebase scan — via `alxndr scan` (currently exists per scratchpad line 104)
3. Noun-proposal dialogue — load `noun-dialogue.md` and run it (fixes the orphan)
4. Configuration solicitation — three values (AI mode, domain novelty, product complexity) with inference-first then explicit-confirmation gate
5. Engine run — invoke Wizard Configuration Engine with confirmed values, receive tier assignments
6. Gap analysis — load `gap-analysis-flow.md`, run as explicit beat (not optional reference)
7. Starter card writes — Sam handoff for cards; Raven writes `alexandria-config.json` directly (assumes PR #393 merged)
8. Scoreboard display — derive + render a real scoreboard after the engine run. Derivation ships as `alxndr scoreboard derive <path>` (`src/tools/scoreboard-derive.ts`); rendering lives at `src/tools/scoreboard.ts`. Implementer decides how to wire them (render subcommand, direct script invocation, etc.)
9. Conan handoff — queue source assessment / grading as actionable next step

## Context

This depends on FEAT-061 (job dispatch split + stub file). The scoreboard CLI (`alxndr scoreboard derive`) already ships; this ticket's beat 8 wires it into the ritual. Raven's full diagnosis of the old-to-new procedural losses is in prior conversation; Bridget's briefing names the four primary cards bearing on this work. Pre-FEAT-045 wizard SKILL.md (commit `02ba02f`) is the depth reference for prompt content (FEAT-063 handles depth).

Anti-pattern: don't treat Tasks as a user-facing surface. TaskCreate calls are invisible mechanics per User Assumptions #4; the human sees progress, not tool calls.

## Acceptance Criteria

- [ ] `job-first-session.md` exists with all 9 beats in order, each a Task step
- [ ] Tasks created with explicit `blocks`/`blockedBy` dependencies reflecting beat order
- [ ] Configuration beat has an explicit confirmation gate (job halts until human confirms all three values)
- [ ] Noun-dialogue, gap-analysis-flow are explicitly invoked at the right beats
- [ ] Scoreboard beat displays a real scoreboard derived from config + library state (not agentically faked)
- [ ] Prose fallback path documented and exercised in a test run where TaskCreate is unavailable
- [ ] Eval case `initialize/first-session-empty-project` passes with all beats hit in order (structural check)

## Implementation Notes

Tasks are an execution aid. If the harness reports Task tools unavailable (via capability check at job entry), follow the prose procedure without creating tasks. The canonical spec is the prose procedure; Tasks mirror it.

Opening content must include: team intro (Raven + Sam + Conan + Bridget + Solomon), what /library is about to do, explicit consent to scan. This was Step 0 of old wizard; restore with the same beats.

Do not write `assessment.md` as a persisted artifact (FEAT-065 handles the kill but write this ticket's output assuming it's gone).
