---
type: Entity
prefLabel: Rule
altLabels:
  - Cursor Rule
  - Project Rule
  - User Rule
category: [Entities]
subcategory: [configuration]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/context/rules
---

# Rule

## WHAT: Definition

_Stub — a declarative instruction authored by the Developer that guides agent behavior across Tab, Composer, and Agent surfaces. Rules can be scoped to the project (stored in `.cursorrules` or the `Rules` UI) or set globally per Developer. Rules persist across sessions and are injected into the agent's context at the start of each relevant interaction._

## WHERE: Ecosystem

_Stub — links to: [[Entity - .cursorrules]] (the file-based artifact for project-scoped Rules), [[Role - Developer]] (the Developer authors Rules), [[Role - Agent]] (the Agent reads Rules as part of its operating context), [[Entity - Workspace]] (project-scoped Rules are bound to the Workspace)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Rule authoring UI location, Rule scope hierarchy (global > project > file-type), `.cursorrules` format, how Rules are injected into context, and Rule character/token limits._
