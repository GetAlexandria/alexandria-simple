---
type: System
prefLabel: "Triggers"
altLabels: ["triggers", "wake-subscriptions", "subscriptions"]
category: [Systems]
subcategory: [automation, events]
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/domain/triggers.ts
  - packages/ax/src/domain/wake-subscriptions.ts
  - packages/ax/src/commands/triggers.ts
---

## WHAT
_Stub —_ Programmatic conditions that fire a play (or wake an agent) when something happens in the event stream.

## WHERE
_Stub —_ Inspectable via `ax inspect triggers`; coupled to the [[Entity - Event Ledger]] and [[Entity - Play]] execution; plugin guidance names Triggers a core surface.

## WHY
_Stub —_ Implies an automation/agentic-loop ambition; which triggers ship and why is NOT in code beyond the mechanism.

## WHEN
_Stub —_ Evaluated as events arrive; fire plays without manual launch.

## HOW
_Stub —_ Trigger + wake-subscription domain models; a runtime loop matches conditions and dispatches.
