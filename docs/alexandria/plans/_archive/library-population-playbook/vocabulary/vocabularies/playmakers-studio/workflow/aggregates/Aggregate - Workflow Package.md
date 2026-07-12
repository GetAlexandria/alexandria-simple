---
type: aggregate
prefLabel: Workflow Package
altLabels: [workflow package, the package, deployable]
category: workflow
subcategory: aggregate
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/PROJECTION.md L294-321; studio/plays/README.md L60-70 (the loop); studio/plays/AUTHORING.md L20-30
context: workflow
altitude: aggregate
---

## WHAT
_Stub —_ the deployable artifact derived from [[Aggregate - Move Graph]]: a `workflow.fabro` graph + a `prompts/<move>.md` file per judgment / mechanical move + optional `workflow.toml` run config. This is what Fabro actually runs.

## WHERE
Authored under `studio/plays/<slug>/` (the studio copy). Banked into `packages/alexandria-next-plugin/workflows/<slug>/` (the plugin copy — what the runtime executes). Two copies, kept in lockstep by [[Capability - Bank]] + bank conformance gate.

## WHY
A play is "a runnable workflow package, not a prompt file" (README, Definition of proven). The package is what banking moves between studio and plugin; it's what `ax run <slug>` resolves.

## WHEN
Created at the Derive step (rung 4 of the loop) — projected mechanically from the brief per [[Component - Projection Rulebook]]. Re-derived after any edit (the sync rule).

## HOW
- Three files: `workflow.fabro` + `prompts/<move>.md` + optional `workflow.toml`.
- Inline-prompt plays (e.g. atomic-card family) keep prompts *inside* `workflow.fabro` — no `prompts/` dir.
- Reverse-derived plays exist as packages first, brief second.
