---
type: Pattern
prefLabel: Linked Database
altLabels:
  - Linked view
  - Linked database view
  - Inline database view
category: [Patterns]
subcategory: [reuse]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/linked-databases
---

# Linked Database

## WHAT: Definition

_Stub — the pattern of embedding a filtered and/or sorted [[Surface - Database View]] of an existing [[Entity - Database]] as an inline [[Entity - Block]] within another [[Entity - Page]]. The embedded View shows a subset of the Database's rows without creating a copy — changes to rows through the Linked Database view update the source Database. A single Database can have multiple Linked Database views across many Pages, each with its own filters and sorts, all drawing from the same underlying data._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Database]] (the source Database being linked), [[Surface - Database View]] (Linked Database creates a View instance), [[Entity - Block]] (the Linked Database embed is a Block), [[Entity - Page]] (Linked Databases are embedded within Pages), [[Capability - Filtering]] (Linked Databases are typically filtered), [[Capability - Embedding]] (Linked Database is a form of Embedding)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the creation flow ("/Linked view of database" command), the filter and sort configuration on the linked View instance, the distinction between a Linked Database (filtered view of an existing Database) and a new inline Database (creates a new Database), and the behavior when the source Database is deleted._
