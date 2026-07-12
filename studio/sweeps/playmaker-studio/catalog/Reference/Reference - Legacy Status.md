---
type: Reference
prefLabel: Legacy Status
context: catalog
plane: Product
status: stub
altitude: component
altLabels: [status, legacy ladder]
source_evidence:
  - studio/plays/registry.js:17
  - studio/plays/registry.js:91
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Stage
    - Entity - Board State
---

## WHAT
The archeological `status:` field on each registry row (slot → designed → hardened
→ derived → proven → registered) — the early-era proving ladder that predates the
Board. It is NO LONGER the source of truth for production stage; it is a degraded
fallback seed only, slated for removal.

## WHERE
`registry.js` (the `status` header comment "LEGACY / archeological"; the per-row
`status:` values).

## HOW
Legacy Status names the same idea the [[Mechanism - Stage]] now owns, but the
authoritative stage lives in [[Entity - Board State]]. Proposed for demotion to a
deprecation note (see HOT-SPOTS); the hardening *step* it half-names is alive, only
the status *name* is archeological.
