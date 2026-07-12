---
type: value
prefLabel: Doer
altLabels: [doer, doer-honesty]
category: brief
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L75-80; studio/plays/README.md L171-174 (autopsy rule); studio/plays/PROJECTION.md L56-67
context: brief
altitude: value
---

## WHAT
_Stub —_ the type of agent assigned to a [[Value - Move]]: **judgment** (comprehension; no closed rule), **mechanical** (a closed rule a machine could follow; runs best-effort as an agent until software is earned), or **human** (in-play decision; becomes a hexagon human gate).

## WHERE
Declared inline in [[Value - Move]] frontmatter. Projects to Fabro node shape: judgment → `box` (agent, has tools) or `tab` (prompt, no tools); mechanical → `parallelogram` script *when shipped*, else `tab`; human → `hexagon`.

## WHY
"Doer honesty" — five mislabeled doers in the factory era let quality gates pass garbage (autopsy). Declaring honestly means the lint can check it and the projection rules can fire.

## WHEN
Set at brief authoring time. Hot Spot — see H4 in STUDIO-EVENTS.md: docs don't say *what kind of node runs* directly; they say *what kind of work it is* + a peg ("future software").

## HOW
- "Mechanical" without shipped software → runs as agent (`tab`), pegged future-software in §8.
- Brief §3 declares which inputs are *untrusted* (a separate property of the move, not a doer type but enforced in the prompt).
