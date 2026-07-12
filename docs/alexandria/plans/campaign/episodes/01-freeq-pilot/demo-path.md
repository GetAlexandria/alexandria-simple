# Demo Path — Episode 1: The Freeq Pilot

> Station 3 (Demo Path) for **Episode 1**, the loop's validating pilot
> (`system.md`: "Episode 1 = the Friday Freeq session with Bryan & Chad — treat
> it as the pilot that validates the whole loop"). There is **no prior Story
> Spine** for this episode, so a tight thesis + spine are inferred below and
> marked as assumptions. This is a **vignette, not a podcast**: simple, tight,
> with the edit plan defined up front.
>
> **Format reality:** LIVE RECORDED SESSION (Friday 2pm; ~23h runway from
> Thu ~3pm). Real people, real agent, mistakes left in — "steak, not sizzle."
> The Demo Path below is adapted for a live session: it is a run-of-show with
> product states, risks, and fallbacks, not a clickthrough we control frame by
> frame.

---

## Inferred Thesis + Spine (ASSUMPTIONS — not a separate artifact)

**Target viewer (A1):** Acquirers + clients who keep asking "you said *factory*
— does AI at companies actually *work*? Can we trust it?" Bryan (Fabro) and Chad
(Freeq) are the live stand-ins; they are also episode-1's first 1:1 outreach
recipients.

**Before → after belief change (A2):** Before — "AI inside a company is a black
screen, a blinking cursor, scattered tools, and dysfunction." After — "Two
people run a real, integrated operation where humans and an AI colleague work
the same problem in the same room, and the conversation turns directly into
software work."

**Demo promise (A3):** *Watch us actually share progress and plan the next build
with an AI colleague (Raven) live in the room — and watch that conversation
become committed work.*

**Proof burden (A4):** It must be visibly **real and integrated**, not staged:
Raven is live in Freeq, hears and answers by voice, has her own video presence,
is wired to Alexandria/Fabro tooling, captures the session, and the session ends
with concrete agent work queued. Mistakes stay in — the realness *is* the proof.

**CTA (A5):** Soft. 1:1 direct shares to Bryan & Chad ("does this look like AI
that works?") + a small named outreach set; drive to sociotechnica.org; capture
email. No hard ask in the cut.

**Scope boundary (A6):** This is a **share + brainstorm** session, not a feature
tour. The **play tracker is real and now BUILT** — it is the viewer's **Play
Tracker tab** (`PlayTrackerTab.tsx` + `playTrackerModel.ts`, commit
`63b901e419`), a live run tracker that polls active Fabro runs, renders a step
rail with Raven's avatar on the running step, and shows rich plain-English
states (on-track, running-slow, circling-back, stuck, blocked/"waiting on you",
failed, factory-problem, done). **Mid-play human feedback is also real:** our
seed play **`frame-the-problem` is the interactive Riff play** with a `review`
human gate, and the runtime carries a first-class `needs_human_feedback` status
that the tracker surfaces as **"Waiting on you — … needs input."** So H4 lands a
built surface, and the pause-for-human beat is in the reliable plan, not a
stretch. We are NOT promising Raven natively executing Alexandria plays. **Raven
verbalizing the gate — speaking the question out loud and waiting for a spoken
answer — is the only STRETCH** (H5): the product *pause* is real and shown via
the tracker + chat/voice; only the fully-verbal ask-and-wait is optional, with
no footage implying it works otherwise (see hero moments and cut candidates).

**Spine (collapsed, A7):**
1. Hook — two founders + an AI colleague open a working call (cold, real).
2. The integration share — Fabro is *inside* Alexandria (Studio); Raven is live
   in Freeq wired to Alexandria. Bryan & Chad react in real time.
3. Raven in the room — she hears, answers by voice, has her own video presence,
   and visibly works the problem alongside the humans.
4. The brainstorm — the four humans + Raven plan what to build next.
5. The turn — the conversation becomes committed work: Fabro picks it up after
   the call. Close on "this is AI at a company that actually works."

---

## Demo objective

Capture a single ~6–10 min vignette (target cut: **4–6 min**) that proves
SocioTechnica runs a real, integrated, human+AI operation — by recording the
genuine Friday share-and-brainstorm session with Bryan & Chad and Raven live in
Freeq. The footage must survive an honest edit (mistakes in) and yield the
default package: **YouTube episode + 1 lab note + 2 social posts + email
mention**.

---

## Hero moments

Five candidate hero beats; **three are load-bearing and confirmed-real**, two
are "show honestly / fallback-heavy." Each maps to a belief-change claim.

| # | Hero moment | Claim it carries | Product truth | Verdict |
|---|---|---|---|---|
| **H1** | **Raven answers by voice, live, in the call** — a human asks Raven a real question and she replies out loud, in the room, with her own video presence (animated Raven-coin orb reacting to audio). | "There's an AI colleague *in the room*, not a chatbot in a tab." | Full STT→Inception→TTS loop is REAL and tested (`crates/freeq-raven/src/{stt,tts,irc,video}.rs`); presence orb + audio reactivity REAL (`video.rs`). | **GO** |
| **H2** | **Fabro is deeply integrated *inside* Alexandria** — Jess screenshares Playmaker Studio and shows the AI/Fabro surfaces to Bryan (who hasn't seen it). Genuine "oh, *that's* where Fabro lives" reaction. | "These aren't separate toys — the factory is integrated into the operating system." | Studio + Fabro surfaces exist in the viewer (`packages/viewer/src/components/studio/*`); this is a screenshare of a real app, lowest technical risk. | **GO** |
| **H3** | **The conversation becomes committed work** — the brainstorm produces a concrete build item; the session is captured into the Alexandria repo as an input; Fabro picks the work up *after* the call. | "Talking in a meeting turns into software getting built." | Capture-to-repo is the assumption to wire (see risks); Fabro-runs-after is REAL (Fabro software factory). The *handoff* is the hero, not a live build. | **GO (with prep)** |
| **H4** | **The Play Tracker** — the viewer's **Play Tracker tab** shows a live `frame-the-problem` run advancing step-by-step, with Raven's avatar pulsing on the running step, a plain-English status badge, and — at the `review` gate — a **"Waiting on you — … needs input"** state that resolves when a human answers and the run continues to `done`. | "There's a real surface where the AI's work-in-progress is tracked — legible, not a black box — and it visibly waits for a human." | The **Play Tracker is REAL and BUILT** (commit `63b901e419`): viewer **Play Tracker tab** (`packages/viewer/src/components/studio/PlayTrackerTab.tsx`, model in `playTrackerModel.ts`). It polls active Fabro runs (10s) + run events (5s), renders the step rail with Raven's avatar on the live step, rich states, progress, ETA, and a one-sentence exception line. **Mid-play human feedback is REAL too:** `frame-the-problem` is the Riff play with a `review` human gate; the runtime has a first-class `needs_human_feedback` status (`project-state.ts`, `state-events.ts`); the tracker renders it via `blockedSentence` as **"Waiting on you — … needs input."** Raven's tile can also render LLM-authored whiteboards/scene cards (presence b-roll, not the proof surface). | **GO (strong)** — the tracker is built; show it as the live status surface, including the genuine human-gate pause. |
| **H5 (STRETCH)** | **Raven verbalizes the gate** — speaks the `review` question out loud and waits for a *spoken* answer, then continues. | "You can run the whole pause-for-input conversationally, by voice." | **The pause itself is REAL** (H4 — `needs_human_feedback` + the tracker); what is NOT reliable is the *fully verbal* loop: Raven has no ask-and-wait voice loop today (`irc.rs` is barge-in + quiet-gate). The gate is answered in the terminal (`ax run … --interactive`) or chat/voice; the tracker reflects it. | **STRETCH GOAL** — only the *verbal* ask-and-wait is optional. Include ONLY if built and there's time; **no footage may imply the verbal loop works** unless it genuinely does. The product pause stays in via H4. |

**Belief change is fully carried by H1–H4.** The Play Tracker (H4) is a real,
built surface — the viewer's Play Tracker tab — and lands both "work is tracked
and legible" *and* the genuine "it waits for a human" pause (the `review` gate →
`needs_human_feedback` → "Waiting on you"). **H5 (the fully-verbal ask-and-wait)
is the only STRETCH** — keep it out of the reliable promise; the product pause is
already in via H4.

---

## Path assumptions

- **A-env:** A live Freeq AV call on `irc.freeq.at`, channel `#alexandria` (or a
  dedicated session channel), with Raven joined and answering. Verified config:
  `FREEQ_SERVER=wss://irc.freeq.at/irc`, `RAVEN_FREEQ_NICK=Raven`.
- **A-keys:** `INCEPTION_API_KEY`, `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY` all
  present and funded for the duration (the live loop is hard-down without these).
- **A-people:** Bryan, Chad, Jess, Danvers on the call; Bryan & Chad are
  genuinely NOT up to date (the realness of their reactions is the asset).
- **A-tool-repo (RESOLVED):** `RAVEN_TOOL_WORKDIR` = **`alexandria-internal`,
  which runs its own Alexandria instance ("Alexandria Prime").** It is a
  legitimate Alexandria project to work in (founder override), so Raven's Codex
  handoff has a real, project-local target. (No private-maintainer-skills caveat
  — dropped.)
- **A-capture:** Recording = each participant's local capture (screenshare +
  webcam + Raven's video tile + room audio). We are NOT relying on a single
  magic recorder. Define the capture sources up front (see Shot List).
- **A-play:** The seed play Raven runs live is **`frame-the-problem`** (LOCKED) —
  now the interactive **"Riff" play** (commit `e85f6e10df`): a 3-node co-editing
  loop, exactly the "draft the framing → react to the draft" shape the founders
  described. Nodes: **`pre_fill`** (Raven drafts a first problem-framing from the
  handed-in material — never a blank question) → **`review`** (a `human` gate:
  the director reacts — *feedback to fold in, or approve to finish*) →
  **`revise`** (rewrite the doc whole) → back to `review`, exiting on `[A]
  Approve`. Run it with `ax run frame-the-problem` (add `--interactive` to answer
  the gate in-terminal instead of auto-approving). It is the canonical live play
  and the tracker watches the same run.
- **A-tracker (now BUILT):** Two real surfaces, both in the viewer — don't
  conflate. (1) The **Play Tracker** = the viewer's **Play Tracker tab**
  (`?tab=tracker`; `PlayTrackerTab.tsx` + `playTrackerModel.ts`, commit
  `63b901e419`): polls active Fabro runs (10s) and the opened run's events (5s),
  renders the step rail with Raven's avatar on the live step, a status badge
  (on-track / running-slow / circling-back / stuck / **blocked = "Waiting on
  you"** / failed / factory-problem / done), progress, ETA, and a one-sentence
  exception. **This is the H4 hero surface.** (2) The **Factory Runs detail**
  (`?tab=runs`) is the raw event-log view (fallback). **Mid-play human feedback
  is REAL, not in-progress:** the Riff play's `review` gate produces the
  runtime's first-class `needs_human_feedback` status, which the tracker shows as
  "Waiting on you — React to the draft … needs input" and clears when the human
  answers. Show it as built.
- **A-edit:** Edit plan is fixed up front (see "Edit plan / cut candidates"):
  cold open → integration share → Raven-in-room → brainstorm → the turn → tag.
  Mistakes stay in; we tighten, we don't fake.

---

## Step-by-step flow

Time markers are *live session* targets (T+ from call start), not edited
runtime. Capture priority: **A** = must get clean, **B** = nice to have,
**C** = filler/safety.

| step | time | user intent shown | exact action | visible state | claim supported | capture priority | risk |
|---|---|---|---|---|---|---|---|
| 1 | T+0 | "This is real, this is us" | Cold open: Jess/Danvers greet Bryan & Chad; Raven is already present in the call (orb tile visible). No staged intro. | Freeq call grid: 4 human tiles + Raven's animated coin/orb tile. | Realness; AI is *in the room*. | A | Raven tile must render — if SFU video fails she's audio-only (fallback). |
| 2 | T+1 | "Say hi to the colleague" | A human addresses Raven by voice: "Raven, can you hear us?" | Orb shifts to listening→speaking mood; Raven replies out loud. | **H1** — live voice colleague. | A | STT mishear / latency / no-reply. Have a second scripted address ready. |
| 3 | T+3 | "Here's the integration nobody's seen" | Jess screenshares **Playmaker Studio inside Alexandria**, walks Bryan through the Fabro surfaces. | Viewer Studio surface on screenshare; Bryan reacting. | **H2** — factory integrated into the OS. | A | Lowest risk (static app). Pre-open the exact tabs; have screenshots as backup. |
| 4 | T+6 | "Raven is wired into this" | Establish that Raven reads Alexandria context / is wired to the same system (state it + show one concrete tell, e.g. she references project context when asked). | Raven answers a question grounded in the project. | Integration is real, not parallel toys. | B | Don't overclaim native play-execution; she hands off to Codex. Keep the claim narrow. |
| 5 | T+8 | "Here's where the work is tracked" | Open the viewer's **Play Tracker tab** and kick off a **real `frame-the-problem` (Riff) run** (Jess): Raven's `pre_fill` drafts the first problem-framing. Watch the tracker's step rail — Raven's avatar pulses on the running step, status reads `on-track`. (Raven's tile may also render a whiteboard as ambient presence.) | Play Tracker tab on screenshare: step rail with `pre_fill` running (Raven avatar), `review` upcoming; status badge `On track`; progress bar moving. | **H4** — the Play Tracker is real and built; AI work is tracked and legible. | A | Built surface; lowest tracker risk. Whiteboard is LLM-authored presence b-roll, not the proof — keep the tab as the visual. |
| 6 | T+10 | "It waits for our input" | The run reaches the **`review` human gate** → tracker flips to **"Waiting on you — React to the draft … needs input"** (`needs_human_feedback`). A human reacts (feedback or approve) — in-terminal `--interactive`, or chat/voice — `revise` folds it in, the tracker returns to `On track`, and `[A] Approve` ends the run (`Done`). | Status badge: `Blocked / "Waiting on you"` → (after the human reacts) `On track` → `Done`; step rail advances `review` → `revise` → `review`. | **H4** — the play genuinely waits for a human, surfaced in the real tracker. | A | This is a built product pause (the Riff `review` gate), NOT Raven *verbally* pausing (that's the H5 stretch). It is reliable; keep it. If a *live* run is flaky, fall back to a prior captured run reaching the gate (still honest). |
| 7 | T+12 | "Now let's plan what's next" | The four humans + Raven brainstorm the next build; Raven contributes by voice. | Open discussion; Raven participates (barge-in/quiet-gate real). | The operation reasons together, human+AI. | A | Conversational timing is rough; keep Raven's turns short and addressed. |
| 8 | T+18 | "This becomes work" | The transcript persists to a file in **`alexandria-internal` (Alexandria Prime, = `RAVEN_TOOL_WORKDIR`)** at session end — the same Alexandria repo as an input the post-call Fabro work consumes. | A transcript/decisions file appears in alexandria-internal (screenshare of the write/commit). | **H3a** — conversation → captured input. | A | Transcript persistence is the one thing to wire in the 23h window (see Transcript Capture section). Recommended: ~30-line file write at the existing session-end handler. Manual-commit fallback exists. |
| 9 | T+20 | "The factory builds it" | Queue the agreed work to **Fabro** to build after the call; show the run kicking off / queued. | Fabro run submitted; Studio Runs shows a new submitted/running entry. | **H3b** — meeting → software. | A | Don't wait live for a build to finish; show the *handoff*, narrate the rest. |
| 10 | T+22 | Close | Founders close: "this is what AI at a company looks like when it works." | Friendly outro; Raven says goodbye by voice. | Belief change landed. | B | Keep short; this is the social-clip moment. |

---

## Required demo data and states

```text
Account / workspace name:      Live Freeq channel (#alexandria or a dedicated
                               episode channel on irc.freeq.at).
User roles needed:             Bryan, Chad, Jess, Danvers (humans); Raven (agent,
                               RAVEN_FREEQ_NICK=Raven, identity "raven").
Projects / spaces / boards:    RAVEN_TOOL_WORKDIR = `alexandria-internal`
                               (Alexandria Prime — its own Alexandria instance),
                               the project-local target for Raven's Codex handoff;
                               a viewer-served Alexandria project (Alexandria
                               Prime) with `frame-the-problem` runnable so a run
                               can advance in the Play Tracker.
Date ranges needed:            n/a (live).
Seed play (LOCKED):            `frame-the-problem` — the interactive **Riff play**
                               (`ax run frame-the-problem`; `--interactive` to
                               answer the gate in-terminal). 3 nodes: pre_fill
                               (draft) → review (human gate) → revise → review …
                               → approve → exit. Reaches a clear terminal state
                               in the call window and **does** hit
                               needs_human_feedback at the `review` gate (step 6).
Key records that must exist:   - `frame-the-problem` (Riff) runnable from the
                                 viewer, producing a visible tracker status change.
                               - The viewer **Play Tracker tab** (`?tab=tracker`)
                                 showing the live run's step rail + status.
                               - Playmaker Studio / Fabro surfaces populated
                                 enough to screenshare convincingly.
Key records that must update:  - Play Tracker status: On track → Blocked
                                 ("Waiting on you" at the `review` gate) → On
                                 track → Done. (REAL; tracker polls runs/10s,
                                 events/5s — `PlayTrackerTab.tsx`.)
                               - A transcript/decisions file written to
                                 RAVEN_TOOL_WORKDIR (alexandria-internal) at
                                 session end (step 8).
                               - A new Fabro run submitted at step 9.
Third-party integrations:      Freeq AV (MoQ SFU), Deepgram (STT), Inception
                               mercury-2 (answers), ElevenLabs (TTS). All keys
                               funded. Codex CLI authenticated for tool handoff.
Notifications / messages:      Raven posts a decision read-back + (with
                               ANTHROPIC_API_KEY) a Claude summary to chat on
                               session end (REAL, `irc.rs` ~L920-994). The
                               durable file write is what we add (step 8).
Screens with clean names:      Viewer Studio + **Play Tracker** tab
                               (`?tab=tracker`) pre-opened; alexandria-internal at
                               a clean commit; window titles free of clutter.
Known fake-looking data:       Use `frame-the-problem` everywhere — no
                               placeholder/lorem play names. Avoid an empty
                               "Plays in flight" landing or an empty step rail on
                               camera (have a run already started).
Reset instructions:           freeq-raven: `make restart` for a clean agent;
                               re-run `ax run frame-the-problem` to seed a fresh
                               run; reopen the viewer **Play Tracker tab** at the
                               new run id. Re-auth keys if loop dies.
Owner:                         Jess (viewer/Alexandria + capture), Danvers (call
                               host + Studio walkthrough narration), founders
                               jointly own the Raven loop pre-flight.
```

---

## Fallback plan

| risky step | primary route | fallback route | backup asset | messaging change |
|---|---|---|---|---|
| **Raven video tile fails (MoQ SFU)** (step 1–2) | Raven joins with rendered orb tile | Continue **audio-only**; pin a static Raven-coin still in the grid | Pre-captured 10s clip of the orb reacting (record in pre-flight) | "Raven's in the call by voice" — drop "watch her video" line; reinsert orb b-roll in edit |
| **Voice loop dies / mishears** (step 2,4,7) | Live STT→TTS exchange | Address Raven again with a short, clean, name-first prompt; if still down, route the question via **chat** and read her text reply aloud | Pre-recorded clean voice exchange as an insert | Narrate "let's take that in chat" — keep it human, mistakes-in is on-brand |
| **Play won't advance / tracker stuck** (step 5–6) | Run play in viewer, watch the **Play Tracker** step rail | Open a **prior completed run** in the Play Tracker by run id (shows its final terminal step rail); or drop to the **Factory Runs detail** (`?tab=runs`) raw event log | Screen-recording of a prior successful `frame-the-problem` run reaching `Done`; a run id that reaches the `review` gate | "Here's a run we did earlier" — point-in-time honesty is fine for a series |
| **Live run won't reach the `review` gate** (step 6) | Live run hits `review` → tracker shows "Waiting on you" | Open a **previously-captured run that reached the gate** in the Play Tracker (the pause is built and real — a prior run still proves it); only **CUT step 6** if no such run exists | Screen-recording of a run sitting at `needs_human_feedback` ("Waiting on you") | Keep the *built* product pause (H4); do NOT claim Raven *verbally* pausing unless H5 genuinely worked. |
| **Transcript file write not landed** (step 8) | Raven auto-writes the transcript file at session end (recommended ~30-line patch — see Transcript Capture section) | **Manually paste** Raven's chat-posted summary/decision read-back (REAL, already posts) into a repo file and commit on camera; OR Jess types the decisions into a `decisions.md` and commits | Pre-made `episodes/01-freeq-pilot/session-notes.md` skeleton to fill live | "We capture this straight into the repo" — the manual commit still proves the claim |
| **Fabro run won't submit live** (step 9) | Submit run, show queued | Show the **prepared ticket / play definition** that *will* be run; submit off-camera; narrate | Screenshot of a Fabro run submitted; a prior completed Fabro run | "Fabro picks this up after the call — here's one it built earlier" |
| **Whiteboard in tile looks wrong/off-topic** (step 5) | LLM draws relevant steps | Don't dwell on the tile; keep the **screenshare** as the primary visual | Static scene-card screenshot | Treat the tile as ambient presence, not the proof surface |

---

## Transcript capture (H3 dependency — investigation + recommendation)

> **Why this matters:** H3 ("the conversation becomes committed work") needs the
> session's content to land somewhere Fabro can pick it up *after* the call. The
> founders flagged transcript capture as important and were unsure how. This
> section is the investigation, the options, the recommendation, and the 23h
> placement. Files read: `freeq-raven/crates/freeq-raven/src/{irc.rs,summary.rs,
> decisions.rs,memory.rs,main.rs}`, `freeq-raven/README.md`.

### Where it stands in freeq-raven today

The transcript is **real and assembled — just not written to a durable file.**

- **The transcript exists in memory, per channel.** Every voice/chat line is
  pushed into a per-channel session ledger (`record_session_line` →
  `cfg.session_context`, `irc.rs` ~L168) and into `ActiveCall.transcript`
  (`irc.rs` ~L516). The ledger is capped at the last **200 lines**
  (`SESSION_CONTEXT_MAX_LINES`, `irc.rs` L166) — long sessions lose the head.
- **At session end, the full transcript is already in hand.** The `av-state =
  ended` handler (`irc.rs` ~L914) calls `session_context_snapshot(&cfg, channel)`
  to build the whole transcript as one string, **then `clear_session_context`
  wipes it.** This snapshot is the natural hook point.
- **Two derived artifacts already get produced at session end and posted to
  chat** (REAL today):
  1. **Decision read-back** — `decisions::Decision::extract` runs on each turn
     and accumulates per-channel commitments ("let's…", "we'll…", "I'll… by
     Friday"); the end handler drains and posts them (`irc.rs` ~L920-945).
  2. **Claude summary** — with `ANTHROPIC_API_KEY` set, `summary::summarize`
     sends the full transcript to the Anthropic Messages API and posts a
     **Summary + Action items** markdown block to chat (`summary.rs`,
     `irc.rs` ~L962-994).
- **Nothing is written to a file.** There is **no file-write path** anywhere in
  the runtime for the transcript, the summary, or the decisions. The README is
  explicit: context is "in memory inside the Rust runtime"; a durable
  SQLite `raven-session` crate is the *next* milestone (not built). `memory.rs`
  does persist Q&A pairs to `~/.freeq/bots/<name>/memory.db`, but that is the
  recall/FTS store, **not** a session transcript, and it lives outside any repo
  Fabro reads.

**Net:** the content is captured and even summarized; it just evaporates to chat
instead of landing as a repo input. That last hop is the only gap for H3.

### Options

| # | Option | What it is | Effort | Risk |
|---|---|---|---|---|
| **A (recommended)** | **Write the session artifacts to a file in the target repo at session end.** | At the existing `av-state=ended` hook, after `session_context_snapshot`, write the transcript + decision read-back + (if present) the Claude summary to a timestamped file under `RAVEN_TOOL_WORKDIR` — **now resolved to `alexandria-internal` (Alexandria Prime)** (already an `Option<PathBuf>` Raven knows). That repo is where Raven's Codex/Fabro handoff already runs — so the file is exactly the input the post-call Fabro work consumes. | **~30-line patch**, no new crate. Add an `Option<PathBuf>` transcript dir (mirror the `tool_workdir` clap+env pattern, `main.rs` L115), default to `RAVEN_TOOL_WORKDIR`, `std::fs::write` a `session-<ts>.md`. | Low. Pure addition at a hook that already has the data; touches one handler. |
| B | **Durable SQLite `raven-session` crate** (the README milestone). | Replay/audit-grade event log. | Days. New crate + schema + wiring. | Over-scoped for 23h; not needed for the demo claim. |
| C | **Manual capture only** (current fallback). | Human pastes Raven's chat-posted summary/decisions into a repo file and commits on camera. | Zero code. | Works on camera and is honest, but the "it just happens" beat is weaker; keep as fallback, not primary. |
| D | **Pipe the chat-posted summary out via the tool handoff.** | Have the end-of-session summary trigger a `tool_now`/`background` Codex run that itself writes the file in `RAVEN_TOOL_WORKDIR`. | Medium. Reuses the handoff but adds an end-of-call trigger path that doesn't exist yet. | More moving parts than A for the same result. |

### Recommendation

**Option A.** Write transcript + decisions + summary to a Markdown file in
`RAVEN_TOOL_WORKDIR` at session end, reusing the snapshot the end handler already
builds (`irc.rs` ~L914) and the `tool_workdir` config pattern Raven already has.
This makes step 8 ("the conversation becomes a captured input") *genuinely
automatic and on camera* — the file appears in the repo Fabro reads, no human
typing — which is the honest version of H3a. Note the **200-line cap**: for a
long session, bump `SESSION_CONTEXT_MAX_LINES` or persist `ActiveCall.transcript`
(also full) rather than the capped ledger, so the head of the call isn't lost.

**How hard in 23h:** Low. It is a single-file, ~30-line addition at a hook that
already has the transcript string and already runs the summary — no new
dependency, no new architecture. The Rust build + a dry-run on `irc.freeq.at`
is the real cost, not the code. **Fallback if it slips: Option C** (manual paste
+ commit on camera) is already in the Fallback table and still proves the claim.

---

## Rehearsal notes

- **Run the whole call once end-to-end in pre-flight** with all four humans + Raven
  (or 2 humans as stand-ins) on the real Freeq server. The loop is only "real"
  if it survived a full dry run on `irc.freeq.at`, not localhost-only.
- **Conversational timing is the #1 live risk.** Raven has barge-in + a
  quiet-gate (waits up to 8s for the room to go quiet before her first
  sentence), but **no ask-and-wait loop.** Coach the humans: address Raven by
  name, then *go quiet* and let her take the floor; keep her questions to her,
  not open-ended group prompts she'll talk over. Jess's timing ideas go here.
- **Keep Raven's turns short and addressed.** Long open discussion is where she
  collides; the brainstorm should route to her deliberately ("Raven, what would
  you add?") then pause.
- **Pre-open every screen.** Studio tabs, the **Play Tracker tab** with a fresh
  `frame-the-problem` run opened, terminal at alexandria-internal, Fabro submit
  path — all staged before record so step 3–9 are navigation, not hunting.
- **Capture each source locally.** Don't trust one combined recording: capture
  Jess's screenshare, the Freeq call grid (incl. Raven's tile), and room audio
  separately so the editor has clean layers.
- **Rehearse the two scripted Raven addresses** (step 2 "can you hear us?" and a
  backup) so there's always a clean voice beat to open on.
- **Step 6 is a built beat — capture it, don't improvise it.** The `review`
  human gate → `needs_human_feedback` → tracker "Waiting on you" is real; in
  pre-flight, drive `frame-the-problem` to the gate and confirm the tracker
  flips, the human reaction folds in via `revise`, and `[A] Approve` ends to
  `Done`. **Pre-capture at least one run sitting at the gate** as edit insurance
  so step 6 survives even if the live run is slow. (The H5 *verbal* ask-and-wait
  is the only STRETCH; rehearse it only if built, and capture nothing implying
  the verbal loop works if it doesn't.)
- **Confirm `frame-the-problem` (Riff) runs clean twice.** It's the locked seed
  play — verify `ax run frame-the-problem` drafts (`pre_fill`), reaches the
  `review` gate, folds a reaction (`revise`), and approves to a terminal state
  inside a call window, with the viewer **Play Tracker** step rail tracking it
  throughout. Use `--interactive` if answering the gate in-terminal on camera.
- **Reset between takes:** `make restart` (Raven), re-run
  `ax run frame-the-problem`, reopen the viewer **Play Tracker tab** at the new
  run id. Confirm the loop can run twice cleanly.

---

## Edit plan / cut candidates (fixed up front — vignette discipline)

**Edit plan (locked):** cold open (steps 1–2) → integration share (step 3) →
Raven-in-room (steps 4–5) → brainstorm (step 7) → the turn (steps 8–9) →
tag (step 10). Target **4–6 min**. Consistent intro/outro frame per `system.md`.

Cut candidates if the cut runs long or a beat is weak:
- **Step 6 (the "Waiting on you" gate)** — it's a built, reliable beat now, so
  prefer to keep it; only trim if the cut is overlong and H1/H2/H3 already carry
  the episode. If trimmed, keep the one-frame status flip even if you drop the
  resolve.
- **Step 4 wiring claim** — if it gets abstract, cut to just "she's wired in"
  and move on; don't lecture.
- **Any long stretch of open brainstorm** — keep the decision, cut the meander
  (but keep *one* genuine mistake/correction for authenticity).
- **Tracker dwell time** — show the Play Tracker step rail + the status change,
  don't narrate every row.
- **H5 verbal ask-and-wait (STRETCH)** — not in the reliable cut. If it gets
  built and we capture a genuinely-working beat, it's an *add*; if not, ensure
  no footage implies the verbal loop works (the built product pause stays via
  step 6).

---

## Open questions / assumptions

1. **`RAVEN_TOOL_WORKDIR` — RESOLVED: `alexandria-internal` (Alexandria Prime).**
   It runs its own Alexandria instance, so it's a legitimate project-local target
   for Raven's Codex/Fabro handoff (founder override). No separate target repo
   needed; no private-maintainer-skills caveat.
2. **Seed play — RESOLVED: `frame-the-problem`** (LOCKED), now the interactive
   **Riff play** (`ax run frame-the-problem`). The `needs_human_feedback`
   sub-question is also **RESOLVED**: the play has a built `review` human gate and
   the runtime/tracker surface `needs_human_feedback` ("Waiting on you"), so step
   6 is a reliable beat, not a coin-flip. Remaining check is operational only:
   confirm the gate fires inside the call window in pre-flight.
3. **Is the viewer pointed at a live Alexandria runtime** (Alexandria Prime) with
   `frame-the-problem` runnable and populated Studio/Fabro surfaces, and is the
   **Play Tracker tab** serving the live run? (Viewer needs a running host; no
   fixture data — confirm in pre-flight.)
4. **Capture stack** — who records what? (Assumption: each participant captures
   locally; Jess owns assembling layers.) Confirm Raven's tile is captured.
5. **Channel** — `#alexandria` (default) or a dedicated episode channel to keep
   the recording clean of unrelated traffic?
6. **1:1 outreach set beyond Bryan & Chad** — episode's direct-outreach list
   (see hand-off). Who are the other 3–13 named contacts per founder?

---

## Hand-off notes for Product Prep and Capture Plan

**Product Prep (the 23h build/wire/rehearse list — priority order):**
1. **[P0 — biggest go/no-go]** Wire and fund the live Raven loop on
   `irc.freeq.at` (3 API keys); dry-run a full call.
2. **[P0]** Set `RAVEN_TOOL_WORKDIR=alexandria-internal` (Alexandria Prime);
   auth Codex; smoke-test a handoff.
3. **[P0]** Point the viewer (Alexandria Prime) at a live runtime with
   `frame-the-problem` (LOCKED Riff seed play) + populated Studio/Fabro surfaces;
   confirm a run advances the **Play Tracker** step rail live and reaches the
   `review` gate ("Waiting on you"). Open the **Play Tracker tab** on a fresh run
   (the H4 surface).
4. **[P1 — H3 dependency] Land the transcript file-write** (Transcript Capture,
   Option A): ~30-line patch writing transcript + decisions + summary to a file
   in `RAVEN_TOOL_WORKDIR` at session end, so step 8 is automatic on camera.
   **Fallback if it slips: manual paste + commit (Option C)** — still proves the
   claim, so this is P1, not P0.
5. **[P1]** Stage the **Fabro submit** path for step 9 (prepared play/ticket).
6. **[P2 — STRETCH, only if P0/P1 are clean] H5:** if there's appetite, attempt
   the verbal ask-and-wait loop. Not on the critical path; capture nothing that
   implies it works unless it genuinely does.

**Capture Plan:**
- Sources: Jess screenshare (Studio/Playbook/terminal), Freeq call grid incl.
  Raven's tile, per-person webcam, room audio. Capture locally + separately.
- Get clean takes of: H1 (voice), H2 (Studio walkthrough), H3 (commit + Fabro
  submit). These three carry the episode.
- Record pre-flight b-roll: orb reacting, a clean voice exchange, a Play Tracker
  run at the "Waiting on you" gate, and a completed run at `Done` — these are the
  fallback inserts.

**Packaging (default package, per `system.md`):** YouTube episode (the 4–6 min
cut) + 1 lab note (the "AI at a company that works" write-up, steak-not-sizzle)
+ 2 social posts (H1 voice clip for X/Bluesky peer reach; H2/H3 "integration →
build" for Danvers' LinkedIn target-audience reach) + an email mention to the
~500 owned list, driving to sociotechnica.org.

**Direct outreach (the conversion tier):** Bryan & Chad are already IN it — the
session itself is the share; follow up 1:1 with the cut and a "does this look
like AI that works?" ask. Each founder adds **5–15 named contacts** for a 1:1
share of the episode (acquirer/client-shaped, LinkedIn-heavy for Danvers). Log
to the biz-dev CRM. (Open question #6 names them.)

---

## SHOT LIST

Live session → editable layers. Each shot notes **source**, **what to get**,
**priority** (A/B/C), and the **hero/claim** it serves. Capture more than the
cut needs; protect the three A-tier proofs.

| # | Shot | Source | What to capture | Priority | Serves |
|---|---|---|---|---|---|
| S1 | **Cold open — the room** | Freeq call grid | 4 human tiles + Raven's animated orb tile live; natural greeting, no staged intro | A | Hook / realness |
| S2 | **"Raven, can you hear us?"** | Call grid + room audio | Human addresses Raven by name; orb shifts listening→speaking; her voiced reply, clean | A | **H1** |
| S3 | **Raven's tile, tight** | Raven video tile (isolated capture) | Orb reacting to audio; any scene card/whiteboard she renders | B | H1/H4 presence b-roll |
| S4 | **Studio integration walkthrough** | Jess screenshare | Playmaker Studio + Fabro surfaces inside Alexandria; cursor moving through real tabs | A | **H2** |
| S5 | **Bryan's reaction** | Bryan webcam tile | Genuine "oh, that's where Fabro lives" reaction during S4 | A | H2 (authenticity) |
| S6 | **"She's wired in"** | Call grid + screenshare | Raven answering a project-grounded question (narrow claim, no overpromise) | B | Integration is real |
| S7 | **The Play Tracker + run kicks off** | Jess screenshare (viewer **Play Tracker tab**) | Open the Play Tracker; start `frame-the-problem`; step rail shows `pre_fill` running with Raven's avatar pulsing; status badge `On track`; progress bar moves | A | **H4** |
| S8 | **Raven draws the steps** | Raven video tile | Whiteboard/scene-card of `frame-the-problem`'s steps appears in her tile during the run (ambient presence, not the proof) | B | H4 (transparent work) |
| S9 | **The gate: "Waiting on you" → done** | Jess screenshare (Play Tracker) | Status badge flips to **`Waiting on you`** at the `review` gate; a human reacts; badge returns to `On track`; `revise` runs; `[A] Approve` → `Done`. (Fallback: a pre-captured run sitting at the gate, or the Factory Runs event log.) | A | **H4** (the genuine human pause) |
| S10 | **The brainstorm** | Call grid + audio | Four humans + Raven planning the next build; one genuine correction/mistake left in; Raven's short addressed turn | A | Human+AI reasoning |
| S11 | **Capture into the repo** | Jess screenshare (terminal/editor) | The transcript/decisions file appearing in `alexandria-internal` (Alexandria Prime) at session end (auto-written if Option A landed; else manual paste + commit on camera) | A | **H3a** |
| S12 | **Fabro picks it up** | Jess screenshare (Studio Runs) | New Fabro run submitted/queued from the agreed work | A | **H3b** |
| S13 | **Close / tag** | Call grid + audio | Founders' "this is AI at a company that works"; Raven says goodbye by voice | B | Belief landed / social tag |
| S14 | **Pre-flight fallback b-roll** (record BEFORE the live session) | Controlled capture | Clean orb reaction loop; a clean voice exchange; a Play Tracker run at the **"Waiting on you"** gate; a completed run at `Done`; a prior Fabro run — all as edit-safety inserts | A (insurance) | Fallback for S2/S3/S7/S9/S12 |

**A-tier (must get clean):** S1, S2, S4, S5, S7, S9, S10, S11, S12, and the S14
insurance b-roll. If S2, S4, and S11–S12 are clean, the episode's belief change
(H1, H2, H3) is fully carried even if everything else is soft.
