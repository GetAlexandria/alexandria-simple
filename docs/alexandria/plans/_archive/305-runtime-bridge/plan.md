# Issue #305 — Slice 1: ax server runtime daemon as the Fabro→ledger bridge + thin `ax run`

**Repo technical plan.** Upstream product intent: `docs/alexandria/plans/frame-the-problem-coin/plan.md` (§5.1, §5.2, §10 slice 1). Issue: #305.

## 1. Scope

Ship §5.1 + §5.2 **together** (the emission handoff must be atomic — no double-emit/no-emit window).

**In:**
1. **`ax run` becomes start-only** (`packages/ax/src/commands/play.ts`): default = fire-and-forget (detached, gates left pending); `--interactive` unchanged; `--auto-approve` explicit; new `--wait` (run to terminal inline). Stamp `alexandria.playId` / `alexandria.playRunId` Fabro run labels at launch. Remove all `play.*` emission from the CLI. Route live `--input` values through temp files (apostrophe fix).
2. **The runtime daemon becomes the bridge** (`packages/ax/src/effects/runtime-server.ts` + a new `run-bridge.ts`): a long-lived task that watches Fabro runs and emits `play.*` lifecycle events to the ledger — `play.started`, `play.human_input_requested`, `play.human_input_resolved`, `play.completed`/`failed` — idempotent, question-scoped, attributed via the `alexandria.*` labels.
3. **New event types** (`packages/ax/src/domain/state-events.ts`): `play.requested`, `play.human_input_requested`, `play.human_input_resolved`.
4. **One run-state model** (`packages/ax/src/domain/project-state.ts`): extend `derivePlayRuns` to fold the new events (open-questions set + `needs_human_feedback` status). The tracker reads this.
5. **Retarget the Play Tracker** (`packages/ax/src/effects/studio-api.ts`): `/api/studio/runs` + `/api/studio/runs/{id}/events` read the runtime projection (`AlexandriaProjectState.playRuns`) instead of shelling `fabro ps` / `fabro inspect`. Fixes the always-empty active-runs list; surfaces the "Raven needs you" (`needs_human_feedback`) state.
6. **Migration:** callers that relied on the old auto-approve default add `--auto-approve`/`--wait` — the viewer "Run" button (`runtime-server.ts launchPlayRunResponse`) and every `--fixture` invocation in `studio/plays/TESTING.md`.

**Out (later slices / not this issue):**
- The `frame-the-problem` Raven skill, subscriptions, connection safeguard (§5.3).
- **Answering** a pending interview (that's §5.3). NB finding: answering is an HTTP call `POST /api/v1/runs/{id}/questions/{qid}/answer`, not a clean `fabro` CLI subcommand — revisit decision-3 ("shell the fabro CLI to answer") in §5.3.
- The coin slot + "Raven needs you" *UI* (§5.4); this slice only makes the data present.
- Scripted-answer dry-run + fixtures (§5.5). No change to the `frame-the-problem` play or to Fabro.

## 2. Architectural boundaries

- `ax run` = launch + label only. No ledger writes.
- The daemon (`ax server`) = the only `play.*` emitter and the single run-state authority. Emits via the existing internal `appendEventResponse` path (`runtime-server.ts`), reusing the mutation semaphore + SSE broadcast.
- The tracker reads the daemon's projection; it does not shell Fabro.
- No Fabro source changes.

## 3. Bridge design (the one real decision)

Fabro exposes **no server-wide event stream** — only per-run `fabro run events <id> --follow` and `fabro runs list --json`. Managing N `--follow` subprocesses (spawn-on-appear, reap-on-complete, crash recovery) is heavy and fragile for v1.

**Decision:** v1 bridge is a **short-interval reconcile loop** (poll), not per-run follow subprocesses. This is a deliberate, documented refinement of the product plan's "push" preference (the product `plan.md` is upstream intent; the repo plan picks the implementation that fits the real Fabro surface). Each tick:
1. `fabro runs list --json --label alexandria.playRunId=*` (enumerate Alexandria-owned runs; attribute via labels).
2. For each run, diff against last-seen state held in memory:
   - first-seen → `play.started`;
   - new pending interview (from the run's `pending_interviews`, fetched per run) → `play.human_input_requested` (carry `questionId`, `prompt`, `choices`, `draftArtifactPath`);
   - a previously-pending interview now cleared → `play.human_input_resolved`;
   - terminal status → `play.completed` / `play.failed`.
3. Emit only transitions (idempotent: keep a per-run last-emitted snapshot; on daemon restart, **reconcile** from the ledger projection + current Fabro state so nothing double-fires and in-flight suspensions are re-surfaced).

Interval ~2s (configurable). The loop is hosted in the daemon process, started at server bootstrap, stopped in the shutdown path.

## 4. Touched files / subsystems

| File | Change |
|---|---|
| `packages/ax/src/commands/play.ts` | run modes (`--wait`, explicit `--auto-approve`, default detach), `--label` stamping, remove 3 emission sites + `terminalStatus`/`trackerPathForFabroRun` + the `appendStateEventThroughRuntime` import, route `--input` via temp files |
| `packages/ax/src/domain/state-events.ts` | add 3 event types + payload schemas + descriptors + registry entries |
| `packages/ax/src/domain/project-state.ts` | extend `derivePlayRuns` + `PlayRun` (open-questions set, `needs_human_feedback` via the new events) |
| `packages/ax/src/effects/run-bridge.ts` (NEW) | the reconcile-loop bridge: enumerate Fabro runs, diff, emit transitions |
| `packages/ax/src/effects/runtime-server.ts` | start/stop the bridge task in the server lifecycle; emit via `appendEventResponse` |
| `packages/ax/src/effects/studio-api.ts` | retarget `/api/studio/runs` + `/runs/{id}/events` to the projection; delete `fabro ps`/`inspect` shelling (`normalizeFabroPsRows`, `ledgerFallbackRuns`, `fetchFabroRunState`) |
| `packages/ax/src/commands/start.ts` | ensure the bridge runs under `ax start server`/`all` |
| viewer `runtime-server.ts launchPlayRunResponse` + `studio/plays/TESTING.md` callers | add `--auto-approve`/`--wait` (migration) |

## 5. Changed behavior surfaces

- `ax run <play>` now returns immediately (detached) and leaves human gates pending; it no longer writes `play.*`.
- Play lifecycle events now originate from the daemon, are attributed via labels, and include the new human-input pair.
- The Play Tracker reflects in-flight runs and a blocked/needs-input state.

## 6. Deterministic tests

In `packages/ax` (`bun test`):
1. `ax run` emits no `play.*` (assert on a fake/recording append path).
2. Label args present + correct on the `fabro run` invocation (assert `runArgs`).
3. Run-mode matrix: default → `--detach`, no `--auto-approve`; `--auto-approve` present; `--wait` blocks; `--interactive` unchanged.
4. `--input` with apostrophes → written to a temp file, path bound, no `WorkflowInputError` (orchestration single-quote check not tripped).
5. Bridge transition logic (unit, fed synthetic `runs list` + `pending_interviews` snapshots): first-seen→started; pending→human_input_requested (questionId); cleared→resolved; terminal→completed/failed; **exactly-once** across repeated ticks; **reconcile-on-restart** dedup against an existing ledger.
6. `derivePlayRuns` folds the new events (open-questions set; `needs_human_feedback`; resolve clears).
7. Tracker endpoints: given a projection with an in-flight + a needs-input run, `/api/studio/runs` returns them (non-empty) with the blocked flag — replacing the `{"runs":[]}` regression. (`packages/ax/tests/studio-api.test.ts`.)

Run: `bun run check` and `bun test` (+ the viewer suite if studio-api response shapes the viewer decodes change).

## 7. Evals

Per `targeted-evals`: slice 1 is **runtime/CLI plumbing**, not agent/skill prompt behavior — no play prompt, agent, or skill text changes. Expect **no eval reruns required**; confirm against `EVALS.md` after the diff is final and record "no impacted evals" with rationale. (The `frame-the-problem` smoke/fixtures are §5.5, not here.)

## 8. Risks & mitigations

- **Emission handoff window** → ship §5.2 + §5.1 in one PR; test exactly-once.
- **Poll latency / missed fast transitions** → short interval + reconcile-on-restart + diff against ledger so a missed tick is recovered, not lost.
- **Label flag drift** → confirmed `--label KEY=VALUE` (repeatable) in `fabro-cli/src/args.rs`; assert in a test.
- **Tracker decode breakage** → keep the `/api/studio/runs` response schema (`StudioActiveRunsSchema`) stable, or update the viewer decoder in lockstep + test.
- **Input temp-file lifecycle** → write under the run workspace/`.ax-runtime` tmp; acceptable to leave for the run's lifetime (matches fixture path semantics).

## 9. Deferred follow-ups

- Push-based bridge (per-run `--follow`) if poll latency proves insufficient.
- General shell-escaping fix for inline `--input` (we route via temp files instead).
- §5.3/§5.4/§5.5.
