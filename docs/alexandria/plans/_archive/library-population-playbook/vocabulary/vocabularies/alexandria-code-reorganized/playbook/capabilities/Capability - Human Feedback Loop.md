---
type: Capability
prefLabel: "Human-in-the-Loop Feedback"
altLabels: ["needs_human_feedback", "play answer", "reactions", "frame-the-problem riff"]
category: [Capabilities]
subcategory: [collaboration, plays]
context: playbook
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/commands/play-answer.ts
  - packages/ax/src/domain/reactions.ts
  - packages/alexandria-plugin/workflows/frame-the-problem/prompts/revise.md
---

## WHAT
_Stub —_ The capability for a running play to pause, surface a draft, and wait for a human reaction before continuing — a non-blocking review/riff loop.

## WHERE
_Stub —_ Surfaced as the `needs_human_feedback` state on a [[Aggregate - Play Run]]; answered via `ax play answer` / reactions; visible in [[Surface - Play Tracker]].

## WHY
_Stub —_ The product clearly wants agents mediated by human judgment at key beats; the philosophy ("never self-answer") is implied by the model, not documented in code.

## WHEN
_Stub —_ At human/review moves inside a play (e.g. the frame-the-problem "Riff").

## HOW
_Stub —_ A waiting move emits a feedback request; a director sends a reaction (answer) back; the play resumes from the event log.
