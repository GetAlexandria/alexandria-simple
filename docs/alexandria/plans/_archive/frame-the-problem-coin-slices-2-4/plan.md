# Frame-a-Problem coin — Slices 2–4 (repo technical plan)

**Repo technical plan.** Upstream product intent:
`docs/alexandria/plans/frame-the-problem-coin/plan.md` (§5.3, §5.4, §5.5; §6
event schemas; §7 decisions). Slice-1 repo plan:
`docs/alexandria/plans/305-runtime-bridge/plan.md` (merged as #305 / PR #309).

**Director directive (this PR):** slices 2–4 ship as **one** PR off `main`
(they are a dependency chain 2→3→4, not independent work). Commits are kept
clean per slice so the director can QA slice-by-slice within the one PR. No
auto-merge.

## 0. What slice 1 already gives us (build on, do not rebuild)

- All 7 `play.*` event types in `state-events.ts` (incl. `play.requested`,
  `play.human_input_requested`, `play.human_input_resolved`).
- The runtime daemon **bridge** (`run-bridge.ts` + `fabro-client.ts`) — the sole
  emitter of `play.*`, reconcile-loop, question-scoped + idempotent. It already
  emits `play.human_input_resolved` when a pending question clears, and
  `play.status_observed { status: needs_human_feedback }`.
- `derivePlayRuns` / `PlayRun` projection and the projection-backed Play Tracker
  endpoints (`/api/studio/runs` returns `needs_human_feedback`).
- Thin `ax run` (start-only, detached default, `alexandria.*` labels, no `play.*`
  emission). The generic `POST /api/events` append endpoint exists.

## 1. Verified corrections to the product plan (empirical)

1. **Answering is HTTP, not a `fabro` CLI subcommand.** Confirmed against
   vendored Fabro: `POST /api/v1/runs/{id}/questions/{qid}/answer`, body
   discriminated by `kind` (`yes`/`no`/`selected`/`multi_selected`/`text`),
   validated by `QuestionType` (`fabro-server/.../handler/runs.rs`,
   `fabro-cli/.../run/attach.rs::submit_server_interview_answer`,
   `fabro-types/.../interview.rs`). The plan §7-3 ("shell the fabro CLI to
   answer") is wrong. → build an `ax play answer` command that POSTs.
2. **`--input` content must travel as a file path.** Prompts read
   `__AX_INPUT_TRANSCRIPT__` as *the path to read material from*
   (`prompts/pre_fill.md:16`); inline values were never content, and any value
   with `'` is rejected (`orchestration.ts:1062`). → route live `--input` through
   a temp file, bind the path (the fixture contract). This is the slice-1 deferral.
3. **Scripted answers have no `fabro run` flag.** `ReplayInterviewer`/
   `QueueInterviewer` are library-only (`fabro-interview/src/{replay,queue}.rs`);
   detached runs use `ControlInterviewer` and accept answers via the POST
   endpoint above. → the deterministic dry-run is a detached run + a scripted
   answerer that POSTs reactions through the *same* answer path Raven uses.
4. **Riff fixtures already exist.** `frame-the-problem/fixtures/` is already the
   single-`transcript` Riff layout (PR #299); reactions "arrive live at the
   review gate, never as a fixture file" (`fixtures/README.md`). → slice 4 adds
   `reactions.json` + the answerer + TESTING.md, not an input rebuild.

## 2. Slice 2 — `ax play answer`, `--input` temp-file fix, the thin skill (§5.3)

### 2a. `ax play answer` (packages/ax)
New command `ax play answer --run <fabroRunId> --question <qid> <answer>` where
`<answer>` is one of `--approve|--yes`, `--deny|--no`, `--select <key>`,
`--multi-select <k,k>`, `--text <s>`, `--text-file <path>` (file form avoids
shell quoting from the agent). Behavior:
- Resolve Fabro target + dev token (reuse `fabro-client.ts` plumbing — export a
  `submitFabroAnswer` / `fetchRunState`).
- GET `/state`; if `qid ∉ pending_interviews` → **already resolved**, exit 0
  (idempotent). Else build the `kind` body, POST the answer.
- Validate the chosen kind against the question's `question_type` (clear error on
  mismatch; Fabro is the backstop with 400/404/409 → structured CLI errors).
- **Emits no `play.*`** — the bridge emits `play.human_input_resolved` on the
  next tick when the question clears.
- Factor `buildAnswerBody(answerSpec, questionType)` pure for unit tests; inject
  the HTTP fns for the round-trip test.

### 2b. `--input` temp-file routing (packages/ax)
In `play.ts`, for each live `--input key=value`, write `value` to a temp file
under the run workspace (`.ax-runtime/.../inputs/<key>`) and bind `inputs[key]`
to that absolute path before render — identical to the fixture contract.
`--fixture` is unchanged (already paths). Apostrophe-laden text round-trips.

### 2c. Skill + routing + subscriptions (packages/alexandria-plugin)
- New `skills/frame-the-problem/SKILL.md`, modeled on
  `raven-vision-drafting`/`-elicitation`, aligned to `PROJECTION.md §7` +
  `AUTHORING.md` (event-sourced, non-blocking; the human gate is conversational,
  never `--interactive`). Contract: connection safeguard (`ax inspect
  connections list --json` + liveness; relaunch `claude-monitor.sh`; "connected
  again" vocabulary) → elicit transcript → write it to a file → `ax run
  frame-the-problem --input transcript=<path>` (fire-and-forget) → on
  `play.human_input_requested` read `runtime/problem-framing.md` +
  `runtime/for-the-director.md`, riff with the director, then `ax play answer`
  the agreed decision for the exact `(fabroRunId, questionId)`; track a **set** of
  open asks, re-check after each answer, handle already-resolved → on
  `play.completed` present the artifact to **ratify** (no auto-bank) or loop.
  Never self-answer.
- `skills/alexandria-event-log/SKILL.md`: route `play.requested`,
  `play.human_input_requested`, `play.human_input_resolved`, `play.completed`
  into the frame-the-problem skill.
- `scripts/claude-monitor.sh` + `skills/ax-start/SKILL.md`: register the play
  lifecycle subscription at session start (alongside `raven-vision`), `--if-missing`.

**Tests:** deterministic `packages/ax` tests for `buildAnswerBody`, the
already-resolved path, and `--input` temp-file binding + apostrophe round-trip.
Skill is prose (graded by §5.5 dry-runs / evals, not unit tests).

## 3. Slice 3 — coin slot + tracker "Raven needs you" (packages/viewer)

- `RavenBench.tsx` `AgentQuickBar`: third button **"Frame a Problem"** (mirrors
  the Knowledge Bank / Agent buttons); thread `onFrameProblem?` through
  `RavenBench` → `LibraryBrowserShell` → `LibraryBrowserApp`.
- Click **emits `play.requested`** (`{ playId:"frame-the-problem", agentId, source:"viewer-coin" }`)
  via a new `runtimeClient.requestPlay` → `POST /api/events`. It does **not** call
  `runPlay` (that spawns a headless inputless run).
- `PlayTrackerTab.tsx`: render a "Raven needs you" badge for runs whose
  `status === "needs_human_feedback"` (data already present; `status` schema is
  tolerant). Active-runs list + per-run view otherwise unchanged.

**Tests:** viewer vitest — slot renders + click emits the event; tracker row
shows the badge for `needs_human_feedback`.

## 4. Slice 4 — scripted-answer dry-run + reactions + TESTING.md (studio + ax)

- New `ax run` test affordance (e.g. `--reactions <path>`): a detached run whose
  pending review gates are answered, in order, from an ordered reactions file via
  the slice-2 answer path; pair with `--wait` to gather. Deterministic traversal
  of `pre_fill → review → revise → review → exit` with no live human, no
  `--interactive`. (Conceptually `QueueInterviewer`; physically the POST path.)
- `reactions.json` schema: an ordered list of director reactions, each an answer
  spec (`{ "kind":"text", "text":"…" }` for Revise, `{ "kind":"selected",
  "option_key":"approve" }` / yes for Approve — exact gate shape confirmed at
  implementation against a live pending question).
- Add `reactions.json` to the loop-exercising cases (at least `golden`,
  `rerun`); confirm input fixtures are already Riff-shaped.
- `studio/plays/TESTING.md`: document run modes — smoke campaigns use
  `--auto-approve --wait`; gate-grading uses scripted `--reactions` (auto-approve
  stays forbidden for grading a gate). Fix stale `ax2 run` references in touched
  run lines.

**Tests:** `packages/ax` test for reactions parsing + the answerer ordering;
a studio dry-run is a manual/QA-gated traversal (live Fabro), documented as such.

## 5. Risks

- **Answer mis-targeting / N open asks** — always address `(fabroRunId,
  questionId)`; idempotent submit; already-resolved handled.
- **Bridge tick latency** — `ax play answer` confirms via the HTTP 204; the
  `play.human_input_resolved` event follows on the next ~2s tick.
- **Draft artifact location** — the skill reads `runtime/problem-framing.md` from
  the run workspace; resolve the absolute path at implementation (emit it as
  `draftArtifactPath` if cheap).
- **No Fabro changes; no change to the `frame-the-problem` play.**

## 6. Out of scope

- Tracker control buttons (pause/approve/deny) — Raven mediates the human turn.
- Push-based bridge, projection consolidation, async `fabro ps` — slice-1
  follow-ups, only folded in if they block correctness.

## 7. Post-rebase reconciliation (main moved during the build)

Rebased onto `origin/main`, which gained two commits after slice 1:

- **#310** ("stop rejecting apostrophes in workflow input substitution") made
  `substituteWorkflowPlaceholders` context-aware: prompt templates inject
  verbatim (no rejection), workflow templates escape `'`. This is the apostrophe
  fix the handoff said was unshipped — so slice 2 does **not** own it. Our
  `--input-text` remains warranted and complementary: the frame-the-problem
  prompt consumes the transcript **as a path** ("read the material at the path
  above"), so inline content must be written to a file and bound by path; #310
  alone (verbatim into a path-expecting prompt) does not make inline content
  work. The skill leads with write-a-file + `--input <path>`; `--input-text` is
  the ax-owned convenience for the same contract.
- **#311** reworked the frame-the-problem prompts ("frame the human struggle,
  not risks to the undertaking"); studio↔plugin prompts are synced there. Our
  new skill (`skills/frame-the-problem/`) does not touch the play prompts.

**Known pre-existing failure (NOT this PR):** `packages/ax tests/runtime-server.test.ts`
is flaky on `main` independent of these slices (5–6 of 26 fail, varying;
reproduced at slice-1 base `4baf2186` and on `origin/main`). Root cause is the
slice-1 run-bridge ticking inside the test server (SSE-ordering contention +
`[run-bridge] Error: Alexandria is not initialized` log noise). A slice-1 bridge
follow-up, deliberately not fixed here. Everything else is green.
