---
type: Pattern
prefLabel: Two-Sided Lifecycle
altLabels:
  - Marketplace Lifecycle
  - Booking Lifecycle
  - Reservation Lifecycle
category: [Patterns]
subcategory: [lifecycle]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/461
  - https://www.airbnb.com/help/article/1387
---

# Two-Sided Lifecycle

## WHAT: Definition

_Stub — the canonical marketplace lifecycle that every [[Entity - Reservation]] in Airbnb moves through: Inquired → Requested → Confirmed → Active Stay → Completed → Reviewed. Each state has distinct transition rules — an Inquiry doesn't commit money; a Confirmed Reservation holds [[Entity - Payment]]; an Active Stay has begun and the [[System - AirCover]] clock is running; a Completed Stay triggers the [[Pattern - Review Cycle]]. The lifecycle is "two-sided" because at each state, both [[Role - Guest]] and [[Role - Host]] have distinct obligations and available actions. Guest Cancelling and Host Cancelling have different outcomes at the same lifecycle state._

_This is the canonical marketplace Pattern — the named exemplar for how Airbnb sequences a transaction from discovery to trust. Cross-link: [[Entity - Reservation]] (the Entity that carries this lifecycle)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Reservation]] (the Entity this lifecycle governs), [[Entity - Trip]] (the Guest-facing view of the same lifecycle), [[Entity - Inquiry]] (the Inquired state's artifact), [[Pattern - Review Cycle]] (the pattern that runs after the Completed state), [[Pattern - Cancellation]] (the pattern for mid-lifecycle interruption), [[Capability - Booking]] (the transition to Confirmed state)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: full state-transition diagram with triggering events; which party can initiate each transition; payment hold and capture timing relative to states; how modification requests (date changes, guest count changes) interact with lifecycle state; how the Reviewed state closes permanently vs how review reminders work._
