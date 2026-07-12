# Library Notepad Surface (un-nested threads, durable burndown)

Status: draft for director review · Author: session 2026-07-02 · Companion to
`docs/alexandria/plans/frame-ruling-cascade/plan.md` (independent surfaces;
the data meets at the resolution-provenance contract).

## 1. The problem, in the director's words

> "The notepad / scratchpad / threads — questions and concerns / found
> problems… In my mind this was part of the draft process, but the reality is
> it was generated from BoH and you need to see what BoH generated. So as far
> as viewing this is concerned, we may want to consider 'un-nesting' it from
> library development stage since it lives in-between and amongst them all."

> "Part of QA is being able to track this… I agree with distinct [cascade
> resolutions] — the whole idea is QA here, and if the agents are making
> really bad calls by erasing good questions based on director input, we need
> to know that that is happening."

Observed the same day: the thread list appeared to count down (25→12) and
then "came back" to 25 — because no durable resolution is projected anywhere;
the apparent burndown was a view filter. There is no surface on which a
resolved question stays resolved.

## 2. The model

The notepad is not a stage artifact — it is the **spine that connects the
stages**: the Back-of-House walk generates it, the Front-of-House walk burns
it down, residuals carry it to the confirm gate and EL5, and living updates
(EL6) will regrow it. It therefore gets its own top-level surface, sibling to
the library tabs, never nested under Back or Drafts. (This extends the
library-health ruling — "one structured provenance-bearing notepad model =
the FoH agenda" — with stage-independence.)

Two shrinking semantics exist today and must never be blurred again:

- **Run-scoped agenda state** — `resolvedAgendaItemIds` are scoped to a play
  run and reset on relaunch. This is working state, not history.
- **Durable thread resolution** — a thread settled by a ruling, forever,
  across runs. The schema field exists (`resolvingEventId`,
  `library-catalog.ts:151`) but nothing projects it from the Ledger today.
  The Notepad builds on this, exclusively.

## 3. The contract

One dataset, three lenses, all projection (baseline + Ledger replay, no new
stored state):

1. **Generated** — the immutable baseline: every thread in the frozen
   bundle's `threads.json`, grouped by `emittingMove` and `kind`, carrying
   the director-register `question`, builder-register `reason`, and
   `sourceEvidence`. This lens answers "what did BoH find" and can never
   shrink.
2. **Resolved** — each settled thread with its resolving provenance, in
   **distinct states** (director ruling above):
   - `director-ruled` — resolved by an `answer_recorded` event (user actor);
     links the ruling text and any patch it produced.
   - `settled-by-cascade` — resolved mechanically by a frame-ruling cascade
     (process actor, `settled by frame ruling <answerEventId>` reason);
     rendered visually distinct so machine erasures are auditable.
   - `settled-by-triage` — resolved by the ruling-aware triage pass
     (cascade plan S5): the machine judged the question already answered by
     the corpus of banked rulings; cites the ruling event ids it generalized
     from. Reopenable — reopening re-stages the item.
   - `invalidated` — the thread was built on a premise a ruling overturned
     (the "sell used library books" class). Not resolved: recorded as a
     **miss**, with the overturning ruling linked. The Misses rollup is the
     process-improvement feed ("why was the scan so off?") — the record the
     director ruled we need without it ever becoming their agenda item.
   - `deferred-residual` — carried to RESIDUAL-GAPS.md by a hold.
3. **Open** — the true remaining set (Generated minus Resolved), cross-run.
   The tab badge is this count: the burndown, finally real.

Resolution derivation (the ax-side projection): an `answer_recorded` /
`residual_gap_recorded` / cascade event whose `agendaItemId` matches a
thread id marks that thread resolved with that event id and state. The
projection is by thread id, not play run — relaunches do not un-resolve.

## 4. Slices

- **N1 — durable resolution projection** (ax): extend the library graph
  loader (or a sibling projection) to derive per-thread resolution
  {state, resolvingEventId} from the Ledger per §3. Tests: director-ruled,
  residual, unresolved; relaunch does not reset; threads.json itself is
  never rewritten.
- **N2 — the Notepad tab** (viewer): top-level tab, three lenses, burndown
  badge, distinct cascade styling, provenance links (question → ruling →
  patch). Empty-ledger state = Generated lens only. Tests: lens counts
  against a fixture ledger, distinctness rendering, immutability of
  Generated, regression on existing tabs.
- (Later, out of scope: cascade-state entries — arrives with the cascade
  plan's S2; N2 renders the state when present and simply has none until
  then.)

## 5. Fences

- `threads.json` in the bundle is never rewritten by any of this — the
  baseline's immutability is the point.
- No new event types; resolution states derive from existing events'
  actor + payload shape.
- One notepad per bundle root (parameterized like the library tabs), not a
  global merge across products, in this pass.
