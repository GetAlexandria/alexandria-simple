---
type: System
prefLabel: Sync Block
altLabels:
  - Synced block
  - Synchronized block
category: [Mechanisms]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/synced-blocks
---

# Sync Block

## WHAT: Definition

_Stub — a [[Entity - Block]] type that shares its content across multiple [[Entity - Page]]s with a single source of truth. One instance of a Sync Block is the original; all other instances are synced copies. Editing any copy updates the original and all other copies simultaneously. Sync Blocks are used to maintain consistent content (e.g., a meeting agenda template, a notice, a navigation block) across multiple Pages without manual duplication._

_The compound name "Sync Block" (two plain words, following [[Standard - Notion Nomenclature Signature]] rule 2) names the feature from what it does for the user: the block synchronizes. This is aesthetics-first naming — the user's felt experience is that editing one copy updates the others — not mechanism-naming (the underlying reference graph is invisible). The noun passes the MDA test._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Block]] (Sync Block is a Block type), [[Entity - Page]] (Sync Blocks can appear on multiple Pages simultaneously), [[System - Block Tree]] (each Page's Block Tree contains a reference to the Sync Block's source node), [[Entity - Template]] (Sync Blocks are sometimes used in Templates to push updates to all instantiated Templates)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the Sync Block creation flow (create original → copy and paste as synced copy), the visual indicator distinguishing original from copy, the "detach" action that breaks the sync relationship, the behavior when the original Block is deleted, and the Sync Block API representation._
