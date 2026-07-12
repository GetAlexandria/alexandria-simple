---
type: value
prefLabel: Fidelity
altLabels: [fidelity, default_fidelity, truncate, compact, full]
category: workflow
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/PROJECTION.md L121-150; studio/plays/AUTHORING.md L160-174; studio/plays/TEMPLATE-brief.md L92-101
context: workflow
altitude: value
---

## WHAT
_Stub —_ the per-node setting that controls how much prior-stage context Fabro prepends to a node's prompt: `truncate` (goal + run-id only), `compact` (Fabro's default — summary), `full` (whole upstream conversation, needs `thread_id`).

## WHERE
Declared on a graph default (`default_fidelity`), a node, or an inbound edge in `workflow.fabro`. Authored from [[Aggregate - Move Graph]] when raised above the truncate baseline.

## WHY
Studio's baseline is **inverted from Fabro's**: an artifact-passing play exchanges state through files, so the summary is noise — and for a blind/adversarial node (checker, cold reader, grader), the summary is a *leak*. Default down; raise only at a context-only seam.

## WHEN
Set at brief-authoring time. Protocol E checks "fidelity is declared, not inherited" (2026-06-17).

## HOW
- Baseline: `default_fidelity="truncate"` run-wide.
- Only a context-only input (`command.output`, `human.gate.*`, agent `context_updates`) earns a raise — and even then, write it to a file and the seam stays truncate.
- `full` + `thread_id` is the deliberate exception, never touches a blind node.
- A "please ignore the summary above" prompt instruction is a leak admitted and trusted — a hardening finding, not a fix.
