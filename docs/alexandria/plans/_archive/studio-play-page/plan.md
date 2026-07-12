# The Play Page — a strong, articulate template for every play

Status: DRAFT — awaiting Director review
Date: 2026-06-13
Owner: Director (Danvers), drafted by orchestrator
Parent plans:

- `docs/alexandria/plans/playmaker-studio-fabro/plan.md` (the Studio → Fabro line)
- `docs/alexandria/plans/studio-workshop-parity/plan.md` (Slice 4 — delivered the
  data, the render plumbing, fixtures, and the `--fixture` run path this builds on)

---

## §1 Goal

Replace the inscrutable **Play records** file-browser with one **articulate Play
page template** — entered from Raven, the same for every play — that lets the
Director **swim the play, zoom into its real background, run a fixture in Fabro
with live events, and (next) edit it.** Inspired by the `frame-the-problem`
exemplar's authored organization, but rendered from **real data** so it scales
to all 15 plays with no per-play hand-assembly.

The earned capabilities are the point: the Studio now sits in the same place as
our Fabro, and the full run pipeline is live and proven (reconfirmed this
session — §4). The page should *use* that, not just describe it.

## §2 The diagnosis (why the current page fails)

The predecessor plan's jobs (its §2) are right and stay requirements. What broke
is the **presentation**:

- **It's a file tree, not a reading order.** `PlayRecordsView` lands on a raw
  file (diagram → else story → else brief) and every pane is an unedited
  artifact. There is no "what is this play" landing.
- **Coder-named groups.** "The logic / Front of house / Design & proof / Other"
  are authoring jargon, not a Director's mental model.
- **The generated `story.md` is a dump** — a paragraph followed by the verbatim
  move prompts — where the exemplar had an authored walk-through.
- **The "all plays jammed at the top."** The Play-records tab opens with a row of
  every play's slug button (`StudioApp.tsx:1023`). Arriving from Raven you hit
  that wall first. It disappears in the new model — you arrive with one slug.

The exemplar got organization right (authored spine + zoom-in nav); the new line
got **scale** right (data-driven, derived diagram/story, no bespoke HTML). The
template keeps both.

## §3 The template

Entered as `/studio?tab=play&slug=<slug>` from a Raven card. One play. Two-pane,
like the old binder.

### Header plate

Glyph · name · golden-path # · Tier · Board stage badge · `● ready` marker ·
back-to-Raven. (All already served by `/api/studio/registry` + the Board.)

### Main pane — the authored walk-through (the default landing)

A fixed reading spine, every section rendered from files that already exist:

| # | Section | Sourced from |
|---|---|---|
| 1 | **Spec card** — what it does · reach for it when · why it matters | brief §1 (goal/failure) + §2 (trigger) + registry `d` *(see Decision D2 — the richer "when/why" may need a small brief field)* |
| 2 | **The play, drawn** | `diagram.svg` (derived), full-screen zoom/pan overlay (`DiagramOverlay`, already built) |
| 3 | **The play in use** — the scene + the trigger | `story.md` opening narrative + brief §2 |
| 4 | **One run, end to end** — input → conversion → output → tests | `fixtures/<case>/` (input) · `prompts/` or `workflow.fabro` (conversion) · a `dry-runs/` artifact (output) · brief §7 + `read-out.md` (tests) |
| 5 | **Inside the play — the moves** | `workflow.fabro` / `prompts/<move>.md` / brief §4 move graph — each move, its doer, its exits/bounces |
| 6 | **What it produces** | brief §1/§4 emits |

Clicking a background record (left nav) swaps the main pane to render that file —
but the **default is the walk-through, never a raw file.**

### Left nav — zoom out → in over the real background

The exemplar's prized feature. Spine anchors up top; below, the real records
under **human** group names (renamed from the coder groups), preserving the
predecessor's grouping logic (`playRecords.ts`):

- **Design** — brief · hardening · lint
- **Research & grounding** — `research/*`, the source-material drill-down
- **Fixtures** — by case, each with its bound-behavior README
- **Dry-runs** — top-level records flat; deep run trees collapsed; link into the
  Factory-runs inspector for root-cause tracing

### The earned controls

- **Run a fixture in Fabro.** Each fixture case gets a **"run this case"** button
  → starts `ax2 run <slug> --fixture <case>` → drops the live event stream inline
  (reuse `RunsView` / the events endpoint). This is the payoff of the proven
  pipeline (§4).
- **Edit** (follow-on PR) — inline edit of brief/prompts/fixtures, saved back to
  disk.

## §4 Capabilities ledger — what exists vs. what's new

Reconfirmed **live this session** (claude-acp), reproducing #237 after everything
since: `ax2 init` ✓ → viewer `/studio` + studio API serve ✓ → embedded factory
(`fabro.sock`) ✓ → claude-acp adapter + `claude` process spawn ✓ → workflow
materialized with **0 `__AX2_` placeholders** ✓ → studio Factory-runs API streams
real lifecycle events (run `01KV1PMRD391`: `run.created → submitted → starting →
sandbox.initializing → … → stage.completed → edge.selected → checkpoint.completed
→ stage.started`) ✓ — *beyond* what #237 captured. Full-completion (9/9)
confirmation: see the reproduction note appended on finish.

| Capability | State | Work for this plan |
|---|---|---|
| Read any record / records list / registry / board | ✅ exists | none |
| Diagram zoom/pan overlay | ✅ exists (`DiagramOverlay`) | reuse |
| Run engine + bundled fixtures (`ax2 run --fixture`) | ✅ built (#242), proven | reuse |
| Watch a run by id (live events) | ✅ exists (`RunsView`, events endpoint) | reuse |
| **Start a run from the viewer** | ❌ no route (only board-POST + events-GET) | **thin** new endpoint: shell the proven `ax2 run` |
| **Write/edit a play file** | ❌ no route (only board write) | new `POST /api/studio/file` (same path-sandbox as the reader) |

The two genuinely-new pieces are small and bounded; everything else is render +
reuse.

## §5 Delivery — separate, non-stacked PRs off `main` (the Director's QA model)

1. **Plan** (this doc, docs-only).
2. **The Play page — read-only, real data, from Raven.** The authored spine +
   human-named zoom-in nav. **Zero new backend.** This is the "fix the
   inscrutable page" win and the scalable template; QA-able alone.
3. **Run a fixture in Fabro.** The thin start endpoint + the "run this case"
   control wired to the existing live-event watcher. (Director leaned toward
   folding this into the first cut since the pipeline is proven — see D2.)
4. **Edit.** The file-write endpoint + inline editing.
5. **Retire** the Play records tab (Raven is the finder).

Naturally sequential (run/edit hang off the page) but each builds and merges
independently. Review uses **Playwright MCP** for live page viewing (must be
connected to the workspace first).

## §6 Decisions for the Director

- **D1 — the spine (§3).** Confirm the six sections + order, or rework it before
  we build. *Recommend as written* — it's the exemplar's proven organization.
- **D2 — run-trigger in the first cut, or its own PR?** The read-only page needs
  no backend; the run-trigger needs the (thin) start endpoint. *Recommend:* ship
  the read-only page as PR #2, the run-trigger as PR #3 — keeps the page
  shippable without process-spawn risk and matches the separate-PR model. (You
  earlier leaned toward folding run in; either works — this is the one call that
  shapes PR #2's size.)
- **D3 — the spec card's "reach for it when / why it matters."** The exemplar's
  opener is richer than brief §1's one-sentence goal (it was hand-authored). Add
  a small structured opener to `TEMPLATE-brief.md` (a "what / when / why" front
  block every play fills), or derive it from `story.md` + grounding? *Recommend:*
  a brief front block — it makes the spec card faithful and authored, not
  guessed, and costs one template field.
- **D4 — retire Play records when?** On the first PR where the Play page covers
  its jobs, or hold one cycle? *Recommend:* retire as PR #5 once run+edit land.

## §7 Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Start-run endpoint spawns a process from a web request | High | Whitelist: slug must match a registry play, case must match a fixtures dir; reuse the existing arg-validation regexes; no free-form args. Detach + return the run id; never block the request. |
| Edit endpoint as a write surface | High | Same path-sandbox as `fileResponse` (`withinRoot`); restrict to known editable extensions under `studio/plays/<slug>/`; the page edits the source, never derived `diagram.svg`/`story.md` (Protocol E: re-derive). |
| Scope creep into a visual redesign | Medium | Parity of *organization*, not a reskin — match the existing studio look. |
| Spine assumes brief/story shapes that vary across plays | Medium | Render what's present; graceful fallback per section; never hard-require a schema. |
| `--detach` returns a null fabro run id (seen this session) | Low | The page resolves the run id from the factory after submit (or runs non-detached server-side and returns the id); confirmed the run still executes. |

## §8 Proof / done-when

- From a Raven card, the Play page opens on the **authored walk-through** (not a
  raw file), with the zoom-in background nav under human group names.
- A second, different play renders a faithful page from its real data (proves the
  template is data-driven, not a one-play special case).
- "Run this case" on a fixture starts a Fabro run and shows live events inline.
- (Edit PR) a brief/fixture edit saves to disk and re-renders.
- The Play records tab and its all-plays button row are gone; Raven is the only
  finder.
- `astro check` clean; viewer build green; studio API tests green.
</content>
</invoke>
