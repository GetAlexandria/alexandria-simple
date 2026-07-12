---
type: Surface
prefLabel: Composer
altLabels:
  - Cmd-I
  - Multi-file Edit
category: [Surfaces]
subcategory: [autonomy-tier]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/composer
---

# Composer

## WHAT: Definition

_Stub — the multi-file change surface; the third tier on Cursor's autonomy ladder. The Developer opens Composer, types a natural-language instruction describing a change that may span multiple files, and Cursor proposes a complete diff across all affected files. The Developer reviews the full diff and applies it in one gesture. Composer is the primary surface for coordinated multi-file refactors, feature additions, and bug fixes where the scope is known but the implementation is delegated to the AI._

## WHERE: Ecosystem

_Stub — links to: [[Pattern - Autonomy Ladder]] (Composer is the third tier), [[Capability - Composing]] (the capability Composer instantiates), [[Pattern - Apply-and-Review]] (the review and apply pattern for Composer-proposed diffs), [[Surface - Inline Edit]] (the tier below Composer), [[Surface - Agent Surface]] (the tier above Composer), [[System - Apply Algorithm]] (the diff-and-merge mechanism used when the Developer applies a Composer proposal)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Composer is invoked, how the Developer attaches context (files, codebase symbols, web URLs), the diff review UI layout, the apply gesture, partial-apply behavior, and how Composer differs from Agent mode (Composer proposes once; Agent loops until done)._
