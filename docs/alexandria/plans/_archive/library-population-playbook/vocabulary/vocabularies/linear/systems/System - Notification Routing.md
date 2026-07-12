---
type: System
prefLabel: Notification Routing
altLabels:
  - Notification Rules
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://linear.app/docs/notifications
---

# Notification Routing

## WHAT: Definition

_Stub — the rules deciding which Role gets notified when which event fires on which Entity. Notification Routing is tunable per Member via notification preferences: a Member can suppress certain event types, change delivery channels (in-app Inbox vs email vs Slack), or mute specific Issues or Projects. Like the [[System - Permission Model]], `user_visible: false` reflects that users don't encounter this as a named system; they encounter its outputs — their [[Surface - Inbox]] fills or stays quiet based on these rules._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Inbox]] (the primary surface Notification Routing populates), [[Role - Member]] (each Member has tunable routing preferences), [[Capability - Commenting]] (mention events are a primary routing trigger), [[Capability - Assigning]] (Assigning events trigger routing to the new assignee)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the event taxonomy that routing rules operate on (assignment, mention, state change, comment, due-date, etc.); the delivery channel options (in-app, email, Slack, GitHub); per-Issue muting; how Team-level notification defaults are set by Admin; the interaction between routing rules and @-mention syntax._
