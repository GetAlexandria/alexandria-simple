---
plane: product
status: confirmed
confidence: high
altitude: pillar
altLabels:
  - /playbook
evidence:
  - "packages/ax/src/domain/plays.ts:130"
  - packages/viewer/src/components/library/viewer-routes.ts
links:
  contains:
    - Entity - Play
  related_to:
    - Capability - Run a Play
    - Entity - Workflow Package
    - Entity - Move
    - Entity - Play Skill
    - Entity - Play Run
    - Mechanism - Fabro Orchestrator
    - Entity - Run Labels
    - Mechanism - Human Gate
    - Entity - Human Input Request
    - Capability - Human Feedback
    - Mechanism - Review Gate
    - Entity - Provenance Record
    - Entity - Basic Product Description
    - Entity - Vision Slot
    - Entity - Source Item
    - Entity - Source of Truth
    - Pattern - Running Plays
---

## WHAT

The registry of plays a team can reliably run — one of the two innovations at
the heart of the product: work processes made atomic and accessible to
agents. The Playbook is the registry, not the page: a company has
plays divided up by role; agents fill role seats and get access to
plays. The playbook page in the viewer is a derived view of the
playbook-as-registry.

## WHY

The Playbook exists because process is centralized in one shared,
agent-executable registry rather than fragmenting into private
per-agent scripts —
[[Bet - Shared, Agent-Executable Playbook]] — and because depth of
that registry is what lets a colleague keep absorbing more of a
director's real work over time rather than plateauing at a handful of
tricks, [[Bet - The Deep Playbook]]. Its own viewer page reflects the
wager that plays and playbooks should be seen and traversed as visual
objects, not only executed under the hood,
[[Bet - Visualized Work Processes]].

## WHERE

Its own registry interface; rendered at the viewer's playbook page.

## HOW

The Playbook holds every registered [[Entity - Play]]. A play is defined by
two parts — a [[Entity - Workflow Package]], the runnable graph of ordered
[[Entity - Move]]s the engine steps through, and a [[Entity - Play Skill]],
its spoken procedure read in session. When work calls it, a
[[Capability - Run a Play]] fires the play, instantiating an
[[Entity - Play Run]], the atomic unit the system is
organized around: the [[Mechanism - Fabro Orchestrator]] executes it,
advancing through submitted, succeeded, failed, or unknown status and
carrying internal [[Entity - Run Labels]] (plumbing, kept only as a
demotion note). Where a run needs a person a [[Mechanism - Human Gate]]
suspends it and records a [[Entity - Human Input Request]] for the
director; a [[Capability - Human Feedback]] answers it and resumes the
run, mediated by [[Role - Raven]]; a [[Mechanism - Review Gate]] adds
staged design- and proven-confirmation checkpoints sized by how much
human review the run selects. On completion the run pins a
[[Entity - Provenance Record]] of what it was built from. One play in the
registry is the [[Entity - Basic Product Description]] — the director's
own account of the product — whose four [[Entity - Vision Slot]] pieces
each move through needs-review, approved, or skipped standing, draw on
attached [[Entity - Source Item]] material, and resolve into the
[[Entity - Source of Truth]] the library later builds from. Firing,
suspending, resuming, and completing runs, again and again, is the
product's continuous [[Pattern - Running Plays]].
