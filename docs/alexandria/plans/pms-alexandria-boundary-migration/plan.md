# PMS / Alexandria Boundary Migration Plan

Date: 2026-07-02
Status: Director-ruled model, slices ready for implementation
Supersedes: the 2026-07-01 draft (merged in #543). The rulings below came out
of the director review of that draft; where this version contradicts it, this
version wins. Dropped items are listed at the end with reasons.

## Goal

Split PlayMaker Studio (PMS) from Alexandria into two cleanly bounded products
that can live in the same monorepo. The end state is a beautiful monolith:
`packages/ax` + `packages/viewer` are Alexandria and contain no studio code;
`packages/pms` is the studio with its own CLI, server, surfaces, and records;
Fabro is shared infrastructure both products consume.

The migration must not stall Alexandria. Every near-term slice is subtractive
for Alexandria — `ax` gets smaller and more coherent — and the expensive
pieces (a real play package manager, a full proving environment) are deferred
behind explicit triggers.

## The Settled Model (director rulings, 2026-07-01/02)

### What each product is

**Alexandria** is the shipped product: the Library, the Playbook, the Ledger,
the viewer, and `ax` — the supported command/tool surface, including the
play-facing commands. Alexandria owns its durable state and mediates every
mutation of it through `ax`.

**PlayMaker Studio** is an authoring and testing solution for plays. It runs
plays with its own Fabro invocation. The work done in PMS is writing plays,
improving their quality, and strengthening their tests. PMS supports the
creation of arbitrary QA surfaces — jigs, viewers, testing interfaces custom
to a play or set of plays — and those surfaces never leave PMS. We may learn
from a PMS jig and deliberately re-implement it in Alexandria, but that is a
separate process, not a shared surface.

PMS-authored plays do not have to go to Alexandria. PMS can author Fabro
workflows used in many different contexts.

### The boundary

The boundary is command/tool contracts, not naming and not co-location.

- The only way a play operating in Alexandria touches Alexandria is a tool
  call via the `ax` CLI. `ax internal ...` commands qualify when they are the
  declared contract; `internal` is a naming question at most.
- A play may write its own declared runtime artifacts (answer files, patch
  drafts, summaries) when a later `ax` command validates and consumes them.
- Not allowed, in either direction:
  - a play or PMS machinery directly editing Alexandria durable state
    (Ledger events, Library cards, Playbook records, runtime manifests,
    cursors, leases);
  - **PMS state in Alexandria's Ledger. The Alexandria Ledger is never
    state for PMS.** (Ruled 2026-07-01. See Slice 1 for the existing
    `studio.operations.*` events.)
  - a play importing AX source modules or invoking `packages/ax/src/...` as
    its runtime interface;
  - Alexandria product data rooted under `studio/` (see Slice 0).

### The interface point

A play crosses from PMS to Alexandria by being **exported from PMS and
imported into Alexandria's Playbook**. The play also stays in PMS; after
import there is no ongoing interaction. Re-export/update flows are explicitly
not designed now — the only concession is a provenance stamp (package id,
version, content hash) recorded at import so a future re-export does not
require archaeology.

### Vocabulary ruling: plays vs workflows

"Play-making plays" are **workflows, not plays**. Calling `make-a-play`,
`capture`, `deprecate`, or `quarantine` a play was a misnomer and a source of
confusion; they are PMS production machinery. (The first Alexandria product
sweep independently flagged this "play" polysemy as an open thread —
`studio/sweeps/alexandria-product/threads.json`, merged in #559.) They are
evicted from `PLAY_MANIFEST` in Slice 1.

A play, in the Alexandrian sense, is an installed Playbook entry that runs in
a host product under the host's tool contract.

### PMS durable records

On-disk JSON, written through a single validated PMS write path. No
append-only event log: the conditions that justify one (many uncoordinated
writers across trust boundaries, audit that must survive disputes, projection
rebuilds) do not apply to PMS. Git supplies history and review; per-run files
(`runs/<id>.json`) dodge write collisions; the Board's multi-writer problem
is solved by the single write path, not by an event model. SQLite is allowed
later only as a derived index over the JSON, never as the source of truth.

### Fabro

Fabro is a shared **dependency**, not a shared **service** — the same
relationship both products have to Bun or TypeScript. Each product invokes
its own runner; run artifacts land in product-owned directories; there is no
shared run state. No separate PMS Fabro deployment is stood up now.

### Libraries federate by reference

Each product keeps an Alexandria-style library about itself. Alexandria's
product library does not absorb PMS's: it references it
(`Reference - Playmaker's Studio Library` in the #559 bundle — a director
ruling already practiced at the content level). The same pattern governs the
future: cross-product knowledge is a reference, not a scan.

## Current State (verified against `main` after #559)

### The inversion: Alexandria has absorbed PMS

The dominant boundary problem is not plays reaching into Alexandria — it is
PMS implemented inside Alexandria's product code:

- `PLAY_MANIFEST` (`packages/ax/src/domain/plays.ts`) carries seven
  PMS-machinery entries alongside the real plays.
- `packages/ax/src/commands/make-a-play.ts` runs the make-a-play modules
  against `<cwd>/studio/plays/make-a-play/` and writes
  `studio/plays/board-state.json`.
- `packages/ax/src/commands/studio-operations.ts` implements
  capture/deprecate/quarantine — the shipped `.fabro` files for those are
  echo stubs — writing `studio/inheritance/` and appending
  `studio.operations.*` events to Alexandria's Ledger.
- `packages/ax/src/effects/studio-api.ts` serves the entire `/api/studio/*`
  surface (including Board writes) from Alexandria's runtime server; the
  viewer is a thin client with no direct file access.
- The scripted-reactions answer path carries a make-a-play review-gate
  special case (`packages/ax/src/commands/play-answer.ts` /
  `front-of-house-answer-banking.ts`, #542).

### Three disagreeing play registries

`studio/plays/registry.js` lists 28 plays (identity/catalog),
`PLAY_MANIFEST` lists 14 (compiled into the `ax` binary — registration does
not come from the installed plugin payload), and
`packages/alexandria-plugin/workflows/` holds 10 workflow packages. The sets
disagree in every direction: `source-assessment` is plugin+manifest with no
registry entry or studio dir; `empty-library-confirm` is registry-"built" but
never banked and is not a manifest play (it is a skill + runtime-API flow);
`capture`/`deprecate`/`quarantine` have plugin stubs that never passed
through `bank.sh`.

### `studio/` is no longer PMS-only

#559 landed Alexandria's own product library bundle (70 cards + keystone, 8
contexts, 25 threads) at `studio/sweeps/alexandria-product/`, and the merged
#558 Alexandria Back viewer tab reads that root
(`packages/viewer/src/components/library/library-mode-config.ts`). The
viewer's library section now has three modes rooted under `studio/`:
`pms-back` and `pms-drafts` (PMS's own library — legitimately PMS space) and
`alexandria-back` (Alexandria product data in PMS's directory — Slice 0).
Issue #540 (in flight) extends the pattern: a library's drafts log lives
beside its bundle root, so the sweep/drafts/runtime family moves together.

### The install mechanism does not exist

"Playbook" is a derived in-memory projection (`derivePlaybook` over the
compiled-in manifest); the only host-policy bit is the `surfaced` flag.
There is no persisted installed-package record and no way to add a play to a
built `ax`. Import, in the model above, therefore requires dynamic play
registration — the largest single lift in this migration, deferred with an
explicit trigger (see Deferred).

### Contract gaps in the play-facing commands

Front-of-House is the architectural reference (Ledger-derived lifecycle,
AX-mediated mutation, declared intermediate artifacts) and simultaneously the
least-pinned contract surface: its exit codes are consistent in code but
undocumented in help (unlike `cards`, `raven`, and `inspect events`); no
command's JSON stdout envelope carries a schema version (versions live on
domain artifacts only); there are no stdout-shape contract tests for
`ax internal front-of-house` or `ax cards`. Separately, there are two
uncoordinated Ledger write paths: runtime-server-mediated (semaphore + SSE
notify) and CLI-direct (`front-of-house`, `cards publish`,
`library-confirm` — no cross-process coordination, no SSE). Hardening both
is Alexandria product work regardless of the split (see Deferred → Contract
hardening).

### What is already right

- FoH plugin workflows call `ax internal front-of-house ...`; Raven answers
  go through `ax raven answer`; durable draft-patch logs (#555) are
  AX-written; lifecycle derives from Ledger events (#522–#529).
- `ax run <play> --reactions <file>` (#542) banks scripted director answers
  through the identical contract as `ax raven answer` — the foundation the
  proving environment will build on.
- `bank.sh` already enforces placeholder conformance, edge lint,
  re-derivation, `fabro validate`, and is pinned by
  `bankConformance.test.ts`. It is the de facto spec for a future
  `pms export play`, not mere debt.

## Play Classification (ruled)

Alexandria plays — stay in `PLAY_MANIFEST`:

| Play | Notes |
|---|---|
| `front-of-house-walk` | Reference play. EL3. |
| `frame-the-problem` | Alexandria play (surfaced). Its Raven feedback loop is Alexandria capability; the earlier "potentially portable" call is withdrawn. |
| `atomic-card-planning` | EL5a. Drives `ax cards`. |
| `atomic-card-creation` | EL5b. Drives `ax cards`. |
| `build-atomic-card` | EL5 per-card sub-workflow. |
| `source-assessment` | Surfaced. Original Raven play. |
| `vision-prerequisite-placeholder` | Placeholder; reuses source-assessment workflow. |

Evicted — PMS workflows misnamed as plays (Slice 1):

| Entry | Where its logic actually lives |
|---|---|
| `make-a-play` | `packages/ax/src/commands/make-a-play.ts` |
| `make-a-play:design` | same |
| `make-a-play:build` | same (+ `studio/tools/bank.sh --modules`) |
| `make-a-play:prove` | same |
| `capture` | `packages/ax/src/commands/studio-operations.ts` |
| `deprecate` | same |
| `quarantine` | same |

Not manifest plays, no change: `empty-library-confirm` (EL4 confirm gate — a
skill + runtime-API flow, correctly Ledger-only through AX); the 18
registry-only catalog identities in `studio/plays/registry.js`.

## Target Architecture

```text
alexandria-internal/
├── packages/ax            Alexandria CLI + runtime server. No studio code.
├── packages/viewer        Alexandria viewer. Library, Playbook, Alexandria
│                          Back. No /studio tab, no PMS library modes.
├── packages/pms           PMS: CLI (`pms`), local server (`pms start`),
│                          studio UI, single JSON write path for records.
├── packages/alexandria-plugin  Alexandria's shipped plays only.
├── studio/                PMS-only data: play library, board, sweeps and
│                          drafts of PMS's own library, tools.
└── docs/alexandria/       Alexandria's data, including its own sweeps/
                           drafts family (relocated in Slice 0).
```

Fabro remains a dependency of both. The `Playbook` tab and
`PlaybookView.tsx` stay in Alexandria's viewer — they render Alexandria's
surfaced plays and were never studio code.

## Migration Slices

### Slice 0 — Relocate the Alexandria sweep family out of `studio/`

Time-sensitive: do this before more tooling grows roots into the path.

- `git mv studio/sweeps/alexandria-product docs/alexandria/sweeps/alexandria-product`
  (exact target is a director call at implementation; `docs/alexandria/` is
  the proposal since it is Alexandria's data home).
- Update the `alexandria-back` root in
  `packages/viewer/src/components/library/library-mode-config.ts` and any
  tests pinning the old path.
- Update `check-keystone.ts --all-sweeps` so it still covers both sweep
  roots (or takes explicit roots).
- When #540 lands and an Alexandria drafts log follows, it lives beside the
  relocated bundle root, not under `studio/drafts/`.
- `studio/sweeps/playmaker-studio/` and `studio/drafts/playmaker-studio/`
  stay: they are PMS's own library and are in the right place.

Acceptance: the Alexandria Back tab renders the relocated bundle; nothing
under `studio/` is an Alexandria product data root.

### Slice 1 — Eviction: PMS machinery out of the manifest and out of `ax`

- Remove the seven evicted entries from `PLAY_MANIFEST` (14 → 7; update the
  count assertion in `packages/ax/tests/state.test.ts`).
- Create `packages/pms` with a `pms` CLI. Port into it:
  - the make-a-play module runner (from `make-a-play.ts`), invoked as `pms`
    commands running Fabro directly — replacing both the old
    `bun packages/ax/src/cli/main.ts run make-a-play:prove --json`
    invocation and any `ax run make-a-play:*` path;
  - capture/deprecate/quarantine (from `studio-operations.ts`). Their
    dispositions become PMS JSON records. **They stop appending
    `studio.operations.*` to Alexandria's Ledger**; existing events are
    frozen history, not migrated.
- Remove the make-a-play review-gate special case from the answer-banking /
  reactions path.
- Delete the stub workflow dirs from `packages/alexandria-plugin/workflows/`
  (`make-a-play/`, `capture/`, `deprecate/`, `quarantine/`).
- `bank.sh` (including `--modules`) moves wholly into PMS's toolset and is
  relabeled the **interim exporter**; a future `pms export play` must
  preserve its checks (placeholder guard, edge lint, re-derive, validate,
  conformance).

Acceptance: `ax` has no code path that reads or writes `studio/`;
`PLAY_MANIFEST` contains only Alexandria plays; Alexandria's Ledger receives
no new PMS events; make-a-play runs end-to-end via `pms`.

### Slice 2 — PMS surface split: server and UI out of `ax`/viewer

- Move `studio-api.ts` behind `pms start` — a small PMS-local server owning
  `/api/studio/*`, including the Board write path (which becomes the single
  PMS record write path; `play-resync.py` and agents route through it or
  through an equivalent `pms` command).
- Remove the `handleStudioRequest` hookup from
  `packages/ax/src/effects/runtime-server.ts`.
- Move the studio UI out of `packages/viewer`: `components/studio/` and the
  `pms-back`/`pms-drafts` library modes. Copy the read-only
  `EmptyLibraryView` render path into PMS rather than creating a shared UI
  package — duplication is accepted; extract a shared package only when
  drift actually hurts.
- The viewer keeps: Library, Playbook, Alexandria Back, event log, agents.

Acceptance: `ax start viewer` serves only Alexandria surfaces; `pms start`
serves the studio; Alexandria runs (FoH, EL5, frame-the-problem) with
`packages/pms` absent from the process.

### Shipped (2026-07-02, overnight build — PRs #563, #564, #568)

All three slices are implemented, reviewed (workflow-backed review per
slice, findings fixed), and verified per the Verification Plan below —
including the hard test: with `packages/pms` removed from the tree, `ax`
cold-boots, its full suite passes, and every Alexandria surface renders.

Deltas from the slice text as written:

- **Slice 1**: `bank.sh --modules` was retired outright rather than moved —
  module packages are validated in place under `studio/plays/` by
  `pms run make-a-play:build`; the play-level `bank.sh` remains the interim
  exporter. Provenance decoration merges the frozen
  `studio.operations.*` ledger history with new PMS JSON records under
  `studio/records/provenance/` (the org-model registry view reads both;
  PMS records win per play).
- **Slice 2**: the PMS viewer became its own workspace package
  (`packages/pms/viewer`, `@alexandria/pms-viewer`) with a `PmsApp` shell
  (Studio + PMS-Back + PMS-Drafts). Alexandria data reaches PMS strictly
  through the public runtime API: `pms start` (4322) proxies a GET-only
  allowlist (`/api/state`, `/api/library/catalog`), identity-checked per
  request with separator-aware containment so a sibling checkout can never
  leak state. Mid-flight factory work was folded in: #562's live
  PMS-Drafts window and #567's DraftsView generalization re-homed onto the
  PMS surface, while the new Alexandria Drafts tab stays in the Alexandria
  viewer. A `check-pms` CI job covers both PMS packages.

Follow-ups picked up during the build (tracked here, not yet scheduled):

- **Studio e2e port.** The 20 studio/PMS-mode Playwright specs (plus #562's
  PMS-Drafts specs) left the Alexandria viewer suite with the surface; they
  need a pms fixture server + playwright harness in `packages/pms/viewer`.
  Specs are retrievable from the pre-split history of
  `packages/viewer/tests/library-browser.spec.ts`.
- **Gate-fact recording for the composed make-a-play runner** (Slice-1
  review pickup deferred out of Slice 2).
- **Viewer e2e in CI.** The viewer playwright suite is not a CI gate, which
  let a folder-route spec land broken on main (fails identically on main;
  pre-dates the split). Fix the spec, then consider gating.
- **Alexandria drafts log location.** #567 put
  `ALEXANDRIA_DRAFT_PATCH_LOG` at `studio/drafts/alexandria-product/…`,
  which contradicts Slice 0's "no Alexandria product data under `studio/`"
  once the drafts pipeline runs for real. Needs writer/reader alignment
  (the FoH writer and the viewer constant together), then relocation beside
  the moved bundle root.
- **ax test-suite spawn cost.** The black-box convention spawns a cold CLI
  per test (~2 min wall for 571 tests; the suite is also vulnerable to
  spawnSync wedges, as the fail-soft regression showed). Candidate: compile
  the CLI once per run (`bun build`) and reuse, keeping the black-box
  contract.

### Kept as-is for now

- Shared Fabro dependency and any existing Fabro server infrastructure.
- The co-located publish path for Alexandria plays: author in
  `studio/plays/`, bank via `bank.sh`, register in `PLAY_MANIFEST`. This is
  the interim import mechanism.
- `#479`-style CI co-location guards, until Slice 2 replaces the coupling
  they watch.
- Existing `studio.operations.*` Ledger events, as frozen history.

### Deferred, with triggers

- **PlayPackage v1 + real import (dynamic play registration).** The largest
  lift: a persisted Playbook record, an `ax playbook install <package>`
  command, and packages carrying workflow graph, prompts, schemas,
  capability requirements (`requires: { alexandria: { tool: "ax", commands:
  [...] } }`), fixtures, proof summaries — and no PMS Board or work-order
  state. Trigger: the first play that must ship into an Alexandria instance
  PMS cannot reach by file copy (e.g. hosted product instances). Design
  acceptance when built: round-trip `front-of-house-walk` through
  export → install → run.
- **The proving environment.** A disposable scratch Alexandria workspace
  driven purely through the installed `ax` contract, with scripted director
  answers via `ax run --reactions` (#542). This is deliberately the same
  investment as the AX contract test suite: every proving run of an
  Alexandria-bound play is an integration test of the play-facing command
  surface. Trigger: the first Alexandria-bound play whose proving needs true
  end-to-end tool calls beyond fixtures and dry-runs.
- **Contract hardening for play-facing `ax` commands.** Document
  front-of-house exit codes in help; version the JSON stdout envelopes; add
  stdout-shape contract tests for `ax internal front-of-house` and
  `ax cards`; pick the canonical Ledger write path (runtime-server-mediated
  vs CLI-direct) and coordinate or retire the other. Alexandria product
  work independent of the split; schedule on product priority.
- **PMS QA-jig framework.** The capability to stand up bespoke per-play
  testing UIs cheaply. Grows inside `packages/pms` as proving demands it;
  not designed up front.

## Verification Plan

Acceptance criteria say where the finish line is; this section says how we
know, after every move, that we are still on the road. The rule: verify by
**driving both products**, not only by test suites. Each slice is its own
branch/PR; a failed checkpoint means stop and fix or revert that slice —
never build the next slice on a broken checkpoint.

### The regression harness (run at every checkpoint)

1. `bun test` in `packages/ax` and `packages/viewer` (and `packages/pms`
   once it exists).
2. `studio/tools/check.sh` (all studio data checks).
3. **The scripted Front-of-House walk** — the end-to-end Alexandria smoke.
   The `small-el2` fixture
   (`studio/plays/front-of-house-walk/fixtures/small-el2/` — self-contained
   `bundle/` + `reactions.json`) drives a full walk with scripted director
   answers via `ax run front-of-house-walk --reactions ...`; the pinned
   version is `packages/ax/tests/play-reactions-cli.test.ts`.
4. **Ledger integrity**: `ax inspect events list` — event count and tail
   diffed against the checkpoint baseline; only expected events may appear.

### Scratch-workspace rule

Verification runs that create durable state (FoH walks, captures,
dispositions) happen in a scratch workspace — a temp checkout with the
fixture copied in, the pattern `play-reactions-cli.test.ts` already uses —
never against the repo's real ledger. This is the lightweight precursor of
the deferred proving environment. Board round-trip edits (below) are
reverted after persistence is confirmed.

### Checkpoint 0 — Baseline, before any change

Capture what works today so "we didn't break anything" has a referent:

- Regression harness green; record test counts.
- `ax start viewer` (`:4321`), click through: Library renders; Playbook
  shows the two surfaced plays; **Alexandria Back renders the #559 bundle**
  (71 cards, 8 areas); event log loads.
- `/studio` tab: catalog renders from `registry.js`; Board renders and a
  Board edit round-trips (edit, confirm `board-state.json` changed
  atomically, reload, then revert); a play page (`frame-the-problem`)
  renders.
- PMS-Back and PMS-Drafts library tabs render.
- Save the `/api/library/catalog?libraryRoot=studio/sweeps/alexandria-product`
  response body — Slice 0 compares against it.

### Checkpoint 1 — after Slice 0 (relocation)

- Alexandria Back renders the relocated bundle; the saved catalog response
  matches the baseline apart from the root path.
- PMS-Back and PMS-Drafts are byte-identical to baseline behavior.
- `check-keystone --all-sweeps` covers both sweep roots.
- Harness green (viewer tests updated for the new path — path updates only,
  no behavioral edits).

### Checkpoint 2 — after Slice 1 (eviction + `packages/pms`)

Alexandria is unbroken:

- `ax run make-a-play:prove --json` → unknown play id, exit 2 (the eviction
  is observable at the CLI).
- Playbook tab still shows the surfaced plays; the scripted FoH walk passes
  end-to-end in a scratch workspace.
- `packages/ax` suite green with the manifest count assertion updated
  (14 → 7 in `state.test.ts`).

PMS works through its own CLI:

- Each make-a-play module runs via `pms` against the real `studio/` tree.
- Capture, deprecate, and quarantine run against fixtures in a scratch
  workspace; dispositions land as PMS JSON records.
- **Ledger purity, the key check**: run a capture, then
  `ax inspect events list` — the event count is unchanged and no new
  `studio.operations.*` event exists.

### Checkpoint 3 — after Slice 2 (surface split)

- `ax start viewer`: no `/studio` route; `/api/studio/*` returns 404 from
  the Alexandria runtime server; Library, Playbook, Alexandria Back, and the
  event log all render as at baseline.
- `pms start`: catalog, Board (write round-trip as in checkpoint 0), play
  pages, PMS-Back, and PMS-Drafts all render.
- Both servers run simultaneously without port or claim conflicts.
- **The hard test**: move `packages/pms` out of the tree; the `ax` suite and
  the viewer click-through stay green; restore it.
- Scripted FoH walk once more, end to end.

## Guardrails

- CI reconciliation check across the three registries: every
  `PLAY_MANIFEST` entry has a plugin workflow package; every plugin package
  has a manifest entry; registry.js catalog identities that are banked match
  by slug. (Today's drift: `source-assessment`, `empty-library-confirm`.)
- `studio/` fence: no Alexandria viewer mode, loader root, or plugin
  workflow may reference a `studio/` path (after Slices 0–1; until then the
  guard runs warn-only on the known list).
- Shipped-workflow lint (warn first, then fail): no direct `events.jsonl`
  or `docs/alexandria/library/` writes, no `packages/ax/src/...`
  invocation or import, from any `packages/alexandria-plugin` workflow.
  Known blind spot, accepted: this lint reads `.fabro` command nodes and
  cannot see logic embedded in CLI commands — that class of violation is
  eliminated structurally by Slice 1, not by lint.

## Dropped from the 2026-07-01 draft

- **"Replace `bun packages/ax/src/cli/main.ts run make-a-play:prove --json`
  with `ax run ...`" (old Immediate Fix 1).** Wrong twice over: the
  installed `ax` binary is stale relative to the working tree PMS iterates
  on (version skew for self-hosting machinery), and by the boundary ruling
  this is PMS machinery operating on PMS state — not an Alexandria boundary
  violation. The real fix is Slice 1: the module runner leaves `ax`
  entirely.
- **Classification metadata on manifest entries.** Superseded by eviction:
  after Slice 1 the manifest contains only Alexandria plays, so there is
  nothing to label.
- **"Playbook visibility no longer depends on PMS Board state" (old Phase 2
  acceptance).** No such code dependency exists — visibility is the
  `surfaced` flag; the coupling is a process step, not data.
- **Work-order schema sharing, `work-order.v1`.** Out of scope; each
  product owns its records (PMS: JSON via Slice 2's write path; Alexandria:
  its own model when its agent-assignment work matures).
- **The `frame-the-problem` "potentially portable" classification.**
  Withdrawn; it is an Alexandria play.

## Success Criteria

- `PLAY_MANIFEST` contains only Alexandria plays, and `rg studio/
  packages/ax/src` returns nothing (Slices 1–2).
- Alexandria's Ledger receives no new PMS-originated events; the last
  `studio.operations.*` event predates Slice 1's merge.
- No Alexandria product data root under `studio/` (Slice 0), and the
  Alexandria Back tab renders the relocated bundle.
- `ax start viewer` runs the full Alexandria product with `packages/pms`
  deleted from the tree (Slice 2's hard test).
- Make-a-play, capture, deprecate, and quarantine run end-to-end through
  `pms` commands against PMS JSON records.
- Front-of-House remains the reference: Ledger-derived lifecycle, durable
  mutation only through `ax` commands, agent artifacts as validated
  intermediate inputs.

## Open Questions

- Confirm the relocation target for the Alexandria sweep family
  (`docs/alexandria/sweeps/` proposed).
- Package and CLI naming: `packages/pms` + `pms`, or keep the
  `studio` word (`packages/studio` + `studio` CLI)?
- Whether `ax internal ...` gets a clearer namespace once contracts are
  documented — still deliberately deferred behind making the contract
  explicit.
