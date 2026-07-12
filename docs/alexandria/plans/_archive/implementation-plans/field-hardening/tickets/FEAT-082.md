---
id: FEAT-082
title: "Remove Raven handoff block from skill files and eval enforcement"
outcome: O-3
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-087]
cards: [Agent - Raven the Maven]
---

## Motivation

The Raven handoff block names agents in front of the user (Solomon, Conan) for a routing mechanism that doesn't exist yet — nothing reads those blocks and dispatches. It's pure orchestration-leak. Until real orchestration lands, the block is load-bearing only in evals, which means eval-enforced noise. Remove it now.

## Description

Strip the `## Raven Handoff` block requirement from:
- Raven's system prompt and agent definition
- Raven job files (`job-product-conversation.md`, `job-first-session.md`, `job-returning-session.md`)
- Eval cases that assert handoff-block presence or structure
- Any documentation that prescribes the handoff block's shape

Preserve the underlying signal — gaps, contested claims, card flags — but route them to the provenance log and feedback queue, not to user-facing prose.

## Context

See [[Agent - Raven the Maven]]. The handoff block was designed as a protocol for orchestration that never shipped. FEAT-087 (provenance writes) handles the real routing; this ticket just removes the leak.

## Acceptance Criteria

- [ ] Raven skill files no longer prescribe the handoff block format.
- [ ] Eval cases no longer assert handoff-block presence or structure.
- [ ] Responses that would have generated a handoff block are reviewed for signal loss.
- [ ] The signal-capture path is documented (provenance log + feedback queue).

## Implementation Notes

This is a clean delete-and-reroute, not a shape migration. Anyone reading a Raven response after this ticket should see only user-facing prose — no handoff block, no agent names.
