---
type: Role
prefLabel: Checker
context: authoring
plane: Product
status: stub
altitude: context
altLabels: []
source_evidence:
  - studio/plays/README.md:51
  - studio/plays/README.md:76
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  related_to:
    - Capability - Lint
    - Mechanism - Sync Rule
---

## WHAT
The agent that runs the mechanical contract lint (Protocols A–E) — catching
self-contradictions, undeclared inputs, vague outputs, design rationale leaking
into prompts, and brief↔workflow drift (Protocol E).

## WHERE
README "Division of labor" (the Checker) and "The loop" Step 5 (Lint).

## HOW
The Checker operates on the [[Entity - Workflow Package]] via the
[[Capability - Lint]] step; Protocol E enforces the [[Mechanism - Sync Rule]]
(no brief↔workflow drift).
