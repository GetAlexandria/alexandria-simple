---
id: FEAT-007
title: Bank Vision creates Raven's Source of Truth
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-003, FEAT-006]
blocks: [FEAT-008]
cards: [Capability - Raven, System - Alexandria Next Runtime, System - Viewer Next]
---

## Motivation

Banking Vision is the moment Raven gains durable context. The result should be a Raven-owned Source of Truth document and state transitions that the Knowledge Bank can trust.

## Description

Implement `Bank Vision`. When Vision is `ready_to_bank`, generate a simple Raven Source of Truth Markdown document from approved slot text, record its path and content hash, append `raven.source_of_truth.updated`, append `raven.vision.banked`, and update Raven onboarding/Knowledge Bank projections.

## Context

Raven's Source of Truth is an internal product context document. It is not a user-facing section map and does not generate Library cards in this slice.

## Acceptance Criteria

- [ ] `Bank Vision` is disabled until Vision is `ready_to_bank`.
- [ ] Banking writes or updates `docs/alexandria/source-of-truth/raven-product-context.md`.
- [ ] Raven state records Source of Truth path, content hash, createdAt, and updatedAt.
- [ ] Ledger includes `raven.source_of_truth.updated`.
- [ ] Ledger includes `raven.vision.banked`.
- [ ] Vision onboarding status becomes `banked`.
- [ ] Knowledge Bank subject `vision` becomes `banked`.
- [ ] No Library cards are generated.

## Verification

### Web UI

- [ ] Complete Vision review and verify `Bank Vision` enables.
- [ ] Click `Bank Vision` and verify the UI moves to a banked/completed state.
- [ ] Verify the user is taken to or offered Raven's Knowledge Bank after banking.

### CLI

- [ ] Verify the Source of Truth Markdown file exists at the expected path.
- [ ] Verify `alexandria-config.json` contains Raven Source of Truth metadata.
- [ ] Verify ledger events include `raven.source_of_truth.updated` and `raven.vision.banked`.
- [ ] Verify `ax2 inspect state --json` reports Vision and Knowledge Bank subject `vision` as banked.

## Implementation Notes

Use a simple deterministic Markdown structure built from approved slot text. Sophisticated SOT authoring and builder handoff are deferred.
