---
type: Surface
prefLabel: Inline Edit
altLabels:
  - Cmd-K
  - Selection Edit
  - In-line Edit
category: [Surfaces]
subcategory: [autonomy-tier]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/inline-edit
---

# Inline Edit

## WHAT: Definition

_Stub — the selection-scoped autonomous suggestion surface; the second tier on Cursor's autonomy ladder. The Developer selects a region of code, invokes Inline Edit (typically Cmd-K / Ctrl-K), types a natural-language instruction, and Cursor proposes a rewrite confined to the selected region. The proposed diff is rendered inline and the Developer accepts or rejects it before any file change is committed._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Autonomy Ladder]] (Inline Edit is the second tier), [[Capability - Inline Editing]] (the capability Inline Edit instantiates), [[Pattern - Apply-and-Review]] (the review pattern the Developer uses to accept or reject Inline Edit proposals), [[Surface - Tab]] (the tier below Inline Edit), [[Surface - Composer]] (the tier above Inline Edit)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the invocation keybinding, how context is bounded to the selection, the diff rendering format for Inline Edit proposals, the accept/reject gesture, and the behavior when no text is selected (Cursor may default to Composer)._
