---
type: System
prefLabel: DAG Engine
altLabels:
  - Dependency Graph Engine
  - alxndr dag
  - Dependency Validator
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - DAG Engine.md
---

# DAG Engine

## WHAT: Definition

_Stub — the DAG Engine (`bin/alxndr dag`) is a deterministic CLI tool that takes a plan directory with outcome and ticket markdown files and produces structured dependency graph output: consistency validation, cycle detection, orphan detection, phase computation, and critical path analysis. The engine enforces graph correctness that LLMs cannot reliably compute. Dependency ordering, acyclicity, and bidirectional relationship consistency are deterministic problems that require exact answers — not LLM judgment. The full system card is at [[System - DAG Engine]] in the existing library._

## WHERE: Ecosystem

_Stub — links to: [[System - DAG Engine]] (full card), [[Entity - Plan]] (the DAG Engine validates Plans), [[Capability - Implementation Planning]] (produces the plans the DAG Engine validates)._

## WHY: Rationale

_Stub — owner-supplied. The DAG Engine exists because dependency ordering cannot be delegated to an LLM — it must be computed exactly._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub._
