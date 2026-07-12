---
type: Entity
prefLabel: Memory
altLabels:
  - CLAUDE.md
  - Persistent memory
  - Project memory
  - User memory
category: [Entities]
subcategory: [session]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/memory
---

# Memory

## WHAT: Definition

_Stub — durable cross-session knowledge available to the Agent. Memory is distinct from Context (the current window): Memory persists after a Session ends and is loaded at the start of each new Session. Claude Code implements Memory in two forms: file-based Memory (CLAUDE.md files in the Workspace, which the User writes and maintains) and harness-managed Memory (persisted by the harness across Sessions without explicit file management by the User)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Workspace]] (CLAUDE.md files are anchored to the Workspace), [[Entity - Session]] (Memory is loaded at Session start, separate from the Session transcript), [[Economy-instance - Context Window]] (Memory consumes Context Window budget when loaded), [[Role - User]] (the User writes and manages CLAUDE.md files), [[Capability - Memory Recall]] (the act of reading and writing Memory)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the CLAUDE.md lookup hierarchy (project root → parent dirs → user home), the harness-managed memory format, how Memory is loaded into the Context Window at Session start, and the User's gesture for updating Memory (direct file edit vs agent-auto-update)._
