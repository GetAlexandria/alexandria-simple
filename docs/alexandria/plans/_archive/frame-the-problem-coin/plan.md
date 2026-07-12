# Frame a Problem from the Coin — Agent-Mediated Play with a Human-Feedback Loop

**Status:** Draft · 2026-06-18
**Owner:** Danvers (+ partner)
**Scope:** cross-package — `packages/viewer`, `packages/ax`, `packages/alexandria-plugin`, `studio/` (testing). **No change to the `frame-the-problem` play itself.** **No change to Fabro** (the engine already supports this).

## 1. Goal / what success looks like

The Raven coin gains a third hot-tray slot, **"Frame a Problem"** (next to "Knowledge Bank" and "Agent"). When the director clicks it:

1. Raven (in Claude Code, in the director's terminal) wakes and **asks for the core input** — the material to frame. The director never needs to know a CLI or a play id exists.
2. Raven hands that input to the play (`ax run frame-the-problem`) for analysis. The play runs as a normal **detached** Fabro run.
3. When the play reaches its human-feedback node, it **suspends** (does not block a process) and the suspension is surfaced to Raven via the **ledger + monitor** wake path.
4. Raven **discusses the draft with the director conversationally** — this back-and-forth happens entirely in chat, not in Fabro. Fabro just holds the pending question.
5. Once they agree, Raven **submits the decision to the waiting Fabro node out-of-band** (shelling the `fabro` CLI), and tells the director it's been sent.
6. When the play completes, Raven is woken again (subscribed to `play.completed`) and **presents the artifact** for the director to **ratify** or **put back in the loop**.

**Invariants this design enforces:**

- The director only ever talks to **Raven**. The human is never asked to "go into Fabro and type."
- Fabro is the **analysis engine behind Raven**, not a human-facing surface.
- The human turn lives in **conversation**, not in the workflow graph. The graph keeps its human node, but that node is a *suspend-and-wait-for-an-answer* point, never a *block-on-stdin* point.

## 2. The architectural decision (resolving human-node vs. agent-node)

The earlier debate ("paused agent nodes" vs. "human nodes") dissolves once framed as **who holds the conversation**, not which node type to use.

- A **blocking human node** (what `ax run --interactive` produces today via Fabro's `ConsoleInterviewer`) means "the human reaches into the Fabro process and types." That only composes when a person is sitting at Fabro's own terminal. When Raven launches the play, *she* owns the terminal and the human is one layer away — so the node blocks forever and the agent hangs. This is the deadlock observed on 2026-06-18.
- The **right model** keeps the human node but treats it as a **suspend point**: Fabro persists the question as a *pending interview* on the run, the run stays alive, and the answer is delivered **out-of-band** (the runtime bridge wakes Raven; she answers via the `fabro` CLI) once Raven and the director have agreed. Control returns to Raven, not to a blocked stdin read.

`--interactive` remains valid for one audience only: a **human running the play directly in their own terminal**. It is not the agent-mediated path and must not be used by Raven.

## 3. Verified foundation (what already exists)

This was confirmed by reading `repos/fabro`, `packages/ax`, `packages/viewer`, and `packages/alexandria-plugin` on 2026-06-18.

| Capability | Status | Evidence |
|---|---|---|
| Human node suspends as a **pending interview** on run state (no process block) | EXISTS | `repos/fabro/lib/crates/fabro-store/src/run_state.rs` (`pending_interviews` map, populated/cleared by interview events) |
| Answer a pending question **out-of-band**, run resumes | EXISTS | `repos/fabro` tests `attach_advances_when_pending_question_is_answered_elsewhere`, `detached_run_answers_pending_question…`; `run_control.rs` uses `Notify` to resume |
| Non-blocking interviewers (not just stdin/auto-approve) | EXISTS | `fabro-interview/src/{queue,control,callback,replay}.rs` |
| **Fabro MCP** submit-answer tool | EXISTS | `fabro-mcp-server/src/server.rs`; `fabro-tool/src/interact.rs` — `fabro_run_interact` action `Answer` → `SubmitAnswerRequest`; `get_questions` action |
| Ledger + wake subscriptions + monitor | EXISTS | `packages/alexandria-plugin/scripts/claude-monitor.sh` → `ax internal host claude monitor`; match logic `packages/ax/src/domain/wake-subscriptions.ts` |
| `play.completed` is a subscribable event type | EXISTS | `packages/ax/src/domain/state-events.ts` (`ALEXANDRIA_STATE_EVENT_TYPES`); emitted in `packages/ax/src/commands/play.ts` |
| `alexandria-event-log` skill = wake interpretation contract | EXISTS | `packages/alexandria-plugin/skills/alexandria-event-log/SKILL.md` (precedent: `canvas.review.requested`) |
| Monitor liveness derivable | PARTIAL | `ax inspect connections list` + `isPidAlive` (`packages/ax/src/domain/connection-status.ts`); no single probe command |
| Viewer → runtime play launch | EXISTS (wrong fit, see §5.4) | `runtimeClient.runPlay` → `POST /api/plays/{id}/runs` → `runtime-server.ts launchPlayRunResponse` spawns `ax run … --json` (no `--interactive`, so it auto-approves) |
| Coin hot-tray slots | EXISTS | `packages/viewer/src/components/library/RavenBench.tsx` `AgentQuickBar` (slots are explicit JSX buttons; wired to navigation in `LibraryBrowserApp.tsx`) |

**Conclusion:** the engine and the wake backbone are done. Every build item below is on the Alexandria side.

## 4. End-to-end flow

Happy path:

```
Director clicks coin → "Frame a Problem"
  → viewer emits `play.requested` to the ledger  (NEW: §5.4)
  → monitor delivers wake to Raven's session
  → Raven loads the frame-the-problem skill (NEW: §5.3)
      → confirms she's connected (safeguard); reconnects if not
      → asks the director for the core input (conversation)
      → director provides material
      → Raven: ax run frame-the-problem (fire-and-forget default, NEW: §5.2)
        (input via file/stdin, not shell-interpolated — fixes the apostrophe bug;
         run tagged with alexandria.playId/playRunId labels)
  → Fabro runs pre_fill, reaches `review` (human node), suspends:
      pending_interview recorded on the run
  → runtime bridge (in ax server) emits `play.human_input_requested` (NEW: §5.1)
  → monitor wakes Raven
      → Raven reads the pending question + the draft artifact (runtime/problem-framing.md)
      → Raven riffs with the director in chat
      → on agreement: Raven submits the answer via the `fabro` CLI, addressing (fabroRunId, questionId)
      → bridge emits `play.human_input_resolved`; Raven: "Sent your feedback back to the play."
  → Fabro routes revise ⇄ review until Approve → exit → run completes
  → bridge emits `play.completed` → monitor wakes Raven
      → Raven presents the artifact: ratify (→ Raven; banks only if directed) or loop (→ new pending question)
```

Monitor-down path (safeguard): if Raven cannot confirm a live monitor connection at kickoff, she does **not** silently run the play (she would miss the human-input and completion wakes). She warns the director and attempts to (re)launch `claude-monitor.sh` to repair the session, then proceeds.

## 5. Build items

The **`ax server` runtime daemon is the centerpiece**: the single translation layer between Fabro and Alexandria. It narrates every play's lifecycle onto the ledger and powers the Play Tracker from one run-state model. Everything else gets thinner around it.

### 5.1 `ax server` runtime daemon — Fabro→ledger bridge, run-state model, emission authority (centerpiece)

The durable bridge. Lives in the persistent runtime (boot-on-demand by the first ledger append; not torn down by `ax run`).

- **Watch Fabro (push, not poll).** Enumerate runs (`list_store_runs`), follow each active run's event stream (`fabro run events --follow` / `attach`), and on (re)start **reconcile from persisted run state** (incl. `pending_interviews`) so no in-flight suspension is missed.
- **Own all play-lifecycle emission.** The bridge is the *only* writer of `play.*` events: `play.started`, `play.human_input_requested`, `play.human_input_resolved`, `play.completed`/`failed` (schemas in §6). Emission is **idempotent** and **question-scoped** (the human-input pair is keyed by `questionId`).
- **Attribute by Fabro labels.** Read `alexandria.playId` / `alexandria.playRunId` off the Fabro run (stamped at launch, §5.2) to label every emitted event — no separate handoff.
- **One run-state model.** Maintain a single projection: per run, status + a **set** of open questions (mirrors `pending_interviews`). **Dedup target:** collapse the two existing ledger projections — `domain/project-state.ts` and the tracker's `activePlayRunsFromLedger` in `studio-api.ts` — onto this one model.
- **Power the Play Tracker from the model.** Replace the `fabro ps` / `fabro inspect` shelling in `studio-api.ts`; the active-runs list, per-run view, and the **"Raven needs you"** blocked state all read the runtime model. Structurally fixes the always-empty active-runs list.
- **Acceptance:** a detached run that suspends on a human node yields a question-scoped, correctly-attributed `play.human_input_requested` on the ledger within seconds, with no `ax run` process alive; the tracker shows "Raven needs you"; answering clears it (`play.human_input_resolved`) and the run resumes to `play.completed`; a daemon restart mid-suspension reconciles and still surfaces the pending ask.

### 5.2 `ax run` — start the play, nothing else

Single responsibility: render the workflow and start the Fabro run. **Emits no `play.*` events.**

- **Three modes (default flips to fire-and-forget):** default = detached, gates left **pending** (the agent/programmatic path); `--interactive` = attended TTY, human answers gates live (today's `ConsoleInterviewer`, for a human running it directly); `--auto-approve` = detached + auto-resolve gates (tests / gateless smokes); add `--wait` (gather to terminal) for callers needing the result inline.
- **Tag the Fabro run** with `alexandria.playId` / `alexandria.playRunId` labels at launch (confirm the `fabro run` label flag) so the bridge can attribute.
- **Input via file/stdin**, not shell interpolation — fixes the apostrophe rejection (`orchestration.ts` ~1062); reuse the fixture file-path input path for live input.
- **Migration (director-approved):** the viewer Playbook "Run" button (`runtime-server.ts`) and every `--fixture` invocation in TESTING.md must add `--auto-approve`/`--wait`. Test thoroughly.
- **Coupling:** ships in lockstep with §5.1 — emission moves to the bridge as `ax run` stops emitting, with no window of double-emit or no-emit.
- **Acceptance:** `ax run <play>` returns in ~1s having only started Fabro and stamped labels; no `play.*` event originates from the CLI; apostrophe-laden transcripts round-trip intact.

### 5.3 `packages/alexandria-plugin` — the thin `frame-the-problem` skill + connection safeguard + subscriptions

- **New skill `frame-the-problem`** (the missing thin skill). Contract:
  1. On wake (a `play.requested` for `frame-the-problem`, or a direct chat request), greet and **elicit the core input** conversationally.
  2. **Connection safeguard.** Confirm Raven is *connected* to Alexandria (`ax inspect connections list --json` + liveness). If not, tell the director and (re)establish by launching `claude-monitor.sh`; announce she's *connected again* on success. Never proceed unconnected. (Reuse ax-start's "connected" vocabulary; no "monitor process" talk.)
  3. Launch the play (`ax run`, default fire-and-forget; input via file/stdin).
  4. On `play.human_input_requested`: read the question + draft artifact, riff with the director, then **submit the agreed answer addressing `(fabroRunId, questionId)`** by shelling the `fabro` CLI. Confirm sent. Track a **set** of outstanding asks (several may be open across runs), route each decision to its own `questionId`, never cross-wire, re-check the set after each answer, and handle "already resolved" gracefully. Never self-answer without director agreement.
  5. On `play.completed`: present the artifact to **ratify** (→ goes to Raven; she banks only if the director directs — no auto-bank) or **loop** (more feedback → new pending question).
- **Subscriptions.** Register the generic play-lifecycle events (`play.requested`, `play.human_input_requested`, `play.human_input_resolved`, `play.completed`) **at session start** (alongside Vision subs) — small fixed set, exists before any play runs (closes the ordering gap). Play-specific logic stays in the skill.
- **Answer transport:** shell the `fabro` CLI (MCP optional later) — a quick non-interactive command, no deadlock risk.
- **`alexandria-event-log` routing:** add the new event types so a wake dispatches into the `frame-the-problem` skill.
- **Acceptance:** with Raven connected, the coin → full loop runs end-to-end, no terminal deadlock, no human touching Fabro; two simultaneously-open asks are tracked and answered to the correct runs.

### 5.4 `packages/viewer` — coin slot + tracker "Raven needs you"

- **Add the "Frame a Problem" slot** to `AgentQuickBar` in `RavenBench.tsx` (third explicit button), wired via `RavenBench` props → `LibraryBrowserApp.tsx`.
- **The slot emits `play.requested`, it does NOT call `runPlay`.** `runPlay` → `POST /api/plays/{id}/runs` spawns `ax run` headless with no input, but the play *requires* a transcript Raven must elicit. So the slot emits `play.requested` (`{ playId, agentId, source }`) → wakes Raven.
- **Tracker reads the runtime run-state model** (§5.1): active runs + the **"Raven needs you"** state from `play.human_input_requested`/`resolved`. (UI couples to §5.1's model.)
- **Acceptance:** the slot produces a wake and nothing else (no headless run); the tracker lists in-flight runs and flags ones awaiting human input.

### 5.5 `studio/` + `packages/ax` — dry-run the human-feedback loop

The play doesn't change, but its **review ⇄ revise loop is currently untested** (dry runs auto-approve the gate; TESTING.md forbids auto-approve "for grading a gate's behavior"). Fixtures supply file-path inputs only — no human answer.

- **Scripted-answer test path.** A fixture case carries the director's reaction(s) (e.g. `fixtures/<case>/reactions.json`); a test interviewer feeds them to the pending node (maps onto Fabro's `ReplayInterviewer`/`QueueInterviewer`). Deterministic round-trip without a live human and without `--interactive`.
- **Rebuild the frozen fixtures** for the Riff contract (one co-edited document; evidence-bar anchoring; the human loop) — the current set was built for the retired 9-move play.
- **Acceptance:** a Coverage-tab eval traverses `pre_fill → review → revise → review → exit` deterministically; a smoke campaign grades gate behavior, not just `pre_fill`.

## 6. New ledger event — proposed schema

`play.human_input_requested` (added to `ALEXANDRIA_STATE_EVENT_TYPES`):

```jsonc
{
  "type": "play.human_input_requested",
  "payload": {
    "playRunId": "…",          // Alexandria play-run id
    "fabroRunId": "…",         // Fabro run id (for the MCP Answer call)
    "questionId": "…",         // the pending interview / question id
    "prompt": "React to the draft — give feedback, or approve to finish",
    "choices": ["approve", "revise"],   // optional, from the node's edges
    "draftArtifactPath": "docs/alexandria/.../runtime/problem-framing.md",
    "agentId": "raven"
  }
}
```

`play.human_input_resolved` (a pending question was answered — by Raven or elsewhere), so the tracker and Raven clear that specific ask:

```jsonc
{
  "type": "play.human_input_resolved",
  "payload": { "playRunId": "…", "fabroRunId": "…", "questionId": "…", "answeredBy": "raven" }
}
```

`play.requested` (director-initiated trigger from the coin), added to `ALEXANDRIA_STATE_EVENT_TYPES`:

```jsonc
{
  "type": "play.requested",
  "payload": { "playId": "frame-the-problem", "agentId": "raven", "source": "viewer-coin" }
}
```

Note: `play.human_input_requested` also fills the gap that made the Play Tracker "active runs" list empty — `fabroRunId` now rides a live in-flight event, not only `play.completed`. This feeds the in-scope tracker fix (§5.1, §5.4).

## 7. Decisions & remaining open questions

**Resolved with the director (2026-06-18):**

1. **Pending-interview detection — durable push bridge** that attaches to Fabro's event stream and auto-posts the event for every play. No polling; no per-move emission. (§5.1)
2. **Subscription registration — generic play-lifecycle events at session start; play logic in the skill;** reconcile in-flight runs on monitor start. (§5.2)
3. **Answer transport — shell the `fabro` CLI** to submit the answer (MCP remains an option later).
4. **Coin → wake — a new `play.requested` event** (not a reuse of the canvas surface). (§5.3, §6)
5. **Run modes — default becomes fire-and-forget with pending gates;** `--auto-approve` and `--interactive` explicit; add `--wait`. (§5.1)
6. **Connection UX — Raven speaks in "connected" terms** and announces when she's *connected again* after a repair. (§5.2)
7. **Run-mode default flip — APPROVED.** Take the migration; be thorough and test it (the viewer "Run" button and every `--fixture` invocation must move to `--auto-approve`/`--wait`).
8. **Ratify — no automatic bank step.** On ratify the artifact goes to **Raven**; she banks it only if/when the director directs. Do not build an automatic post-completion bank.
9. **Tracker shows "Raven needs you."** When a run is awaiting human input, the tracker surfaces a blocked / "Raven needs you" state (reads `play.human_input_requested`).
10. **Bridge home — the `ax server` runtime daemon.** The persistent Alexandria runtime is the translation layer for Fabro: it watches runs and emits the internal play-lifecycle events as a run moves through its process. Verified boot-on-demand (first ledger append boots it) and not torn down by `ax run`.
11. **`ax server` powers the Play Tracker** from that same run-state model, replacing the `fabro ps`/`fabro inspect` shelling — one source of truth for both the ledger and the tracker.

12. **Emission ownership — all on the bridge.** `ax run` has a single responsibility: start the play. It emits no `play.*` events; the bridge narrates the entire lifecycle from Fabro's stream — uniform whether launched by the coin, the CLI, or a test.
13. **Run attribution — Fabro labels (confirmed).** At launch, tag the Fabro run with labels `alexandria.playId` / `alexandria.playRunId`; the bridge self-attributes by reading them. Verified: Fabro runs carry a `labels: HashMap<String,String>` set at create, persisted on run state, and searchable (`fabro_run_search`). (Impl detail: the exact `fabro run` CLI flag to pass labels.)
14. **Concurrency — architect for N open gates from day one.** Multiple human gates may be open at once (parallel branches in one run, or several runs). Cheap to support because Fabro already models `pending_interviews` as a map keyed by `question_id` and answers are per-question — so everything is **question-scoped** from the start: `play.human_input_requested` carries `questionId`, a new **`play.human_input_resolved`** event clears each ask individually, the run-state model holds a **set** of open questions (not a boolean "blocked"), and the skill tracks the set and routes each decision to its own `(fabroRunId, questionId)`.

**Still open:** only impl-detail confirmations (exact `fabro run` label flag; `play.human_input_resolved` naming). No blocking decisions remain for phase 1.

## 8. Risks

- **Silent auto-approve regression:** if a run is launched `--auto-approve` when it should leave gates pending, the riff is skipped silently. Guard with explicit modes + a test that asserts a pending gate actually appears.
- **Emission handoff (§5.1↔§5.2 cutover):** a window where both `ax run` and the bridge emit (duplicate events) or neither does (silent runs). Ship the two together; assert exactly-once in a test.
- **Raven not connected:** the loop depends on the bridge→ledger→monitor→Raven path; the §5.3 connection safeguard is load-bearing, not optional.
- **Answer mis-targeting:** an answer must address the exact `(fabroRunId, questionId)`; with N open asks, cross-wiring answers the wrong gate. Idempotent submit + handle "already resolved".
- **Fixture rebuild scope:** rebuilding the frozen fixtures for the Riff contract is its own effort and gates honest grading.

## 9. Non-goals / deferred

- **No change to the `frame-the-problem` play** (graph, prompts, contract) in this work.
- **No change to Fabro.**
- **No viewer control surface** for pause/approve/deny on the tracker (the delivery-tracker plan explicitly scopes this out). The human turn is mediated by Raven, not by tracker buttons.
- **Play Tracker is now IN scope** (no longer adjacent): the `ax server` run-state model powers the tracker, structurally fixing the always-empty active-runs list (previously it shelled `fabro ps`, blind to embedded-socket runs, with a ledger fallback that required a `fabroRunId` only present on `play.completed`) and providing the "Raven needs you" state.
- **Apostrophe input bug** is fixed here only insofar as §5.1 routes live input through a file/stdin path; a general fix to the shell-interpolation validation can be separate.

## 10. Sequencing (independent, non-stacked slices)

Each phase is intended to ship as its own PR off `main`, QA'd by hand.

1. **Runtime daemon bridge + `ax run` thinning (§5.1 + §5.2) — shipped together.** They're coupled: the bridge takes over all emission as `ax run` stops emitting, so they move in one PR to avoid a double-emit/no-emit window. Delivers question-scoped lifecycle events, label attribution, and the one run-state model. Verifiable via CLI + ledger inspection.
2. **Viewer: tracker on the model + coin slot (§5.4).** Tracker reads slice-1's model (the "Raven needs you" state + the active-runs fix); the coin slot emits `play.requested`. Depends on 1 for the tracker half.
3. **Plugin: `frame-the-problem` skill + session-start subscriptions + connection safeguard + `alexandria-event-log` routing (§5.3).** Depends on 1; completes the end-to-end loop with 2.
4. **Studio: scripted-answer dry-run + rebuilt fixtures (§5.5).** Independent; unblocks honest grading of the human loop.

Settle the §7 impl-detail confirmations before phase 1.
