---
type: Entity
prefLabel: Property
altLabels:
  - Database Property
  - Column
  - Field
category: [Entities]
subcategory: [database-piece]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/database-properties
  - https://developers.notion.com/reference/property-object
---

# Property

## WHAT: Definition

_Stub — a typed column in a [[Entity - Database]] schema. Every row-[[Entity - Page]] in a Database has a value for each Property. Property types include: Title (required, the Page name), Text, Number, Date, Select (single-choice), Multi-select, Checkbox, URL, Email, Phone, Person (a Workspace Member), Files, Status, [[Entity - Relation]] (link to another Database), and [[Entity - Rollup]] (computed aggregate). Properties appear both in the Database View as column headers and on the individual Page as a metadata panel._

_The name is deliberate pedagogical borrowing from spreadsheet vocabulary — "Property" maps to "column" in a spreadsheet or "field" in a form. Notion chose "Property" over "Column" or "Field" because it generalizes to both the Database context (where columns apply) and the individual Page context (where the same data appears as page properties in the metadata panel). The term appears in the Notion API as well, bridging the user-facing and developer-facing vocabularies. This is the `families.md` "database vocabulary borrowed from spreadsheets/RDBMS" pattern done deliberately to lower onboarding cost for spreadsheet-literate users._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Database]] (Properties define a Database's schema), [[Entity - Relation]] (a Property type that creates a foreign-key link), [[Entity - Rollup]] (a computed Property type), [[Capability - Filtering]] (Filtering constrains Database Views by Property predicates), [[Capability - Sorting]] (Sorting orders a Database View by a Property)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the full Property type list with value formats, the schema-editing flow (add/rename/delete/reorder Properties), Property visibility settings per View, the formula Property type (computed values), and the API shape for Property objects._
