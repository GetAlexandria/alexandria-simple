# Three confusions — verdicts

The architect's three blockers from the type-binned view, with the framework
move that resolves each.

## 1. Is **Play Run** an Entity?

**Verdict: Aggregate (lifecycle-bearing instance of Play), in the Playbook
pillar.** Not a bare Entity.

The data model says: "Play Run — the durable, inspectable state of an executing
play — progress, per-branch status, freeze points. Supports freeze/resume… The
'now' surface, watched by triggers." That is textbook Aggregate language:
durable, owns state, has a lifecycle (start → freeze → resume → abort/finish),
watched by external observers.

The type "Entity" was making it look like a peer of Atomic Card or Source Item.
It is not. It is the **runtime instance** of an Aggregate definition (Play),
and the lifecycle test makes that explicit.

**Move:** `Entities/Entity - Play Run.md` → `playbook/aggregates/Aggregate - Play Run.md`.

## 2. Is **Studio Board** a Surface or an Entity?

**Verdict: both — DDD polysemy split.** The Studio Board is two things in two
different bounded contexts (or two roles in the same context), and the only
honest move is two cards sharing the name.

- `studio/surfaces/Surface - Studio Board.md` — the kanban UI you look at
  (columns, draggable cards, ready dots, the ▸ confirm).
- `studio/read-models/Read Model - Studio Board.md` — the derived state being
  rendered (per-play stage position + ready flag). Today it's persisted in
  `board-state.json`; conceptually it's a Read Model ("Knowledge Bank, Playbook
  page, Briefing — all derived, never stored" — the Studio Board is the same
  shape: where each play has been confirmed-to in the Ledger).

Each card explicitly cross-references the other in its body — this is the DDD
prescription for a noun that wears two hats.

**Move:** one card → two cards in the new Studio context.

## 3. Is **Raven Connection** a product noun at all?

**Verdict: no — demote to implementation.**

UL test: would the architect say "Raven Connection" when describing the
product? Inspecting the data model — Agent, Job Title, Play Run, Grant,
Briefing all earn their place — there is no Raven Connection noun. Whether
Raven is currently *connected* is a property of the agent's session (presence /
liveness), not a card-worthy concept. It is the implementation of an Agent's
attachment to the project from a coding tool.

Kept on the audit trail as `runtime/implementation/Implementation - Raven
Connection.md`, marked `status: implementation-detail`, with a note explaining
the demotion. Do not promote without re-running the UL test (e.g. if a later
data-model session introduces "Session" or "Lease" as a noun).

**Move:** `Entities/Entity - Raven Connection.md` →
`runtime/implementation/Implementation - Raven Connection.md`,
`type: Entity` → `type: Implementation`.
