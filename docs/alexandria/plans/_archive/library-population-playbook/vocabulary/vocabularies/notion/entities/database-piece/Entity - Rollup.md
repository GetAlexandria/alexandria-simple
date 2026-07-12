---
type: Entity
prefLabel: Rollup
altLabels:
  - Rollup Property
  - Aggregation
category: [Entities]
subcategory: [database-piece]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/relations-and-rollups
  - https://developers.notion.com/reference/property-object#rollup
---

# Rollup

## WHAT: Definition

_Stub — a computed [[Entity - Property]] type that aggregates values from a target [[Entity - Property]] across all [[Entity - Page]]s linked via a [[Entity - Relation]]. For example: a Tasks Database related to a Projects Database can have a Rollup on Projects that counts the number of related Tasks, sums their estimated hours, or shows the latest due date. Rollup functions include: Count, Count Values, Count Unique Values, Count Empty, Count Not Empty, Sum, Average, Median, Min, Max, Range, Show Original, Show Unique, and date-specific aggregations._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Relation]] (a Rollup requires a Relation to traverse), [[Entity - Property]] (Rollup is a Property type), [[Entity - Database]] (Rollups appear as columns in the Database that owns them), [[Pattern - Database as Application]] (Rollups enable derived computed fields in Notion-as-CRUD-app)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the Rollup configuration flow (select Relation → select target Property → select aggregation function), the full function list and their input type requirements, the date rollup display options, and the API shape for Rollup Property values._
