---
type: value
prefLabel: Orchestrator
altLabels: [orchestrator, orchestrating agent]
category: production-line
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/HANDOFF.md L107-130; studio/plays/README.md L60-70
context: production-line
altitude: value
---

## WHAT
_Stub —_ the orchestrating agent who runs a session — coordinates Hardener, Author, Checker, Grader, performs the Register step, manages the Closeout. Reports rulings to the Director, never invents.

## WHERE
Reads [[Component - Handoff Package]] at session start; runs [[Component - Closeout Checklist]] at session end. Edits [[Aggregate - Board State]] directly when a card moves. Updates [[Read-Model - Play Registry]] when status changes.

## WHY
A play production line needs one agent that holds session-level state and routes work to the right specialist. Director rulings come to the Director through this agent.

## WHEN
Every session.

## HOW
- "Opus is sufficient" for play #2..N orchestration (Director directive).
- Reserve the largest model for novel process design, not production.
- Tags "orchestrator calls" in briefs as a provenance class (Grounded / Orchestrator call / DIRECTOR DECISION).
