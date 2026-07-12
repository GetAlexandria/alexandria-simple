---
type: Entity
prefLabel: Workspace
altLabels:
  - Repository
  - Project
  - Working directory
  - Repo
category: [Entities]
subcategory: [workspace]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Workspace

## WHAT: Definition

_Stub — the current working directory; the codebase or project the Agent operates on. The Workspace is the primary scope boundary: Tool calls (Read, Edit, Bash, Glob, Grep) are relative to the Workspace root. Memory files (CLAUDE.md) are anchored to the Workspace. The Agent's understanding of "this project" is the Workspace._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Memory]] (CLAUDE.md lives at the Workspace root), [[Entity - Session]] (a Session is associated with a Workspace), [[Entity - Tool]] (Tools operate within Workspace boundaries), [[Role - User]] (the User opens a Workspace to start working)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how the Workspace is detected (cwd at invocation), whether multiple Workspaces can be open in one Session, and the rules for CLAUDE.md lookup (current dir → parent dirs)._
