# Library Review Page — build log, the three altitudes, and if-then next steps

**Status:** Spike capture (2026-06-25). What this session built toward reformatting
the library, the decisions, and the deferred-wiring logic so it isn't lost.
Companion to [`card-story-template.md`](./card-story-template.md). See memory
`library-review-page-model`, `library-operations-pipeline`.

## What we built (prototype)

- The **context review page** rendered in the viewer's Empty Library surface,
  pointed at a **Studio-owned** library via a new `?libraryRoot=` param
  (`studio/library/`, kept off Alexandria's library — Studio spins out).
- For a context's **lead** card (the top-altitude "king"): a two-bucket story —
  **what it does** + **how it does it** — with nouns as inline links (colored by
  an Event-Storming-ish role palette; uncarded nouns render **gray**), plus a
  **type-keyed diagram**: Aggregate/Surface → hub of labeled connectors, Value →
  lifecycle flow, Read-Model → feeds-hub. Connectors group by verb to stay in
  parity with the sentence.
- The **recursion**: every card opens into its own template (lead auto-shows;
  pieces expand on click). Proven on three examples in the `board` context:
  **Work Board** (Aggregate), **Stage** (Value), **Play Registry** (Read-Model).
- The programmatic spec (`card-story-template.md`): two buckets, **R1–R7** hard
  rules, type-keyed mad-libs, acceptance bar incl. **noun↔diagram parity** and
  **no-orphans**.
- Phase-3 plan as sortable **work orders** on the Studio board (`board-state.json`).
- **Claude as the play executor** (verified via a `source-assessment` smoke run).
  The `.alexandria` provider flip is a *local* setting — not committed here.

## The three altitudes (C4 — same template at each, recursive)

1. **Appendix / index — zoom all the way out. NOT BUILT.** The product's top-level
   shape: planes (Strategy/Product/Learning), and within Product the **contexts**
   (board, brief, grading, runtime…) as the "row of folders" (the Obsidian
   appendix view). *Same template*, with the **product/plane as the lead** and the
   **contexts as the nouns**: "what the product does / how it does it via its
   contexts" + a diagram of the contexts. Drill a context → the context page.
2. **Context — the power altitude. BUILT this session.** Lead + pieces; what/how +
   type-keyed diagram; shared nouns; self-checking.
3. **Atomic card — zoom all the way in. NOT FULLY BUILT.** The card's own what/how
   body (`WHAT/WHERE/WHY/WHEN/HOW`), atomizer-filled *after* the confirm gate.

## Decisions captured

- The story is a **view composed from atomic cards + links**, not a fat card body
  (atomicity holds).
- **The diagram a card shows is dictated by its type/altitude.** The lifecycle
  belongs to the **Stage** card (drill-down), not the Work Board.
- **Sentence and diagram are one unit** (parity); **every defined term in a
  context must appear in the lead's how-it-works, or be relegated** (no orphans).
- The two-bucket **what it does / how it does it** is an elegant QA container.

## If-then — deferred wiring (do NOT universally wire yet)

The flow is not proven end-to-end (appendix ↔ context ↔ atomic card, plus the
BoH → FoH → confirm → atomize pipeline). So, in order:

- **IF** the appendix/index view renders (contexts as nouns, same template)
  **AND** the atomic-card view renders its own what/how **AND** the recursion
  holds across all three altitudes → **THEN** we have a complete surface to
  approve a product top-to-bottom.
- **IF** that holds **AND** the **BoH/FoH walks are re-pointed to *produce* these
  review pages** (their output *is* the page) → **THEN** building the library =
  filling stubs + linking everything, and the elicitation chicken-and-egg resolves.
- **ONLY THEN** universally wire: apply the template across all cards; turn on the
  **live lints** (R1–R7 + parity + orphan = the self-checking page / auto-generated
  FoH agenda); let the **atomizer fill bodies after the confirm gate**.
- **UNTIL THEN:** keep prototyping at the context altitude (proven), hand-author
  examples, and do **not** auto-generate cards or wire the pipeline.

## Immediate next (workshop order)

1. **Appendix / index view** (highest altitude) — same template; plane/product as
   lead, contexts as nouns. ← requested next.
2. **Atomic-card view** (lowest altitude) — the card's own what/how.
3. Prove the three altitudes **connect** (drill up/down), then the lints, then
   re-point BoH/FoH.
