---
id: FEAT-048
title: "Unify Health Check and Quality Cycle as one play in the playbook"
outcome: O-6
tier: could
enabler: false
blocked-by: []
blocks: []
cards: [Capability - Health Check, Artifact - Play Definition, Artifact - Play Pattern]
---

## Motivation

Health Check (assess) and Quality Cycle (repair) are currently documented as separate plays but are really two phases of one workflow. Assessment without repair is a to-do list that rots. The playbook should reflect how the library actually gets maintained.

## Description

Update the playbook (`docs/design/playbook.md`) to document a single unified play:

**Play: Health Check + Quality Cycle**

Phase 1 — Assess:
- Conan: Grade (sample or full, depending on scope)
- Conan: Cascade Analysis (trace weak cards upstream)
- Human: Review report

Phase 2 — Repair (repeat until healthy):
- Conan: Diagnose root causes
- Conan: Recommend fixes (prioritized by blast radius)
- Human: Approve fixes
- Conan: Surgery plan
- Sam: Execute fixes
- Conan: Re-grade (delta report)
- → Loop if still below standard

Also update related library cards (Capability - Health Check, Play Definition, Play Pattern) to reference the unified play.

## Context

Source Alignment (phase 1) and Inventory Reconciliation (phase 2) from the current health check are being moved to continuous infrastructure (per the data layer conversation, deferred). The unified play assumes the library is structurally sound (CI-enforced) and focuses on content quality.

## Acceptance Criteria

- [ ] Playbook documents one "Health Check + Quality Cycle" play with Assess and Repair phases
- [ ] Grade (Job 2) positioned as a step within Assess, not standalone
- [ ] Old separate play definitions for Health Check and Quality Cycle consolidated
- [ ] Related library cards updated with unified play reference
- [ ] No functional change — same work happens, just documented as one play

## Implementation Notes

The playbook at `docs/design/playbook.md` is the primary target. Also update any Conan job files that reference the play structure. The tldraw architecture map already shows the unified view — use it as reference for the play structure.
