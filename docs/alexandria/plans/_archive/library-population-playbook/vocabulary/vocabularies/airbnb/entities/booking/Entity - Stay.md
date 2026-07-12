---
type: Entity
prefLabel: Stay
altLabels:
  - Occupancy
  - Check-in Period
category: [Entities]
subcategory: [booking]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/1387
  - https://www.airbnb.com/help/article/220
---

# Stay

## WHAT: Definition

_Stub — the active-occupancy period within a confirmed [[Entity - Reservation]]: the window of time during which a [[Role - Guest]] is physically present at the [[Entity - Property]]. Stay is a felt-experience noun (aligned with [[Entity - Trip]]) that names the interval between check-in and check-out. The [[Pattern - Two-Sided Lifecycle]] names this state as "Stayed." Stay is distinct from Reservation (the transactional artifact) and Trip (the full Guest journey including planning and travel); Stay names specifically the on-property experience._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Reservation]] (the transactional record that governs this Stay), [[Entity - Trip]] (the felt-experience wrapper around this Stay), [[Pattern - Two-Sided Lifecycle]] (the lifecycle position of Stay within Inquire → Book → Stay → Review), [[Entity - Review]] (written after the Stay completes), [[Role - Host]] (the Host present or reachable during the Stay)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: check-in and check-out time windows; early check-in and late checkout policies; how the Stay window triggers the [[Pattern - Review Cycle]] post-departure; what happens during active Stay if an issue arises (AirCover activation, Customer Support escalation); self-check-in vs Host-greeting check-in modes._
