---
type: Entity
prefLabel: Workspace
altLabels:
  - Project
  - Codebase
category: [Entities]
subcategory: [workspace-artifact]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com/context/codebase-indexing
---

# Workspace

## WHAT: Definition

_Stub — the opened folder or project that Cursor operates on. The Workspace is the boundary within which the Index is built, Rules apply, and Agent actions are scoped. When a Developer opens a folder in Cursor, that folder becomes the Workspace for the session._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Index]] (the Index is built over the Workspace's files), [[Entity - Rule]] (Rules are scoped to the Workspace), [[Entity - File]] (Files are the atomic addressable units within a Workspace), [[Role - Agent]] (Agent actions are bounded by the Workspace unless a Background Agent is used)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how a Workspace is opened, how Cursor detects project type, the relationship between Workspace and git root, and multi-root workspace behavior._
