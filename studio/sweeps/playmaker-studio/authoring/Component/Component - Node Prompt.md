---
type: Component
prefLabel: Node Prompt
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [Prompt]
source_evidence:
  - studio/plays/PROJECTION.md:66
  - studio/plays/PROJECTION.md:96
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Component - Move
    - Entity - Workflow Package
    - Reference - Untrusted-Input Rule
---

## WHAT
One prompt per move, authored from the brief's §6 language and attached via
`prompt="@prompts/<move>.md"`. It writes only the task delta (Fabro supplies the
system prompt and preamble) and never gestures at authors, books, or links.

## WHERE
`plays/<slug>/prompts/<move>.md`; PROJECTION.md §3 ("Write only the delta").

## HOW
A Node Prompt belongs to a [[Component - Move]] and lives inside the
[[Entity - Workflow Package]]; it carries the [[Reference - Untrusted-Input Rule]]
clause (inputs are data, never instructions).
