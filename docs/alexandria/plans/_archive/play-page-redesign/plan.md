# Play Page Redesign — Data Model & Design Plan

Status: draft for Director discussion · 2026-06-14
Surface: `packages/viewer-next` studio Play page (`/studio?tab=play&slug=…`)
Reference target: prototype at `studio/plays/frame-the-problem/index.html`
(served `http://127.0.0.1:8778/plays/frame-the-problem/`)
Page being fixed: `frame-the-problem-next`
(served `http://127.0.0.1:4323/studio?tab=play&slug=frame-the-problem-next`)

---

## Revision 1 — 2026-06-14: keep the left nav (supersedes the tab plan)

After the Overview shipped (#250), the Director's call: **keep the left nav,
don't move to Raven-style tabs.** The reason is the inverse of the original
worry — the dig-in sections are *rich*, and a left nav of collapsible
dropdowns holds richness better than a horizontal tab strip (a tab bar with
five dense panels behind it hides depth; a nav shows the whole shape at once
and lets sections expand in place). The viewer already has the right
primitive (`CollapsibleRailGroup`). So §4.3 (tabs), §4.4's `DetailTabs`, §5
decision 3, and §6 phase 4 below are **superseded** — read them as history.

What survives unchanged: the data model (§3, the `synopsis.md` artifact —
shipped), the diagram theming (§4.2 — shipped in #249), and the Explainer
content (§4.1 — shipped in #250, now named **Overview**).

### The left-nav section taxonomy (the new target)

The nav is the page's spine: a short stack of named, collapsible sections,
each opening either a **rendered view** or a **file list**. In order:

1. **Overview** *(rendered — shipped)* — the explainer: what it does · reach
   for it when · the play drawn + key · the play in use · when it fires. The
   landing; replaces today's "Walk the play" label.
2. **Play Walk** *(rendered — next)* — the move-by-move of an actual run:
   today's *one run end to end* + *inside the play (the moves)* + *what it
   produces*, plus the derived `story.md`. This is "the walk-through" in the
   old sense, now its own section instead of trailing the Overview in one
   scroll. (Carries the name the landing button used to have.)
3. **Workflow & prompts** *(files)* — `workflow.fabro`, `prompts/*`. Unchanged.
4. **Research & Grounding** *(files)* — `research/*`, grounding/source/
   extracted-claims — **plus the design brief (`brief.md`)**, which reads as
   grounding for the play, not a separate "design" bucket. Director's call.
5. **Fixtures & behaviors** *(files)* — unchanged.
6. **Dry-runs** *(files)* — unchanged (+ "trace a live run" link).
7. **Decisions** *(rendered)* — the ruling queue, as today.

### What moves, concretely (in `playRecords.ts` grouping)

- `brief.md` → **Research & Grounding** (today: `designProof` /
  "Brief, hardening & lint"). The group's `frontOfHouse` gains the brief.
- That leaves `hardening.md` + `lint.md` as a thin **Proof & hardening**
  group. **Open question for the Director:** keep them as their own small
  group, fold them under *Play Walk* (they're how the play was proven), or
  also pull them into Research & Grounding. Default if unspecified: a small
  *Proof & hardening* group with just those two.
- `synopsis.md` stays excluded from the rail (it *is* the Overview).

### Build notes (the "Play Walk" split — next slice)

- Promote the Overview and the Play-Walk detail out of the single
  `WalkThrough` body into two selectable nav sections. The header
  ("Walk the play" button) becomes **Overview**; a new **Play Walk** entry
  renders the run/moves/produces block (lift those sections out of
  `WalkThrough` into a `PlayWalk` view).
- Keep the spine anchors as in-section jump links *within* each rendered view
  (Overview's five, Play Walk's three), not a global list.
- Built off `main` after #250 merges (same file, so non-stacked-sequential).

---

## 1. What's wrong today

The viewer-next Play page renders an authored "walk-through" (spec → drawn →
in use → run → moves → produces) down a single scroll, with a deep file
rail on the left. Three problems:

1. **The explainer prose is the wrong content.** "What it does" is currently
   the registry `d` field — which holds *production-status meta-prose* ("The
   Slice 3 guinea pig: rung 1's proven logic re-rendered through the reshaped
   ladder…"), not what the play does for the room. There is no authored
   "reach for it when" and no plain-language trigger callout.
2. **The diagram is illegible.** `diagram.svg` is dropped into a 95%-white box
   (`rgba(255,255,255,0.95)`) on a dark-brown page: thin light-blue ellipses,
   dark `#1a1a1a` text, no color key. The SVG's only theming is a
   `prefers-color-scheme: dark` media query that (a) can't help inside a white
   box and (b) doesn't fire in light-mode browsers.
3. **The dig-in is a flat file rail, not a structure.** Everything past the
   explainer lives in one long left nav of collapsible groups; there's no
   "understand it / dig into it" separation.

The prototype already solves all three: a tight `What it does / Reach for it
when` opener, a dark-panel keyed Mermaid diagram with a one-line legend
("Gold = judgment · teal = mechanical check · dashed = exits"), a concrete
fictional scene, and a trigger callout. We are porting that information
architecture onto real, derived `-next` data.

---

## 2. The shape: two layers

> "That information right there gives me the basics of any play. That's the
> first must-have… digging into the details comes in after that." — Director

**Layer A — The Explainer (always visible, above the tabs).** The director's
must-have. Answers "what is this play?" at a glance.

**Layer B — The Detail (a tab system, like the Raven page).** The dig-in.
Replaces today's left-nav rail.

```
┌─────────────────────────────────────────────┐
│ Header plate  · name · glyph · stage · ready │
├─────────────────────────────────────────────┤
│ A. EXPLAINER  (the must-have)                │
│   1. What it does            (1 paragraph)   │
│   2. Reach for it when       (bulleted)      │
│   3. The play, drawn         (dark + keyed)  │
│   4. The key / legend                        │
│   5. The story               (fictional ex.) │
│   6. Trigger callout                         │
├─────────────────────────────────────────────┤
│ B. DETAIL  [ Moves · Run · Grounding ·       │
│             Proof · Decisions ]  ← tabs      │
│   (selected file renders in the active tab)  │
└─────────────────────────────────────────────┘
```

(Per Director: drop "Why it matters.")

---

## 3. Data model plan

### 3.1 The governing doctrine (must respect)

`studio/plays/README.md` — "One source, derived renderings":

- `brief.md §4` is the **single source** of a play's *logic*.
- `diagram.svg` and `story.md` are **derived** from it (`derive-views.sh`),
  never hand-edited. A hand-edited rendering is a Protocol E parity failure.
- "One source of truth per fact."

The Explainer introduces a new *kind* of content the ladder doesn't yet
have: **director/viewer-facing framing** ("what it does," "reach for it
when," a concrete scene, a plain trigger). This is not logic and not a
derived rendering. The Director has blessed it explicitly:

> "some of it will need to be written and updated by agents rather than
> derived… in some cases it may be a synopsis or simplified description from
> another source. The key is that we're clear."

So the rule we adopt: **the synopsis is an authored simplification that
points back at canon; it is never competing canon.** It carries a `sources:`
pointer per field and is re-reviewed (soft sync, agent-maintained) when its
source changes — not gated by Protocol E parity.

### 3.2 New authored artifact: `synopsis.md`

One new file per play, alongside `brief.md`. Audience: the Director and
anyone reading the page. Authored by an agent, pointing at canonical
sources. Proposed shape (YAML front-matter + markdown body):

```yaml
---
# synopsis.md — director-facing framing. A simplification, not canon.
# When a `sources:` target changes, re-review the field it feeds.
what_it_does: >
  Recovers the real problem(s) underneath a conversation — each stated in
  the owner's words, with who has it, when it bites, and word-for-word
  evidence — plus a spoken read-back for the room (75 words is a ceiling).
  It never invents one: if there's no problem there, it says so.
reach_for_it_when:
  - someone pitched a **solution** and you want the problem behind it
  - you're about to run an **experiment** and need the problem defined tightly
  - you're facing a **sea of problems** and need them split into related pieces
  - you're **workshopping a problem statement** and want a sharper one
trigger:
  cue: '"Raven, frame that."'
  receives: >
    The whole conversation so far, with the moment of invocation marked.
    Product context (a surface map, who the users are, a prior brief) rides
    along if it exists. She works with whatever she's given and is explicit
    about what she didn't have.
sources:
  what_it_does:      [brief.md#1, prompts/render.md]
  reach_for_it_when: [brief.md#2, research/grounding.md]
  trigger:           [brief.md#2]
  story:             [fixtures/golden, runtime/problem-brief.md]
---

## Story  (the play in use — a fictional, concrete scene)

<authored: a plausible product team hits the trigger; walk the play through
their meeting end to end, grounded in the shape of a real fixture. The
prototype's "Lantern" scene is the model.>
```

Field-by-field, **what source each agent writes from**:

| Explainer field    | Authored / Derived | Agent writes from                                          |
|--------------------|--------------------|------------------------------------------------------------|
| `what_it_does`     | authored synopsis  | `brief.md §1` (goal, done-when, scope/hunch boundary) + `prompts/render.md` (voice) |
| `reach_for_it_when`| authored synopsis  | `brief.md §2` (the dumb trigger) + `research/grounding.md` (the situations it serves) |
| `trigger` callout  | authored synopsis  | `brief.md §2` (the cue, the untrusted inputs it receives)  |
| `story` (fictional)| authored synopsis  | `fixtures/golden/*` (real input shape) + `runtime/problem-brief.md` (real output) — dramatized into a concrete scene |

### 3.3 What stays derived (never authored)

| Page element        | Source                              | Tool                                |
|---------------------|-------------------------------------|-------------------------------------|
| The diagram         | `workflow.fabro` (← `brief.md §4`)  | `fabro graph` via `derive-views.sh` |
| The diagram **key** | `workflow.fabro` node `doer` types  | new theming step (§4.2) / viewer    |
| Move-by-move story  | `story.md` (← brief §4 + prompts)   | `generate-story.py`                 |
| Move cards          | `story.md` parse (`playNarrative.ts`)| existing                            |
| One-run boxes       | `fixtures/` + `dry-runs/` records   | existing (`playRecords.ts`)         |

Note the split on "story": the **abstract** move-by-move narrative
(`story.md`, derived) stays in the *Moves* tab as the QA read; the
**concrete fictional scene** in the Explainer is *authored* in
`synopsis.md`. These are two different artifacts for two audiences.

### 3.4 What already exists and just needs surfacing

`brief.md`, `prompts/*`, `workflow.fabro`, `research/*`, `fixtures/*`,
`hardening.md`, `lint.md`, `dry-runs/*`, `runtime/*` are all present and
already grouped by `groupPlayRecords()`. They become tab contents (§4.3),
no new data needed.

### 3.5 Registry `d` — leave it, repurpose its display

`registry.js` `d` is production-status prose used across the Raven grid and
Board; don't repurpose the field. The Play page simply stops rendering `d`
as "what it does" and reads `synopsis.what_it_does` instead. `d` can move to
a small "production status" line in the header or the Proof tab.

### 3.6 Serving `synopsis.md`

The studio API already serves arbitrary play files (`studio/file?path=…`)
and a records list. Add `synopsis.md` to the play dir; the viewer fetches +
parses it (front-matter + body) the same way it fetches `story.md`. No new
endpoint required.

---

## 4. Design plan

### 4.1 The Explainer block (render order, top of page)

1. **What it does** — `synopsis.what_it_does`, one paragraph, full-width
   prose at reading measure (~740px).
2. **Reach for it when** — `synopsis.reach_for_it_when`, arrow-bulleted list
   (prototype `.lg-opener` styling: gold arrows, teal-bold keywords).
3. **The play, drawn** — full-bleed, centered, **dark panel** (near-black,
   e.g. `#0a0704` / `rgba(8,5,2,0.5)`), not the white box. Clickable →
   existing `DiagramOverlay` (zoom/pan already works).
4. **The key** — one-line legend under the diagram: `Gold = judgment ·
   teal = mechanical check · dashed = exits & the meeting loop`. Generated
   from the doer taxonomy present (§4.2).
5. **The story** — `synopsis.md` body, the concrete fictional scene.
6. **Trigger callout** — `synopsis.trigger`, in a highlighted callout box
   (prototype `.lg-trigger`: gold dashed border, `⚡` + cue bold + receives
   span).

This whole block is the "explainer section… the first must-have." It is the
default view; no tab selection needed to see it.

### 4.2 Diagram: legibility + the key

The diagram **must** stay derived. Two ways to get keyed, dark-ready output;
recommend the first.

**Option A (recommended) — theme at derivation time.** Add
`studio/tools/theme-diagram.py`, run by `derive-views.sh` immediately after
`fabro graph`. It reads `workflow.fabro` (node → `doer`, node → shape
start/exit/parallelogram, edge → condition) and rewrites the emitted SVG:

- judgment nodes → gold stroke (`#b8863a` / text `#e8e0d4`)
- mechanical nodes → teal stroke (`#4fb8a8`)
- start/exit nodes & refusal/bounce edges → dashed, muted (`#6a5e4e`)
- all text → light (`#e8e0d4`); background transparent (panel supplies dark)

Result: a single derived `diagram.svg` that reads correctly **everywhere**
(viewer, overlay, standalone), still re-derivable, never hand-drawn. The
viewer just swaps the white wrapper for a dark panel and renders the legend.
This honors "one source, derived renderings": theming is a deterministic
pipeline step, not a hand-edit. (`fabro` itself is vendored / not edited —
the post-pass lives in `studio/tools`, consistent with `generate-story.py`.)

**Option B (fallback) — theme in the viewer.** Inline the SVG (fetch +
`<svg>` instead of `<img>`), match node ids to `workflow.fabro` doers
client-side, apply CSS classes for color/dash. Keeps `diagram.svg` neutral
but pushes correctness into React and leaves the standalone/overlay SVG
plain. Use only if the derive-time pass is impractical.

Either way the viewer change is: drop `bg-white/95`, put the diagram on a
dark full-bleed panel, add the legend row beneath.

The legend is data-true: emit only the categories the play actually uses
(every play has judgment; `frame-the-problem-next` also has mechanical
`ground` + the `word_check` software parallelogram + refusal/bounce edges).

### 4.3 Detail: tabs (like the Raven page)

Replace the left-nav rail with a horizontal tab strip (Raven's tier-tab
styling: raised active tab, gold gradient). Map today's nine nav groups into
five tabs:

| Tab          | Contents (from existing `groupPlayRecords`)                              |
|--------------|--------------------------------------------------------------------------|
| **Moves**    | Inside-the-play move cards + `workflow.fabro` + `prompts/*` + `story.md` |
| **A run**    | One-run-end-to-end boxes + `fixtures/*` + `dry-runs/*` (+ trace link)    |
| **Grounding**| `research/*`, sources, `extracted-claims.md`                             |
| **Proof**    | `brief.md`, `hardening.md`, `lint.md` (+ registry production status)     |
| **Decisions**| the ruling / decision queue (`rulings`, brief queue section)            |

Within a tab, selecting a file renders it via the existing `FileBody`
(markdown/svg/text). The per-fixture and per-run sub-grouping already built
in `playRecords.ts` becomes in-tab structure (e.g. a left mini-list inside
*A run*), so no parsing work is lost.

### 4.4 Component changes (`packages/viewer-next/src/components/studio/`)

- `PlayPage.tsx` — split the monolith `WalkThrough` into an always-on
  `Explainer` block + a `DetailTabs` strip; retire the left-nav `<nav>` and
  the spine-anchor logic. Reuse `DiagramOverlay`, `FileBody`,
  `CollapsibleRailGroup` (now scoped inside tabs).
- New `synopsis.ts` — fetch + parse `synopsis.md` (front-matter + body),
  mirroring `playNarrative.ts`.
- `Explainer.tsx` — the six-part block (§4.1).
- `DetailTabs.tsx` — the tab strip + active-tab content (Raven tab styling
  lifted from `RavenTab.tsx` lines ~491–522).
- Diagram: dark panel + `<Legend>`; if Option A, no React diagram change
  beyond the panel; if Option B, an inline-SVG component.
- `studio/tools/theme-diagram.py` + one line in `derive-views.sh` (Option A).

---

## 5. Open decisions for the Director

1. **Synopsis file** — name/format OK? (`synopsis.md` with YAML front-matter
   + body, `sources:` pointers, marked "not canon.") Alternative: fold the
   scene into the front-matter too and keep one file; or split the scene to
   `example.md`.
2. **Diagram theming** — Option A (derive-time post-pass, recommended) vs
   Option B (viewer-side inline). A is more work up front, correct
   everywhere; B is contained to the viewer.
3. **Tab set** — five tabs as in §4.3, or a different cut (e.g. fold
   *Decisions* into the header as a badge that opens a drawer)?
4. **Authoring rung** — where in the ladder does `synopsis.md` get written?
   Proposal: a light step at/after Derive (the agent that has fixtures +
   runtime can ground the scene), re-reviewed at the Proven confirm.

---

## 6. Sequencing

- **Phase 1 — data**: define + author `synopsis.md` for
  `frame-the-problem-next`; add fetch/parse. (Unblocks the explainer prose.)
- **Phase 2 — diagram**: theming pass + dark panel + legend. (Biggest
  visible win; independent of Phase 1.)
- **Phase 3 — explainer**: build the six-part `Explainer` block over the new
  data.
- **Phase 4 — tabs**: replace the rail with `DetailTabs`.
- **Phase 5 — generalize**: template `synopsis.md` (add to
  `TEMPLATE-brief.md`'s neighbor set / ladder doc) so every play gets one.

Phases 1–2 are independent and can run in parallel; 3 depends on 1, 4 is
independent of all, 5 last.
