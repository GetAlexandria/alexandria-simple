---
id: FEAT-005
title: Raven collaborates slot-by-slot from the CLI
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-003, FEAT-004]
blocks: [FEAT-006]
cards: [Capability - Raven, System - Alexandria Next Runtime, System - Viewer Next]
---

## Motivation

The prototype's most important mechanic is Raven participating in the onboarding flow. Raven should write one slot, wait for the user's feedback, and continue from the current state rather than bulk-filling an invisible form.

## Description

Add the CLI/runtime path that lets Raven update Vision slots. A Raven-written update should appear in the Web UI, mark the slot `needs_review`, and preserve all other slot/source state. User approve/skip/edit feedback must be visible back to Raven through projected state or ledger events.

## Context

This ticket centers the two-surface collaboration model. The Web UI is where the user reviews. The CLI/plugin side is where Raven participates. Manual editing remains supported.

## Acceptance Criteria

- [ ] Raven can update a single Vision slot through a CLI/runtime path.
- [ ] Raven-written text appears in the corresponding slot.
- [ ] The slot becomes visibly `needs_review`.
- [ ] Existing approved/skipped/needs-review slots are not reset by Raven updates.
- [ ] User approve, skip, and edit feedback is visible to Raven through state or events.
- [ ] Raven can continue slot-by-slot using the current projected state.

## Verification

### Web UI

- [ ] With Vision open, trigger a Raven slot update and verify the slot text appears.
- [ ] Verify the updated slot is visually marked `needs_review`.
- [ ] Approve the slot in the UI and verify the status changes.
- [ ] Skip a later Raven-written slot and verify text clears.

### CLI

- [ ] Trigger a Raven slot update from the CLI/plugin path or a deterministic test command that uses the same runtime endpoint.
- [ ] Verify the ledger contains `raven.vision.slot.updated`.
- [ ] After Web UI approval/skip, verify Raven can read the updated state or events before issuing the next slot update.
- [ ] Tests prove slot-by-slot updates preserve unrelated slot state.

## Implementation Notes

If the final plugin play is not ready, add the smallest deterministic runtime path needed to exercise the same event/reducer behavior. Do not make Raven bulk-fill every slot in this ticket.
