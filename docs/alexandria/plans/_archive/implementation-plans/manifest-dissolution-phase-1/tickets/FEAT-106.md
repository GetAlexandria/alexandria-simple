---
id: FEAT-106
title: "Defer card status and retirement rendering to ledger/archive design"
outcome: O-5
tier: could
enabler: false
blocked-by: []
blocks: []
cards: [Capability - Inventory]
---

## Motivation

Phase 1 originally included scoreboard rendering for built vs retired card
status. During FEAT-096 schema review, `status:` was removed from canonical
card frontmatter: active cards are derived from files present under the active
library, missing cards require the future expected-card/data layer, and retired
cards need an archive or ledger mechanism rather than a card-local flag.

That makes status rendering premature. The scoreboard should first become
accurate about card-to-area attribution (FEAT-103/FEAT-104). Lifecycle and
retirement visibility should wait until Alexandria has a real source of truth
for inactive cards.

## Description

No Phase 1 implementation is required for this ticket. Treat it as a deferred
marker recording the scope decision.

Future work should define one of these before reintroducing status rendering:

- an archive path convention for retired cards
- a ledger record for card lifecycle events
- an expected-card/data-layer query that can distinguish missing from retired

Until then, `ax cards list` and scoreboard rendering should treat cards under
the active library as built/active by existence and should not expose a stored
frontmatter `status:` field.

## Acceptance Criteria

- [ ] Phase 1 docs no longer require card-local `status:` frontmatter
- [ ] `ax cards list` does not expose `--status` in Phase 1
- [ ] Scoreboard Phase 1 scope is area attribution and presence, not lifecycle rendering
- [ ] Future status/retirement work is blocked on archive or ledger design

## Implementation Notes

Do not add a placeholder `status:` field back to `Standard - Card Frontmatter
Schema`. If a future workflow needs card lifecycle state, design the lifecycle
source of truth first and then add reader/rendering behavior against that
source.
