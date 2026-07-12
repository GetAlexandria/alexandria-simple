---
type: System
prefLabel: Wizard Configuration Engine
altLabels:
  - Wizard
  - Configuration Wizard
  - WCE
category: [Mechanisms]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Wizard Configuration Engine.md
---

# Wizard Configuration Engine

## WHAT: Definition

_Stub — the Wizard Configuration Engine accepts three inputs (AI Mode, Domain Novelty, Product Complexity) and produces tiered knowledge area assignments across 22 knowledge areas organized into five domains. It operates through a pipeline: inputs determine pool membership via a non-compensatory gate, sensitivity profiles map each in-pool area's response to novelty and complexity, the max() combination rule resolves dual-axis areas, and three explicit anomaly overrides handle interaction effects. This produces 36 distinct configurations. The Wizard is the entry point for a new Director setting up their first library. The full system card is at [[System - Wizard Configuration Engine]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[System - Wizard Configuration Engine]] (full card), [[System - Gap Analysis Engine]] (downstream — takes Wizard output and compares against existing library state), [[Role - Director]] (the Wizard's user)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — three inputs: AI Mode (4 options), Domain Novelty (3 options), Product Complexity (3 options) = 36 configurations. Four tiers: Foundation, Core, Amplifier, Deprioritized. Non-compensatory gate: a failing score on any gate dimension cannot be compensated by higher scores on others._
