---
type: aggregate
prefLabel: Brief
altLabels: [brief.md, Play Design Brief, design]
category: brief
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L1-157; studio/plays/README.md L60-80; studio/plays/frame-the-problem/brief.md L1-50
context: brief
altitude: aggregate
---

## WHAT
_Stub —_ the Director-owned design document for a Play. Has eight sections (Goal, Trigger, Required knowledge, Golden path / move graph, What could go wrong, Draft prompt language, Proof spec, Upgrade notes). Single source of the play's logic — every downstream rendering derives from §4.

## WHERE
`studio/plays/<slug>/brief.md`. §4 is the [[Aggregate - Move Graph]]. §7 seeds [[Aggregate - Risk Map]]. §6 feeds [[Component - Node Prompt]]. Hardened by [[Agent - Hardener]] via [[Aggregate - Hardening Record]]. Authored from [[Aggregate - Grounding Doc]]. Approved at [[Capability - Gate 1]].

## WHY
The brief separates *design* (a Director can read and judge) from *prompts* (machine-facing). Earned the hard way — the autopsy found 13 of 26 factory prompts leaked design rationale into the prompt itself.

## WHEN
Authored after Step 0 (grounding) per the "ground before design" rule. Hardened iteratively. Frozen at Gate 1. Amendments are dated §9/§10 sections, never silent edits (the sync rule).

## HOW
- Single source of truth — edits land here, renderings re-derive.
- Carries `status` (designed / hardened / derived / proven / registered) and `gate-1` approval state in YAML header.
- Includes the "startup floor" question answered before §4.
