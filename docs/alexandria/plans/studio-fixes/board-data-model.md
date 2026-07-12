> **Agent-drafted 2026-06-22** for director review. The Board reconceived as a studio-wide work-to-be-done tracker (resolves IG8). Draft — not ruled.

# DESIGN SPEC — The Playmaker's Studio Board Data Model

*Director-facing. Drafted against the live Board (`studio/plays/board.html`, `board-state.json`, `studio/site-server.py`), `registry.js`, `frame-the-problem/improvements.md`, the playtest rulings (IG3/IG4/IG8 + the "drum beat" META), the Play Re-sync spec (`docs/alexandria/plans/studio-fixes/play-re-sync.md`), `studio-fix-list.md` (F4), and `work-with-the-ledger.md`. Draft for director review — not ruled.*

> **One grounding note (flagged):** these Studio-fix specs live on a feature branch, not merged. On the live `main` Board the surface is still the 6-stage kanban described below; nothing here assumes Play Re-sync or this rename has merged. The rename + card model are **additive** over the live Board.

---

## 1. Purpose — one Board, "work to be done across the whole studio"

The Board is **one surface**: a place to see *all the work to be done* across the Studio, at a glance. It is no longer scoped to "production progress of plays on the golden path."

This is a deliberate promotion. The playtest filed the Board as a **drum beat** — housekeeping, "a gesture so we don't forget that we need it… you can't even manipulate the cards or move them around yourself" (playtest META; fix-list **F4**). The Board's heart is still play authoring — but its *role* grows from drum beat into **the Studio's work-management surface**. The work-to-do pool is no longer just "which plays exist": it is plays-in-flight **plus** the open testing, improvement, and bug work on each one.

**The rename: "Empty" → "Backlog."** The first column is renamed. It stops meaning "a named slot with nothing started" and becomes the **work-to-do pool**: named-but-unstarted plays **and** per-play to-do cards waiting to be picked up. "Empty" described a play's emptiness; "Backlog" describes a queue of work — the right frame for a work tracker.

`board-state.json` stays the single source of truth for production progress. What changes: the Board now also holds the to-do cards that used to live in scattered per-play `improvements.md` files and Brief §8.

---

## 2. The card data model

Two kinds of card: **Play cards** (a play moving through its lifecycle) and **to-do cards** (Testing / Improvement / Bug, each linked to a play subject). Both render on the same Board.

### 2.1 Play card

A Play card *is* a play, positioned by its **lifecycle stage**. Identity stays in `registry.js` (the single source of truth for identity + `prio`/`tier`/`function`); the Board card is a projection of that identity plus its stage.

| Field | Source / meaning |
|---|---|
| `slug` | play id, joins to `registry.js` (`BY_SLUG`) |
| `stage` | one of the **IG3-unified ladder** (§4): `backlog → sourced → designed → built → proven → live` |
| `priority` | **order within the column** — top card = "NEXT UP". Not a separate field; it is list position. |
| `ready` | membership in the top-level `ready` set — work done, awaiting the Director's confirm-to-advance (the `● ready` marker) |
| *(rendered)* `name`, `glyph`, `tier`, `function`, `surface`, `rulings` | read-through from `registry.js` |

The stage is the **IG3 unified ladder** anchored on the real production process (IG3: *"the board is fake and the process is real, updating the board to match the process"*). The **"Empty"→"Backlog" rename is the first stage's relabel**; the stage *key* in storage may stay `empty` for back-compat (§7) or migrate to `backlog`.

### 2.2 To-do card (Testing / Improvement / Bug)

A to-do card is a unit of work **linked to a play subject**. This link is the spine of the model (it powers the per-play views, §3, and it is Brick 0's typed-link **F2** turned onto the Board — §8).

```jsonc
{
  "id": "todo-ftp-0007",            // stable unique id
  "type": "bug",                    // "testing" | "improvement" | "bug"
  "play": "frame-the-problem",      // ← THE LINK: slug joining registry.js. Required, always present.
  "title": "Interactive review⇄revise loop deadlocks under detached run",
  "detail": "stdin inherit, no TTY — see frame-the-problem-agent-driven-gaps.",
  "status": "open",                 // "open" | "in-progress" | "done"   (see §9)
  "priority": 1,                    // order within its play's view; lower = higher
  "source": "play-re-sync",         // provenance: "director" | "agent" | "play-re-sync" | "migrated"
  "created": "2026-06-22",
  "tags": ["decision"]              // optional — preserves improvements.md's [decision] tag
}
```

**The three types:**

- **Testing** — see §4. The aggregation rule is load-bearing: **exactly ONE Testing card per play**, carrying a priority-ordered checklist (not one card per test). This single card represents the campaign to raise the play's N past the "N=1 smoke."
- **Improvement** — an idea to make a play *better* or grow it. Inherits `improvements.md`'s cards (§6). Carries the optional `[decision]` tag (closing an open decision is an improvement).
- **Bug** — a catch, break, or problem. **A distinct type from Improvement** — "an idea for making it better isn't a bug." Default priority **higher** than Improvement (§5). Auto-created by **Play Re-sync Catches** (§8).

**Every to-do card carries `play`** — there is no unlinked to-do card. That requirement is what makes the per-play views (§3) and typed-link computability (§8) possible.

### 2.3 How a Play card's stage relates to its to-do cards

Different axes; they do not collapse:

- A **Play card's `stage`** answers *"how far through production is this play?"* — the IG3 phase ladder.
- A **to-do card's `status`** answers *"is this piece of work open / being done / finished?"* — independent of the play's stage.

A play can be `live` (stage) and still carry many `open` Improvement and Bug cards. **The stage is a property of the play; the status is a property of the work.** Consequence: to-do cards do **not** occupy the lifecycle stage columns — see §3 and §7.

---

## 3. The per-play views — big vs small, powered by the link

Because every card carries `play`, the Board is **computable per play**. A play page renders one of two views by filtering the global card set on `card.play === slug`:

- **Big view — the play's whole work board.** Every card for this play: its Play card (with stage), its one Testing card, all its Improvement cards, all its Bug cards. "A filtered copy of the Board — just this play — easily accessible." The play's mission control.
- **Small view — a filtered slice.** The same filter plus a `type`/`status` facet: *just the testing plan* (`type:testing`), *just the improvements* (`type:improvement`), *just open bugs* (`type:bug, status:open`).

Both views are pure projections — no second store, no duplication. The play-link is the join key; big view = "filter by play," small view = "filter by play **and** facet." Exactly the F2 pattern ("one underlying graph, multiple projections") applied to the Board: the Board is the graph, the per-play views are lenses.

---

## 4. The Testing aggregation rule — one checklist-card per play

**One Testing card per play. Not dozens.** The Testing card is a *rolled-up checklist*, priority-ordered, representing the play's path from "N=1 smoke" to a fuller campaign.

This anchors on real testing state. `frame-the-problem` ran an **N=1 smoke** (*"a Riff N=1 smoke ran 2026-06-18… 8/8 problem fixtures emitted a deliverable"*) — enough to show the play is **not a hulking ruin**, but explicitly *not* the bar. Owed: *"a k≈30 graded campaign, the interactive review⇄revise loop, and the IN-1/IN-2 invariance pairings."* Those owed items are the **checklist entries** on the one Testing card:

```jsonc
{
  "id": "test-ftp", "type": "testing", "play": "frame-the-problem",
  "title": "Raise N past the N=1 smoke",
  "status": "in-progress",
  "checklist": [                               // priority-ordered: top = next
    { "text": "k≈30 graded campaign on the 8 problem fixtures", "done": false, "prio": 1 },
    { "text": "Interactive review⇄revise loop end-to-end",       "done": false, "prio": 2 },
    { "text": "IN-1 / IN-2 invariance pairings",                 "done": false, "prio": 3 },
    { "text": "N=1 smoke (pre_fill, auto-approve)",              "done": true,  "prio": 4 }
  ]
}
```

**Why one card, not many:** a play's test campaign is *one body of work with internal priority*, not a swarm of tickets. Dozens of cards would bury the Board and lose the "how far is this play's proving?" signal. The single card's **checklist completion is the play's proving progress** — the natural input to the Board's `proven` stage gate (a play advances to `proven` when its Testing checklist clears the bar the Director sets; cf. Gate 2 being "human judgment right now").

**Relationship to `fixtures/` + `risk-map.md`** *(open question, §9):* the Testing card is the **director-facing rollup**; the graded material lives in `fixtures/` and the risk dispositions in `risk-map.md`. Best read: the checklist **summarizes** the campaign defined by `risk-map.md` (whose `results:` axis tracks proof — Play Re-sync E13) and run against `fixtures/`; it is a view, not a replacement.

---

## 5. Improvement vs Bug — distinct types, bugs default higher

Two types, not one — the director's distinction: *"an idea for making it better isn't a bug."*

- **Improvement** — make the play *better* / grow it. Forward-looking, optional, idea-shaped. Inherits `improvements.md` semantics including the `[decision]` tag.
- **Bug** — a catch, break, or problem. Something is *wrong* and should be *fixed*. Backward-looking, corrective.

**Priority default: Bugs higher than Improvements.** A new Bug enters above the Improvement band by default (a break that invalidates the play outranks an idea to grow it). The Director re-orders freely — `priority` is list position, draggable, exactly as the current Board reorders Play cards. The default is a starting sort, not a lock.

This split also routes provenance: Play Re-sync **Catches** become **Bug** cards (§8); director/agent ideas become **Improvement** cards.

---

## 6. Migration — `improvements.md` + Brief §8 → Improvement cards

The **IG8 resolution.** Both were **pre-Board procedural attempts not to lose good ideas** — a per-play markdown backlog and a brief section. The Board now *is* the place ideas don't get lost, so both retire into it.

- **`frame-the-problem/improvements.md` → Improvement cards.** Its format maps cleanly: H2 columns `Backlog / In progress / Shipped` are the `status` enum (`open`/`in-progress`/`done`), each `- ` bullet is a card, the `[decision]` tag carries over as a `tags` entry. The four `## Backlog` items become four `open` Improvement cards on `frame-the-problem`; the three `## Shipped` items become `done` Improvement cards (kept for history). **Format collision to note:** `improvements.md`'s own "Backlog" column is a *status*, while the Board's renamed first *stage* column is "Backlog" — different axes (§2.3). The migration maps the file's columns to to-do **`status`**, not to the play-stage column.
- **Brief §8 → Improvement cards.** The "flag-for-upgrade" content §8 carried becomes Improvement cards on that play.
- **What happens to the files:** once migrated, `improvements.md` and Brief §8 **retire** — the live source of improvement work is the Board. Recommended: a one-line stub/pointer (or delete) so no one re-seeds the dead format. *(Tombstone-vs-delete is a small Director call — §9.)*

---

## 7. Storage / mechanics — reconciling with `board-state.json` + `POST /api/board-state`

Current mechanism (verified in `site-server.py`):

- `board-state.json` holds `{ stages: { <stage>: [slug,…] }, ready: [slug,…], updated }`.
- `board.html` loads it, renders 6 columns, drag/drop + the `▸` advance button mutate it, and `persist()` POSTs the whole object to `/api/board-state`.
- `site-server.py` **hard-validates** the payload: `stages` keys must be **exactly** `['empty','sourced','designed','built','proven','live']`, and every stage value must be a **list of non-empty slug strings**, deduped. Atomic write (tmp + `os.replace`).

**This validation is the load-bearing constraint.** The Board cannot carry to-do cards without changing the server contract — bare slug-string arrays cannot hold the card objects in §2.2, and the stage-key allowlist forbids the rename. Two concrete edits:

1. **The rename.** Change the `STAGES` constant in `site-server.py`, the `STAGES` array in `board.html`, and the flow-note copy. Lowest-risk path: keep the storage **key** `empty`, change only the display `title` to "Backlog" (zero migration). Cleaner path: migrate the key `empty → backlog` + bump the server allowlist. **Recommendation: relabel the title now, migrate the key later.**
2. **The cards store.**
   - **(A) Extend `board-state.json`** with a sibling `cards: [ …todo objects… ]` array, leaving `stages`/`ready` for Play cards. The server gains a validator for `cards` (type ∈ {testing,improvement,bug}, `play` present + known, status ∈ {open,in-progress,done}). **Recommended** — one file, one POST, preserves "the same file agents edit" so the Board stays shared ground.
   - **(B) A separate `board-cards.json`** + a second endpoint. Cleaner separation but breaks single-file shared-ground and doubles the persistence path. **Not recommended** unless card volume outgrows one file.

**Rendering with (A):** Play cards render by stage as today; to-do cards render **on their play**, not in the stage columns — primary home is the **per-play views (§3)**, with an optional Backlog-column surfacing of `open` to-do cards as the studio-wide "work to pick up" pool. Exact Board-level placement is the §9 layout question.

**Server contract delta (A):** keep the existing `stages`/`ready` asserts; add `cards = body.get('cards', [])`; assert it is a list; per card assert `type` in enum, `play` in known-slug set, `status` in enum, `id` unique. Persist `cards` alongside `stages`/`ready`. Atomic-write path unchanged.

---

## 8. Connections

- **Brick 0 typed-links (F2).** The card↔play-subject link is a **typed link** — the same primitive Brick 0 F2 defines between library cards, applied to the Board, which becomes **computable off it** (§3). Recursively: Play Re-sync is "F2 turned inward" (links between a play's own artifacts); the Board's card-graph and the play's artifact-graph are the same idea at two scales.
- **Play Re-sync feeds the Board (Catch → Bug).** Play Re-sync computes a play's stale-artifact cone after any edit and partitions it into auto-derived vs flagged. Its **Catches** — detected breaks it flags rather than fixes (dead placeholders, failure-blind ACP edges, risk-map drift, a stale plugin bank, runs that no longer apply) — should **auto-log as Bug cards** on that play, with `source:"play-re-sync"`. "What just broke" becomes visible on the work board the moment re-sync detects it.
- **The Ledger (cards/dispositions as events).** Per `work-with-the-ledger.md` (D2): provenance is the ledger's job; Studio projects from / appends to it, never a parallel record. Card creation / status change = **ledger events** carrying an `AlexandriaActor` (Director move = `actor.kind:user`; agent/Play-Re-sync auto-log = `agent`/`process`); the card's `source` field is then a **projection of the event's actor** (the D3 pattern). **D5 gap applies:** no generic status-change event type yet — needs an adopted `assessment.recorded` or a new `board.card.*` / `decision.ruled` type (keep it the *same* type Play Re-sync settles on). **Position: the `board-state.json` write stays the operational source of truth for v1; ledger-event emission is the D2 wiring step that lands in `packages/` later** — design the schema so `source`/status are projectable from events when that lands; don't block the Board redesign on it.

---

## 9. Open questions / dependencies

1. **Do to-do cards share the lifecycle stage columns, or carry their own status?** Best read: **their own status** (`open`/`in-progress`/`done`) — a different axis from the play's stage (§2.3); `improvements.md`'s own columns are precedent. *Confirm the enum.* **(Central layout ruling.)**
2. **Where do to-do cards render at Board altitude?** Own swimlane? Only in per-play views? A mix where `open` cards surface in the Backlog column (making "Backlog = plays + to-do cards" literal)? Recommendation: per-play views primary (§3); a Backlog-column pool of open cards as the studio-wide rollup.
3. **Testing checklist ↔ `risk-map.md` + `fixtures/`.** Generated from `risk-map.md` risk ids, or authored alongside as a rollup? Best read: a summary view, ideally seeded from `risk-map.md`. Tie-in: a Play Re-sync that resets proof (E13) should **re-open** the Testing card's cleared items. **(Coordinate with Play Re-sync.)**
4. **Rename: relabel title only, or migrate the storage key `empty → backlog`?** Recommended: relabel now, migrate later.
5. **Cards store: extend `board-state.json` (A) or split (B)?** Recommended **A**. Either way the `site-server.py` validator must change — "just add cards to the JSON" is not a no-server-change operation.
6. **Ledger event type for card lifecycle (D5).** Adopt `assessment.recorded` or add `board.card.*` / `decision.ruled` — keep it the same type Play Re-sync settles on.
7. **Migrated files: tombstone or delete?** `improvements.md` / Brief §8 leave a pointer stub, or removed outright (§6).
8. **Branch/sequencing.** The rename, Play Re-sync, and this card model are on a feature branch; sequencing them relative to landing is a coordination dependency, not a design one.

---

*This spec extends, not replaces, the live Board: `board-state.json` + `POST /api/board-state` stays the operational source of truth; the rename, the to-do card types, and the per-play views are additive. It honors IG3 (one process-anchored ladder), IG8 (`improvements.md` + Brief §8 retire into Improvement cards), the F2 typed-link model, the Play Re-sync Catch→Bug feed, and the ledger decision (cards as projectable events, wired later).*
