---
type: Entity
prefLabel: Relation
altLabels:
  - Relation Property
  - Database Link
category: [Entities]
subcategory: [database-piece]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/relations-and-rollups
  - https://developers.notion.com/reference/property-object#relation
---

# Relation

## WHAT: Definition

_Stub — a [[Entity - Property]] type that creates a link between [[Entity - Page]]s in two [[Entity - Database]]s (or within the same Database). A Relation on Database A pointing to Database B adds a column to Database A where each row can reference one or more rows in Database B. The linked rows appear as clickable Page references in the cell. A Relation can be configured as one-way or two-way (synced), in which case a corresponding back-relation Property is automatically added to Database B._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Database]] (Relations link Databases), [[Entity - Property]] (Relation is a Property type), [[Entity - Rollup]] (Rollups compute aggregates across a Relation), [[Pattern - Database as Application]] (Relations are how multi-table applications are built in Notion)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: one-way vs two-way Relation configuration, the self-Relation (same Database) use case, the Page-picker UI for selecting related rows, the limit on related entries per cell, and the API shape for Relation Property values._
