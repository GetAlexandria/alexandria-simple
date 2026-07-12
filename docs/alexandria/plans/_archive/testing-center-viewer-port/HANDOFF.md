# Play Testing — handoff for the next agent(s)

Two independent projects remain. They can run in parallel — one builds the
surface, the other produces the data it renders.

- **Project A — Merge into Alexandria:** build the real Play Testing surface in
  `viewer-next`, rendering from the play's files.
- **Project B — Write the fixtures + evals + diagnostic checks:** turn the open
  areas into real, measured tests.

Read this whole file first, then the four artifacts it points at.

## Where it stands

Design is settled and on `main` (PRs #259 canon, #262 plan + prototype + vocab).
The artifacts:

| file | what it is |
|---|---|
| `docs/alexandria/plans/testing-center-viewer-port/plan.md` | the build plan — render-from-files architecture, source→derived→display contract, the three-tab ladder, slices, no-drift test |
| `…/play-testing-mockup.html` | **layout only.** Real words, **empty data** (`0/N · not yet measured`). NOT a data source — open it in a browser to see the surface, never to read data from |
| `studio/plays/frame-the-problem-next/risk-map.md` | the **real starting position** — real risks → real fixtures, results empty. This is what the surface renders |
| `…/AUTHORING-EVALS.md` | how to design real fixtures + evals for the gaps (Project B's manual) |

The surface: three tabs as a cost ladder — **Preflight** (build-validity gate,
blocks) → **Diagnostics** (reference-free system health, informs) → **Coverage**
(test-case tier: Behavioral + Systemic). Status is a headline fill-circle
(`● covered ◐ partial ○ gap`); run evidence is **one link to Fabro per test**,
not N links; all copy is plain, non-technical English.

## Non-negotiables (lessons paid for the hard way this session)

These are the rules both projects must hold. Violating any of them is the
failure mode we already hit and fixed.

1. **Render from the play's files, NEVER from the mockup.** The mockup is a
   layout sketch; its data is empty by design and its names are illustrative.
   The surface reads `risk-map.md` and the play's fixtures. (A previous mockup
   hardcoded a retired "Knot" test and an invented "perf-deck" — that is exactly
   what file-rendering + the no-drift test prevent.)
2. **No fabricated data of ANY kind.** Real words + empty/zero data, ready for
   real measurement. If we intend 30 runs, show `0/30` — never an invented rate.
   A fixture is "built" or "to build"; it is never "passing" until measured runs
   back it.
3. **The library *describes*; it does not hold the technical source of truth.**
   Prompts, code, fixtures, results live in `studio/`. The library (if used)
   describes the system and points at those files via `source:`. Do not push the
   testing source of truth into the library.
4. **A run is a sample; the stat is the surface; Fabro is the run source of
   truth.** Aggregate stats live on the surface; individual runs live in Fabro
   (one link). Only evidentially-significant runs (failures, calibration anchors)
   get durably captured. Don't rebuild a "dry-runs" archive.
5. **Vocabulary is settled:** coverage states `covered / partial / gap / n/a`;
   tabs `Preflight / Diagnostics / Coverage`; section name **Play Testing**.
   Plain language for everything a user reads.

---

## Project A — Merge into Alexandria (build the surface)

**Goal:** the Play Testing section renders live in `viewer-next`, from files,
for `frame-the-problem-next` first.

**Follow `plan.md`** §2 (render from files), §3 (source→derived→display), §5
(the `risk-map.md` schema — already authored for the exemplar), §6 (the locked
surface design), §7 (modules), §8 (the no-drift test), §9 (slices).

**Build, in order (separate PRs off `main`, hand-QA'd, not stacked):**
1. `studio/evalPlan.ts` — parse `risk-map.md` → risks, tests, results. +
   `studio/measurement.ts` — the policy as pure code (label + binding-constraint
   rollup; deterministic n=1; never pool). + the §8 tests. No UI.
2. `studio/PlayTesting.tsx` — the projection: render the parsed file as the three
   tabs and the locked design (§6). Mount via `PlayPage.tsx`'s `SectionView`.
   Holds **zero** canon strings.
3. Later/deferrable: Diagnostics + Preflight from `workflow.fabro`; results
   back-filled from Fabro runs; a cross-play "mission control" (only after 2–3
   plays prove the shape).

**Pointers:** the play-page render pattern to extend — `packages/viewer-next/src/
components/studio/PlayPage.tsx`, `playRecords.ts`, `app/runtime/studio.ts`; the
file host — `packages/ax-next/src/effects/studio-api.ts` (`/api/studio/file` +
`/records`, already sufficient — no new endpoints for the MVP).

> **Kickoff prompt:** "Build the Play Testing surface in `viewer-next` per
> `docs/alexandria/plans/testing-center-viewer-port/plan.md`, slice 1 first
> (`evalPlan.ts` + `measurement.ts` + the no-drift tests, no UI). Render from
> `studio/plays/frame-the-problem-next/risk-map.md` — the words come from that
> file, never hardcoded, never from the mockup. The mockup is layout reference
> only. Stop after slice 1 for review."

---

## Project B — Write the fixtures + evals + diagnostic checks (the data)

**Goal:** turn the play's open areas into real, measured tests, so the surface
fills with real data.

**Follow `AUTHORING-EVALS.md`** (the step-by-step recipe) against the gap/partial
rows in `risk-map.md`. The open areas today: IN-1 (positional invariance), ADV-1
(injection plant), ADV-2 (poisoned context), CHN-1…5 (Tier-B chain frontier),
OUT-2 (over-refusal minimal-pair), OUT-3 (overclaim bait); RE-5 / OUT-4 carry
known cracks rather than fixtures.

**The loop per area:** pick an open risk → design a one-risk fixture (use its
default pattern from `RISKS.md`) → lay it out per `fixtures/README.md` (one
`<case>/` dir, inputs named by key, `expected/` for grading) → define the
assertion → run k times on the factory and grade blind (run-count policy: smoke≈5
/ estimate≈30 / ship-gate≥100; deterministic = n=1; never pool) → **write the
`n · pass` back into `risk-map.md`** (that's what makes the surface fill in).

**Hard rule:** invent no data. Record only what real runs produce. An honest
empty cell beats a fabricated number.

> **Kickoff prompt:** "Author real fixtures + evals for `frame-the-problem-next`
> following `docs/alexandria/plans/testing-center-viewer-port/AUTHORING-EVALS.md`.
> Start with one ○ gap (suggest ADV-1 injection plant — TESTING.md mandates one).
> Build the fixture, run it on the factory, grade, and write the measured `n/pass`
> back into `studio/plays/frame-the-problem-next/risk-map.md`. Invent no numbers —
> record only real runs. Do one area, then stop for review."

---

## Loose threads to be aware of

- **Canon wording divergence (flagged, not fixed):** `TESTING.md` says an omitted
  optional input is "passed empty"; `fixtures/README.md` says "omit the key, do
  not pass an empty file." For this play, `fixtures/README.md` (the play-specific
  convention) wins. Worth reconciling in the canon.
- **Preflight/Diagnostics data** is not in `risk-map.md` — those tabs derive from
  `workflow.fabro` and are a later, separate source (plan §7, §9).
- **The exemplar only.** `risk-map.md` exists for `frame-the-problem-next`. Other
  plays need their own, authored the same way (Project B, repeated) — and only
  after a few plays should the shared spine / mission control be abstracted.
