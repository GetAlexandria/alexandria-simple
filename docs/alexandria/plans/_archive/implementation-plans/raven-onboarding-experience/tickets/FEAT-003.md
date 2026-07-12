---
id: FEAT-003
title: Vision onboarding supports manual slot review
outcome: O-2
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-004, FEAT-005, FEAT-007]
cards: [Capability - Raven, System - Viewer Next, System - Alexandria Next Runtime]
---

## Motivation

Vision is Raven's first power-up. The user must be able to fill and review the Vision slots directly, regardless of whether Raven has drafted anything yet. Manual editing is a permanent collaboration capability, not a fallback.

## Description

Build the Vision onboarding surface with nine slot cards from a static manifest. Add reducer-backed state for Vision onboarding and slots. Users can type/edit slot text, approve slots, skip slots, reopen skipped slots by typing, and see when `Bank Vision` becomes available.

## Context

Vision onboarding is active workflow state. Knowledge Bank is durable capability state. This ticket builds the workflow up to `ready_to_bank`; banking itself is handled later.

## Acceptance Criteria

- [ ] `Power up Raven: Vision` opens the Vision onboarding surface.
- [ ] The surface renders nine slots from a static manifest.
- [ ] Typing into an empty, approved, or skipped slot sets it to `needs_review`.
- [ ] Approving a slot sets it to `approved`.
- [ ] Skipping a slot clears text and sets it to `skipped`.
- [ ] Typing into a skipped slot reopens it as `needs_review`.
- [ ] `Bank Vision` is disabled until every slot is approved or skipped and at least one approved slot has non-empty text.
- [ ] `ready_to_bank` is computed by the reducer, not toggled directly by the UI.

## Verification

### Web UI

- [ ] Open Vision onboarding from Home.
- [ ] Type into a slot and verify it becomes `needs_review`.
- [ ] Approve one slot and skip the rest; verify `Bank Vision` becomes enabled.
- [ ] Skip a slot with text and verify the text is cleared.
- [ ] Reopen a skipped slot by typing and verify `Bank Vision` disables until reviewed again.

### CLI

- [ ] `ax2 inspect state --json` or runtime state shows Vision status and slot statuses after each action.
- [ ] Ledger events include `raven.vision.started`, `raven.vision.slot.updated`, `raven.vision.slot.approved`, and `raven.vision.slot.skipped` as applicable.
- [ ] Focused AX2 tests prove reducer transitions, including `ready_to_bank`.

## Implementation Notes

Keep slot definitions out of user config. Initialize all nine slot records when Vision starts. This ticket may add the Raven state schema, reducer, and runtime endpoints needed for this screen.
