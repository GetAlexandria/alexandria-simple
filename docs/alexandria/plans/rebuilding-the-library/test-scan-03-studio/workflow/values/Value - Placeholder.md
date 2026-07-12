---
type: value
prefLabel: Placeholder
altLabels: [__AX_INPUT_KEY__, build-time placeholder]
category: workflow
subcategory: value
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/AUTHORING.md L98-114; studio/plays/PROJECTION.md L112-120; studio/plays/RUNTIME.md L97-108
context: workflow
altitude: value
---

## WHAT
_Stub —_ a build-time token the runtime substitutes when materializing a play: `__AX_INPUT_<KEY>__` (per-input), `__AX_ACP_COMMAND_JSON__`, `__AX_PROJECT_ROOT__`. Single-`AX_` only.

## WHERE
Written verbatim in [[Component - Node Prompt]] frontmatter `consumes:` lines and body, and in `workflow.fabro` `acp.command=` wiring. Resolved by `packages/ax/src/domain/orchestration.ts` regex `__AX_([A-Z0-9_]+)__`.

## WHY
Build-time substitution means a play stays portable: the ACP provider and project root inject at materialization, not at author-time. Single-spelling discipline is enforced because the dead `__AX2_` spelling (left over from `ax-next → ax` rename) **never substitutes** — a play authored with it ships unrendered placeholders, silently.

## WHEN
Authored in node prompts; resolved at run time. Conformance gated by `placeholderConformance.test.ts`.

## HOW
- Token format: `__AX_…__` only.
- BIG-EDIT step 1 explicitly: "Placeholders stay single-`AX_`."
- Hot Spot H11 in STUDIO-EVENTS — the rule is repeated across four docs because it recently bit.
