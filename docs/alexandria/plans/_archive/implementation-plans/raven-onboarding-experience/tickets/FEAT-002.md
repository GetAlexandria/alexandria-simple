---
id: FEAT-002
title: Raven Quick Bar opens from the coin
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-008]
cards: [Capability - Raven, System - Viewer Next]
---

## Motivation

Agent-specific actions should live with the agent shelf. The prototype made Knowledge Bank feel like an orthogonal overlay, and closing it with `X` looked like navigating home. This ticket gives Raven a clear Quick Bar without promoting her to top-level navigation.

## Description

Add the Raven Quick Bar opened from Raven's coin. It should expose at least `Knowledge Bank` and `Ping Raven`, with clear disabled or empty states as needed. Closing the Quick Bar should close only that transient surface.

## Context

Raven's Quick Bar is the place for Raven-specific actions. `Knowledge Bank` is reachable here, but Raven is not a top-level navigation destination.

## Acceptance Criteria

- [ ] Clicking Raven's coin opens the Quick Bar.
- [ ] Clicking outside or a close affordance closes only the Quick Bar.
- [ ] Quick Bar includes `Knowledge Bank`.
- [ ] Quick Bar includes `Ping Raven` or a clearly disabled placeholder if the ping behavior is not ready.
- [ ] Quick Bar behavior does not rely on logo navigation or an overlay-as-home model.

## Verification

### Web UI

- [ ] Click Raven's coin and verify the Quick Bar appears.
- [ ] Click `Knowledge Bank` and verify it routes to or opens the Knowledge Bank status surface placeholder.
- [ ] Close the Quick Bar and verify Home/Library remains stable.

### CLI

- [ ] Verify no durable Raven state changes are emitted merely by opening or closing the Quick Bar.
- [ ] If `Ping Raven` is wired, verify its ledger/runtime event is visible from CLI inspection; if not wired, verify it is disabled and documented in the ticket result.

## Implementation Notes

Use the existing agent shelf visual language. Do not use a full-screen modal unless the existing Viewer pattern requires it; the Quick Bar should feel attached to Raven's coin.
