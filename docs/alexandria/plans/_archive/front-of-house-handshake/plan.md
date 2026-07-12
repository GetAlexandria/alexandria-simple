# Front-of-House Walk — Handshake to the `threads.json` Source + Proving

**Status:** plan (2026-06-30). In-here design + Studio ladder; Raven fronts the run.

## Why this plan

The library-notepad chain (**#466** schema · **#470** producer · **#471** consumer ·
**#474** viewer) made `threads.json` the single **lifecycle-bearing source of truth**:
every thread carries `status` (open→answered→residual) + a director-register
`question` + `emittingMove` + `sourceEvidence`; the FoH `prepare-agenda` CLI now
*projects* `threads.json` into the agenda; a director answer writes
`status`/`resolvingEventId` back; and the **Library Notepad** renders the burndown.

The **Front-of-House Walk** (EL3, issue #348) — the Raven-mediated play that walks
the director through the Back-of-House draft — was built *before* that move and
still consumes the **markdown** reports. This plan reconciles the FoH walk to the
new source (the handshake) and proves it end-to-end on real data.

## Current state (grounded 2026-06-30)

- **FoH play `front-of-house-walk`: `status: built`, `proven: no`.** Runnable — full
  plugin workflow package (`packages/alexandria-plugin/workflows/front-of-house-walk/`:
  `workflow.fabro`, `legs.json`, `prompts/`) + skill. Golden path:
  `prepare_agenda → stage_next → director_review` (suspends; Raven answers via
  `ax raven answer`) `→ plan_bundle_patch → apply_bundle_patch →` loop `→
  finalize_accounting`. Provenance gate covered + tested (no director value without
  a matching `actor.kind=user` answer event). Deterministic spine green at n=1.
- **The CLI already moved** (slice 3, #471 merged): `ax internal front-of-house
  prepare-agenda` *"Project[s] an EL2 bundle's open `threads.json` items into
  `agenda.json`"* (`front-of-house.ts:119,530`); the answer flow flips the thread
  `status` + stamps `resolvingEventId`.
- **The drift (the handshake gap):**
  - The FoH **brief** golden path still says *"parses the Stage-2 brief and Hot
    Spots"* — stale; the CLI projects `threads.json`.
  - The FoH play **fixtures** (`small-el2`, `unanswered-gap`,
    `invalid-director-patch`) are **markdown-only — no `threads.json`** → post-#471
    they build empty agendas.
  - The `prompts/plan_bundle_patch.md` example still uses the **old synthesized id**
    `agendaItemId: "stage2:q1"`; slice 3 made the agenda item id the **thread id**
    (e.g. `hot-spot-two-advancement-mechanisms`).
  - The walk doesn't yet trade on the new provenance. `question` is the
    director-register agenda text and `sourceEvidence`/`emittingMove` are the
    evidence; slice 3 already sets `item.text = question` and
    `item.evidenceRefs = sourceEvidence`, so the runtime *surfaces* them — but the
    play's design/prompts don't acknowledge or lean on them.
  - The answer→status write-back now feeds the **Library Notepad** burndown — but
    the BoH→FoH→Notepad loop has **never been run** (`proven: no`).
  - The BoH→FoH handoff is a **manual file path** (`ax run front-of-house-walk
    --input bundle=…`); the event-typed `el2.bundle.produced` handshake is
    **deferred** (Back-of-House brief §8).

## Goal / done-condition

The FoH walk consumes the `threads.json` source, presents the director-register
`question` + provenance, and is proven by a **detached runtime smoke that drains
the Library Notepad on the real PMS bundle** — with the provenance gate,
body-preservation, and residual accounting intact.

## Revision (2026-06-30) — the handoff is two halves

A parallel agent ran the **Vision→Back-of-House** e2e (the reshaped Vision /
"Basic Product Description" → `library-search-prior.json`, #475/#476/#478) and it
worked. Their FoH read is sharper than this plan's first cut, and it's right: the
BoH→FoH handoff has **two halves**, and FoH only consumes one.

- **Half 1 — `threads.json` (what source *showed*): DONE.** #473 made
  `prepare-agenda` thread-backed; FoH turns each open thread into an agenda item
  (`question`/`reason` + `evidenceRefs`) and walks the director through it.
- **Half 2 — `library-search-prior.json` (what the prior *inferred but couldn't
  log*): NOT consumed at all.** FoH reads the prior nowhere (verified). Its
  `openQuestions` (every low-confidence inference — *literally* director
  decisions), its `fence` (what we assumed out-of-scope), and its `domain`
  (assumed actors/vocabulary) never reach the director. This is the "ask when we
  can't log it from source" half we designed, and it's missing.

The four sub-gaps (theirs, kept): (1) **seed the agenda from the prior's
`openQuestions`**, not just threads; (2) **confidence-aware triage** — carry each
item's `confidence` + `basis` so "a low-confidence inference needs your call"
reads differently from "a gap was found in source"; (3) **search-space
reconciliation** — use the prior's `domain`/`fence` to frame the conversation
("we assumed X, fenced out Y — right?") and confirm the fence held; (4)
**residual readback** — unresolved inferences cite their `basis`/`confidence` in
`RESIDUAL-GAPS.md`.

**The decision this plan must close first (single-source-of-truth).** Slices 1–4
just made `threads.json` the *one* lifecycle-bearing source. Half 2 must land
without re-fragmenting that. Two routes:

- **Route B (single source — preferred):** the producer folds the prior's
  per-finding `openQuestions` **into `threads.json`** as threads carrying their
  origin (`emittingMove: translate_search_prior`), `confidence`, and `basis`
  (a small additive thread-provenance extension). FoH stays threads-backed (#473)
  and gets them for free; triage (#2) and residual readback (#4) read the thread's
  `confidence`/`basis`. This keeps the single source we just built.
- **Route A (two sources):** FoH also reads `library-search-prior.json` directly.
  Richer, but re-introduces a second source into the consumer.

**Genuine exception — gap #3 is walk-level, not per-finding.** The `fence`/`domain`
are global assumptions, not one thread; "confirm the search frame" doesn't fit a
single finding. So the recommended shape is a **hybrid**: per-finding openQuestions
→ threads (Route B); the fence/domain → either a synthetic "confirm the search
frame" thread the producer emits, or FoH reading the prior for that one
walk-level agenda item. **This fork (B-hybrid vs A) is the first thing to rule.**

This revision **demotes old Item 1**: the threads-half *drift cleanup* (brief /
fixtures / prompt still say "markdown", `plan_bundle_patch.md` still shows
`stage2:q1`) is real but small and nothing is red (`fixtures.test.ts` only binds
the bundle dir) — so it **folds into** the Half-2 work below rather than shipping
as its own PR (one FoH reconciliation, not two).

### Grounded breakdown (verified 2026-06-30) — Route B-hybrid (ruled)

The producer side of Route B is **already built**: BoH emits unresolved
low-confidence `openQuestions` as `threads.json` entries with director-register
`question` + builder-register `reason` (brief §pass1/§emit, shipped in #478), FoH
agendizes them (#473), and the Notepad renders them (slice 4). So the prior's
questions **already reach the director** — as *plain* agenda items.

The real gap is that they're **untriageable**: an openQuestion-thread is surfaced
with `emittingMove: pass1_events` (not `translate_search_prior`), carries no
`basis`, and the agenda item (`FrontOfHouseAgendaItem`) carries neither
`confidence` nor origin — so "a low-confidence inference needs your call" reads
identically to "a gap was found in source." So B-hybrid's remaining work is:

- **P — Producer tagging (Studio ladder, small):** openQuestion-threads carry
  `emittingMove: translate_search_prior` and the prior's `basis` (in `reason`),
  at `confidence: low`; plus a walk-level **"confirm the search frame"** thread
  synthesized from the prior's `fence`/`domain` (gap #3). BoH brief/moves edit.
- **C — Consumer triage (factory — "the FoH counterpart to #476"):** extend
  `FrontOfHouseAgendaItem` with `confidence` + `origin`; `prepare-agenda` carries
  them from the thread; `for-raven.md` + the Library Notepad render the
  inference-vs-source triage; `finalize`/`RESIDUAL-GAPS.md` cite `confidence` +
  `basis` (gap #4). The FoH drift-cleanup (old Item 1) folds in here as the
  Studio companion (FoH brief/fixtures/prompt).
- **Sequencing:** P unblocks C (C triages on the origin tag P writes).
- **Dogfood caveat:** the current PMS bundle was swept *without* a Basic Product
  Description, so it has **no** inference-threads. The smoke (old Item 2) needs a
  **prior-bearing bundle** — re-sweep PMS with a description, or a crafted
  fixture — to exercise the triage end-to-end.

## Work items

### Item 1 — Reconcile the FoH walk to the `threads.json` source  *(SUPERSEDED → folds into Half-2; see Revision above)*

> **Folded in.** Per the Revision, this threads-half drift cleanup is small and
> nothing is red, so it rides with the Half-2 search-prior consumption rather than
> shipping alone. The mechanics below still apply — they're now the *cleanup
> portion* of the Half-2 issue, not a standalone PR.

A **play change, not a factory issue** — the CLI already changed in #471; this
aligns the play to it. Order: derive → re-tune fixtures → re-audit → sync the
plugin copy → re-run.

- **Brief** (`studio/plays/front-of-house-walk/brief.md`): rewrite §1/§3 and
  golden-path step 1 — `prepare_agenda` *projects* `threads.json` (open items) into
  `agenda.json`; the agenda item text is the thread's `question`;
  `sourceEvidence`/`emittingMove` are the evidence Raven shows; the markdown
  reports are projections/context, not the agenda source. Note `apply_bundle_patch`
  now flips the thread `status` (→ the Notepad reflects it).
- **Fixtures**: add a `threads.json` to each of `small-el2`, `unanswered-gap`,
  `invalid-director-patch`, mirroring the agenda their markdown used to produce
  (same items, now threads-sourced, with `question` text + canonical family/kind).
  Keep the markdown as projections (or trim) — the agenda derives from threads.
- **Plugin payload** (the play's runtime copy — this is what runs): update
  `prompts/plan_bundle_patch.md`'s example `agendaItemId` from `stage2:q1` to a
  real thread-id shape; refresh the `prepare_agenda` node label
  ("Project threads.json into the agenda"). Leave `workflow.fabro` wiring otherwise
  unchanged (the node already runs the slice-3 CLI).
- **Guards**: re-run `node studio/tools/check-play-conformance.mjs
  front-of-house-walk`, `bun studio/tools/check-threads.mjs`, and `cd packages/ax &&
  bun test tests/library-front-of-house*.test.ts`; all green.
- **Ships as**: one Studio-ladder PR off main, QA'd by hand. No app-code/factory
  issue (the CLI is done).

### Item 2 — Detached runtime smoke (the proof + the first real loop)  *(after Item 1)*

The first end-to-end run — flips the play toward Proven and verifies the whole
BoH→FoH→Notepad loop.

- **Setup**: copy the PMS bundle (`studio/sweeps/playmaker-studio`, 12 open threads
  with questions) to a scratch dir (the run mutates cards — **never** the canonical
  bundle). Start the viewer on that root to watch the Notepad.
- **Run**: `ax run front-of-house-walk --input bundle=<scratch> --json` → confirm it
  suspends at awaiting-input with **no** launch-time director → `for-raven.md`
  presents the first thread's `question` + `sourceEvidence` → `ax raven answer --run
  <id> --question <id> --bundle <scratch> --text-file answer.md` → resume →
  `plan_bundle_patch` → `apply_bundle_patch`.
- **Verify (proof spec + the handshake):**
  - detached launch reaches awaiting-input without a launch-time director;
  - one Stage-2 question + one Hot Spot banked as `actor.kind=user` answer events;
  - a patch updates `prefLabel`/`context`/`plane` + a relationship while preserving
    the body + Small-floor fields;
  - **the answered thread flips `open→answered` + `resolvingEventId` in
    `threads.json`, and the Library Notepad's open count drops** (the new loop);
  - an unanswered item lands in `RESIDUAL-GAPS.md` and mutates no card;
  - a patch with no matching user answer event is rejected.
- **Artifacts**: capture `dry-runs/` + a read-out under the play; record the smoke in
  the risk-map (`runs`/`result`). This is the runtime-smoke row owed for Proven (the
  stochastic/adversarial eval rows remain — Item 3).
- **Ships as**: dry-run records + a risk-map update (Studio ladder); not a code PR.

### Item 3 — Owed evals  *(deferred)*

The stochastic/adversarial rows the risk-map flags ◐ partial: **RE-1** (Raven
faithfully *paraphrasing* the director into the recorded answer — no LLM eval) and
**OUT-3** (over-applying beyond what the director authorized — no bait fixture).
Needs the eval harness; pegged after the smoke. Required before `proven: yes`.

### Item 4 — Event-typed BoH→FoH handoff  *(deferred)*

Replace the manual file-path handoff with the `el2.bundle.produced` Ledger event
(BoH brief §8) so the chain auto-advances EL2→EL3. Not blocking; pegged to when the
chain runs unattended.

## Sequencing

Item 1 → Item 2 (item 2 needs the play consuming threads). Items 3, 4 follow.
Item 1 is a single Studio-ladder PR; Item 2 is a guided run + artifacts.

## Risks

- **Fixture drift cuts the other way**: if the new `threads.json` fixtures don't
  mirror the markdown agendas, the play's deterministic tests shift — keep the same
  agenda items so the proof spec still holds.
- **The smoke mutates the bundle**: always run on a copy of the PMS bundle, never
  the canonical one.
- **The plugin copy is what runs** (not the studio brief) — sync
  `plan_bundle_patch.md` / labels, or the run won't reflect the reconciliation.
- **Proven ≠ smoke alone**: the eval rows (Item 3) are still owed; do not flip the
  play to `proven` on the smoke alone.
