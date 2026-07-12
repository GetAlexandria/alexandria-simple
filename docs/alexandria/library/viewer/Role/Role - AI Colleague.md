---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - Agent
  - AI employee
evidence:
  - "packages/ax/src/domain/agents.ts:13"
  - "packages/ax/src/domain/plays.ts:7"
links:
  operates_on:
    - Entity - Play Run
  related_to:
    - Entity - AI Colleague
    - Bet - Independent Execution
    - Role - Raven
    - Role - Damien
---

## WHAT

The generic term for an AI colleague — a member of the team with areas of
responsibility it handles faithfully and independently, not a prompt
window. The concept itself is headline-level (its thesis lives on the
Strategy plane as [[Bet - Independent Execution]], superseding
[[Entity - AI Colleague]]); this card is the class the named agents are
instances of. The current design is up to five direct reports for a
director, each with a coin — eventually hundreds — and there is a
difference between *coined* (has a slot) and *built* (has real plays and
capabilities).

## WHY

The class exists because each colleague is meant to be a named
individual with a persistent identity a director builds a working
relationship with, not an interchangeable capability —
[[Bet - Named Colleagues]] — and because that colleague is trusted to run
with real work independently, checking in only when it genuinely
matters, the way a human peer would, [[Bet - Independent Execution]].

## WHERE

The team's built-in agent roster; each agent is met through its coin in the
viewer's Tray.

## HOW

The instances are [[Role - Raven]] (the one somewhat built out) and
[[Role - Damien]] (coined, a few off-playbook skills); the remaining coined
slots are unnamed. An agent operates on the [[Entity - Play Run]] — it
manages plays rather than being them — taking work up when woken. The
retired [[Entity - AI Colleague]] card records that split: this Role
is the class, and [[Bet - Independent Execution]] now carries its
thesis on the Strategy plane.
