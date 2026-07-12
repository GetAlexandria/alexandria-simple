---
type: Aggregate
prefLabel: "Trigger"
altLabels: ["triggers", "wake-subscriptions", "subscriptions", "Triggers (system)"]
category: [Entities]
subcategory: [automation, events]
context: triggers
altitude: pillar
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/domain/triggers.ts
  - packages/ax/src/domain/wake-subscriptions.ts
  - packages/ax/src/commands/triggers.ts
---

## WHAT
_Stub —_ Programmatic conditions that fire a play (or wake an agent) when something happens in the event stream. Per the data model: Triggers are the activation layer — their own mechanism, not part of the Ledger; they watch Ledger events, live run-state, schedule, or manual/external sources. Authority-gated; live in a registry.

## WHERE
_Stub —_ Inspectable via `ax inspect triggers`; coupled to the [[Aggregate - Ledger]] and [[Aggregate - Play]] execution; plugin guidance names Triggers a core surface.

## WHY
_Stub —_ Implies an automation/agentic-loop ambition; which triggers ship and why is NOT in code beyond the mechanism.

## WHEN
_Stub —_ Evaluated as events arrive; fire plays without manual launch.

## HOW
_Stub —_ Trigger + wake-subscription domain models; a runtime loop matches conditions and dispatches.
