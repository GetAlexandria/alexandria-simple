# Issue 337 Technical Plan - Play Re-sync

## Header

- Issue reference: `GetAlexandria/alexandria-internal#337`
- Goal: implement the first durable Play Re-sync slice so a Studio play edit computes the stale downstream cone, runs the existing mechanical derivations and gates, and emits explicit work orders or Bug cards for everything Re-sync must not invent.
- Linked product plan: [`docs/alexandria/plans/studio-fixes/play-re-sync.md`](../studio-fixes/play-re-sync.md)
- Product surface: Playmaker Studio maintenance tooling under `studio/`, with narrow test coverage in existing repo test packages.

## Scope

- Add a Studio-local command, tentatively `studio/tools/play-resync.py <play-dir>`, with `--json`, `--check`, and deterministic exit codes.
- Encode the E1-E16 artifact edge graph in the Re-sync command as a small explicit data model for v1. This is code-owned data, not a per-play manifest yet.
- Detect changed source artifacts from a per-play Re-sync checkpoint and a git-diff fallback when no checkpoint exists.
- Compute and print the stale set as edge ids plus source and target artifacts.
- Partition the stale set into:
  - auto-derivable edges that can run now
  - needs-authoring work-order items
  - blocked auto edges whose upstream needs-authoring edge is unresolved
  - invariant Catch items that become Bug cards
- Reuse the existing Studio executors rather than rebuilding them:
  - `studio/tools/derive-views.sh` for prompt-file plays
  - `studio/tools/generate-story.py` for inline-prompt story refresh when `derive-views.sh` is not applicable
  - `studio/tools/check-placeholder-spelling.sh`
  - `studio/tools/check-workflow-edges.py`
  - `studio/tools/check-moves.ts` when `moves.md` exists and `bun` is available
  - `studio/tools/bank.sh`
- Add minimal Board-card persistence needed for Catch -> Bug:
  - preserve an optional `cards` array in `studio/plays/board-state.json`
  - validate/preserve it in `studio/site-server.py`
  - make Re-sync add or update deterministic Bug cards with `source: "play-re-sync"`
- Write a per-play Re-sync checkpoint/report artifact, tentatively `studio/plays/<slug>/play-re-sync-state.json`, to support idempotent reruns and duplicate-card prevention.
- Update Studio maintenance docs so `BIG-EDIT.md` is clearly replaced by the command path, while keeping the product-level spec in `docs/alexandria/plans/studio-fixes/play-re-sync.md` as the design source.

## Non-Goals

- Do not implement the later manifest-as-data edge graph or per-play typed-link manifests.
- Do not auto-project `brief.md` section 4 into `workflow.fabro`; E1 remains needs-authoring.
- Do not generate fixtures, answer keys, risk-map content, `hardening.md`, `lint.md`, `known-fps.md`, `moves.md`, or bookkeeping decisions.
- Do not re-run the proving campaign or claim proof is re-earned; E13's runtime half remains deferred.
- Do not add a public `ax` command in this slice. The CLI requested by the issue is the Studio-local command.
- Do not build the full PlaymakerStudio -> Operations catalog or full Board redesign.
- Do not write to `docs/alexandria/library/`.
- Do not change shipped plugin behavior except when a user intentionally runs Re-sync and `bank.sh` mirrors a changed play package.

## Linked Product-Plan Summary

The product spec defines a play's artifacts as a typed dependency graph, E1-E16. Editing a node makes the transitive downstream cone stale. Re-sync runs three phases:

1. Detect the delta from the last known source checkpoint.
2. Compute the stale cone by walking E1-E16.
3. Propagate or flag:
   - auto-derive mechanical edges such as renderings and bank
   - emit work-order rows for needs-authoring edges
   - create Catch -> Bug cards for invariant-gate violations

The important frozen contract is that Re-sync never designs. A stale member that requires graph-shape, fixture, grading, audit, or bookkeeping judgment is flagged, not invented.

## Current Gap

- The repo has good single-purpose Studio tools:
  - renderings are derived by `derive-views.sh`
  - placeholder spelling is checked by `check-placeholder-spelling.sh`
  - ACP failure-fallback edges are checked by `check-workflow-edges.py`
  - banking is handled by `bank.sh`
  - bank, placeholder, risk-map, and moves-overlay conformance have existing tests
- The repo does not have a single command that:
  - detects what changed after a play edit
  - computes the downstream cone
  - lists needs-authoring work instead of relying on memory
  - runs the mechanical derivations in dependency order
  - creates Bug cards for invariant catches
  - makes a second unchanged invocation a no-op
- `BIG-EDIT.md` records the manual sequence, but the failure that seeded it was a skipped downstream step. The issue asks for the sequence to run as a computed operation.
- The live Board state has only play-stage arrays and `ready`; the draft Board data model describes Bug cards, but the live JSON/server contract cannot yet preserve them.

## Architectural Boundaries

- The implementation belongs in `studio/tools/` because this is Studio maintenance over `studio/plays/<slug>` artifacts.
- `packages/ax` should not define the Play Re-sync workflow in v1. It may host black-box tests because existing Studio command tests already live there.
- `packages/alexandria-plugin` remains the banked payload; Re-sync reaches it only through `bank.sh`.
- `packages/viewer` remains the home for shared Studio parsers and conformance tests. Re-sync can rely on existing tests, but should not move viewer parsing logic into Python unless a concrete gate needs it.
- Board-card support should be the smallest compatible extension of `board-state.json`: preserve existing `stages` and `ready`, add optional `cards`, and keep old clients from deleting cards when they POST stage changes.
- The per-play checkpoint is operational state, not product library content and not Alexandria runtime config.

## E1 Blocking Rule

There is one approval-sensitive behavior to make explicit before implementation:

- If only `brief.md` section 4 changes, Re-sync must compute the full downstream cone, but it must not pretend it can satisfy E1. It should flag E1 as needs-authoring and mark downstream auto edges that depend on the projected workflow as `blockedBy: ["E1"]`.
- If the edit includes the authored projection as well, for example `workflow.fabro` and prompt files changed with the brief, Re-sync may run renderings and bank immediately.

This preserves the "Re-sync never designs" contract. It also means an acceptance test that expects renderings after a brief-only graph edit should be interpreted as "after the projection source exists" or should expect renderings to be reported as blocked by E1.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Studio Re-sync command | `studio/tools/play-resync.py`, optional helper `studio/tools/play_resync_lib.py` | New deterministic command detects changed play artifacts, computes E1-E16 stale cones, runs existing executors, emits JSON/human output, writes a checkpoint |
| Existing Studio executors | `studio/tools/derive-views.sh`, `generate-story.py`, `check-placeholder-spelling.sh`, `check-workflow-edges.py`, `check-moves.ts`, `bank.sh` | Reused by orchestration; avoid changing unless implementation exposes a concrete structured-output or path bug |
| Board state | `studio/plays/board-state.json` | Adds optional `cards: []` with Bug card records created by Re-sync catches |
| Board persistence | `studio/site-server.py` | Validates and preserves optional cards while keeping existing stage/ready validation and atomic writes |
| Board UI | `studio/plays/board.html` | At minimum preserves `cards` on POST; optional small bug-count display only if needed for verification |
| Studio docs | `studio/plays/BIG-EDIT.md`, `studio/plays/README.md` | Documents Re-sync as the running replacement for the manual big-edit checklist |
| Tests | `packages/ax/tests/play-resync.test.ts` and existing Studio guard/conformance tests | Black-box command coverage for stale sets, exit codes, JSON fields, idempotency, Bug cards, and no content invention |
| Planning | `docs/alexandria/plans/337-play-re-sync/plan.md` | Repo-specific implementation plan |

## Changed Behavior Surfaces For Agents And Skills

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | No agent prompt changes in this slice |
| Product skills | None | No plugin skill changes in this slice |
| Contributor workflow | Studio maintainers get a deterministic Re-sync command to run after play edits | Update Studio docs that currently point to the manual `BIG-EDIT.md` sequence |
| CLI tools | New Studio-local command, not a public `ax` command | Add black-box tests for output fields and exit codes |
| Board data | Re-sync can create/update Bug cards in `board-state.json` | Server must preserve cards; later Board redesign can render full card views |
| Plugin packaging | Only affected when `bank.sh` is invoked by Re-sync on a changed bankable play | Run plugin validation if implementation or verification changes plugin payload files |

## Command Contract

Proposed invocation:

```bash
studio/tools/play-resync.py studio/plays/frame-the-problem --json
```

Required output fields for `--json`:

```json
{
  "play": "frame-the-problem",
  "changedArtifacts": [],
  "staleSet": [],
  "autoDerived": [],
  "blocked": [],
  "workOrder": [],
  "bugCards": [],
  "noOp": true,
  "statePath": "studio/plays/frame-the-problem/play-re-sync-state.json"
}
```

Exit codes:

- `0`: command completed; no invariant Catch or executor failure occurred. A needs-authoring work order may still be present.
- `1`: invariant Catch, executor failure, or failed auto-derivation occurred; JSON includes `bugCards` or an error summary.
- `2`: usage or invalid input path.

Mutation modes:

- default: run eligible auto-derivations, update checkpoint, create/update Bug cards
- `--check`: compute and report only; no file writes, no bank, no board card write
- `--json`: stable machine-readable stdout; diagnostics stay on stderr

## Detection And State

- Fingerprint source-like artifacts:
  - `brief.md` section 4 only, from the `## 4.` heading through the next `## ` heading
  - `workflow.fabro`
  - every file under `prompts/`
  - prompt frontmatter contract fingerprints derived from `prompts/`
  - optional authored overlays and audit/grading artifacts only where they are edge targets
- Store the last processed source fingerprints in `play-re-sync-state.json`.
- If no Re-sync state exists, use `git diff --name-only HEAD -- <play-dir>` as a first-run detection fallback. If git is unavailable or the play has no diff, bootstrap the state after invariant checks.
- Use deterministic item keys for work-order rows and Bug cards so reruns update existing records instead of duplicating them.
- Update the checkpoint after the command has completed its eligible actions and emitted any work order. This makes a second unchanged run a no-op while preserving outstanding work-order and Bug-card records.

## Stale-Cone Rules

Implement the E1-E16 graph as explicit edge records with at least:

- `id`
- `source`
- `target`
- `disposition`: `auto-derivable`, `needs-authoring`, `auto-detectable`, or `needs-runtime`
- `executor`, when auto-derivable or auto-detectable
- `blockedBy`, for edges that should not run until an upstream needs-authoring edge is satisfied
- `workOrderTitle` or `catchTitle`

Initial source classifiers:

- `brief.section4`: starts E1, E2, E4-E16, with E2/E4/E14 blocked until E1 is satisfied unless workflow/prompt projection changes are also present.
- `workflow.fabro`: starts E2, E4, E8, E9, E10, E12, E14, E15.
- `prompts/*`: starts E4, E8, E10, E12, E14.
- prompt external-input contract changes: additionally starts E5 and E6.
- `story.md` or `diagram.svg` edited directly: invariant catch/work-order route for E2/E3 because renderings are derived and should be overwritten from source.
- `fixtures/`, `risk-map.md`, `known-fps.md`, `hardening.md`, `lint.md`, `moves.md`, `dry-runs/`, `registry.js`, and `board-state.json`: classify as authored target edits and run the relevant detect-only checks without generating replacement content.

## Auto-Derivation And Work Order

- Run dependency preflight before mutating:
  - play dir exists
  - required files for selected executors exist
  - `fabro` is available before derive/bank paths that require it
  - `python3` is available
  - `bun` is available for `check-moves.ts`, otherwise record a skipped advisory check rather than failing the run
- For prompt-file plays, run `derive-views.sh` once when any selected unblocked edge needs diagram/story refresh.
- For inline-prompt plays with no `prompts/`, run `generate-story.py` for story refresh and mark diagram/bank edges as not applicable or work-order, matching `BIG-EDIT.md`.
- Run `check-placeholder-spelling.sh` and `check-workflow-edges.py` for invariant gates.
- Run `bank.sh` only after renderings and invariant gates pass and only for bankable prompt-file plays.
- Work-order entries must name the edge, target artifact, reason, and why authoring is required. They must not create or rewrite the target content.
- Needs-runtime E13 should archive/reset only if the implementation can do it mechanically without touching proof claims ambiguously; otherwise flag it as `needs-runtime` and leave full campaign re-run deferred.

## Catch To Bug Cards

For every invariant-gate violation, create or update a deterministic Bug card in `board-state.json`:

```json
{
  "id": "bug-frame-the-problem-play-re-sync-e8-<short-hash>",
  "type": "bug",
  "play": "frame-the-problem",
  "title": "Play Re-sync catch: dead placeholder spelling",
  "detail": "E8 failed in prompts/pre_fill.md: __AX2_INPUT_TRANSCRIPT__",
  "status": "open",
  "priority": 1,
  "source": "play-re-sync",
  "created": "2026-06-23",
  "tags": ["E8", "invariant"]
}
```

Rules:

- Re-running the same catch updates the existing card detail and timestamp fields instead of appending duplicates.
- Clearing the bug is not automatic in v1; a clean later run may add a `resolvedByRun` field or leave closure to the Board workflow. The full status lifecycle is deferred to the Board card model.
- If `cards` is absent, Re-sync initializes it as `[]`.
- `site-server.py` preserves cards when Board UI POSTs only `stages` and `ready`.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Re-sync CLI black-box tests | `bun test packages/ax/tests/play-resync.test.ts` | Verifies stale-set JSON, exit codes, no-op rerun, Bug-card creation, and no needs-authoring content invention |
| ACP edge invariant | `bun test packages/ax/tests/studio-workflow-edge-guard.test.ts` | Keeps E9 gate behavior covered against real shipped workflows |
| Python syntax | `python3 -m py_compile studio/tools/play-resync.py` | Fast sanity check for the new Studio command |
| Viewer Studio conformance subset | `pnpm --filter @alexandria/viewer run test` | Covers placeholder, bank, risk-map, prompt-contract, and move-overlay parsers/gates that Re-sync relies on |
| Plugin validation, if plugin files changed | `claude plugin validate ./packages/alexandria-plugin` | Required when banking or implementation changes touch plugin payload |
| Real Studio smoke, when `fabro` is available | `studio/tools/play-resync.py studio/plays/frame-the-problem --json` | Exercises real derive/check/bank executor chain on the canonical live play |
| Repo checks | `pnpm run check` | Formatting, lint, shell, markdown, and typecheck gate before PR handoff |

Black-box test cases to add:

1. Prompt edit computes a cone containing story, placeholder/frontmatter checks, lint/audit work order, and bank; it runs eligible auto edges.
2. Brief section 4 edit computes the full downstream cone and flags E1 instead of inventing a workflow projection.
3. Brief section 4 plus workflow/prompt projection edit re-derives renderings and banks in a temp repo fixture.
4. Second unchanged invocation is a no-op and creates no duplicate work-order or Bug-card records.
5. Placeholder typo exits `1`, returns an E8 Bug card, and writes a deterministic Board card.
6. Missing ACP failure fallback exits `1`, returns an E9 Bug card, and writes a deterministic Board card.
7. Needs-authoring edges for fixtures/risk-map/hardening/lint are listed but their files are byte-unchanged.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents | Not changed | No eval rerun | N/A |
| Product skills | Not changed | No eval rerun | N/A |
| Studio maintenance command | Deterministic command, not eval-backed product skill behavior | Add black-box tests instead of eval harness | `bun test packages/ax/tests/play-resync.test.ts` |
| Board card persistence | Deterministic static Studio server/data behavior | Add command/server tests; no eval harness | Covered by Re-sync tests |
| Future Operations play/catalog | Not built in this slice | Add eval coverage only when Re-sync becomes plugin-guided behavior | Deferred |

Contributor-skill changes are not part of this issue, so EVALS.md does not require harness reruns.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A brief-only graph edit cannot safely produce a new workflow or trustworthy renderings because E1 is needs-authoring | Make blocked downstream auto edges explicit in JSON and tests; do not run derive from a known-stale projection |
| The checkpoint could hide an outstanding work order on rerun | Use deterministic work-order/card ids and include outstanding records in the checkpoint/report while keeping unchanged reruns no-op for new work |
| Git fallback may behave differently in temp worktrees or untracked play copies | Treat git diff as bootstrap only; after first run the per-play checkpoint is authoritative |
| Board card support could accidentally delete existing stage state or future card fields | Preserve unknown card fields, validate only required fields, and keep stage/ready validation unchanged |
| Existing executor scripts emit human text rather than structured events | Treat stdout/stderr as captured diagnostics and structure only Re-sync's own output fields |
| `fabro` may be unavailable in CI or maintainer shells | Preflight dependency availability before mutation; use fake `fabro` in black-box tests and a real smoke only where available |
| Running bank in tests could mutate the real plugin payload | Build tests around a temp repo fixture or copied tool tree so `bank.sh` resolves a temporary repo root |
| The slice could drift into the full Board redesign or Operations catalog | Limit v1 to optional `cards` persistence plus Re-sync-produced Bug records; defer UI and catalog work |
| Needs-authoring work might be silently skipped if an edge is classified only as advisory | Tests must assert expected work-order ids for E1, E5, E6, E7, E12, E13 runtime, E16, and negative no-content writes |
| An exit-0 run advances the checkpoint, so a still-open work order could vanish on rerun | Hold back the blocking source (brief.section4 while E1 is unresolved) in `checkpoint_fingerprints` so the E1 work order and the blocked downstream cone re-surface every rerun until the projection is authored; cover with a rerun-persistence and a resolution test |

## v1 Work-Order Persistence Boundary

Re-sync distinguishes two kinds of stale authoring work on rerun:

- **Blocking projection (E1).** A brief §4 edit with no authored
  `workflow.fabro`/`prompts/` projection leaves the play genuinely
  inconsistent and blocks the mechanical cone. This work order **persists**:
  `checkpoint_fingerprints` refuses to advance `brief.section4` until the
  projection edit lands, so every rerun re-reports E1 and the blocked edges.
  Resolution is automatic — authoring the projection clears the block and the
  source advances normally.
- **Advisory drift (E11 moves overlay, E12 hardening/lint, E15 legs.json).**
  These exit 0 and are **fire-once** in v1: they re-surface whenever their
  relevant source changes again, but a no-op rerun will not re-list them.
  Durable carry-forward of every outstanding authoring row by stable id is the
  manifest-as-data follow-up below, because correct per-edge resolution needs
  the typed dependency graph rather than the source-fingerprint heuristic.

## Implementation Steps

1. Add the Re-sync command skeleton with argument parsing, repo/play path resolution, `--json`, `--check`, and exit code handling.
2. Implement source fingerprinting and per-play checkpoint read/write, including git-diff bootstrap.
3. Encode the E1-E16 edge records and source classifiers, then add pure stale-cone tests through the black-box command.
4. Implement executor planning with blocked-edge handling, dependency preflight, and no-mutation `--check`.
5. Wire existing tools in dependency order: invariant checks, derive/story refresh, moves advisory, bank.
6. Add work-order output for needs-authoring and needs-runtime edges without modifying authored targets.
7. Extend `board-state.json`/`site-server.py` card preservation and add Re-sync Bug-card upsert logic.
8. Update Studio docs to point from `BIG-EDIT.md` to the Re-sync command and to document the E1 blocking rule.
9. Add black-box tests with temp repo fixtures, fake `fabro`, and byte-unchanged assertions for needs-authoring targets.
10. Run deterministic verification and inspect the first real `frame-the-problem` smoke output when local dependencies allow it.

## Acceptance / Exit Criteria

1. Editing a play source and running `studio/tools/play-resync.py <play-dir> --json` returns a stale set that matches the E1-E16 downstream cone for the changed artifact class.
2. Prompt/workflow edits with satisfied upstream projection re-derive `diagram.svg`/`story.md` and run bank through existing tools.
3. A brief section 4 graph edit with no workflow projection does not invent a projection; it returns E1 as a needs-authoring work-order item and marks dependent auto edges blocked.
4. Needs-authoring edges for fixtures, answer keys, risk-map, hardening, lint, known-fps, moves overlay, and bookkeeping are listed in the work order and not silently skipped.
5. Needs-authoring target files are not generated or rewritten by Re-sync.
6. An unchanged second run is a no-op and does not duplicate work orders or Bug cards.
7. Placeholder spelling and missing ACP failure-fallback violations produce Catch -> Bug cards with deterministic ids and nonzero exit.
8. `board-state.json` preserves existing stage/ready data and optional cards through `site-server.py` POSTs.
9. The runtime proving campaign remains deferred and no output claims proof has been re-earned.
10. Deterministic tests and applicable validation commands pass.

## Deferred Follow-Ups

1. Externalize E1-E16 into a manifest-as-data typed-link model once the catalog shape lands. This also unlocks durable carry-forward of every outstanding advisory authoring work order (E11/E12/E15) by stable id, replacing the v1 fire-once behavior with precise per-edge resolution.
2. Promote Play Re-sync into the PlaymakerStudio -> Operations catalog and add plugin-guided behavior/evals if it becomes a shipped play surface.
3. Wire ledger events for Re-sync runs, work orders, and Bug-card lifecycle after the Board/ledger event type is adopted.
4. Build full Board to-do card UI, filtering, status transitions, and resolved-card workflow.
5. Automate the E13 mechanical half only after the reset/archive format is ruled safe for every play shape.
6. Add a future public `ax` surface only if Studio maintenance becomes a product/runtime operation rather than repo-maintainer tooling.
