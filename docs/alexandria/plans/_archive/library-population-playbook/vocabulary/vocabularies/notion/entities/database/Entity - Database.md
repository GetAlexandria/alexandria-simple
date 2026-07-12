---
type: Entity
prefLabel: Database
altLabels:
  - Notion Database
  - Table
  - Collection
category: [Entities]
subcategory: [database]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/intro-to-databases
  - https://developers.notion.com/reference/database
---

# Database

## WHAT: Definition

_Stub — a queryable collection of [[Entity - Page]]s that share a common schema defined by [[Entity - Property]]s. A Database is the "Record" pole of the `families.md` Document-vs-Record axis; it is what distinguishes Notion from a pure note-taking product. Databases can be filtered, sorted, and grouped via [[Entity - Property]] values, and can be displayed in multiple layouts via [[Surface - Database View]]: Table, Board, Calendar, Gallery, List, and Timeline._

_The Page-vs-Database cut is Notion's load-bearing ontological distinction. The crucial detail: every row in a Database is itself a [[Entity - Page]] with a full body, sub-pages, and all Block composition affordances. A Database row is not a stripped-down record — it is a full Page that happens to share a schema with its siblings. This means a user can build a project tracker (Database) where each project row (Page) contains a full brief, meeting notes Sub-pages, linked databases, and embedded media. The duality collapses the distinction between "document tool" and "database tool" — Notion is both simultaneously, bound by the single concept that every row is a Page. Directors building document-plus-database tools should treat this as the canonical example of how to resolve the Document-vs-Record tension: not by choosing one, but by making the Item noun (Page) serve both roles._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Page]] (every Database row is a Page; a Database can also live inline within a Page as a Block), [[Entity - Property]] (Properties define the schema columns of a Database), [[Entity - Relation]] (a Property type that links this Database to another), [[Entity - Rollup]] (a computed Property that aggregates across a Relation), [[Surface - Database View]] (the multi-layout rendering surface for a Database), [[Pattern - Database as Application]] (the pattern of building a CRUD app from a Database)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Database creation flows (new full-page database vs inline database Block vs linked database), Property schema editing, the six View types and their layout rules, the Filter and Sort mechanics, the Database template gallery, and the API object shape for Database vs Page._
