---
type: System
prefLabel: Knowledge Graph
altLabels:
  - Library Graph
  - Card Graph
  - Graph
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - docs/alexandria/library/product/systems/System - Knowledge Graph.md
---

# Knowledge Graph

## WHAT: Definition

The Knowledge Graph is the typed, wikilink-connected graph structure underlying all library operations. Cards are nodes. Wikilinks (`[[Type - Name]]`) are edges. The graph has typed nodes, typed edges, and directional traversal rules. Builders interact with cards, not the graph — the graph is invisible infrastructure that makes retrieval, assembly, cascade analysis, and blast radius calculations possible. Without the Knowledge Graph, the library is a folder of files with no traversal semantics and no structural relationships.

The Knowledge Graph is stored as markdown files in a folder structure that encodes the type taxonomy, though the storage format is a separable concern. The graph abstraction — typed nodes, typed edges, directional traversal — is stable regardless of storage backend. The full system card is at [[System - Knowledge Graph]] in the existing library.

## WHERE: Ecosystem

_Stub — links to: [[System - Knowledge Graph]] (full card), [[Entity - Card]] (the nodes), [[Entity - Wikilink]] (the edges), [[System - Retrieval and Assembly Engine]] (consumes the graph), [[System - Quality Grading Engine]] (uses graph for cascade analysis)._

## WHY: Rationale

_Stub — owner-supplied. Without a graph structure, retrieval becomes keyword search rather than typed traversal. Blast radius is invisible. Cascade analysis cannot exist. The graph is what transforms isolated descriptions into a navigable knowledge system where relationships carry meaning._

## WHEN: Timeline

_Stub — established at library inception. Current implementation: markdown files with wikilink edges. Target architecture: MCP-mediated structured access. Storage format is an evolving implementation detail; the graph abstraction is stable._

## HOW: Specification

_Stub — graph properties: typed nodes (21 card types), typed edges (wikilinks with context phrases), directional traversal (card A linking to card B does not imply reverse). Traversal depth varies by node type: leaf nodes 1 hop, mid-graph nodes 2 hops, hub nodes 3 hops. The library has 208 cards and 2,174 edges as of 2026-05._
