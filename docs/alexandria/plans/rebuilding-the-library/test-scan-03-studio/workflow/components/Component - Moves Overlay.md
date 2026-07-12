---
type: component
prefLabel: Moves Overlay
altLabels: [moves.md, Inside the play, authored overlay]
category: workflow
subcategory: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L132-162; studio/plays/AUTHORING-moves.md L1-50
context: workflow
altitude: component
---

## WHAT
_Stub —_ the per-move reader-facing prose for the viewer's "Inside the play" section: clean-English golden-path beats plus off-path "problems happen" branch stories, keyed by move id onto the derived spine.

## WHERE
`studio/plays/<slug>/moves.md`. Authored at Derive (the "reskin step"). Lives next to [[Component - Story View]] but is **authored**, not derived — so it can drift.

## WHY
The derived story view is mechanically faithful but terse; the overlay is the deliberate human polish a viewer-facing audience needs. Points back at canon, never competes with it.

## WHEN
Authored at Derive after the spine settles. Re-reviewed when the §4 changes.

## HOW
- Optional — absent → moves render in their terse derived form.
- Skeleton: lead sentence + scannable beats + `↳ <route> — <headline>` block per validated exit.
- `studio/tools/check-moves.ts` is the mechanical guard against drift; runs advisory at Derive, gated at Lint.
- Companion to [[Component - Synopsis]], also authored.
