# The Studio Board — surface decision (RESOLVED 2026-06-23)

> **Resolved 2026-06-23 (director ruling).** The canonical Playmaker Studio is the
> **viewer's `/studio` tab** (`packages/viewer/src/components/studio/`). The
> standalone `studio/*.html` + `site-server.py` (`:8778`) site is **RETIRED** — a
> smuggled-in prototype, not "in Alexandria." This note previously parked the
> question as *open* and **leaned the wrong way ("8778 canonical")**; that lean is
> overturned. **Decision = Option B (cut over to the viewer).** See memory
> `studio-surface-is-the-viewer`, [`org-model.md`](org-model.md), and
> [`issue-plan.md`](issue-plan.md) (the surface-correction track).

## The ruling, concretely

- **Catalog + Board render in the viewer**, off the shared studio data
  (`studio/plays/registry.js`, `board-state.json`). Phase-1's catalog (#353) and
  Board (#358) UI were built into the retired `:8778` HTML (`registry.html`,
  `board.html`) — that rendering ports to `/studio`. The data/logic were sound and
  surface-agnostic; only the rendering was mis-placed.
- The viewer's **`/api/studio/board` endpoint gains the work-order card authoring**
  (`merge_cards` + card validation) that currently lives only in `site-server.py`,
  and adopts `backlog` as the first stage key (it is still on the old `empty`).
- **#347** (Board-advanced) retargets to the viewer board tab.
- The `:8778` site is **deleted once its surfaces have a viewer home**; the shared
  data (`studio/plays/`, `registry.js`, `board-state.json`) and the `studio/tools/`
  data-validators stay as the file-level CI guard.

## The situation that forced the call (verified on `main`)

Both surfaces write `studio/plays/board-state.json`:

| Path | What it writes | Cards? |
|---|---|---|
| **`studio/site-server.py`** (`:8778`) | stages + ready + **work-order cards** (Testing/Improvement/Bug), with `merge_cards()` preserving cards a stale tab didn't post | **full CRUD** — where #358's card authoring lives |
| **viewer `/api/studio/board`** (`packages/ax/src/effects/studio-api.ts:boardWriteResponse`) | **stages + ready only** — reads `existing` fresh and writes `{ ...existing, stages }`, never reading/writing `cards` | **none** — preserves on-disk cards via the spread, but can't author them |

The viewer endpoint does **not** drop on-disk cards (the spread preserves them), but
it **can't author** them, and the viewer's read schema (`StudioBoardSchema`) drops
`cards` on decode — so the viewer can neither show nor edit work-order cards today.
It is also still on the **old stage vocabulary** (`empty`): the canonical
`board-state.json` files the backlog under `backlog`, so the viewer board currently
renders an empty "Empty" column and hides the whole backlog. Both are part of the
port.

## Why this was a port, not a `rm`

`studio/` is three things; the cut-over sequences them:

- **`studio/plays/` + `board-state.json` + `registry.js`** — load-bearing
  content/data + the org model. **Kept.**
- **`site-server.py` card authoring (`merge_cards`/`validate_cards`)** — the only
  place work-order cards can be created. **Ported to the viewer endpoint first.**
- **`index.html` / `registry.html` / `board.html` / `board-ui.js`** — the `:8778`
  UI. **Deleted once the catalog + Board live in `/studio`.**

## History (the open-decision framing this replaces)

This note was raised 2026-06-23 as an *open* question with three options (A: 8778
canonical · B: cut to the viewer · C: keep both), and leaned A on a now-rejected
read of the roadmap (that the studio is a spin-out tool outside the product). The
director ruled **B**: the viewer is the product surface for the Studio, and the
prototype retires. The factory's **dual-maintenance** (it had been writing features
like #344's provenance into *both* surfaces) is what kept the viewer current and
made the cut-over a port rather than a rebuild.
