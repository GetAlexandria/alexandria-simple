---
type: Surface
prefLabel: Stream
altLabels:
  - Streaming output
  - Token stream
  - Live output
category: [Surfaces]
subcategory: [input-output]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
---

# Stream

## WHAT: Definition

_Stub — the live token-by-token render of the Agent's output. As the Agent generates its response, tokens appear in the CLI (or IDE Extension Pane) incrementally rather than arriving all at once when generation is complete. The Stream gives the User real-time visibility into what the Agent is producing — critical for long-running tasks where the User needs to know whether the Agent is on track before it finishes._

## WHERE: Ecosystem

_Stub — links to: [[Surface - CLI]] (the Stream is rendered in the CLI), [[Surface - IDE Extension Pane]] (the Stream is also rendered in the IDE pane), [[Role - Agent]] (the Agent emits the Stream), [[Role - User]] (the User reads and monitors the Stream), [[Economy-instance - Context Window]] (Stream output accumulates in the Context Window)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: how Tool call progress is displayed within the Stream (in-progress indicator, completed marker), how the User interrupts a Stream mid-generation, and how Streams differ across CLI vs IDE Extension Pane rendering._
