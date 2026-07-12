# Design brief — the **Viewer elicitation** session

*A build brief for a fresh agent. Self-contained. Sibling of the taxonomy walk. 2026-07-05.*

## Why this exists (read first)

**The viewer is the front of Alexandria's product roadmap.** Every primitive area —
Library, Playbook, Ledger, Knowledge Bank, and the newer/experimental views —
represents something meaningful, and each is built to a *different extent*. Naming
what's in each area **now**, and what it's **intended to be**, does two jobs at once:

1. It **fills the library's Surfaces coverage gap** — the viewer already ships **12+
   routes** the library never named (flagged during the taxonomy walk).
2. It **lays down the product roadmap** — the "intended" state of each area *is*
   roadmap content, and Alexandria's own data model already has a **Product Roadmap
   Area** (Product plane) to feed.

Run this like the taxonomy walk: chunked, one area at a time, low cognitive load.

## The method — elicit each primitive (now + future + build-state)

Walk the viewer primitive by primitive with the director (Raven mediates). For each
area, capture:
- **What it is now** — the current shipped reality (or "not built yet").
- **What it's intended to be** — the future / roadmap state.
- **Build state** — shipped · stub · experimental · planned · speculative.
- **Where it sits** — which pillar/context; what it contains, what contains it.
- **Disposition** — keep · promote · remove-until-built (e.g. Info Hub).

## The primitives to elicit (inventory + head start from this session)

- **Library** — a pillar / top-level nav. (Being built out right now via the taxonomy +
  Knowledge-Organization work — very meta.)
- **Playbook** — a pillar / top-level nav.
- **Ledger** — a pillar / top-level nav (ruled a *pillar* this session, not a Mechanism).
- **Knowledge Bank** — Raven's; a **real but nascent gaming mechanic** (you power it —
  and her — by building your library; future plays gate on built-out planes/containers).
  Represented for Raven today; not fully wired. **Keep** (not a derived-view to de-card).
- **Info Hub** — speculative/unbuilt **kanban** to track all Alexandria work. Capture the
  plan; **likely remove from the live viewer** until it's built.
- **Builder view** — recently added; **needs QA/testing** to confirm it actually works.
- **Knowledge-Organization / Taxonomy walk view** — added this session; several
  experimental views are currently up (enumerate what's live).
- **The 12+ Viewer Routes** — the screens the library never named; enumerate them from
  the code (`packages/viewer/src` route map).
- **Tray · Canvas · AX CLI · Viewer shell** — shipped surfaces already ruled (see Locked
  decisions — don't redo, extend).

## Two outputs

1. **Library cards (the NOW):** each primitive → a Surface card (or the right type),
   reconciled with the taxonomy-walk Surfaces rulings — filling the coverage gap.
2. **The product roadmap (the FUTURE):** each primitive's "intended" state → roadmap
   content, feeding the Product Roadmap Area (Product plane). The viewer is the
   roadmap's front.

## Modeling notes
- Use the two-axis model (Type = families category, Altitude = DDD grain). Viewer
  screens are **Surfaces** (places) — but decide *per screen*: a first-class Surface, or
  a **Viewer Route** (Component) inside the Viewer Surface? (The Viewer card already
  models routes as `Component - Viewer Route`.)
- Knowledge Bank is a **real mechanic**, keep it (the earlier "derived view" read was too
  literal).
- Each primitive's build-state maps to card **status** (shipped→confirmed, partial→stub,
  planned/speculative→stub or "not carded yet + capture the plan").

## Grounding — read before running (don't start cold)
- **Surfaces already walked + all rulings:** `docs/alexandria/plans/library-word-legibility/library-update-worklog.md` (Surfaces section + "Batch-review discussion rulings" + this "Next elicitation: the VIEWER" to-do).
- **The two-axis model:** `docs/alexandria/plans/library-word-legibility/taxonomy-state-of-the-state.md`.
- **The real routes/screens (code):** `packages/viewer/src/` — especially `components/library/viewer-routes.ts` (the route map) and how `Component - Viewer Route` is used.
- **The shipped surface cards:** `docs/alexandria/sweeps/alexandria-product/viewer/…` and `…/canvas/…`.
- **The director's data model (pillars + Product Roadmap Area):** the Library/Playbook/Ledger model doc in the session's `.context/attachments/`.
- **Memories:** `alexandria-organizing-concepts-are-product-feature`, `alexandria-two-axis-taxonomy`.

## Locked decisions (do NOT relitigate — from the 2026-07-05 taxonomy walk)
- **Viewer** = pillar Surface (confirmed); houses the routes, the Tray, and the (dormant) Canvas.
- **Tray** = confirmed Surface (holds one Coin per AI Colleague).
- **AX CLI** = confirmed Surface (the terminal; sibling to the Viewer).
- **Inbox** = deprecated (parked prototyping ghost).
- **Canvas** = a **dormant Mechanism**, NOT a Surface (retyped; the "main pane / magic window" meaning dropped).
- **Ledger** = a **pillar** (top-level nav), not a Mechanism.

## Owner
Director + Raven. Same shape as the taxonomy walk — chunk by area, capture
now / future / build-state, output library cards (now) + roadmap (future).
