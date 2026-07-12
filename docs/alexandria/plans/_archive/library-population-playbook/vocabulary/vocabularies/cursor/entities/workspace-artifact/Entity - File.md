---
type: Entity
prefLabel: File
altLabels:
  - Source File
  - Document
category: [Entities]
subcategory: [workspace-artifact]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com
---

# File

## WHAT: Definition

_Stub — a text file within the Workspace. Files are the primary unit of content that Tab, Inline Edit, Composer, and Agent read and write. The Indexing Pipeline processes Files to build the semantic Index; Composer and Agent propose changes to Files as diffs; Applying commits those diffs to the File on disk._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Workspace]] (Files exist within a Workspace), [[Entity - Index]] (Files are the source material the Index is built from), [[Capability - Applying]] (Applying commits proposed changes to a File), [[System - Indexing Pipeline]] (the pipeline that processes Files into the Index)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: file types supported for indexing, binary file handling, gitignore-based exclusion, and the diff format used when Composer or Agent proposes File changes._
