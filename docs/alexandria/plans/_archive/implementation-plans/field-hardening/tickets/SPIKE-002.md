---
id: SPIKE-002
title: "Research AskUserQuestion patterns across plugins and hosts"
outcome: O-4
tier: must
enabler: spike
blocked-by: []
blocks: [FEAT-086]
cards: [Standard - Top-1 Surfacing Rule]
---

## Motivation

O-4 requires a bounded-choice UI for multi-path forks. `AskUserQuestion` is the Claude Code primitive; other hosts (Codex, plain terminal) may not support it. Before implementing, we need a clear read on: how other plugins use the pattern, what host-capability detection looks like, and what graceful fallback should be.

## Description

Study two reference implementations:
- **Compound Engineering plugin** — https://github.com/EveryInc/compound-engineering-plugin
- **gstack** — https://github.com/garrytan/gstack

For each, extract: (a) how they invoke multi-choice UI, (b) whether they detect host capability, (c) what the fallback path looks like, (d) how they structure options (action-oriented vs descriptive). Produce a short design brief (`spike-output.md` in this plan directory) with a recommendation for Alexandria's pattern.

## Context

See [[Standard - Top-1 Surfacing Rule]] (being drafted in FEAT-080). Decision D-5 deferred this specifically to a spike because we don't yet know the right shape.

## Acceptance Criteria

- [ ] `spike-output.md` documents findings from both reference plugins.
- [ ] Brief recommends: invocation pattern, host-capability detection strategy, fallback shape, option structure.
- [ ] Brief includes concrete TypeScript snippets usable by FEAT-086.
- [ ] Planted re-planning trigger if the spike reveals the pattern requires a capability Alexandria can't supply.

## Implementation Notes

Budget: ~0.5 day. Time-box and produce the brief even if incomplete — findings inform FEAT-086 sequencing.
