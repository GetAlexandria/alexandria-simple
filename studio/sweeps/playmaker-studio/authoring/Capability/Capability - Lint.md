---
type: Capability
prefLabel: Lint
context: authoring
plane: Product
status: stub
altitude: capability
altLabels: [Protocol E, Contract Lint]
source_evidence:
  - studio/plays/README.md:76
  - studio/plays/PROJECTION.md:333
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  related_to:
    - Mechanism - Sync Rule
    - Reference - Moves Overlay
---

## WHAT
The mechanical contract check (Protocols A–D on the prompts, plus Protocol E:
brief↔workflow parity, no drift) plus `check-moves.ts` overlay coverage and
`fabro validate`. It catches the class of error the Director can't.

## WHERE
README "The loop" Step 5; PROJECTION.md §9 (Protocol E is validate's
semantics-gap charter).

## HOW
Lint operates on the [[Entity - Workflow Package]]; Protocol E enforces the
[[Mechanism - Sync Rule]], and the overlay check guards the
[[Reference - Moves Overlay]].
