# The Ledger as the Work Queue — Kanban over Events

Source material: director ruling and design conversation, 2026-07-08, during
the library-migration orchestration session (Raven). Captures original
thinking for library update / feature development. The migration slices
referenced (4b/4d) were in flight when this was written.

## The ruling

Open problems, questions, and work items queue in the **Ledger**, not in
documents. The director's words: "the queue should def be the ledger. i think
that becomes a kanban board presentation in the info hub of the viewer. every
task is event-sourced via the ledger. totally agree. and will be super
valuable for tracking work over time and resolving open work."

## The model

A queued problem needs to be durable, ownerless-until-claimed, subscribable
(so a colleague can pick it up without being told), and resolvable with
provenance. That is the thread lifecycle:

- `library.thread_opened` — the problem enters the queue (family, kind,
  concerns naming real cards, a director-register question).
- claim — a colleague or the director takes it. NEEDS A NEW EVENT
  (`thread_claimed` or similar): kanban columns imply a claim state, and the
  claim is the coordination fact that lets a second colleague see work is
  taken. Today's vocabulary (opened / resolved / reopened) gives two columns;
  the claim verb makes it a board.
- worked — for problem-shaped threads, picking one up means running
  `frame-the-problem` against it (observed live 2026-07-08: the
  Triggers-and-Wakes framing run is exactly a dequeue).
- `library.thread_resolved` — resolution citing the ruling event. History
  intact forever.

## The presentation

A **kanban board in the Viewer's info hub**, projected entirely from the
Ledger. No stored board state; columns are event-derived. The unification is
bigger than threads: play runs already emit their whole lifecycle into the
same ledger (`play.requested` → `play.human_input_requested` →
`play.completed`), so the board shows problems AND work-in-flight on one
surface from one record — a thread in "open," the play run working it in
"claimed/in-progress," the gate waiting on the director in "needs director."
This is the keystone's "the ledger is coordination and QA" made visible.

Tracking work over time falls out for free: the board at any past moment is
a replay question, and every resolved item carries its full history.

## Enabling gaps (known at time of writing)

1. **Forward writer**: after migration slice 4b, the append schema for
   `thread_opened` exists but the only emitter is the one-time backfill.
   A deterministic command (`ax raven thread open --question … --concerns …`
   or a Notepad affordance) is the small missing capability.
2. **Claim event**: not in the vocabulary yet (see above).
3. **Board surface**: the info-hub kanban view itself.

## First queue entries (real problems awaiting the writer)

- Two concurrent sessions of the same colleague share
  `host:claude-code:default` — one connection, one cursor, wake-delivery
  races and crosstalk (observed live 2026-07-08 with two Raven sessions).
  Concerns: Entity - Session, Entity - Connection Lease, Mechanism - Monitor,
  the colleagues shelf.
- Wake-routing defaults: nothing warns when a second session leases an
  already-active connection.
- The info-hub kanban itself — the queue's first entry can be the queue.

## Addendum — QA bundle registry collapses to the Ledger (director ruling 2026-07-09)

The Builder's bundle list (`docs/alexandria/library-bundles.json`) should not
survive as a hand-edited file. "A draft bundle exists" is a history fact, not
a location fact: a play run produced it, and its existence, `draftOf`,
and eventual acceptance or abandonment are lifecycle events. The reviewable-
bundles list becomes a projection ("bundles emitted, not yet confirmed or
discarded"), which also places drafts-under-review on the kanban board for
free. Config keeps only the live library's location. Implementation timing:
after the first real post-migration draft bundle exists (the back-of-house
walk's first run under the new emit contract).
