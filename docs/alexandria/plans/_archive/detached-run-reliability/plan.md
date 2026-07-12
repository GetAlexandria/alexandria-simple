# Detached Run Reliability — make `ax run` fail loud, hand back a handle, and not clobber output

**Status:** Draft · 2026-06-18 — **PR 1 (A+B) built (#313); fix C retired (see §5)**
**Owner:** Danvers
**Scope:** `packages/ax` (run command + detached-run plumbing). **No change to
Fabro. No change to the `frame-the-problem` play graph or prompts.**

## 0. Update (2026-06-18) — relationship to slices 2–4 (#312)

Slices 2–4 of the coin plan landed under review as **#312** while PR 1 was open.
That changed the picture for this plan:

- **#312 builds the human-in-the-loop** (the `frame-the-problem` skill consuming
  `play.human_input_requested`, `ax raven answer`, the coin slot + tracker, and a
  scripted-answer dry run). That resolves the loop gap discussed when this plan
  was written.
- **PR 1 (A+B) is complementary and partly a prerequisite.** #312 adds neither
  the liveness guard (A) nor the detached run-handle parse (B). Its scripted-answer
  dry run (`--reactions`) launches **detached** and then needs the run id from
  `parseFabroRunResult` to drive the gates — i.e. it **depends on Fix B** to work
  against real Fabro (its tests use a fake that emits compact NDJSON, masking the
  gap). So PR 1 should land with or just before #312.
- **Coordination done in PR 1:** rebased #313 onto #312 and **exempted
  `--reactions` from the Fix A guard** — that mode observes Fabro directly and
  drives gates itself, so it doesn't need the bridge daemon the guard checks for.
- **Fix C is retired as originally scoped** — see §5. It becomes a small bridge
  follow-up, not a prompt/path change, because #312's skill already reads
  `event.payload.draftArtifactPath`.

## 1. Why this exists (and why it is *not* the coin plan)

The 2026-06-18 QA session of `frame-the-problem` surfaced three defects that are
**independent of the coin re-architecture's unshipped slices 2–4**
(`docs/alexandria/plans/frame-the-problem-coin/plan.md`). Those slices add the
coin trigger (§5.4), the Raven skill that consumes the human-input event (§5.3),
and the dry-run harness (§5.5) — they close the *human-in-the-loop*. The three
defects here are different: they are reliability holes in the **detached `ax run`
path that Slice 1 already shipped**. They would still bite after 2–4 land.

Slice 1 (#305/#309) flipped `ax run` to **detached-by-default** and moved all
`play.*` emission to the `ax server` runtime daemon (the bridge). That design is
correct, but the launch path has no guard that the bridge is actually alive, no
run handle to hand back, and no per-run output isolation. The observed failure:
the daemon was down, every detached submit returned success-shaped with
`fabroRunId: null` and no events, the tracker stayed empty, and nothing told
Raven to stop — so she re-submitted in a loop, each run silently overwriting the
last run's framing document.

This plan hardens Slice 1's delivered surface. It is compatible with — and does
not re-litigate — the thin-`ax run` direction in coin-plan §5.2 (these fixes add
liveness + a returned handle; they do **not** re-introduce emission into the CLI).

## 2. The three defects

| # | Defect | Evidence | Independent of slices 2–4? |
|---|---|---|---|
| **A** | Detached `ax run` fires into a void: no daemon liveness check, no boot. The plan's "boot-on-demand by first ledger append" cannot trigger because the thinned `ax run` never appends — the bridge does. | `commands/play.ts` has zero boot/liveness code in the launch path (verified: no `isPidAlive`/`ensureServer` call before `startFabroServer`/run). Daemon metadata + `isPidAlive` exist (`runtime-server.ts:2956`) but are unused by `ax run`. | Yes — a down daemon kills the loop silently no matter what 2–4 do. |
| **B** | Detached submit returns `fabroRunId: null` + exit 0 + `status: "submitted"` — a success-shaped result with no handle to poll and no stop condition. | Session JSON showed `fabroRunId: null`; `--wait` returned an id. `parseFabroRunResult` (`orchestration.ts:773`) does not recover the id from the detached invocation's output shape. | Yes — the caller needs a handle on detach regardless of the coin. |
| **C** | Play output is not run-scoped. The deliverable lands at a fixed `docs/alexandria/runtime/problem-framing.md` (+ `for-the-director.md`), overwritten every run; `.ax-runtime/<fabroRunId>/` holds only the materialized workflow copies, not output. | Session retry-storm: ~4 submits all wrote the same two files; last-writer-wins. | Yes — an output-path issue, untouched by 2–4. |

## 3. Fixes

### Fix A — liveness guard (+ optional boot) before a detached launch

`ax run`, when launching **detached** (the default), must confirm the runtime
daemon is alive before declaring the run submitted. The detection primitive
already exists; wire it into the launch path.

- **Probe.** Read the server metadata file
  (`serverMetadataPathForWorkspacePath`) and `isPidAlive(pid)`
  (`runtime-server.ts`). Extract a small `isRuntimeDaemonAlive(workspacePath)`
  helper so both `ax run` and tests can call it.
- **On daemon down — two acceptable behaviors (decide in §6):**
  - *(preferred)* **Auto-boot** the daemon (same path as `ax start server`) and
    wait briefly for it to claim its metadata, then proceed. Matches the
    "boot-on-demand" intent in coin-plan §10.10, just triggered explicitly by
    `ax run` instead of relying on a ledger append that never comes.
  - *(fallback / minimum)* **Refuse loudly**: non-zero exit + a structured
    `CliResult` error — *"Detached run not started: the Alexandria runtime
    daemon isn't running. Start it with `ax start server` (or `ax start all`).
    Nothing would observe this run."* Never return `submitted` into a dead
    bridge.
- **`--wait` / `--auto-approve` / `--interactive`** are unaffected (they gather
  the result inline and don't depend on the bridge for observation), but A's
  probe is cheap, so still emit a soft warning if those modes run with no daemon
  (the tracker/ledger will be blind).
- **Files:** `commands/play.ts` (launch path ~395–467), a new helper beside
  `connection-status.ts` / `runtime-server.ts`.
- **Acceptance:** with the daemon down, a default `ax run` either boots it (and a
  subsequent `play.started` appears on the ledger within seconds) or exits
  non-zero with the actionable message — never exit 0 / `submitted` into a void.

### Fix B — return the run handle on detached submit

A detached `ax run` must hand back `fabroRunId` (and the derived `trackerPath`)
so the caller has something to poll and a stop condition.

- **Recover the id.** Confirm the `fabro run --detach --json` output shape and
  fix `parseFabroRunResult` (`orchestration.ts:773`) to read the run id from it
  (the id is assigned at submit; the bridge already attributes by the
  `alexandria.playId/playRunId` labels we stamp). If the detached fabro
  invocation does not print the id, add the flag/format that makes it do so.
- **Surface it.** `PlayRunSummary.fabroRunId` non-null on a successful detached
  submit; `trackerPath` via `trackerPathForFabroRun`; JSON + human output both
  include it and a one-line "check status / awaiting the daemon to narrate" note.
- **Files:** `orchestration.ts` (`parseFabroRunResult`), `commands/play.ts`
  (summary assembly ~457–491).
- **Acceptance:** `ax run <play> --json` (detached) returns a non-null
  `fabroRunId` and a `trackerPath`; the id matches the run the bridge then
  narrates on the ledger.

### Fix C — run-scoped (non-clobbering) play output — RETIRED as scoped

The spike found fix C is *not* the small isolated change this plan assumed, and
#312 changed where it belongs:

- **c1 (per-run cwd) can't be verified.** The play writes `runtime/…` relative to
  the agent's sandbox `working_directory`, which Fabro's server/sandbox sets —
  inconsistently (output has landed in both `.ax-runtime/<fabroRunId>/runtime/`
  and the shared `docs/alexandria/runtime/`). `ax run`'s client cwd doesn't
  deterministically control it without Fabro/server config changes (out of
  scope), and the fake-fabro tests ignore cwd, so a cwd fix would ship untested.
- **c2 (placeholder path) fights two contracts.** The viewer's prompt-contract
  parser + test (`packages/viewer/.../promptContract.test.ts`) assert the prompts
  write the literal `runtime/problem-framing.md` (the agency boundary), and
  **#312's skill hardcodes the same path as a fallback**. A placeholder in the
  path would break both and churn 4 prompt copies + the brief.
- **The real home is the bridge.** #312's skill reads
  `event.payload.draftArtifactPath` first (falling back to the hardcoded path),
  and `draftArtifactPath` is already in the slice-1 event schema
  (`state-events.ts:240`). So the clean fix is a small follow-up: **the bridge
  emits a per-run `draftArtifactPath`** (and the play writes there) — the skill
  then follows it with no change. #312 already stages **inputs** per-run at
  `.ax-runtime/inputs/<playRunId>/`; mirror that for outputs.
- **Severity is low post-PR-1.** PR 1's guard removed the acute trigger (the
  retry-storm); the residual is two *legitimate* sequential runs overwriting the
  prior draft — a retention nicety, not an active-run correctness bug.

→ **Refile as a bridge follow-up after #312 lands** ("emit per-run
`draftArtifactPath`"), not a standalone prompt/path PR.

## 4. Out of scope / non-goals

- The human-in-the-loop itself (coin-plan slices 2–4): the coin trigger, the
  Raven `frame-the-problem` skill, the `play.human_input_requested` consumer, the
  tracker "Raven needs you" surface, the dry-run harness. **Unchanged here.**
- `--auto-approve`'s silent gate-skip (coin-plan Risk §8) — folds into Slice 3's
  explicit-modes guard, not this plan.
- Already fixed: apostrophe input rejection (#310), framing audit-drift (#311).
- No Fabro changes. No framing-logic changes.

## 5. Sequencing

1. **PR 1 — A + B (detached-run reliability) — built as #313.** Both are the
   `ax run` detached path turning a silent void into either a working, observable
   run or a loud, actionable error with a handle. Rebased onto #312 to add the
   `--reactions` guard exemption (§0); Fix B is a prerequisite for #312's
   scripted dry run on real Fabro. Lands with or just before #312.
2. **~~PR 2 — C (run-scoped output)~~ — RETIRED.** Refiled as a bridge follow-up
   ("emit per-run `draftArtifactPath`") after #312 lands; see §3 Fix C.

Each PR off `main`, no auto-merge, hand-QA'd.

## 6. Open decisions (settle before building)

1. **A: auto-boot vs. refuse-loud.** Auto-boot is the better UX and matches the
   stated boot-on-demand intent; refuse-loud is the safer minimum. Recommendation:
   auto-boot **with** a clear announcement, falling back to a loud refusal if the
   boot doesn't claim metadata within a short timeout.
2. **B: does `fabro run --detach --json` already print the run id?** Confirm by
   inspection; determines whether B is a parser fix or also needs a fabro flag.
3. **C: c1 (per-run cwd) vs. c2 (placeholder).** Decided by whether
   `commands/play.ts` controls the agent's working dir. Prefer c1.

## 7. Risks

- **Auto-boot races the startup claim.** `acquireStartupClaim`
  (`runtime-server.ts`) already guards double-start; reuse it, don't add a second
  lock. Test concurrent `ax run` invocations don't both spawn a daemon.
- **Liveness probe false-negative.** A daemon mid-boot may not have written
  metadata yet; the probe must tolerate a brief window (retry/backoff) before
  declaring it down, or A will spuriously refuse/boot.
- **C breaks existing readers** of the fixed `docs/alexandria/runtime/…` path
  (the for-the-director companion, any viewer/skill that reads it). Inventory
  readers before moving the path; keep a "latest" pointer if any are load-bearing.
- **Coin-plan drift.** Slice 1's direction is thin `ax run`. A/B add liveness +
  handle return, not emission — keep it that way so this doesn't collide with the
  bridge's emission ownership (coin-plan §12).
