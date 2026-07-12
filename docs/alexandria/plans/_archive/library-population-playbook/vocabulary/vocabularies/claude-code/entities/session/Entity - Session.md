---
type: Entity
prefLabel: Session
altLabels:
  - Conversation
  - Thread
category: [Entities]
subcategory: [session]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code/memory
---

# Session

## WHAT: Definition

_Stub — the durable conversation transcript between a User and the Agent. A Session accumulates messages, Tool call records, and observations across a single continuous engagement. Sessions survive CLI invocations — a User can resume a prior Session, restoring its context. Sessions are distinct from Memory: the Session is the transcript (what was said and done), while Memory is the persistent knowledge loaded at Session start (what the Agent knows going in)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Workspace]] (a Session is associated with a Workspace), [[Entity - Memory]] (Memory is loaded at Session start, separate from the Session transcript), [[Entity - Checkpoint]] (a captured point in Session state), [[Role - Agent]] (the Agent runs within a Session), [[Role - User]] (the User initiates and resumes Sessions)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Session creation, resumption mechanics, how Session history is stored and retrieved, Session compaction behavior when the Context Window fills, and how `/clear` relates to Session vs Memory._
