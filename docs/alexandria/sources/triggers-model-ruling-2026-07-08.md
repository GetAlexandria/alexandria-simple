# Source: The Triggers Model — Director Ruling (2026-07-08)

**Provenance:** Conversation between Jess (cofounder, director, and the
library's named holder of Triggers domain knowledge) and Raven, 2026-07-08,
structured through a `frame-the-problem` play run
(playRunId `2f545e78-880f-411c-8e49-b058b1a31978`,
fabroRunId `01KX13FQRB578ES1JRPPN394K3`). The director reviewed and approved
the v2 problem framing (`runtime/problem-framing.md`). This source resolves
the residual thread `hot-spot-trigger-design-vs-runtime` from the 2026-07-07
front-of-house walk.

**Status:** Ruled by the director. Ready for atomization / card propagation.

---

## The ruling, in the director's words

> "Wake feels like purely delivery. The how. Plumbing. Could be built lots of
> different ways. The important thing is that a Trigger is a subscription to
> an event on the ledger that notifies a specific agent (more specifically, a
> specific _instance_ of an agent embodied in a session)."

And, on the derived pending condition:

> The doc on disk produced by codifying with Raven "is a Source I think" —
> and the pending "source awaiting assessment" is a state of that Source,
> not a trigger.

## The model

One product noun, with everything else subordinate:

- **Trigger** — a subscription to a ledger event that notifies a specific
  agent instance (a session) and fires a play. This is the product noun.
  The thing the library currently cards as `Entity - Wake Subscription` is,
  in substance, the Trigger — it has the wrong name, not the wrong content.
- **Source** — owns its own pending state. The shipped derived-on-read
  "pending trigger" (kind: source awaiting assessment, derived in
  `packages/ax/src/domain/triggers.ts`, stored nowhere) is **not a Trigger**.
  It is a *state of a Source* ("awaiting atomization/assessment") and the
  noun dissolves into the Source card. The runtime computation may keep
  existing; it just is not a product noun.
- **Wake, Monitor, Match Rule, Cursor** — delivery plumbing beneath the
  Trigger. Implementation notes, not product nouns. (Same class of ruling as
  Run Labels, 2026-07-07: "not a product noun — it is plumbing.")

## The earned instance (why the bigger surface is real, and modest)

The codify→atomize pipeline: the director works with Raven to codify product
knowledge (e.g. the vision doc); that produces a document on disk which is
banked as a **Source**; a Trigger watching "source banked" should then fire
the atomization play at the right agent session. **Today nothing fires — the
director runs the next play by hand.**

This instance earns the bigger trigger surface, but only the modest version:
the shipped subscription machinery, extended to fire plays. It does **not**
earn additional trigger kinds, a generic automation framework, or keeping
pending-source assessment as a Trigger.

## Synthesis (approved framing, v2)

> "Trigger is a play-firing subscription; Source owns its pending state;
> Wake/Monitor/Match Rule/Cursor are plumbing beneath delivery."

## Known defect to fix alongside

The `Entity - Wake Subscription` card's HOW paragraph is stale: it claims
triggers take "one of its two shipped kind values" including "a director
ruling awaiting capture." That second kind was removed with the Studio
Operations eviction (PMS/Alexandria boundary migration, Slice 1); the
`Mechanism - Trigger` card was corrected 2026-07-06 but the Wake Subscription
paragraph was not. One kind ships today.

## Card work this implies (for the propagating agent)

1. **Rename/refit** `Entity - Wake Subscription` → the Trigger card
   (aggregate). Its contains/produces links (Match Rule, Cursor, Wake) become
   subordinate plumbing notes.
2. **Retire or absorb** `Mechanism - Trigger` (the derived-on-read pending
   condition). Its content moves to Source-state language on the Source of
   Truth card (per the 2026-07-07 ruling: one Source noun, states not cards).
3. **Demote** `Capability - Wake` and `Mechanism - Monitor` from product
   nouns to delivery plumbing (implementation notes on the Trigger card, or
   plumbing-tier cards per whatever the taxonomy allows).
4. **Fix** the stale two-kinds HOW paragraph wherever it appears.
5. **Record** the intended-but-unbuilt behavior: triggers fire plays (the
   codify→atomize case), not just wakes. Mark as planned, earned by the
   instance above.
6. **Close** `hot-spot-trigger-design-vs-runtime`, citing this source.
   (Corrected 2026-07-09: `threads.json` was retired — threads now project
   from the Ledger — so closure is recorded as a Ledger event via `ax`, not
   a sidecar edit.)
7. **Re-examine deferred rulings** that were parked "pending Triggers review
   with the cofounder": `Entity - Cursor` (hot-spot-cursor-demotion) and
   `Capability - Wake` typing (ruling 52cdef40) — both likely resolve to
   plumbing under this model.

## Field note (supporting evidence, same day)

During this very conversation the wake-delivery path failed twice (stale `ax`
binary crash-looping the monitor; a wake recorded as delivered that never
reached the live session). Work continued anyway because the open question
was recoverable from the ledger on read. The recorded condition is the durable
thing; delivery is replaceable plumbing — the ruling held up under field
conditions within the hour.
