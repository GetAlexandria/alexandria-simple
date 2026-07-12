---
type: Entity
prefLabel: "Raven Connection"
altLabels: ["raven connection", "RavenConnectionState", "connection"]
category: [Entities]
subcategory: [runtime, presence]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/useRavenConnectionState.ts
  - packages/viewer/src/app/runtime/schemas.ts
  - packages/ax/src/domain/connection-status.ts
---

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
