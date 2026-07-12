---
type: Capability
prefLabel: Linting
altLabels:
  - Structural Linting
  - alxndr lint
category: [Capabilities]
subcategory: [play]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/capabilities/Capability - Linting.md
---

# Linting

## WHAT: Definition

_Stub — Linting is the capability where `alxndr lint` runs six levels of deterministic, boolean structural checks across the entire library. Linting is always before Grading in the pipeline: structure before substance. Linting answers only yes/no questions (is this link broken? is this card in the wrong folder? does this card have five sections?) — there is no judgment involved. It runs as a CLI tool, not as an agent. The full capability card is at [[Capability - Linting]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Linting]] (full card), [[Capability - Grading]] (Linting runs before Grading, as pre-screen), [[Surface - Card Repository]] (the target of lint sweeps), [[Entity - Wikilink]] (Linting's graph target checks broken wikilinks)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — six sweep levels: lines (markdown hygiene), cards (five-section structure, naming convention, folder placement), graph (broken wikilinks, orphan cards), layers (cross-layer links), library (coverage metrics), and specialized targets (grades, plans, wizard). Every check is deterministic: a broken link is a broken link._
