---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - play definition
evidence:
  - packages/ax/src/domain/plays.ts
links:
  related_to:
    - Entity - Workflow Package
    - Entity - Play Skill
---

## WHAT

A play is a definition that lives in the playbook — a reliable, reusable
combination of agentic, software, and human activities. It is assigned to an
agent and gets called by the director or by a trigger. A play includes moves —
and sometimes other plays, making it a compound; moves can be made by agents,
software, or humans. "The play" is this definition: the workflow
template and the skill file are its components, not the play itself.
Its production lifecycle (authoring, testing, promotion) happens in
Playmaker Studio, not in the shipped product — here a play is the
bounded definition that play runs are scoped to.

## WHY

A play exists because a colleague takes ownership of work at exactly
this grain — [[Bet - The Play as Unit of Ownership]] — the unit by
which a director can assign a real task the way they would to a human
peer. Definitions live in one shared playbook every colleague draws
on rather than as private per-agent scripts,
[[Bet - Shared, Agent-Executable Playbook]], and once called, a play
runs with real autonomy rather than waiting on step-by-step
instruction, [[Bet - Independent Execution]].

## WHERE

Registered in the shipped play manifest.

## HOW

A play's machine contract is its [[Entity - Workflow Package]] and its
spoken, Raven-facing procedure is its [[Entity - Play Skill]] — one noun,
two subordinate parts.
