# Issue 346 Technical Plan - Play Re-sync Runtime Proof Re-run

## Header

- Issue reference: `GetAlexandria/alexandria-internal#346`
- Goal: implement the runtime half of Play Re-sync E13 so a play whose proof was reset after a move-graph change can re-run the affected proving campaign, record a fresh dry-run generation, update only the reset risk-map entries that earned a new verdict, and emit an honest read-out of `re-earned`, `still-unproven`, and `owed-runtime`.
- Linked product plan: [`docs/alexandria/plans/studio-fixes/play-re-sync.md`](../studio-fixes/play-re-sync.md), especially E13, section 3 phase (c), and section 9 question 5.
- Prerequisite implementation plan: [`docs/alexandria/plans/337-play-re-sync/plan.md`](../337-play-re-sync/plan.md), which built the stale-cone command and explicitly deferred E13 runtime proof.
- Product surface: Playmaker Studio maintenance tooling under `studio/`, with black-box coverage in `packages/ax/tests/play-resync.test.ts`.

## Scope

- Extend the existing Studio-local Re-sync command, `studio/tools/play-resync.py <play-dir>`, rather than adding a new public `ax` command.
- Consume the E13 reset boundary from Phase 1:
  - a play has had pre-edit runs archived under `dry-runs/archive-<old-shape>/`
  - the reset risk-map entries have been moved back to an unproven state
  - the reset cone is available from Re-sync state or, if the current implementation lacks that handoff, the smallest state marker needed to persist the Phase-1 reset cone is added without changing stale-cone computation
- Add a runtime E13 pass that:
  - builds the reset cone as risk-map entries, not the whole risk map
  - creates or reuses a deterministic dry-run generation under `dry-runs/<new-shape>/`
  - runs every unattended runnable entry against current `fixtures/`
  - records each command, stdout, stderr, JSON summary, and verdict evidence under that generation
  - writes `dry-runs/<new-shape>/read-out.md` and a machine-readable manifest
  - updates only the reset entries in `risk-map.md`
  - creates deterministic Bug cards for `still-unproven` entries with `source: "play-re-sync"`
- Preserve the #337 behaviors: stale-cone detection, mechanical derivations, invariant Catch -> Bug cards, work orders, and idempotent reruns.
- Add tests for runtime read-out partitioning, risk-map mutation, dry-run generation idempotency, Bug-card creation, archive preservation, and no stage advancement.

## Non-Goals

- Do not re-implement Phase-1 detect/compute/cone walking. This slice consumes the E13 reset as the entry boundary.
- Do not auto-author fixtures, answer keys, risk-map rows, prompt changes, hardening, lint, `known-fps.md`, or move graph projections.
- Do not mark proof as re-earned from a successful `ax run` alone. A `re-earned` verdict requires a real run plus a bar the runtime can actually verify.
- Do not build a general semantic grading harness for all Studio plays. Rows that need fresh human/agent grading and lack an unattended grader are `owed-runtime`.
- Do not advance Board stage, `ready`, or `registry.js status`. This writes proof records and Bug cards only.
- Do not delete, rewrite, or move any `dry-runs/archive-*` directory.
- Do not write to `docs/alexandria/library/`.
- Do not change shipped plugin play behavior unless a later implementation discovers an `ax run` contract bug that must be fixed in `packages/ax`; if that happens, keep the CLI deterministic and test the changed contract.

## Linked Product-Plan Summary

Play Re-sync defines a play as a typed artifact graph, E1-E16. E13 is:

`brief §4 (move added/removed) -> dry-runs/ + risk-map results:`

The Phase-1 half archives old runs and resets stale proof to unproven. This issue is the Phase-2 runtime half: re-run the affected proving campaign against the current play shape and report what proof was re-earned versus what remains owed. The frozen contract is honest, not optimistic:

- `re-earned`: a reset entry re-ran and met its bar
- `still-unproven`: a reset entry re-ran and missed its bar
- `owed-runtime`: the runtime could not re-run or grade the entry unattended

Only `still-unproven` creates a Bug card. `owed-runtime` is pending work, not a break.

## Current Gap

- `studio/tools/play-resync.py` already models E13 as `needs-runtime` and returns it in the work order.
- `play-re-sync-state.json` currently stores source fingerprints and `lastRun`, but it does not persist a structured E13 reset cone or runtime generation status.
- `dry-runs/` has a human-authored convention:
  - archived retired-shape runs live under `archive-*`
  - fresh run records and `read-out.md` live beside the archive
  - `risk-map.md` carries a top-level `results:` rollup and a per-entry eval table with `runs` and `result` columns
- `ax run` now supports the run modes this slice should reuse:
  - `--fixture <case>`
  - `--auto-approve --wait --json` for unattended structural or gateless smoke
  - `--reactions <path>` for scripted review/revise gates
- The repo does not have a general automatic semantic grader for every risk-map row. The runtime must therefore avoid treating execution success as proof when the row's bar requires human/agent grading or unavailable proving modes.

## Architectural Boundaries

- `studio/tools/play-resync.py` remains the orchestrator because this is Studio maintenance over `studio/plays/<slug>` artifacts.
- `packages/ax` remains the deterministic runner. The Re-sync command may call `ax run`; it should not duplicate `ax run` fixture resolution, run modes, or Fabro launch behavior.
- `packages/alexandria-plugin` owns the shipped play package. This slice should not alter plugin skills or play prompts as part of proof re-running.
- Board cards stay inside the existing `studio/plays/board-state.json` schema. Runtime Bug cards should use existing fields (`title`, `detail`, `source`, `play`) unless implementation explicitly updates both Board validators and tests.
- `risk-map.md` parsing should follow the existing Studio eval-plan table convention (`risk | test | scope | type | built | target | runs | result`). The implementation should not invent a new risk-map schema for this slice.
- Runtime proof state is operational state in `play-re-sync-state.json` and `dry-runs/<generation>/`, not Alexandria runtime config.

## Trigger And State Contract

Extend `play-re-sync-state.json` to a schema-versioned state that can carry E13 reset/runtime status while preserving existing fields:

```json
{
  "schemaVersion": 2,
  "play": "frame-the-problem",
  "sourceFingerprints": {},
  "lastRun": {},
  "e13Runtime": {
    "shapeId": "resync-<shape-hash>",
    "resetConeHash": "<risk-entry-list-hash>",
    "riskMapHashAtReset": "<hash>",
    "archiveGeneration": "archive-<old-shape>",
    "runGeneration": "resync-<shape-hash>-<cone-hash>",
    "resetEntries": [
      {
        "entryId": "risk-row-012-out-3-overclaim-bait",
        "risk": "OUT-3",
        "test": "overclaim-bait",
        "rowIndex": 12
      }
    ],
    "status": "needs-runtime"
  }
}
```

Rules:

- If Phase 1 already writes equivalent reset metadata, consume it and migrate in memory to the shape above.
- If Phase 1 does not yet persist the reset cone in this codebase, add only the handoff needed when E13 reset/archive runs; do not change how stale source artifacts are detected or how the downstream cone is computed.
- The reset cone is a list of risk-map entries, not just unique risk ids. Multiple rows for the same risk remain distinct proof obligations.
- `runGeneration` is deterministic from current play shape plus reset cone. Re-running with no edit reuses the same generation and read-out instead of creating a duplicate directory.
- A new edit that triggers another E13 reset must produce a new `shapeId`/`resetConeHash` and a new runtime generation.

## Runtime Verdict Rules

Each reset entry is classified exactly once:

- `re-earned`
  - The implementation records a real command under `dry-runs/<generation>/`.
  - The command reaches a successful terminal state.
  - The row's bar is verified by an unattended mechanism available in the repo, such as a deterministic checker, a scripted reactions traversal whose success is the declared bar, or explicit expected material that the implementation can check without judgment.
- `still-unproven`
  - The entry is runnable unattended, a real command is recorded, and the command or verifier fails.
  - Examples: `ax run` exits nonzero, scripted reactions fail/timeout, expected output is missing, deterministic checker fails, or a declared sample budget is run and does not meet the pass threshold.
- `owed-runtime`
  - The runtime cannot honestly re-earn the entry unattended.
  - Examples: no registered `PLAY_MANIFEST` entry, no `fixturesDir`, `built` is not `yes`, no fixture case can be mapped, an interactive review/revise loop lacks `reactions.json`, the row needs semantic fresh-eyes grading with no unattended verifier, the row depends on a proving mode not present, or the target sample size is larger than the configured unattended campaign budget.

Operational dependency failures should be handled separately from per-risk verdicts:

- If no runtime can be launched at all because `ax`, Fabro, or required project setup is unavailable before any row starts, fail the command with an operational error and do not write proof updates.
- If a specific row names a mode the runtime does not support, classify that row as `owed-runtime` with the reason.

## Dry-Run Generation Contract

For a generation named `dry-runs/<generation>/`, write:

```text
dry-runs/<generation>/
  manifest.json
  read-out.md
  <entry-id>/
    run-1/
      command.json
      run.stdout.txt
      run.stderr.txt
      run-summary.json
      verdict.json
```

The manifest records:

- play slug
- current shape id
- reset cone hash
- reset entries
- commands executed
- verifier used per entry
- final partition lists
- hashes of `risk-map.md` before and after mutation

Preservation rules:

- Never write inside `dry-runs/archive-*`.
- Never count an archived run as proof for the new shape.
- Never mark an entry `re-earned` without a successful run record in the current generation.
- On an unchanged rerun, read the existing generation manifest, re-confirm it matches the current shape/reset cone, and avoid creating a duplicate generation.

## Risk-Map Mutation Rules

Treat the eval-plan table row `result` cell as the per-risk results axis for this slice. The top-level frontmatter-like `results:` field remains only a rollup.

For reset entries only:

- `re-earned`: update `runs` to the new run count and `result` to a concise re-earned verdict that names the generation.
- `still-unproven`: update `runs` to the attempted run count and `result` to `still-unproven` with a short failure summary and generation reference.
- `owed-runtime`: leave the proof state unproven and include the owed reason in the read-out. If the row was reset to `unproven`, keep it unproven.

For non-reset entries:

- Preserve existing `runs` and `result` cells byte-for-byte where possible.

For the top-level `results:` field:

- Do not set it to `proven`.
- If any reset entry is `still-unproven` or `owed-runtime`, keep or set the rollup to `unproven` with an explanatory comment if the current file already uses comments.
- If every reset entry is `re-earned`, set the rollup to a non-stage-advancing campaign label such as `re-earned:<generation>` or `smoke:<generation>`, matching nearby Studio convention.

## Bug Card Rules

For every `still-unproven` entry, create or update one deterministic Bug card:

```json
{
  "id": "bug-<play>-play-re-sync-e13-<entry-hash>",
  "type": "bug",
  "status": "open",
  "division": "<registry division>",
  "function": "<registry function>",
  "play": "<play>",
  "priority": 10,
  "source": "play-re-sync",
  "created": "2026-06-23",
  "title": "Play Re-sync catch: proof not re-earned for <risk>",
  "detail": "Risk entry, generation, command, and failure summary."
}
```

Rules:

- Re-running the same still-unproven entry updates the same card; it does not append duplicates.
- `owed-runtime` entries do not create Bug cards.
- `re-earned` entries do not create Bug cards.
- Existing stage arrays, `ready`, and `registry.js` remain unchanged.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Studio Re-sync command | `studio/tools/play-resync.py` | Adds E13 runtime state, dry-run generation management, risk-map parsing/mutation, `ax run` orchestration, read-out generation, runtime Bug-card creation |
| Studio run records | `studio/plays/<slug>/dry-runs/<generation>/` | Adds deterministic generation manifest, per-entry run records, and runtime read-out |
| Studio risk map | `studio/plays/<slug>/risk-map.md` | Updates only reset eval-plan entries with re-earned or still-unproven verdicts; owed-runtime remains unproven |
| Re-sync state | `studio/plays/<slug>/play-re-sync-state.json` | Extends schema to remember E13 reset cone, shape id, generation id, and idempotency status |
| Board state | `studio/plays/board-state.json`, `studio/plays/board-model.js`, `studio/site-server.py` only if needed | Reuses existing Bug-card schema; update validators only if implementation needs a new card field |
| `ax` runner | `packages/ax/src/commands/play.ts`, related tests only if needed | Prefer no change; fix only if `ax run` lacks a deterministic output field required to record the campaign honestly |
| Tests | `packages/ax/tests/play-resync.test.ts`, existing `ax run` tests as needed | Adds black-box runtime E13 tests with fake `ax`/Fabro where practical |
| Planning | `docs/alexandria/plans/346-play-re-sync-runtime/plan.md` | This implementation plan |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents | None | No agent prompt changes in this slice |
| Product skills | None | No plugin skill changes in this slice |
| Contributor workflow | Studio maintainers can run the existing Re-sync command after an E13 reset and get a runtime proof read-out | Update Studio docs only if implementation changes the command invocation or read-out path |
| CLI tools | Existing Studio-local command gains runtime proof behavior; no new public `ax` command | Black-box tests for JSON output, exit codes, idempotency, and mutation boundaries |
| Board data | Runtime still-unproven entries create Bug cards | Board validation/tests if any schema field changes; otherwise reuse existing card checks |
| Plugin packaging | No intended behavior change | Plugin validation only if implementation changes banked plugin payload files |

## Command And Output Contract

Keep the existing invocation:

```bash
studio/tools/play-resync.py studio/plays/frame-the-problem --json
```

When an E13 runtime reset is pending, JSON output adds a runtime section:

```json
{
  "play": "frame-the-problem",
  "e13Runtime": {
    "generation": "resync-<shape-hash>-<cone-hash>",
    "readOutPath": "studio/plays/frame-the-problem/dry-runs/<generation>/read-out.md",
    "reEarned": [],
    "stillUnproven": [],
    "owedRuntime": [],
    "bugCards": []
  }
}
```

Exit codes:

- `0`: command completed. It may include `re-earned` and `owed-runtime` entries.
- `1`: at least one entry is `still-unproven`, an invariant Catch occurred, an auto-derivation failed, or an operational error prevented an honest runtime pass.
- `2`: invalid input or usage.

`--check` remains no-write:

- report which E13 runtime entries would run
- report which would be `owed-runtime`
- do not create a generation
- do not mutate `risk-map.md`
- do not create Bug cards

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Re-sync black-box tests | `bun test packages/ax/tests/play-resync.test.ts` | Covers stale-cone behavior plus E13 runtime partitioning, dry-run generations, Bug cards, idempotency, and archive preservation |
| `ax run` fixture/scripted modes, if touched | `bun test packages/ax/tests/fixtures.test.ts packages/ax/tests/scripted-answerer.test.ts packages/ax/tests/ax.integration.test.ts` | Verifies fixture resolution and run-mode contracts used by runtime proof |
| Studio syntax | `python3 -m py_compile studio/tools/play-resync.py` | Fast Python syntax gate |
| Board/state checks | `sh studio/tools/check.sh` | Validates Board cards, server persistence, catalog, and Re-sync syntax |
| `ax` package, if touched | `pnpm --filter @alexandria/ax run test` and `pnpm --filter @alexandria/ax run typecheck` | Required if the implementation changes CLI code |
| Full repo gate before handoff | `pnpm run check` | Lint, format, shell, markdown, and typecheck gate |
| Plugin validation, if plugin files changed | `claude plugin validate ./packages/alexandria-plugin` | Required only if banked plugin payload changes |

Black-box cases to add:

1. A pending E13 reset with two runnable reset entries creates one deterministic generation and updates only those rows to `re-earned`.
2. The read-out partitions every reset entry exactly once across `re-earned`, `still-unproven`, and `owed-runtime`.
3. A fake `ax run` failure produces `still-unproven`, exits `1`, writes a generation record, and creates one deterministic Bug card with `source: "play-re-sync"`.
4. A reset entry requiring interactive review/revise without `reactions.json` is `owed-runtime`, remains unproven, and creates no Bug card.
5. A row with no unattended verifier is `owed-runtime` even if a fixture can launch; no optimistic proof is written.
6. A second unchanged invocation reuses the generation, does not duplicate read-outs or Bug cards, and does not reset results back to unproven.
7. `dry-runs/archive-*` hashes are identical before and after the runtime pass.
8. Board stage arrays, `ready`, and `registry.js` are byte-unchanged except for allowed Bug-card insertion in `board-state.json`.
9. Negative: no entry can become `re-earned` unless its generation contains a successful command record and verifier verdict.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Product agents | Not changed | No eval rerun | N/A |
| Product skills | Not changed | No eval rerun | N/A |
| Studio maintenance command | Deterministic command, not product skill behavior | Add black-box tests instead of eval harness | `bun test packages/ax/tests/play-resync.test.ts` |
| `ax run` deterministic CLI, if changed | Existing unit/integration coverage | Rerun targeted deterministic tests; no skill eval | `bun test packages/ax/tests/fixtures.test.ts packages/ax/tests/scripted-answerer.test.ts packages/ax/tests/ax.integration.test.ts` |
| Future guided Operations play | Not built in this slice | Add plugin evals only when Play Re-sync becomes shipped guided behavior | Deferred |

No eval-harness coverage is required for this slice unless implementation changes product-facing plugin skills or agents.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A successful `ax run` could be mistaken for proof even though no grader checked the risk's bar | Require a verifier before `re-earned`; classify missing verifier rows as `owed-runtime`; add negative tests |
| The reset cone may not be persisted by the current Phase-1 implementation | Add the smallest schema-v2 handoff in Re-sync state at the E13 boundary; do not alter stale-cone detection |
| Parsing freeform risk-map Markdown could rewrite unrelated prose or rows | Limit mutation to the eval-plan table rows named by stable row ids; preserve non-reset rows and prose byte-for-byte where practical; test multi-row same-risk cases |
| Generation naming could create duplicate run directories on rerun | Derive generation id from current shape plus reset cone hash and store it in state/manifest; assert idempotency in tests |
| An old `archive-*` run could be counted as proof for the new shape | Only accept run records whose manifest shape id matches current shape; hash archives before/after |
| `owed-runtime` could be treated like a failure and spam Bug cards | Encode `owed-runtime` as a first-class verdict with reason; tests assert no Bug card for owed rows |
| Runtime dependency failures could partially mutate proof | Preflight `ax`/Fabro/project setup before writing `risk-map.md`; write run records first, then read-out, then risk-map and cards atomically |
| Board card schema drift could break the Board | Use existing card fields; if a new field is needed, update `board-model.js`, `site-server.py`, and Board tests in the same slice |
| The implementation could accidentally advance stage while updating proof | Snapshot `board-state.json` stages/ready and `registry.js`; tests assert they do not change |
| Real k-run campaigns could be expensive or flaky in deterministic tests | Use fake `ax`/Fabro in black-box tests; make live smoke optional/manual and record if unavailable |

## Implementation Steps

1. Add schema-versioned E13 runtime state helpers to `studio/tools/play-resync.py`, preserving existing schema-1 state reads.
2. Add or consume the Phase-1 reset handoff: shape id, archive generation, reset cone entries, and risk-map hash at reset.
3. Implement a risk-map eval-table parser that returns stable entry ids and can rewrite only selected `runs`/`result` cells.
4. Implement generation planning: deterministic generation id, manifest path, idempotent reuse, and archive write protection.
5. Implement runtime classification planning for each reset entry: runnable command, verifier, or owed-runtime reason.
6. Wire `ax run` execution through the existing CLI contract, capturing command JSON, stdout, stderr, run summary, and verifier verdict under the generation.
7. Generate `read-out.md` and `manifest.json` with partition lists that cover every reset entry exactly once.
8. Mutate `risk-map.md` atomically after run records and read-out are written.
9. Reuse existing Board-card upsert logic to create deterministic E13 Bug cards for `still-unproven`.
10. Preserve `--check` as a no-write planner for the runtime pass.
11. Add black-box tests for success, failure, owed-runtime, idempotency, archive preservation, no optimistic proof, and no stage advancement.
12. Run deterministic verification and document any live smoke that cannot run because local Fabro/ACP credentials are unavailable.

## Acceptance / Exit Criteria

1. After a Phase-1 E13 reset, `studio/tools/play-resync.py <play-dir> --json` creates or reuses one current-shape generation under `dry-runs/<generation>/`.
2. The generation contains per-entry command records and a read-out for every reset entry that the runtime attempted or classified.
3. The read-out partitions all reset entries exactly once into `re-earned`, `still-unproven`, or `owed-runtime`.
4. A reset entry is marked `re-earned` only when a corresponding successful run and verifier verdict exist under the generation.
5. A reset entry that re-runs and misses its bar is marked `still-unproven`, exits nonzero, and creates or updates one Bug card on that play with `source: "play-re-sync"`.
6. A reset entry that cannot be re-run or graded unattended is marked `owed-runtime`, remains unproven in `risk-map.md`, and creates no Bug card.
7. Only reset entries are rewritten in `risk-map.md`; untouched entries keep their existing results.
8. `dry-runs/archive-*` directories are unchanged.
9. `board-state.json` stage arrays, `ready`, and `registry.js` status are not changed by the runtime pass.
10. Re-running with no edit is idempotent: no duplicate generation, no duplicate read-out, no duplicate Bug card, and no fresh unproven reset.
11. Deterministic verification commands pass, or any unavailable live runtime smoke is reported with the exact missing dependency.

## Deferred Follow-Ups

1. Build a general Studio grading harness only after the proof-bar schema is ruled; until then, semantic grader rows remain `owed-runtime`.
2. Externalize Play Re-sync E1-E16 and E13 reset cone metadata into the future typed-link manifest when that data model lands.
3. Wire read-out verdicts to Ledger event types after the Board/Ledger event schema is adopted.
4. Add Viewer support for runtime proof generations if the Board or Testing surface needs to render them.
5. Add k-run campaign scheduling, sampling summaries, and confidence intervals beyond the single-generation runtime pass.
6. Promote Play Re-sync into a guided plugin Operations play and add eval coverage if it becomes a shipped product-facing workflow.
