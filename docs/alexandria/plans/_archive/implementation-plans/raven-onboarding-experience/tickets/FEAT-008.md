---
id: FEAT-008
title: Knowledge Bank shows banked Vision
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-002, FEAT-007]
blocks: []
cards: [Capability - Raven, System - Viewer Next]
---

## Motivation

After banking, the user needs to understand what changed: Raven now has Vision banked, but the Library has not been atomized yet. The Knowledge Bank should show capability status, not a parallel card library.

## Description

Build the Raven Knowledge Bank status screen. It opens from Raven's Quick Bar and after Vision banking. Vision appears banked. Future subjects are visible but grayed out from the static subject manifest. The screen should not imply that Knowledge Bank subjects are Library cards.

## Context

Knowledge Bank state stores only project-specific subject progress. Locked and available future subjects are derived from the subject manifest and product rules.

## Acceptance Criteria

- [ ] Knowledge Bank opens from Raven's Quick Bar.
- [ ] After Vision banking, Knowledge Bank shows Vision as banked.
- [ ] Before Vision banking, Knowledge Bank does not falsely show Vision as banked.
- [ ] Future subjects are shown as grayed out/locked from the static manifest.
- [ ] The screen distinguishes Knowledge Bank status from Library cards.
- [ ] No source sliders, phase rail, or logo upload appears in this flow.

## Verification

### Web UI

- [ ] Open Knowledge Bank before Vision banking and verify Vision is not banked.
- [ ] Bank Vision and verify Knowledge Bank shows Vision banked.
- [ ] Verify future subjects are visible but disabled/grayed out.
- [ ] Verify the screen does not render atomized Library cards.

### CLI

- [ ] Verify Knowledge Bank UI state matches `ax2 inspect state --json`.
- [ ] Verify play unlock projection, if present, is computed from Knowledge Bank state and not stored in `agents.raven`.
- [ ] Run the viewer e2e path covering Home -> Vision -> Bank -> Knowledge Bank.

## Implementation Notes

Keep the visual language close to the prototype, but remove the prototype's modal/overlay ambiguity and phase rail dependency.
