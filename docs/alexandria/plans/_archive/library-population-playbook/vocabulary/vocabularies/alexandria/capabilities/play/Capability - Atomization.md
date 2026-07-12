---
type: Capability
prefLabel: Atomization
altLabels:
  - Atomic Decomposition
  - Card Decomposition
category: [Capabilities]
subcategory: [play]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/primitives/Primitive - Card.md
  - docs/alexandria/library/rationale/principles/Principle - One Concept Per Card.md
  - docs/alexandria/library/product/artifacts/Artifact - Decision 2: Atomic Documentation.md
---

# Atomization

## WHAT: Definition

Atomization is the capability of breaking a Source of Truth document (design doc, strategy memo, research note, executive directive) into atomic cards — each encoding exactly one claim. Atomization is the first transformation step in the library construction pipeline: source material arrives as connected prose; Atomization splits it into discrete typed cards that the Knowledge Graph can traverse. The One Concept Per Card principle governs Atomization's success criterion: a card that encodes two claims is an Atomization failure.

Atomization is primarily Conan's and Sam's shared responsibility: Conan's Inventory capability defines the expected cards (deciding what to atomize), Sam's Card Building capability creates them (executing the atomization). The Director's judgment governs what counts as one claim vs two.

## WHERE: Ecosystem

_Stub — links to: [[Capability - Card Building]] (Sam's execution of Atomization), [[Capability - Inventory]] (Conan's planning of what to atomize), [[Principle - One Concept Per Card]] (the governing quality criterion), [[Entity - Card]] (the output of Atomization)._

## WHY: Rationale

_Stub — owner-supplied. Atomization is the foundational bet documented in Decision 2: Atomic Documentation. Without atomization, the library is a set of prose documents that are hard to retrieve, version, and traverse._

## WHEN: Timeline

_Stub — Decision 2 (Atomic Documentation) established atomization as a first-class design principle at product inception._

## HOW: Specification

_Stub — Atomization procedure: identify the distinct claims in a source document; assign each claim to a type (Standard, Principle, System, etc.); write one card per claim. Anti-example: a card titled "System - Authentication and Authorization" that covers both topics — two claims merged into one card is an Atomization failure._
