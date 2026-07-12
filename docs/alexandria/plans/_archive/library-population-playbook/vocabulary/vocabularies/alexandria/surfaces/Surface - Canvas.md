---
type: Surface
prefLabel: Canvas
altLabels:
  - Main Canvas
  - Working Surface
category: [Surfaces]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/plans/canvas-library-spike/
  - memory/canvas-raven-architecture.md
---

# Canvas

## WHAT: Definition

_Stub — the Canvas is Alexandria's main demo working surface — the primary UI zone where the Director's session plays out. The Canvas is software-only (forms, state, agent output rendering); it does not host chat. Raven lives in the coding tool (Claude Code), and hooks bridge them. The Canvas is where modules unroll, where cards are displayed, and where agent output appears as structured forms rather than raw text. The canvas-library spike (prototype at docs/alexandria/plans/canvas-library-spike/) established the Canvas concept._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Library]] (the Library tab is part of the Canvas UI), [[Surface - Info Hub]] (the Info Hub tab is part of the Canvas UI), [[Role - Raven the Maven]] (Raven lives in Claude Code, not the Canvas — a deliberate architecture choice)._

## WHY: Rationale

_Stub — owner-supplied. Canvas is software-only because putting chat on the canvas collapses the distinction between the Director's thinking tool (Raven in Claude Code) and the product's display surface. Chat on canvas is an anti-pattern._

## WHEN: Timeline

_Stub — Canvas as a concept was prototyped in the canvas-library-spike. It is not yet shipped in production._

## HOW: Specification

_Stub._
