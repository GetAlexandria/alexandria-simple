---
type: System
prefLabel: Eval Harness
altLabels:
  - Eval Framework
  - Evaluation Harness
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Eval Harness.md
---

# Eval Harness

## WHAT: Definition

_Stub — the Eval Harness is a reusable framework for testing conversational skills end-to-end. It runs scripted or adaptive inputs through a skill, records full transcripts, evaluates results with deterministic structural checks and LLM-as-Judge quality criteria, and compares against checked-in baselines for regression detection. The Harness is the concrete implementation of "measure before promoting" — no skill change is promoted without evidence that it improves or at least does not regress outcomes. The full system card is at [[System - Eval Harness]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[System - Eval Harness]] (full card), [[Role - Maintainer]] (the Harness is the Maintainer's quality gate), [[Pattern - Eval-Driven Skill Improvement]] (the loop the Harness enables)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — the Harness stores checked-in baselines. Quality cannot silently regress below a checked-in baseline. Each new baseline becomes the new floor._
