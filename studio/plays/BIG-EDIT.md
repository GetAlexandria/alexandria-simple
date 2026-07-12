# BIG-EDIT.md — predecessor notes for Play Re-sync

> **Status, 2026-06-23:** this manual checklist has been retired as an
> operating path. After editing a fully drafted play, run
> `studio/tools/play-resync.py <play-dir> --json`. Re-sync computes the stale
> E1-E16 downstream cone, runs the mechanical derive/check/bank tools, creates
> Catch -> Bug cards for invariant failures, and emits work-order rows for
> authoring edges. This file remains as the historical grounding for the order
> and failure modes.

*(Director-requested via the playmaker-testing-streamline plan §3.C. Seed: the
Frame the Problem → Riff promotion (2026-06-18), a large edit that silently
invalidated the play's renderings, tests, audit, and recorded results — because
the downstream steps were skipped. This is the **stable, runtime-independent**
procedure (C1). The runtime-touching half — re-running the graded campaign and
writing the honest read-out — is **C2, pegged to the frame-the-problem-coin
re-architecture** (Slice 1, issue #305); see step 7–8 and plan §6.)*

## When this applied

The old rule keyed on edit size: a **big edit** was any change large enough to
invalidate renderings, tests, or audit. Play Re-sync replaces that size gate.
Every play edit gets the same question mechanically: which downstream artifacts
are stale now?

The important boundary remains: Re-sync never designs. A brief §4 move-graph
edit with no accompanying `workflow.fabro`/`prompts/` projection produces an E1
work order and blocks downstream auto edges such as E2, E4, and E14 until the
projection exists.

## The order is load-bearing

Each step invalidates the next if skipped. Every failure the plan's §1 catalogs
was a skipped step — renderings not re-derived, tests tuned to the old play,
results that measured the retired play. Run them in order.

## 1. Edit the source — never the renderings

- **Logic → the brief first.** A change to *what* the play does (a move's job,
  the graph shape, a bounce) lands in `brief.md` §4, the projected source.
  Protocol E gates on brief ↔ workflow ↔ prompts parity, so editing
  `workflow.fabro` directly is a parity failure unless it is a pure projection of
  a brief §4 you already changed (`PROJECTION.md` is the projection rulebook).
- **Method → the prompts.** A change to *how* a move does its job lands in
  `prompts/<move>.md` (or, for an inline-prompt play, the node's `prompt=` in
  `workflow.fabro`), per `AUTHORING.md`.
- **Placeholders stay single-`AX_`** (`__AX_INPUT_<KEY>__`, …) — the spelling
  rule is owned by `AUTHORING.md`; `studio/tools/check-placeholder-spelling.sh`
  and the conformance gate reject anything the runtime won't substitute.
- **File-writing moves carry the output-discipline clause** (`AUTHORING.md`):
  write the declared `emits` files with the tool; a reply that writes no file is
  a failed run.

## 2. Re-derive the renderings — never hand-edit them

`studio/tools/derive-views.sh <play-dir>` regenerates `diagram.svg` + `story.md`
from `brief.md` §4 + `workflow.fabro` + `prompts/`. It validates the workflow
first and runs the advisory `moves.md` check. A hand-edited rendering is a
Protocol E parity failure — these files are derived, never authored.

> Inline-prompt plays (no `prompts/` dir, e.g. `build-atomic-card`):
> `derive-views.sh` refuses without `prompts/`. Re-derive the story directly with
> `studio/tools/generate-story.py <play-dir> <play-dir>/story.md`.

## 3. Re-tune the test suite — a big edit invalidates the grading material

- `fixtures/` to the **new input contract** — drop dead inputs; the contract is
  the play's declared `consumes`.
- answer-keys to the **new outputs and move names** — the old keys grade against
  retired moves and artifacts.
- `known-fps.md` provenance — re-disposition; a pattern dispositioned against the
  old play may no longer hold.
- `risk-map.md` terminology to the new moves/ids — the canonical-family
  convention; the risk-map drift gate enforces it.

## 4. Re-audit — the old audit is not carried

Fresh `hardening.md` (graph + state-flow) and `lint.md` (Protocols A–E per
`AUTHORING.md`). **E is the anti-drift protocol** — brief ↔ workflow ↔ prompts
parity, with `fabro validate` as E.6. Pre-run the lint yourself and check
`known-fps.md` so you don't "fix" a dispositioned pattern.

## 5. Sideline the old runs — never show results the live play didn't earn

- Archive pre-edit dry-runs under a dated subdir, e.g.
  `dry-runs/archive-<old-shape>/`, so the read-out doesn't mix old and new.
- Reset `risk-map.md`'s `results:` axis to unproven. Every recorded pass measured
  the *retired* play (plan §1.5) — the live play has earned nothing yet.

## 6. Bank — make the factory run the edit

`studio/tools/bank.sh <play-dir>` copies the deployable package
(`workflow.fabro` + `prompts/`) studio → plugin: it refuses dead placeholders,
re-derives (so step 2 can't be skipped), previews the diff, mirrors the package,
and validates the banked copy. `bank.sh --check <play-dir>` reports drift without
copying. **Until you bank, the factory runs the stale plugin copy** — the silent
footgun this whole sequence closes (plan §1.1). The bank conformance gate then
holds studio ≡ plugin in CI.

## 7–8. Re-run the campaign + the read-out — and the records (C2 + bookkeeping)

**Runtime half (C2 — pegged, see plan §6):** re-running the graded campaign on
the new play and writing the honest read-out depend on the new `ax run` modes and
the run-state model from the frame-the-problem-coin re-architecture (Slice 1,
#305) — the campaign harness (workstream E) drives `ax run --auto-approve`, and a
human gate is graded through the bridge's suspend/answer events. Until that
lands, treat any re-run as best-effort; **do not record a campaign as proof under
the old transport**, and keep the step-5 `results:` reset honest.

**Bookkeeping half (do now):** advance the play's `status` on the proving ladder
in `registry.js` (`slot → designed → hardened → derived → proven → registered`)
and its board stage to match what's actually been earned — never ahead of it.

## The safety net — what catches a skipped step

These gates fail CI loudly, but they catch drift; they don't do the re-tune or
the honest read-out for you:

- **placeholder spelling** — a dead or malformed placeholder in
  `workflow.fabro` or `prompts/` (step 1): caught locally by
  `studio/tools/check-placeholder-spelling.sh` and in CI by the conformance
  gate (rule: `AUTHORING.md`).
- **bank conformance** — studio ≠ plugin for a banked play (step 6).
- **risk-map drift** — an off-taxonomy risk id (step 3).
- **Protocol E + `fabro validate`** — brief ↔ workflow ↔ prompts parity (steps
  1, 4).
