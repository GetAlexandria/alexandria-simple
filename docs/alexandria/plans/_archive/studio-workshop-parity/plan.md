# Studio Slice 4 completion — the play workshop, by jobs-to-be-done

Status: DRAFT — awaiting Director review
Date: 2026-06-13
Owner: Director (Danvers), drafted by orchestrator
Parent plan: `docs/alexandria/plans/playmaker-studio-fabro/plan.md` (this is the
remainder of that plan's **Slice 4**, not a new line of work)

---

## §1 Goal

The old studio had a play workshop that did real work: you could **swim the
whole process stem-to-stern** — elicitation output, the research and
source-material spikes, the drill-down to the foundational source lot we picked,
the play drawn as a graph, and one run end-to-end — with a front-end focus that
made the play **QA-able**: dig in, find the root cause, see where a problem
enters. The new `/studio` does not have this yet. Finish Slice 4 so it does.

**Framing correction (Director, 2026-06-13):** the old workshop page was *not*
unscalable in what it did — its content was derived reflections of the process.
Only its **hand-assembly** (510 lines of bespoke HTML per play) was
unsustainable, and that is exactly the part the reshape already replaces: the
hand-drawn graph → `fabro graph`, the seven-moves walkthrough → generated
`story.md`. So the workshop's **jobs are requirements**; we rebuild them on
generated/derived inputs instead of hand-built ones. We do not copy the old
assembly; we do not drop the old jobs.

**Anti-drift rule:** no play's logic changes here. Pillar A renders artifacts.
Pillar B gives two artifact classes a home and a generator. Records stay files
under `studio/plays/`; the viewer renders, it does not own.

## §2 Jobs to be done (the spec — everything below serves these)

1. **Swim the whole play, front to back.** From the elicitation/source material
   that seeded it, through the research and the chosen foundational lot, to the
   logic graph, to one run end-to-end. The front end is first-class — that is
   where most QA happens.
2. **Dig to root cause.** When a run is wrong, trace it: which move, which
   prompt, which input, which fixture, which retry. Find where the problem
   enters.
3. **See and work the play↔fixture match.** Find a play's fixtures, understand
   which fixture exercises which behavior, read them, edit them. Fixtures are how
   we prove a play and how we reproduce a bug.
4. **Read the play as one story** (the generated story view) and **see it drawn**
   (the generated diagram), both dive-in-and-out.
5. **Rule from the workshop** — the open decision queue is visible where the
   Director is already looking.

## §3 Where we are — and the two gaps

PR #237 shipped the Board and the Factory-runs inspector. It did **not** ship the
workshop. Worse, the data two jobs depend on is missing from the new line:

- **`research/` exists and is populated** for all 15 fleet plays (grounding,
  research-brief, extracted-claims) — the source-material/front-end home is
  there. The viewer just doesn't render it (today `PlayRecordsView` is a flat
  alphabetical file dump). *Job 1 is a pure rendering gap.*
- **`fixtures/` exists for zero new-line plays.** The carve never gave fixtures a
  home or a play↔fixture binding. *Job 3 has nothing to render.* This is the same
  root cause as the `ax2 run frame-the-problem` input gap flagged on #237 —
  fixtures fell out of the reshape. (See `studio/plays/frame-the-problem/`,
  frozen: it still has the rich `fixtures/` the new line lacks.)
- **The exemplar is a poor showcase.** `frame-the-problem-next` is the single
  play with no `research/` of its own (it inherited from the frozen original), so
  the play you'd open to judge the workshop can't demonstrate Job 1.

So the work is two pillars: **render the front-end that exists (A)**, and **give
fixtures + the exemplar's front-of-house the data that doesn't (B)**.

## §4 Pillar A — the workshop view (rendering)

Replace the flat `PlayRecordsView` with a workshop laid out like the old binder:
a curated, **grouped** left rail and a main pane. The rail groups records the way
the jobs want them, not alphabetically:

- **Front of house** (Job 1): elicitation output, `research/grounding.md`,
  `research/research-brief.md`, `research/extracted-claims.md`, and the chosen
  foundational source lot — surfaced together, up top.
- **The logic** (Job 4): the play **drawn** (`diagram.svg`, click → full-screen
  overlay with scroll-zoom / drag-pan / dbl-click-reset / esc; port the ~50-line
  `openDia()` from the old workshop into a small React component) and the
  **story** (`story.md`, rendered via the existing `react-markdown` path,
  first-class — not one file among many).
- **Fixtures** (Job 3): the play's fixtures listed with their bound behavior,
  readable inline, with an obvious path to edit (depends on Pillar B).
- **Proving / runs** (Job 2): brief proof spec, `lint.md`, dry-run records and
  the graded read-out, linking through to the Factory-runs inspector for live
  root-cause tracing (move → prompt → input → retry).
- **Decision queue** (Job 5): the play's `rulings` count (already served via
  `/api/studio/registry`) plus the brief's `## …decision queue` section,
  rendered as its own panel.

Also: **Registry → golden-path chain** (matching `registry.html`): chain order,
sectioned (core / inputs / stretch / Demo M), status legend, SSOT note. Data is
already in `registry.js` rows (`n`, `prio`, `g`, `glyph`, `status`, `rulings`).

`FileBody` already renders `.md` and `.svg`; this is mostly layout + grouping +
the diagram overlay, over endpoints that already exist.

## §5 Pillar B — give fixtures and the exemplar a home (data/process)

This is the part the reshape skipped. Without it, Jobs 1 and 3 have nothing to
render and `ax2 run <play>` stays un-runnable one-command.

1. **Define the fixture home + play↔fixture binding for the new line.** Decide
   where fixtures live (recommend: `studio/plays/<slug>/fixtures/<case>/` with
   one dir per behavior — golden, refusal, empty, hard-case — each carrying the
   named inputs the workflow consumes) and how a fixture maps to the workflow's
   declared inputs. Record in `PROJECTION.md` / `TESTING.md`.
2. **Make fixtures the run inputs.** `ax2 run <play> --fixture <case>` (or
   `--input-file`) so a fixture *is* how you run a play — closing the #237 gap
   (no inline-only `--input`, no single-quote landmine). Quality + QA +
   reproducibility all key off the same artifact.
3. **Wire the Derive step to emit the generated views per play** — `fabro graph`
   → `diagram.svg`, `generate-story.py` → `story.md` — so every workshop is
   non-empty, not just `-next` by hand.
4. **Backfill the exemplar's front of house.** Give `frame-the-problem-next` its
   own `research/` and a `fixtures/` set (port/adapt from the frozen
   `frame-the-problem/`) so it can actually demonstrate Jobs 1 and 3.

## §6 Scope — out / deferred

- **The bespoke `frame-the-problem` hand-assembly** (the Lantern scene as
  hand-written HTML, the hand-coded four-part chips). The *jobs* those served are
  in §2; we meet them with generated/derived inputs, not by re-hand-authoring.
- **Board** and **Factory-runs** — shipped; untouched (the workshop links into
  the runs inspector for Job 2, not reimplements it).
- **Record-file relocation** (parent plan's open ★: stay at `studio/plays/` vs a
  content dir). Lean: stay put. Out until the static site is actually retired.
- **In-browser mermaid** — unnecessary; the diagram is pre-rendered SVG.
- Any play *content* change.

## §7 Architecture & touch points

- `packages/viewer-next/src/components/studio/StudioApp.tsx` — rework
  `PlayRecordsView` → grouped workshop; `RegistryView` → chain; add
  `<DiagramOverlay>`.
- `packages/ax-next/src/effects/studio-api.ts` — prefer rendering over data
  already served; add at most one read-only endpoint if the decision-queue or
  fixture-binding parse needs the server. No new write surface.
- `packages/ax-next` run path — `--fixture` resolution into workflow inputs
  (Pillar B.2), reusing the existing input-substitution machinery.
- **Derive step** — `studio/plays/README.md`, `PROJECTION.md`, `TESTING.md`:
  fixture home + binding, the `--fixture` run convention, and per-play emission
  of `diagram.svg` + `story.md`.
- Static studio (`studio/plays/*.html`, `site-server.py`) — retired only after
  the §8 proof. Fallback until then.

## §8 Proof / done-when

Inherits the parent plan's Slice 4 proof, with the jobs made explicit:

> **Done when:** the Director runs a full review session entirely in
> viewer-next — moves the board, rules a gate, **swims a play front-to-back,
> opens its fixtures, and traces a run to root cause** — with no fallback to the
> static pages; board state survives restart; the static site is retired.

Concrete pre-session checks:

- `/studio?tab=play&slug=frame-the-problem-next` shows front-of-house
  (research/source), the zoomable diagram, the story view, the **fixtures with
  bound behaviors**, the dry-runs with a link into the runs inspector, and the
  decision queue.
- `ax2 run frame-the-problem --fixture golden` runs with no hand-fed inputs.
- `/studio?tab=registry` shows the sectioned golden-path chain with live
  statuses.
- A second, freshly-derived play renders a non-empty workshop (proves the
  generator + fixture wiring is per-play, not a one-play special case).
- `astro check` clean; viewer build green; studio API tests green.

## §9 Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Fixture home/binding designed in the viewer instead of the line, baking a viewer-shaped convention | High | Pillar B is a *line* decision (run path + PROJECTION/TESTING) first, rendered second. Decide the binding before building the fixtures panel. |
| Pillar B (fixtures) is bigger and slips, dragging the fixture-dependent jobs with it | High | Decide B.1 first (cheap), then run two parallel tracks (§10.2): Track 1 (front-of-house/story/diagram/runs/registry) is unblocked today; Track 2 (fixture spine) carries the higher-value jobs. Don't queue all of B behind A — that defers root-cause + play↔fixture + runnability. |
| Front-of-house render assumes a `research/` shape that varies across plays | Medium | Render what's present, group by known filenames, graceful fallback; don't hard-require a schema. |
| Generators not wired into Derive → empty workshops for all but `-next` | High | §5.3 explicit; §8 second-play check gates it. |
| Scope creep into a visual redesign | Medium | Parity pass, not a redesign — match the existing static look. |

## §10a Delivery (Director directive, 2026-06-13)

Ships as **separate, independent PRs off `main` — not stacked, no auto-merge** —
so each can be QA'd on its own:

1. **Plan** (this doc, docs-only).
2. **Exemplar backfill** — `frame-the-problem-next/research/` + `fixtures/<case>/`.
3. **`--fixture` run path** (ax-next) — closes the #237 runnability gap.
4. **Workshop + golden-path chain registry** (viewer-next) — Pillar A render.
5. **Derive generators + process docs** — per-play `diagram.svg`/`story.md`,
   TESTING/PROJECTION/README.

Each branches from `main` and stands alone. Where one is QA'd more fully once
another is merged (e.g. the workshop's fixtures panel against #2's fixtures, or
a live `--fixture` run needing both #2 and #3), the PR body says so; none
*depends* on another to build or merge.

## §10 Decisions

**Execution note (2026-06-13):** the Director delegated the build —
"orchestrate the build out of as much as you can… use your best judgment." The
decisions below were ruled by the orchestrator on that authority and are built;
they are framed so the Director can override on return. Provenance is recorded
inline.

1. **Fixture home + binding (Pillar B.1) — RULED (orchestrator, 2026-06-13).**
   `studio/plays/<slug>/fixtures/<case>/`, one dir per behavior case
   (`golden`, `refusal`, `empty`, `rerun`, `hard-case`). Each case dir holds the
   workflow's inputs as files named by input key (`transcript.md`,
   `surface_map.md`, `users.md`, `prior_brief.md`); an optional `expected/`
   subdir holds grading material (answer-key, read-out), never passed as input.
   **The binding exploits how the workflow already consumes inputs: as file
   paths, not inlined content** (the prompts say "read the transcript at the
   path above"; optional inputs treat an empty/missing path as "not provided").
   So `ax2 run <play> --fixture <case>` resolves each `fixtures/<case>/<key>.*`
   to its path and passes `--input <key>=<path>` — no inline content, no
   single-quote hazard. This both restores the play↔fixture QA job and closes
   the #237 runnability gap (a play is now runnable with one flag and a
   bundled fixture). Override surface: rename cases, or move to a manifest map,
   without touching the run-path logic.
2. **Sequencing — by dependency, not by visibility.** There is exactly one
   must-be-first: **B.1, the fixture home + binding decision** — a cheap, no-code
   convention that both the `--fixture` run path and the viewer's fixtures panel
   encode, so building either before it lets the implementation dictate the data
   model. After B.1, two tracks run in parallel:
   - **Track 1 (unblocked today, no fixture dependency):** front-of-house
     (`research/`), story + diagram, dry-runs → runs-inspector, decision queue,
     the chain registry. This is what gets you swimming plays immediately.
   - **Track 2 (the fixture spine):** the `--fixture` run path, the exemplar's
     `research/` + `fixtures/` backfill, and A's fixtures panel — together.
     This is the higher-value track: it serves the two jobs the Director called
     vital (root-cause digging, the play↔fixture match) and closes the #237
     runnability gap.

   Do **not** sequence all of Pillar B after Pillar A — that defers exactly the
   fixture-dependent jobs (root cause, play↔fixture) and runnability, shipping
   the less-important half first. (Recommend: B.1 decision → both tracks in
   parallel; the static site retires only when Track 2 lands, since the review
   session must exercise fixtures.)
3. **Retire-the-static-site trigger:** retire on the first passing session, or
   keep the static pages one more demo cycle? (Recommend: retire on the passing
   session — two writers of `board-state.json` is a standing hazard while both
   exist.)
