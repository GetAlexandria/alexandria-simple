---
type: System
prefLabel: Block Tree
altLabels:
  - Block hierarchy
  - Content tree
  - Block AST
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://developers.notion.com/reference/block
  - https://www.notion.com/help/what-is-a-block
---

# Block Tree

## WHAT: Definition

_Stub — the AST-style hierarchical structure underlying every [[Entity - Page]]. Each [[Entity - Block]] has exactly one parent (either a Page or another Block) and an ordered list of children Blocks. The Block Tree is the data model that represents a Page's content: the top-level Page object is the root; its direct Blocks are first-level children; a toggle Block or column Block contains child Blocks nested beneath it. The Block Tree is the mechanism that makes [[Capability - Embedding]] and [[Entity - Sub-page]] nesting possible — a Sub-page is a Block of type "child_page" in the parent's tree._

_This is an internal system exposed at the API level (the Notion API returns Block objects with parent and children relationships) but not directly named in the product UI. The noun "Block Tree" is used in developer documentation, not end-user documentation. It is banked here as `user_visible: false` because the underlying structure is aesthetically felt by users (who see blocks nesting inside toggles and columns) but the tree-as-a-named-concept is a developer concern._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Block]] (the node type in this tree), [[Entity - Page]] (the root of each Page's Block Tree), [[System - Sync Block]] (Sync Blocks reference a source Block in a different tree), [[Entity - Sub-page]] (Sub-pages are child_page Blocks in the tree)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the API Block object shape (id, parent, type, has_children, created_time, last_edited_time), the maximum nesting depth, the Block retrieval pagination rules, the Block update and deletion API behaviors, and the Block Tree traversal pattern used by integrations._
