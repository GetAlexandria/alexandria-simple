# Issue draft — Tab 2 · PMS-Drafts (Raven's FoH workspace)

> Factory-style draft for review. Build **after** PMS-Back (Tab 1) lands. Its own
> PR, off `main`. Posting to GitHub is the director's call.

## Job to be done

Give Raven a Front-of-House workspace: an editable **working copy** of the
PMS-Back library that Raven tunes during the director conversation, with the
BoH baseline kept pure and every change tracked. This is the second of three
pure states — **PMS-Back (pure BoH) → PMS-Drafts (FoH tuning) → PMS-Final
(approval)** — and it must not blur into the other two.

## Discipline (load-bearing)

- **Back stays byte-pure.** PMS-Drafts is a separate, editable layer; it never
  mutates the swept `studio/sweeps/playmaker-studio/` output. FoH changes land
  as **tracked patches/events**, so the BoH baseline and the FoH deltas are both
  independently inspectable (the archaeological dig).
- **Raven asks the director in FoH; the builder does not.** The threads the
  sweep found (the 5 gaps + 6 hot-spots PMS-Back already renders) **are Raven's
  FoH agenda.** Resolving a thread (e.g. the two-card-vocabularies hot-spot) is
  Raven's job in the conversation, never a question the build agent puts to the
  director.
- **FoH improves the rendering.** The controlled experiment: Raven consumes the
  Back rendering + threads, runs the director conversation, and updates the
  Drafts rendering so it measurably gets better (threads resolve).

## What will be true (observable)

- A **PMS-Drafts** tab in the library section renders a working copy of the
  PMS-Back library.
- Running the existing **`front-of-house-walk`** play against the Back state +
  threads produces Drafts edits as tracked patches/events; the Drafts rendering
  reflects them while `studio/sweeps/playmaker-studio/` stays unchanged.
- Open threads decrease as Raven resolves them; the change trail (what changed,
  why, from which thread) is inspectable.
- The three states remain visibly distinct (Back read-only, Drafts editable,
  Final = approval).

## Interface contract (freeze before building)

- **Where Drafts state lives** — a separate draft root vs. an event/patch log
  layered over the Back root. (Decision needed; the patch-log option keeps Back
  trivially pure and gives the trail for free.)
- **Patch representation** — the shape of a tracked FoH edit (kind, target,
  before/after, originating thread id) and how it composes over the Back
  baseline at render time.
- **Engine wiring** — `front-of-house-walk` (already built) reads the Back
  catalog + `threads.json` and writes Drafts patches. Reuse the shipped
  surface (the PMS-Back render path) for the Drafts tab.

## Decisions / open questions

- **Deferred (handoff §2):** whether/when the director *sees* the surface live
  during FoH. For the controlled start it is about **Raven updating** the
  rendering, not live director integration — keep live integration out of scope
  unless explicitly pulled in.

## Verification

- Load PMS-Drafts; it renders a copy of the Back library.
- Run `front-of-house-walk` against the Back state; ≥1 thread resolves and the
  Drafts rendering changes accordingly.
- `studio/sweeps/playmaker-studio/` is byte-identical before/after (Back pure).
- The change trail for each edit is inspectable and attributes the originating
  thread.

## Non-goals

- Diagrams (Seam 1) and the §5b category-vocabulary work (separate track).
- The director approval/confirm step (that's Tab 3 · PMS-Final).
