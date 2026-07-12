# Handoff: Alexandria Library Reconciliation (the blast-through)

For the agent taking this on. Written 2026-07-02 at the end of the first
full Front-of-House walk of Alexandria's own library. Your mission: get
Alexandria a **good library now**, by hand-reconciling everything the
director ruled, while the systemic fixes (see companion plans) are built in
parallel. You are the deliberate "bank act" — performed by an agent, reviewed
by the director as a PR.

## What exists on this branch

- `docs/alexandria/sweeps/alexandria-product/` — the bundle **including the
  walk's applied patches** (committed here as the walk left it: 39 cards
  modified, 3 files added by patches, RESIDUAL-GAPS.md present). Note: the
  walk was supposed to write to a draft log and silently wrote to base
  instead (dropped `draftLog` input) — for you this is a gift: `git diff
  <bundle-creation commit>` shows exactly what the 21 card-touching patches
  enacted.
- `docs/alexandria/plans/alexandria-library-reconciliation/walk-events.jsonl`
  — all 190 ledger events for the two walk runs
  (`01KWH7PEV2F77BJC0YHRP0EVWD`, `01KWHFN1SA5R413ASARCRN79VW`): 26
  `answer_recorded` (the director's rulings, full text), 22
  `bundle_patch_applied`, 2 `section_confirmed` (Library, Viewer — with
  director-approved summaries), 4 `residual_gap_recorded`. **This is the
  source of truth for every decision.**
- `draft-log-snapshot.json` — the vestigial draft log (one empty frame
  patch); mostly evidence of the dropped-input defect.
- `RECEIPT.md` (beside this file) — the director's end-of-walk summary.
- Companion plans (branch `danversfleury/frame-ruling-cascade-plan`):
  `frame-ruling-cascade` and `library-notepad-surface`. You are NOT
  implementing them — but their §1b guiding principle governs you:
  **traceability everywhere, director time only on genuine unknowns.**

## The mission, in order

1. **Audit.** Build the reconciliation worklist: (a) what the 21 patches
   enacted (diff); (b) every ruling in the answer events NOT yet enacted —
   the walk did not generalize, so expect most structural consequences of
   the frame ruling and several hot-spot rulings to be un-inked; (c) the
   receipt's takeaways. Every worklist item cites its ruling event id.
2. **Enact the frame ruling** (the biggest un-inked decision): the product
   map is five regions — Library and Playbook (the heart), Viewer, Ledger,
   Triggers (enabling systems). Rename/merge containers accordingly
   (`product-shell` → viewer, `session-wake` → triggers); re-home the cards
   of demoted `vision-onboarding` (one play among thousands → its cards
   belong under the playbook region's vocabulary) and `knowledge-production`
   (prototyping — park its cards with an honest note, do not delete);
   `canvas` was held for its own conversation — leave it, flagged.
3. **Enact the hot-spot rulings** from the events/receipt where the walk
   didn't: taxonomies-as-layers, Play Run = unit of work / Play = definition
   / Playbook = registry, Coin = Component, Source of Truth merged to one
   card with frozen-as-a-state, Vision Slot = component, Director = pillar,
   demotions (Idempotency Key, State Store, Run Labels → notes on parents).
4. **Add the missing cards** the walk surfaced: `Surface - Tray` (viewer),
   `Concept - AI Colleague` (headline-level — "an AI colleague executes on a
   task or project as independently as a human peer would, fitting the
   director's rhythm and culture" is the JTBD, in the director's words).
5. **Rewrite the keystone** (`_index/Concept - Alexandria.md`): the
   five-region story in the director's voice (mine the frame ruling event +
   the banked Basic Product Description at
   `docs/alexandria/source-of-truth/raven/vision/source-of-truth.md`),
   naming AI Colleagues and the JTBD. It must pass the keystone gate against
   the FINAL container set.
6. **De-machine the language.** Where rulings supplied director vocabulary,
   card prose still reads "software machine." Rewrite bodies to the
   director's register, preserving WHAT/WHERE/HOW structure,
   `source_evidence`, and links. Keep `confidence`/`proposed_by` honest
   (ruled content is `confirmed`, director-provenance).
7. **Settle the threads.** In `threads.json`: mark each thread resolved with
   its `resolvingEventId` (director-ruled), or invalidated (premise
   overturned — record as a miss, cite the overturning ruling), or leave
   open (the 4 residuals: trigger design, README-vs-routes, Project noun,
   vision naming cleanup). Never delete a thread.
8. **Gate and ship.** `bun studio/tools/check-keystone.ts
   docs/alexandria/sweeps/alexandria-product` and `bun
   studio/tools/check-threads.mjs` must pass; do a cold self-read
   (link-resolution, frontmatter completeness); then PR to main, **no
   auto-merge** — the director reviews. PR body: the worklist with per-item
   ruling citations, so review is checking enactment, not re-deciding.

## Constraints

- Every change traces to a ruling event id or is explicitly marked as your
  editorial proposal (keep those few and separate — the director reacts to
  mostly-right, and must be able to see which is which).
- The 4 residual gaps stay open — they are cofounder/investigation items.
- Do not touch `studio/` (PMS), the old library at
  `docs/alexandria/library/` (excluded oracle), or the plans.
- Optional final check, recommended: diff your finished library against the
  old 208-card library as a coverage oracle — "what did the old library know
  that this one doesn't" — and list (don't import) anything real that's
  missing, as candidate threads.
