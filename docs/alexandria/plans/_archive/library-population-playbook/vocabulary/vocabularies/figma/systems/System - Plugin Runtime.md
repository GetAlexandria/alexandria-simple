---
type: System
prefLabel: Plugin Runtime
altLabels:
  - Plugin API
  - Plugin Sandbox
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.figma.com/plugin-docs/
---

# Plugin Runtime

## WHAT: Definition

_Stub — the sandboxed JavaScript execution environment that hosts third-party and first-party plugins within the Figma editor. Plugins run in an iframe with access to the Figma Plugin API, which exposes a read/write interface to the document tree. The Plugin Runtime isolates plugin code from Figma's main thread for security and stability; plugins cannot access user credentials or Files outside the current session._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Assets Panel]] (Plugins are surfaced and launched from the Assets Panel), [[Entity - File]] (the Plugin Runtime operates on the currently open File), [[Role - Admin]] (Admins can restrict Plugin access at org level), [[Entity - Component]] (many Plugins generate or modify Components programmatically)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the Plugin API surface (document tree access, network access restrictions, UI thread vs main thread model), the plugin manifest format, the Community plugin review process, and enterprise Plugin allowlisting._
