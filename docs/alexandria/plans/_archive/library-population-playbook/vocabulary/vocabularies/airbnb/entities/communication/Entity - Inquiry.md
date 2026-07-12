---
type: Entity
prefLabel: Inquiry
altLabels:
  - Pre-Booking Message
  - Guest Question
category: [Entities]
subcategory: [communication]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/188
  - https://www.airbnb.com/help/article/217
---

# Inquiry

## WHAT: Definition

_Stub — a pre-booking communication sent by a [[Role - Guest]] to a [[Role - Host]] before submitting a formal [[Capability - Booking]] request. An Inquiry opens a [[Entity - Thread]] and lets the Guest ask questions about the [[Entity - Listing]] without committing to a booking. The Host is notified and can respond, pre-approve the dates, or decline. Inquiry is the earliest state in the [[Pattern - Two-Sided Lifecycle]] — the Inquired state precedes Requested/Booked. Airbnb's response-rate metrics for Hosts count Inquiry responses._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Thread]] (the conversation thread an Inquiry initiates), [[Entity - Message]] (the atomic message unit; Inquiry is a typed Message), [[Pattern - Two-Sided Lifecycle]] (Inquiry is the Inquired state at the start of the lifecycle), [[Role - Guest]] (the Inquiry sender), [[Role - Host]] (the Inquiry recipient), [[Entity - Reservation]] (the potential Reservation an Inquiry might lead to)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Inquiry vs. Booking Request distinction (Inquiry is non-binding; Request requires Host acceptance and payment authorization); how a Host pre-approves an Inquiry (sends a pre-approval link the Guest can then convert to a Booking Request); how Inquiry response time is measured and affects Host metrics; Inquiry content requirements._
