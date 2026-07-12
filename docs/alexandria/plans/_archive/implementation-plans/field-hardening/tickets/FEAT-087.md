---
id: FEAT-087
title: "Provenance log captures orchestration handoffs"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-082]
blocks: []
cards: [Standard - Agent Name Curtain]
---

## Motivation

After FEAT-082 removes the user-facing handoff block, the underlying signal (which agent was dispatched for what) still needs to go somewhere. Provenance log is the right home — it's behind the curtain, available for debugging, and Jess noted "one day will be db."

## Description

When Raven dispatches an agent via the Agent tool, write a provenance record: timestamp, dispatched agent, task summary, outcome. The log is append-only at `docs/alexandria/provenance-log.jsonl`. Feedback queue handles user-visible gaps (this is not new).

## Context

Anchored by [[Standard - Agent Name Curtain]] (FEAT-080). Scratchpad "Raven → Solomon handoff is manual" (line 117) captures the underlying problem; this ticket is the library-side piece (log writes), not the full orchestration wiring.

## Acceptance Criteria

- [ ] Raven writes a provenance-log entry on every Agent-tool dispatch.
- [ ] Log format matches existing `provenance-log.jsonl` schema (or extends it with a documented migration).
- [ ] Log is append-only; no structural rewrites.
- [ ] Tests cover: write on dispatch, append semantics.

## Implementation Notes

Keep the schema simple. Future DB migration is cleaner if the JSONL is already schema-stable.
