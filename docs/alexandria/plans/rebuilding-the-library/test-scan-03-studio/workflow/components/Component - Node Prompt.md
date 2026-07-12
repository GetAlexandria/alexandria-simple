---
type: component
prefLabel: Node Prompt
altLabels: [node prompt, prompts/<move>.md]
category: workflow
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/AUTHORING.md L40-100, L150-225; studio/plays/PROJECTION.md L92-101
context: workflow
altitude: component
---

## WHAT
_Stub —_ one prompt file inside [[Aggregate - Workflow Package]] — the "task that remains" once Fabro's system prompt + preamble are supplied. Has a fixed structure: frontmatter (contract), task, failure behavior, hard limits, output format, optional gallery.

## WHERE
`studio/plays/<slug>/prompts/<move>.md`. Authored from [[Aggregate - Brief]] §6 language by [[Agent - Author]]. Lint-checked by [[Agent - Checker]] via [[Component - Lint Verdict]] (Protocols A-E).

## WHY
"Write only the delta" — Fabro already supplies system prompt and a preamble carrying goal + summaries; the prompt is only what's left. Earned: 13 of 26 factory prompts leaked design rationale (autopsy).

## WHEN
Authored at Derive. Re-authored at edit-time (via brief amendment, the sync rule — never patched in place).

## HOW
- Frontmatter mirrors brief §4 (Protocol E string-checks).
- External inputs are `__AX_INPUT_<KEY>__` placeholders (single-`AX_`, not the dead `__AX2_`).
- Purity rules: no provenance, no design rationale, no machinery nouns ("play," "brief," "lint" as self-reference), no session vocabulary, no unresolvable references, no seam-leak patches.
- File-writing moves carry the "write the file, don't narrate it" clause.
