---
type: Entity
prefLabel: Reservation
altLabels:
  - Booking
  - Confirmed Booking
category: [Entities]
subcategory: [booking]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/461
  - https://www.airbnb.com/help/article/1387
---

# Reservation

## WHAT: Definition

_Stub — the transaction record: the system-layer artifact that binds a [[Role - Guest]] to a [[Entity - Listing]] for a specific date range at a confirmed price. A Reservation is created when a Guest completes the [[Capability - Booking]] flow and a [[Role - Host]] accepts (or instant-book fires). The Reservation is the lifecycle entity that moves through states: Inquired → Requested → Confirmed → Active Stay → Completed → Reviewed. It is the authoritative record of the commercial agreement; a [[Entity - Payment]] is made against it, a [[Entity - Refund]] is credited against it, a [[Entity - Review]] is written against it._

_Reservation is a Host-and-platform noun. Guests don't encounter "Reservation" prominently in Airbnb's UI — they see [[Entity - Trip]]. Reservation is the transactional side of what Trip is the felt side of. This is the cleanest two-audience naming split in the Airbnb vocabulary: the same underlying data object is called Reservation when the system and Host reason about it, and Trip when the Guest encounters it. Cross-link: [[Pattern - Two-Sided Lifecycle]]._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Trip]] (the Guest-facing name for this same data), [[Entity - Listing]] (the Listing this Reservation is against), [[Role - Guest]] (the Guest who holds this Reservation), [[Role - Host]] (the Host who accepted this Reservation), [[Entity - Payment]] (the Payment made to hold this Reservation), [[Pattern - Two-Sided Lifecycle]] (the lifecycle pattern this Reservation moves through), [[Surface - Trips Dashboard]] (where Guests see this Reservation as a Trip)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Reservation states and transitions; Instant Book vs. request-to-book flows; Reservation confirmation numbers; how Reservation price is locked at booking time; modification requests; cancellation against a Reservation and the resulting Refund calculation; how the Reservation record is used by Customer Support in dispute resolution._
