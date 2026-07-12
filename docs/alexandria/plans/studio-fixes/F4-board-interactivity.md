> **Agent-drafted 2026-06-22** for director review (playtest fix-list F4). Draft — not ruled.

# DECISION BRIEF — F4: Board Interactivity

**Item:** F4 (Playmaker's Studio fix-list, playtest 2026-06-21)
**Date:** 2026-06-22 · **Audience:** Director
**One-line:** The Board is *already* interactive in code — the real decision is whether to verify/finish it, or honestly downgrade it to a status view.

---

## Current state (honest)

F4's premise — *"you can't even manipulate the cards or move them around yourself… it's a gesture"* — **no longer matches the code.** `studio/plays/board.html` ships a working interaction model:

- **Drag-and-drop** — reorder within a column (top card = "NEXT UP"), drag across columns. Full `dragstart`/`dragover`/`drop` handlers (lines 220-229).
- **Confirm-to-advance** — a `▸` button appears on card hover; one click advances to the next stage (lines 206, 216-219). This *is* the gate-confirm gesture the fix-list asked for.
- **Ready-dots** — the `● ready` chip renders from a top-level `ready[]` list (line 207); the marker exists end-to-end.
- **Persistence** — every move POSTs to `/api/board-state`; `site-server.py` validates the payload and writes `board-state.json` **atomically** (`mkstemp` + `os.replace`, lines 83-87). The save-pill reports `saved ✓ HH:MM` or warns `NOT SAVED — run site-server.py, not http.server`.

So the file is **shared ground** by design: the Director drags in the browser, agents edit the JSON, same file. The director's playtest impression was of a *gesture*; the artifact is closer to a *built-but-unverified feature*. The honest gap is **provenance/verification**, not absence: there is no record this was driven end-to-end in a live session, and `board-state.json` today holds only a near-empty default (8 cards in Empty, 1 Live).

**One real defect:** the unified six-stage ladder is wired here (Empty → Sourced → Designed → Built → Proven → Live), but cards still render `r.job` and `r.surface` / `r.status` from `registry.js` (lines 147, 149, 209) — the exact fields the **Brick 0** ruling (`job:`→`function:`) and **IG3** ruling (collapse `status:`/`surface:` into the one ladder) are retiring. Whatever happens to F4, the Board is a **named touch-point** for those two renames.

---

## The decision

**Option A — Verify & finish (small).** Treat F4 as ~done: drive the existing UI end-to-end in a real session, fix anything broken, fold in the Brick 0 / IG3 field renames, update the fix-list to "verified." Build *no* new interaction.

**Option B — Honestly downgrade.** Declare the Board a read-mostly status view; document that advances happen by editing `board-state.json` / via agents; defer interactivity as low-priority. (Note: this would mean *removing or hiding* working code, since the UI is already interactive — a deliberate step back.)

**Option C — Defer untouched, retitle only.** Leave the interactive code in place but stop calling F4 "build the interactivity." Re-scope F4 to its real residual: *"verify the existing Board interaction and migrate its fields to the Brick 0 / IG3 lexicon."* Park deep verification behind F8.

---

## Tradeoffs

| | Pros | Cons |
|---|---|---|
| **A — Verify & finish** | Captures value already paid for; closes F4 truthfully; forces the Brick 0/IG3 renames the Board needs anyway. | Spends director attention on housekeeping the playtest itself flagged as *drum beat, not heart*. Risk of gold-plating a surface that's secondary. |
| **B — Downgrade** | Maximally honest about centrality (play authoring is the heart). | **Factually wrong about the code** — you'd be deleting/hiding shipped interactivity to "mark it read-only." Wastes the build; likely to confuse the next reader. |
| **C — Defer + retitle** | Lowest cost; corrects the stale premise without burning time; keeps the option open; lets F8 (make-playmaking-a-play) re-derive the Board's truth later. | F4 stays open (unverified). The Board keeps rendering `job:`/`surface:` until someone does the rename — drift persists a while longer. |

---

## Recommendation — **Option C, with the field-rename pulled forward into A-lite.**

**Defer the deep interactivity verification; do the minimum that's load-bearing now.** Concretely:
1. **Rewrite F4's definition** to match reality: interactivity is *built*, not a gesture — the residual is **verify it live** + **migrate its lexicon**. The current text is stale evidence.
2. **Pull the field renames forward** as part of the IG1/IG3 cleanup PRs (which already name `board.html` as a touch point): `r.job` → `r.function`, and fold `surface:`/`status:` into the one stage ladder. This is cheap, already-scoped work and removes the only true defect.
3. **Park end-to-end interaction verification behind F8.** The playtest's own cap finding is that the Board's truth (its six stages) *is* a projection of the playmaking process; once playmaking is itself a play, the Board's stage model and confirm-gates become a rendering rather than a hand-maintained surface. Verifying the drag/confirm UX in isolation now risks hardening something F8 will re-shape.

**Stakes if ignored:** Choosing **A** (full verify now) trades the director's scarce attention away from play authoring — the actual heart — to polish the drum beat, against the playtest's explicit ruling. Choosing **B** is the worst outcome: it would *remove working interactivity* under a false belief that none exists. The cost of **C** is only that F4 stays honestly open and the Board renders two retiring field names a little longer — both bounded, both swept by the IG/F8 work already on the roadmap.

**Bottom line:** F4 isn't "build it" — it's "you already built it; verify the premise, rename the fields, and let F8 make it true." Interactivity is real; *centrality* is not — keep the director on authoring.
