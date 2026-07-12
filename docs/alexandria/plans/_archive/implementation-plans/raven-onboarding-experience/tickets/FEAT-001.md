---
id: FEAT-001
title: Home shows Raven connection state
outcome: O-1
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-002, FEAT-003]
cards: [Capability - Raven, System - Viewer Next]
---

## Motivation

The first screen needs to tell the user what is happening: Raven is either not connected yet or ready to be powered up. This ticket replaces the prototype's ambiguous "home behind overlays" with a clear Home state and agent shelf entry point.

## Description

Build the initial Alexandria Home state for Raven onboarding. The Home surface shows the bottom agent shelf, Raven's inert or glowing coin, and the correct CTA based on the existing runtime/plugin connection projection.

## Context

See `docs/alexandria/plans/_archive/raven-onboarding-experience/plan.md` and `CONTEXT_BRIEFING.md`. Raven is not top-level navigation. Connection state is not stored in `agents.raven`; for this slice, any Alexandria Next plugin connection means Raven is connected.

## Acceptance Criteria

- [ ] Home renders without the old `1.1` to `1.9` onboarding rail.
- [ ] Raven appears on the bottom agent shelf.
- [ ] When no plugin connection exists, Raven's coin is inert and Home shows `Connect Raven`.
- [ ] When the runtime reports a plugin connection, Raven's coin glows and Home shows `Power up Raven: Vision`.
- [ ] The logo is not the only way to return to Home/Library.
- [ ] Raven is not added to top-level navigation.

## Verification

### Web UI

- [ ] Open Viewer Next and verify disconnected Home shows an inert Raven coin and `Connect Raven`.
- [ ] Simulate or fixture connected state and verify Raven's coin glows and `Power up Raven: Vision` appears.
- [ ] Verify top navigation remains app-level and does not include Raven.

### CLI

- [ ] `ax2 inspect state --json` or the relevant runtime endpoint exposes enough connection projection for the viewer to choose inert vs glowing.
- [ ] No `agents.raven.connection` field is written to `alexandria-config.json`.
- [ ] Focused AX2/Viewer tests cover both connected and disconnected projections.

## Implementation Notes

Prefer the existing Viewer Next shell, top navigation, and agent shelf assets. Keep this ticket focused on Home state and the Raven coin affordance; do not build Vision onboarding yet.
