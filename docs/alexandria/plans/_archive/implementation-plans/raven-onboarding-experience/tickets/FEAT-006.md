---
id: FEAT-006
title: User adds more sources during slot review
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-004, FEAT-005]
blocks: [FEAT-007]
cards: [Capability - Raven, System - Viewer Next, System - Alexandria Next Runtime]
---

## Motivation

Source intake is not a one-time wizard step. During review, Raven or the user may discover that more context is needed. The user must be able to add another source without losing existing slot decisions.

## Description

Support adding additional sources while Vision onboarding is already in progress and slots may be `needs_review`, `approved`, or `skipped`. New source items attach to Vision, appear in the source strip, and can be used by Raven in subsequent slot updates without resetting existing work.

## Context

This ticket proves the non-linear flow: sources are shared context that can enter Alexandria at any point, not a phase that must be completed before slot review begins.

## Acceptance Criteria

- [ ] The user can add another source while at least one slot is `needs_review`.
- [ ] The user can add another source after at least one slot is `approved`.
- [ ] The user can add another source after at least one slot is `skipped`.
- [ ] Adding a source does not clear existing slot text/status.
- [ ] Approved slots stay approved unless explicitly edited.
- [ ] Skipped slots stay skipped unless reopened.
- [ ] The new source appears in the Vision source strip and in `sourceItemIds`.
- [ ] Raven can be pinged or continue after the new source is added.

## Verification

### Web UI

- [ ] Put Vision into mixed slot state: one `needs_review`, one `approved`, one `skipped`.
- [ ] Add a new source and verify all existing slot states remain unchanged.
- [ ] Verify the new source appears in the source strip without navigating away.
- [ ] Trigger or simulate Raven continuing after the new source is present.

### CLI

- [ ] Inspect the ledger and verify the later source addition emits `source.added` and `raven.vision.source_attached`.
- [ ] Inspect runtime state and verify prior slot statuses are unchanged.
- [ ] Verify Raven's next slot update can see the expanded `sourceItemIds`.
- [ ] Regression tests cover adding sources during mixed slot states.

## Implementation Notes

Re-use the source intake path from FEAT-004. This ticket is about preserving and proving workflow continuity during review.
