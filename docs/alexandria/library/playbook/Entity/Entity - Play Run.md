---
plane: product
status: confirmed
confidence: high
altitude: aggregate
altLabels:
  - run
evidence:
  - packages/ax/src/commands/play.ts
  - packages/ax/src/domain/fabro-labels.ts
links:
  derived_from:
    - Entity - Play
  contains:
    - Entity - Human Input Request
  produces:
    - Entity - Provenance Record
  related_to:
    - Mechanism - Fabro Orchestrator
flow:
  - activity: Initialize the project
    context: viewer
    doer: Director
    stateAfter: configured
    refs: [Entity - Project, Surface - AX CLI, Entity - Alexandria Config]
    evidence: packages/ax/CLAUDE.md
  - activity: Start the local runtime and viewer
    context: viewer
    doer: Director
    stateAfter: healthy
    refs: [Mechanism - AX Runtime Server, Surface - Viewer]
    evidence: packages/ax/src/cli/router.ts
  - activity: Lease the session connection
    context: triggers
    doer: Monitor
    stateAfter: connected
    refs: [Entity - Session, Entity - Connection Lease, Mechanism - Monitor]
    evidence: packages/ax/src/domain/wake-subscriptions.ts
  - activity: Register wake subscriptions with match rules
    context: triggers
    doer: Agent
    stateAfter: wakeable
    refs: [Entity - Wake Subscription, Entity - Match Rule]
    evidence: packages/alexandria-plugin/skills/ax-start/SKILL.md
  - activity: Draft the Vision slots and rule on each
    context: playbook
    doer: Raven
    gate: true
    stateAfter: slots resolved
    refs: [Entity - Basic Product Description, Entity - Vision Slot]
    evidence: packages/ax/src/domain/raven-vision.ts
  - activity: Flush the source of truth and bank the description
    context: playbook
    doer: Director
    gate: true
    stateAfter: banked
    refs: [Entity - Source of Truth, Entity - Basic Product Description]
    evidence: packages/ax/src/domain/raven-vision.ts
  - activity: Add a source to the inbox
    context: library
    doer: Director
    stateAfter: pending assessment
    refs: [Entity - Source, Surface - Inbox]
    evidence: packages/ax/src/domain/triggers.ts
  - activity: Derive the pending trigger from recorded history
    context: ledger
    doer: Trigger
    stateAfter: trigger pending
    refs: [Mechanism - Trigger]
    evidence: packages/ax/src/domain/triggers.ts
  - activity: Assess the source
    context: library
    doer: Agent
    stateAfter: assessed
    refs: [Capability - Source Assessment, Entity - Source]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Request the play (coin click or Raven in session)
    context: playbook
    doer: Director
    stateAfter: requested
    refs: [Entity - Play, Entity - Playbook, Entity - Coin]
    evidence: packages/alexandria-plugin/skills/frame-the-problem/SKILL.md
  - activity: Submit the run to the embedded orchestrator
    context: playbook
    doer: Agent
    stateAfter: submitted
    refs: [Entity - Play Run, Mechanism - Fabro Orchestrator, Entity - Workflow Package, Entity - Run Labels]
    evidence: packages/ax/src/domain/orchestration.ts
  - activity: Start the run and walk its moves
    context: playbook
    doer: Fabro Orchestrator
    stateAfter: running
    refs: [Entity - Play Run, Entity - Move]
    evidence: packages/ax/src/commands/play.ts
  - activity: Suspend at the human gate with a recorded question
    context: playbook
    doer: Fabro Orchestrator
    stateAfter: awaiting director
    refs: [Mechanism - Human Gate, Entity - Human Input Request]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Wake the session on the matched event
    context: triggers
    doer: Monitor
    stateAfter: agent woken
    refs: [Capability - Wake, Mechanism - Monitor, Entity - Session]
    evidence: packages/ax/src/domain/wake-subscriptions.ts
  - activity: Relay the director's answer to the waiting run
    context: playbook
    doer: Director
    gate: true
    stateAfter: resumed
    refs: [Entity - Human Input Request, Role - Raven, Role - Director]
    evidence: packages/ax/src/commands/play.ts
  - activity: Select the review level and confirm the staged gates
    context: playbook
    doer: Director
    gate: true
    stateAfter: gates confirmed
    refs: [Mechanism - Review Gate]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Complete (or fail) the run and record its provenance
    context: playbook
    doer: Fabro Orchestrator
    stateAfter: succeeded
    refs: [Entity - Play Run, Entity - Provenance Record]
    evidence: packages/ax/src/commands/play.ts
  - activity: Append every step as immutable history
    context: ledger
    doer: State Store
    stateAfter: appended
    refs: [Entity - Ledger, Entity - Ledger Event, Mechanism - State Store]
    evidence: packages/ax/src/domain/state-store.ts
  - activity: Save canvas steps and request review
    context: canvas
    doer: Agent
    stateAfter: awaiting review
    refs: [Entity - Canvas Step, Capability - Canvas Review, Mechanism - Canvas]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Advance the source conversion and freeze the output
    context: library
    doer: Director
    gate: true
    stateAfter: frozen
    refs: [Capability - Source Conversion, Entity - Frozen Source of Truth]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Atomize the ready knowledge areas into cards
    context: library
    doer: Agent
    stateAfter: cards created
    refs: [Entity - Knowledge Bank Area, Entity - Atomic Card, Entity - Atomic Card Category]
    evidence: packages/ax/src/domain/atomic-card-categories.ts
  - activity: Record studio dispositions against rulings
    context: library
    doer: Director
    stateAfter: disposition recorded
    refs: [Capability - Studio Operation, Principle - Director Ruling]
    evidence: packages/ax/src/domain/triggers.ts
  - activity: Walk the draft library front-of-house, turn by turn
    context: library
    doer: Raven
    stateAfter: answered
    refs: [Capability - Front-of-House Walk, Entity - Walk Turn]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Apply validated bundle patches to the draft overlay
    context: library
    doer: Agent
    stateAfter: draft-patched
    refs: [Entity - Bundle Patch, Mechanism - Draft Overlay, Entity - Atomic Card]
    evidence: packages/ax/src/domain/library-draft-overlay.ts
  - activity: Confirm sections; record residual gaps
    context: library
    doer: Director
    gate: true
    stateAfter: sections confirmed
    refs: [Entity - Section, Entity - Thread]
    evidence: packages/ax/src/domain/state-events.ts
  - activity: Rule on the whole draft library
    context: library
    doer: Director
    gate: true
    stateAfter: confirmed
    refs: [Mechanism - Confirmation Gate, Entity - Alexandria Product Library]
    evidence: packages/ax/src/domain/library-confirmation.ts
---

## WHAT

The unit of work — the atom the whole system is organized around. The
whole system exists so a director can assign a task or project to an
AI colleague the same way they would to a human peer, and the way you
do that is by running a play. The Play Run is what advances; the
Ledger Event records what happened during that advance, and the
Library is the knowledge the colleague draws on — both serve the play
run, not the other way around. Requested, submitted, running,
suspended at gates, resumed, and terminated — every step is recorded
as immutable history.

## WHY

The play run is the atom it is because work gets assigned and trusted
at the level of a play, not below it —
[[Bet - The Play as Unit of Ownership]] — so the run, not any of its
internal steps, is what a director points to as the unit of
accountability. Recording every step from request to termination as
immutable history is what keeps a colleague's work legible to the
director at all times, [[Principle - Transparent Machinery]].

## WHERE

Summarized by the play command; labeled runs inside the embedded
orchestrator; narrated in the ledger's play-run history.

## HOW

A run is derived from an [[Entity - Play]] and executed by the
[[Mechanism - Fabro Orchestrator]]; it moves through submitted, succeeded,
failed, or unknown status as it advances, suspends on a
[[Entity - Human Input Request]] at a gate, and produces a
[[Entity - Provenance Record]] declaring what it was built from.
Inside the orchestrator a run also carries internal tagging labels
for the run, the play, and the project — plumbing, not a product
noun.
