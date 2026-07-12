---
type: Capability
prefLabel: Memory Recall
altLabels:
  - Reading memory
  - Memory access
  - CLAUDE.md loading
category: [Capabilities]
subcategory: []
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/memory
---

# Memory Recall

## WHAT: Definition

_Stub — the act of reading and writing persistent Memory (CLAUDE.md files and harness-managed memory). At Session start, the Agent loads Memory into the Context Window. During a Session, the Agent can write to Memory files to capture knowledge that should persist beyond the current Session. Memory Recall is the bridge between the ephemeral (the current Context Window) and the durable (the Memory files that survive across Sessions)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Memory]] (the Memory being recalled), [[Entity - Session]] (Memory is loaded at Session start), [[Economy-instance - Context Window]] (loaded Memory consumes Context Window budget), [[Entity - Workspace]] (CLAUDE.md files are located relative to the Workspace), [[Role - User]] (the User can explicitly ask the Agent to write to Memory)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the automatic Memory load at Session start, the Agent's gesture for writing to Memory, the CLAUDE.md lookup hierarchy, and the distinction between the Agent writing Memory and the User directly editing CLAUDE.md._
