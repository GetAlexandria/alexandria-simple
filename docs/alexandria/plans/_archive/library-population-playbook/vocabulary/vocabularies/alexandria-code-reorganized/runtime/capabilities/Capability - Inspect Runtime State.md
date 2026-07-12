---
type: Capability
prefLabel: "Inspect Runtime State"
altLabels: ["ax inspect", "doctor", "events", "triggers"]
category: [Capabilities]
subcategory: [observability, admin]
context: runtime
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/ax/src/commands/inspect.ts
  - packages/ax/src/commands/doctor.ts
  - packages/ax/src/commands/events.ts
  - packages/ax/src/commands/triggers.ts
---

## WHAT
_Stub —_ The capability to read and validate the project's runtime: derived state, the event ledger, triggers, and orchestration readiness.

## WHERE
_Stub —_ `ax inspect state|events|triggers` and `ax doctor`; the data behind [[Surface - Ledger]] and Studio run views; reads the [[Aggregate - Ledger]].

## WHY
_Stub —_ A deterministic inspection surface implies a debuggability commitment; the product priorities here are implied, not stated.

## WHEN
_Stub —_ During development, debugging a run, or verifying setup.

## HOW
_Stub —_ Subcommands list/append/validate events against a schema, dump state projections, list triggers, and check orchestration health.
