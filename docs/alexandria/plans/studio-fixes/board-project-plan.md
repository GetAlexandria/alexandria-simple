> **Project plan / design-capture — 2026-06-22.** The Board's *logic* is settled (IG8 + [board-data-model.md](board-data-model.md), confirmed this session); this sequences the design + build work to make it **real, useful, and usable.** Not built today. Sits under the [Operations & Maintenance Quality Plan](studio-operations-quality-plan.md).

# PROJECT PLAN — Bringing the Board to Life

## The settled logic (locked)

- **One studio-wide Board** — the work-to-be-done tracker (the maintenance half of the Quality Plan).
- **Two card kinds:** **Play cards** (the lifecycle *funnel* — Backlog → Sourced → Designed → Built → Proven → Live) and **work-order cards** (Testing / Improvement / Bug).
- **Work-order cards carry their own status** — `open / in-progress / done` — a **different beast from the play funnel** (director, confirmed): a bug being open/closed is a different axis from a play being built/live.
- **A work order can sit at several levels.** In Playmaker Studio it's *usually* a card tied to a specific play — but the Division→Function structure means it can also be **system-level** (no specific play). "More times than not it is a card, but we've clearly established paths where it isn't."
- **The link generalizes:** a work order belongs to a **Division / Function**, with an **optional specific play.** (A play-level Bug and a studio-wide Improvement are the same model, different scope.)
- **Multiple views / tiers are on the table** (director, open to it) — at minimum the play-funnel view + work-order views (per-play, per-system).
- **The three types:** Testing (one checklist-card/play, raise N past the smoke) · Improvement (forward-looking) · Bug (corrective; higher default priority). **Play Re-sync *Catches* auto-log as Bugs.**

## The work to make it real ("there is *plenty* to be done")

### Phase 0 — Data model + server contract *(the reality check)*
- Extend `board-state.json` with a `cards: [...]` array (work-order: `type`, `status`, Division/Function, optional `play`, `priority`, Testing `checklist`).
- Change `site-server.py`'s validator — today it **hard-validates the six stage keys and accepts only bare slug strings**, so cards cannot be added passively. Add a `cards` validator + allow the Backlog rename.
- Relabel **Empty → Backlog** (display now; migrate the storage key later).

### Phase 1 — Editability *(the thing you can't do today)*
- Make work-order cards **creatable / editable / movable / closeable** by the director in the browser, persisted via the server. Today there are no rich cards to edit — only play-slug drag, and only with `site-server.py` running. This is the core usability gap ("I can't even edit a card myself or move it around").

### Phase 2 — Views / tiers
- **Play-funnel view** — the lifecycle stages (today's board).
- **Work-order views** — per-play (a play's big/small view), per-system (the Operations Division backlog), optionally per-Function — all filtered off the Division/Function/play link.
- Decide which are top-level **tiers** vs **filters**.

### Phase 3 — Connections
- **Play Re-sync Catches → Bug cards** (auto-logged).
- **Ledger** — card create/move/close as events (per `work-with-the-ledger.md`; needs the D5 event type).
- **Migration** — `improvements.md` + Brief §8 → Improvement cards; tombstone the files.

## Open design questions

- **The "work order" term** (director: "for lack of a better term") — the generic for a unit of work (Testing/Improvement/Bug). Card? Work order? Ticket? Item? Pick one.
- **Views / tiers** — exactly which views are top-level tiers vs filters.
- **Testing card ↔ `risk-map.md` / `fixtures`** — generated from the risk-map, or authored alongside? Coordinate with Play Re-sync (a re-sync that resets proof should re-open the Testing checklist — E13).

## Not today

The logic is clear; this is the path to make the Board real. Sequenced design + build, captured so momentum holds — the same shape as the Operations Division proposal.
