# Project Plan — Fix the Studio, Rebuild the Library

**Updated 2026-06-22.** Source-of-truth update after the Brick-0 + cold-items + studio-operations session. Mirror this into the master Google Doc ("Alexandria Studio — Batched Sprint"). The next-session handoff is at the bottom.

---

## The shape (one push, two efforts)

- **Fix the Studio** — bring its operations & maintenance up to snuff (the design corpus this session produced).
- **Rebuild the Library** — use the fixed Studio's tooling to dogfood Alexandria's own library (the original EL/VB arc).

They share **one data model, one lexicon (Role/Tier/Function/Play), one ledger.** The Studio is the candidate spin-out — **incubate inside Alexandria, spin out as a slice when ready** (IG9).

---

## DONE this session (2026-06-22)

- **Brick 0 foundations ruled → #328 (merged).** Type enum (product-descriptive + **Role**; DDD-trio out; Read Model → `derived_from` link); link types (typed: 6 structural + 3 epistemic); frontmatter (**Small floor / Large target**); scope (**palette vs profile** — Studio gets its own library, separate from Alexandria's).
- **Cold-items 12/12 → #329, #330, #332 (merged).** `job→Function` lexicon heal (Role·Tier·Function·Play); stage/surface/board unification (IG3/IG4); the **ledger decision** (provenance = ledger events, not hand-rolled — #330); the registry **Division→Function** principle (agent-ownership = a view); IG9 (incubate-then-spin-out).
- **Studio operations design corpus → #331 (OPEN — for hand-QA).** The **Operations & Maintenance Quality Plan** (the macro-frame); **F7 → Review Levels** (Low/Med/High Review = compositions of Play-Writing step-plays); **Play Re-sync** (ruled: edges-as-data, Operations — replaces "big edit"); **F9 → Operations Division proposal** (the Curator parked into product-level maintenance); **Board → project plan** (bring-it-to-life); + the **Studio data model** (draft, to finalize).
- **Memories:** `brick-0-foundations-ruled`, `back-of-house-walk-el2`.

---

## NOW — priority order (what this session stirred up)

1. **Use the Studio data model (draft in #331) as the reference** — its *insights* are already baked into this plan, so don't gate everything on "finalizing" the whole thing. **Front-load only the ~3 cross-cutting schema decisions** multiple builds write to: the **D5 ledger event type** (its Q6), the **Division→Function catalog home** (Q8), and **edges-as-a-manifest** (Q10). Settle the rest of its 16 open questions **just-in-time**, with the build that forces each tradeoff.
2. **The renames/unifications the rulings imply** — `job→function`; stage/surface/board → one ladder anchored on the process; the registry **Division→Function** reorg (agent-as-view). (Touches `registry.js`, `board.html`, `TEMPLATE-brief.md`, `raven-grounding.md`, `site-server.py`.)
3. **Play Re-sync — build it.** The artifact dependency-graph as first-class data (edges-as-data, ruled); replaces `BIG-EDIT.md`; Catches → Bug cards.
4. **Resume F8 (make-a-play)** on `playmaker-testing-streamline` — the self-healing cap; the home for Play Re-sync + the Review-level dial.
5. **Board — bring it to life** (per `board-project-plan.md`): data model + server contract (`site-server.py` hard-validates the 6 stages) → editability → views/tiers → connections.
6. **Operations Division / the Curator** — product-level maintenance & management (its own design pass; `studio-operations-division.md` is the captured thinking).
7. **Reconcile EL2 (`back-of-house-walk`) to Brick 0 → its Gate 1** — the library pipeline's next trigger, now unblocked.

---

## THE BIG ARC — library rebuild (continues, now unblocked by Brick 0)

Per the original arc and `rebuilding-the-library/plan.md`: **VB1 ↔ EL4** (Empty Library View + Confirm Gate) · **EL3** (Front-of-House Walk — the biggest unbuilt thing, its own session) · **EL5** (atomizer re-point — the Conan/Sam plays) · **VB2 / VB3 / VB4 / VB5** · **Brick 6** (dogfood the fill on Alexandria). The bricks (0 done → 1 Vocabulary → 2 Skeleton → 3 sourcing → 4 confirm-gate → 5 atomizer → 6 dogfood → 7 living-plan) are the spine.

---

## Open picks (small)

- The **"work order" term** (the Board's generic for a unit of work — Testing/Improvement/Bug).
- The Board's **views/tiers** (top-level vs filters); the **Curator's Tier**.

---

## NEXT-SESSION HANDOFF / PROMPT

> **Start here.** Read in order: this project plan; the **Studio data model** draft (`docs/alexandria/plans/studio-fixes/studio-data-model.md`, in #331); the **Operations & Maintenance Quality Plan** (`…/studio-operations-quality-plan.md`).
>
> **State:** Brick 0 ruled (#328, merged); cold-items 12/12 (#329/#330/#332, merged); the **Studio operations design corpus + data model are in #331 (open, awaiting your hand-QA)**. Five PRs total this session.
>
> **The push** is *fix-the-Studio + rebuild-the-Library*, sharing one data model, lexicon, and ledger.
>
> **Highest-leverage first move:** the Studio data model is the **reference** (its insights are already in this plan) — **front-load only its ~3 cross-cutting schema calls** (D5 ledger event type · Division→Function catalog home · edges-as-a-manifest), then pick a build from NOW (Play Re-sync · the Board · resume F8), settling the model's other open questions just-in-time. The library arc (EL3/EL5/VB) is unblocked by Brick 0; reconcile **EL2 → Brick 0 → Gate 1** to fire its next pipeline step.
>
> **Standing constraints:** separate, non-stacked PRs off `main`, no auto-merge, hand-QA'd each. Don't edit `docs/alexandria/library/` until the pipeline is ready. Studio carries its own library/profile, separate from Alexandria's.
