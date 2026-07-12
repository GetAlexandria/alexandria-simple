# RUNTIME.md — the play ↔ runtime contract

*(Director-requested 2026-06-18. `PROJECTION.md` projects a play's logic into a
Fabro workflow and `AUTHORING.md` writes its node prompts — both describe a play
as *a Fabro graph + prompts*. But a play also **participates in the Alexandria
runtime**: something launches it, it narrates its lifecycle onto the ledger, it
may suspend for human judgment, it is tracked, and its output is banked. That
contract had no rulebook — this is it. It is **ported from a shipped reference,
the Raven Vision power-up**, not from intent: every obligation below is something
Vision already does in production. Where the *generic play-side* plumbing is not
yet shipped, it is marked **\[Slice 1, #305]** — the frame-the-problem-coin
re-architecture that brings the Fabro-play runtime up to what Vision proved.)*

## The reference: Raven Vision (shipped, working today)

When the director "powers up" Raven, she fills the Vision card one slot at a
time. That onboarding is **not packaged as a play**, but it runs the entire
contract this doc describes, and it is the exemplar to copy:

- **Event-sourced.** Every step is a ledger event — `raven.vision.started →
  source_attached → drafting_requested → slot.updated → slot.approved /
  slot.skipped → banked` (`packages/ax/src/domain/state-events.ts`).
- **Non-blocking, wake-driven.** Raven wakes on an event, drafts **one slot**,
  writes it through AX (the slot goes `needs_review`), and **ends her turn**. The
  director reviews asynchronously in the Viewer and approves / skips / revises,
  which emits an event that **wakes Raven for the next slot**. She never blocks
  waiting at a terminal.
- **Per-unit, Raven-mediated.** The unit is a slot
  (`empty → needs_review → approved / skipped`, `packages/ax/src/domain/raven-vision.ts`);
  the director's judgment enters through Raven, not a Fabro console.
- **Banked.** When the slots resolve, the onboarding goes `ready_to_bank →
  banked` (`ax raven vision bank`) and the result lands in the knowledge bank.

Read before designing a runtime-aware play: the skills `raven-vision-drafting`
(produce a unit) and `raven-vision-elicitation` (help the director improve one),
`domain/raven-vision.ts` (the state model), `commands/raven.ts` (the CLI), and
the `alexandria-event-log` skill (how a wake works).

## The contract — six obligations of a runtime-aware play

### 1. Launch — a play is started, it does not start itself

`ax run <play>` is **start-only**, with modes: **default fire-and-forget** ·
`--interactive` (attended TTY) · `--auto-approve` (detached, gates auto-resolved —
tests / smokes) · `--wait` (gather the result to the terminal). A play may also
be fired by a **trigger event** — the coin emits `play.requested`; Vision is
woken by `raven.vision.drafting_requested`. **\[Slice 1, #305]** for the generic
`ax run` modes + Fabro-run label stamping; Vision's event-triggered launch is
shipped.

### 2. Narrate to the ledger — the runtime is the only writer

The agent never appends to `events.jsonl` (or cursor / lease / subscription
files) directly. It calls an AX command and **the runtime writes the event**, so
validation, idempotency, and projection stay consistent (`alexandria-event-log`
skill). Lifecycle events: `play.started / completed / failed / status_observed`
(`state-events.ts`); the human-input pair is §3. Vision writes via `ax raven
vision slot update / approve / skip / bank`, which emit the `raven.vision.*`
events.

### 3. Human judgment is non-blocking and event-sourced — never a blocking node

This is the heart, and the one place the old canon was wrong (`PROJECTION.md §7`:
a blocking Fabro human node **deadlocks** the moment a play runs detached,
because the agent owns the terminal and the human is one layer away — coin plan
§2). The shipped pattern:

1. The agent does **one unit** of work and writes it through AX, marking it
   *awaiting review* (Vision: the slot → `needs_review`; a play gate: a pending
   interview → `play.human_input_requested` **\[Slice 1, #305]**).
2. The agent **ends its turn.** It does not wait.
3. The human reviews asynchronously and **approves / revises / skips**, emitting
   an event (Vision: `slot.approved / skipped`; a play:
   `play.human_input_resolved` **\[Slice 1, #305]**).
4. That event **wakes** the agent (§4) to take the next unit.

Design rules that fall out of this:

- **Units, not a boolean.** Model the open asks as a **set** of unit- or
  question-scoped items (Vision: nine slots), each resolved on its own — architect
  for N open gates from day one (coin §7.14). Never model "blocked / not blocked."
- **One open ask at a time per reviewer** is the safe default: the drafting skill
  refuses to draft while any slot is `needs_review` — the human is mid-review.
- **Two agent roles.** A *drafting* path produces a unit from sources
  (`raven-vision-drafting`); an *elicitation* path helps the human improve a unit
  and writes a revision only when asked (`raven-vision-elicitation`). A play that
  carries human judgment usually needs both.

### 4. Wake on events

The agent is reactivated by a **wake signal** — a monitor injects a ledger event
into the session (`alexandria-event-log` skill). The event is a signal, not a
full brief: read it, decide whether it asks for action, inspect projected state
with `ax inspect state --json` only when the event lacks context, then act and
write back through AX. Subscriptions register which events wake which behavior
(`ax raven`, `commands/subscriptions.ts`, `domain/wake-subscriptions.ts`).

### 5. Idempotent writes, file / stdin input

- **Idempotent.** A re-delivered event or a retried write is a graceful no-op —
  carry an idempotency key (Vision: `ax raven vision slot update
  --idempotency-key <key>`). The human-input pair is keyed by the unit / question
  id, so resolving one never resolves another.
- **Input by file / stdin, not shell interpolation.** Pass text via `--text-file`
  / stdin so apostrophes and quotes survive intact (Vision: `--text` /
  `--text-file`; the generic play `--input` file path is **\[Slice 1, #305]**,
  which fixes the apostrophe-rejection bug in `orchestration.ts`).

### 6. Track and bank

- **Tracked.** An in-flight run is visible in the Play Tracker, fed by the
  runtime's one **run-state model** — status + the set of open asks (the "Raven
  needs you" state). **\[Slice 1 / 2, #305]**: the tracker moves onto that model,
  structurally fixing the always-empty active-runs list.
- **Output bank.** When the units resolve, the play's deliverable banks into the
  library / state (Vision: `ax raven vision bank` → `raven.vision.banked`). This
  is **not** the *package bank* (`bank.sh`, studio → plugin — see `BIG-EDIT.md`),
  which deploys the play's code, not its output.

## Designing a new human-in-the-loop play — the porting checklist

1. Name the **unit** the human reviews (Vision's slot; a question; a section).
   The play emits one unit, suspends, and resumes per unit.
2. Give each unit a state (`awaiting review → approved / revised / skipped`) and
   key every write and resolution by the unit id.
3. Write the unit **through AX**, **end the turn**, and let the resolving event
   wake the next unit. Never author a blocking gate for a detached / Raven-mediated
   run.
4. Split **drafting** (produce a unit) from **elicitation** (help the human
   sharpen one).
5. Inputs by file / stdin; writes idempotent.
6. Make sure the deliverable banks at the end.

Until the generic play-side plumbing lands (**\[Slice 1, #305]**), the **shipped
instance of every obligation above is Raven Vision** — read it as the worked
example and design to its shape.

## See also

`PROJECTION.md` (logic → Fabro graph) · `AUTHORING.md` (node prompts) ·
`TESTING.md` (grading) · `BIG-EDIT.md` (editing an existing play) ·
`docs/alexandria/plans/_archive/frame-the-problem-coin/plan.md` (the play-side
re-architecture: #304 plan, #305 Slice 1).
