---
type: Reference
prefLabel: Moves Overlay
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [moves.md]
source_evidence:
  - studio/plays/README.md:181
  - studio/plays/AUTHORING-moves.md:1
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Surface - Story View
    - Capability - Lint
    - Component - Move
---

## WHAT
An authored (not derived) reader-facing overlay — the per-move prose for "Inside the
play": the clean-English golden path plus the off-path "problems happen" branch
stories. Keyed by move id so ids/doers/routes never drift; because it is authored it
can fall out of step.

## WHERE
`plays/<slug>/moves.md`; the authoring guide is `AUTHORING-moves.md`; its mechanical
guard is `studio/tools/check-moves.ts`.

## HOW
A Moves Overlay sits on top of the [[Surface - Story View]]'s derived spine, keyed
to each [[Component - Move]]; the [[Capability - Lint]] gates on `check-moves.ts`
(its analog to Protocol E).
