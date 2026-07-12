---
plane: product
status: stub
confidence: medium
altitude: pillar
altLabels:
  - Structure
  - the Dewey Decimal system of the product
evidence:
  - docs/alexandria/plans/library-word-legibility/knowledge-organization-brief.md
  - docs/alexandria/plans/library-word-legibility/taxonomy-state-of-the-state.md
links:
  contains:
    - Entity - Company
    - Entity - Domain
    - Entity - Library
    - Entity - Plane
    - Entity - Context
    - Entity - Type
    - Entity - Altitude
    - Entity - Atomic Card Category
  related_to:
    - Entity - Atomic Card
    - Pattern - The Approach
  relegates:
    - Entity - Rationale
    - Entity - Research
    - Entity - Roles
    - Entity - Surfaces
    - Entity - Entities
    - Entity - Capabilities
    - Entity - Mechanisms
    - Entity - Patterns
    - Entity - Economy
---

## WHAT

The system by which Alexandria organizes a library: the containment
hierarchy that gives the graph its shape, the two axes that classify
every card in it, and the names those choices go by. It is the Dewey
Decimal system of the product — the metaschema that classifies every
card in the library, this one included, is defined here. Not only the
boxes but the words: what a thing is called matters as much as where
it is filed.

## WHY

A graph only pays off the wager that atomized, typed, linked cards
compose better than prose,
[[Bet - Atomic, Agent-Readable Knowledge|the wager on atomic knowledge]],
if the scheme classifying its containers and
its nouns is itself written down rather than invented card by card as the
library grows. Naming the containers and the axes is also what keeps the
whole structure navigable to a human director rather than a hairball only
a machine can traverse, [[Principle - Legible Graph]].

## WHERE

A Context on the Product plane, alongside Library, Playbook, and the
rest.

## HOW

[[Entity - Company]] sits at the top, grouping a set of Domains; each
[[Entity - Domain]] groups a set of Planes, and a Domain's Planes
together make up its [[Entity - Library]] — the whole graph being
organized. A [[Entity - Plane]] groups the
[[Entity - Context|Contexts]] a working area is organized at; a
Context, in turn, holds the [[Entity - Atomic Card]] — the unit every
other concept here classifies. Every Atomic Card carries two
independent classifying axes: [[Entity - Type]], which names the kind
of product-noun it is, and [[Entity - Altitude]], which names how big a
piece of the system it is and whether it carries its own lifecycle. Type
draws its values from the [[Entity - Atomic Card Category]], the
fourteen-bucket metaschema every card's Type is filed under — Bet,
Principle, Research, Experiment, Measure, Arc, Roles, Domains, Surfaces,
Entities, Capabilities, Mechanisms, Patterns, and Economy, each carded
one level down with its own definition and its nearest neighbor. (Rationale, the retired
catch-all the Bet and Principle buckets grew out of, stays carded as
vocabulary history.) None of this is frozen:
[[Pattern - The Approach]] is the current method — Domain-Driven
Design's structural grain crossed with this families taxonomy — and it
governs every concept named here, itself open to revision as the
Strategy and Learning planes evolve it.
