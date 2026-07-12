---
type: Capability
prefLabel: Booking
altLabels:
  - Book
  - Request to Book
  - Instant Book
  - Reserve
category: [Capabilities]
subcategory: [guest-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/461
  - https://www.airbnb.com/help/article/139
---

# Booking

## WHAT: Definition

_Stub — the [[Role - Guest]]'s transacting action: completing the [[Surface - Booking Flow]] to create a confirmed [[Entity - Reservation]] against an [[Entity - Listing]]. Booking has two modes: Instant Book (Reservation confirmed automatically without Host action required) and Request to Book (Reservation pending until the Host explicitly accepts via [[Capability - Accepting]]). Booking triggers [[Entity - Payment]] authorization and creates the [[Entity - Thread]] for Host-Guest communication._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Booking Flow]] (the surface where Booking executes), [[Entity - Reservation]] (the artifact Booking creates), [[Entity - Payment]] (the Payment authorized during Booking), [[Capability - Accepting]] (the Host counterpart for Request-to-Book mode), [[Entity - Trip]] (the Guest-facing framing of the confirmed Reservation)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Instant Book eligibility criteria (Host setting); Request-to-Book flow and Host response window (24 hours); payment authorization timing; what happens if Host doesn't respond to a Request; how trip modifications work after Booking; booking confirmation communication._
