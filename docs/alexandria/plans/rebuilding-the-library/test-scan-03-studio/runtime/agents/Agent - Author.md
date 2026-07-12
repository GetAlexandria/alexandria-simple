---
type: agent
prefLabel: Author
altLabels: [Author]
category: runtime
subcategory: agent
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L47-50; studio/plays/AUTHORING.md L20-30
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ the agent that runs the [[Capability - Derive]] step: projects the brief's move graph into the [[Aggregate - Workflow Package]] per [[Component - Projection Rulebook]], authoring one [[Component - Node Prompt]] per judgment/mechanical move from the brief's §6 language. Also drafts [[Component - Moves Overlay]] at the reskin step.

## WHERE
Reads [[Aggregate - Brief]] (Gate-1 approved) + [[Aggregate - Grounding Doc]]. Writes `workflow.fabro` + `prompts/` + `moves.md`. Hands off to [[Agent - Checker]].

## WHY
"You polish and structure; you do not design." Author in the loop, not designer. Every methodological claim in any prompt traces to the brief or the grounding — invented rules kick back to the Director.

## WHEN
Rung 4 of the loop. Re-run on big edits.

## HOW
- "Write only the delta" — Fabro's preamble already supplies system identity.
- Each node prompt has one reader: a cold doer agent.
- Subject to three-strikes-then-freeze.
- Output discipline: write the file with the tool; reply is a one-line confirmation.
