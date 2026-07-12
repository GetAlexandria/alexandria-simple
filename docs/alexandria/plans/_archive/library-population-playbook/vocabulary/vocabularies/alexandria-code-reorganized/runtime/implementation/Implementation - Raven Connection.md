---
type: Implementation
prefLabel: "Raven Connection"
altLabels: ["raven connection", "RavenConnectionState", "connection"]
category: [Mechanisms]
subcategory: [runtime, presence]
context: runtime
altitude: component
user_visible: false
status: implementation-detail
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/useRavenConnectionState.ts
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/connection-status.ts
---

## NOTE — not a product noun

Demoted from `type: Entity` to `type: Implementation` after applying the DDD
Ubiquitous-Language test: this is the *implementation* of agent presence/liveness,
not a noun the architect would say when describing the product. The product model
has [[Agent - Raven]] (identity), Job Title, and Play Run; whether Raven is
"connected" right now is a property of the agent's session, not a card-worthy noun.
Kept as a card for auditability of the move; do not promote without re-running the
UL test.

## WHAT
_Stub —_ The live link between the viewer and [[Agent - Raven]] running in a coding tool — connected or disconnected — that gates Raven-mediated actions.

## WHERE
_Stub —_ Drives the coin/status on [[Surface - Alexandria Home]] and the agent tray; required before "Power up Raven: Vision" is enabled.

## WHY
_Stub —_ The connection model implies Raven lives outside the web app (in a CLI/coding host); the product framing of that split is implied, not stated.

## WHEN
_Stub —_ Active while a Raven session/loop is attached to the project.

## HOW
_Stub —_ Connection summary lists active leases with owner/host/delivery; the viewer polls and derives connected/disconnected.
