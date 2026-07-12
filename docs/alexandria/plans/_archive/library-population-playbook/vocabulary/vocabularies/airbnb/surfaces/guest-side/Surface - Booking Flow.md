---
type: Surface
prefLabel: Booking Flow
altLabels:
  - Checkout Flow
  - Request to Book
  - Booking Wizard
category: [Surfaces]
subcategory: [guest-side]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/461
  - https://www.airbnb.com/help/article/139
---

# Booking Flow

## WHAT: Definition

_Stub — the multi-step Guest-side surface that converts a [[Entity - Listing]] selection into a confirmed [[Entity - Reservation]]. The Booking Flow collects: trip dates (if not already selected), guest count, any required Host questions, payment method, and [[Economy-instance - Service Fee]] acknowledgment. It ends in either an instant confirmation (Instant Book) or a pending request awaiting [[Capability - Accepting|Host acceptance]]. The Booking Flow is the [[Capability - Booking]] surface._

## WHERE: Ecosystem

_Stub — links to: [[Surface - Listing Detail Page]] (the surface from which Booking Flow is entered), [[Capability - Booking]] (the Capability this surface executes), [[Entity - Reservation]] (the artifact created when Booking Flow completes), [[Entity - Payment]] (the Payment authorized during Booking Flow), [[Economy-instance - Service Fee]] (the fee shown in the price breakdown)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Instant Book vs. Request to Book flow branching; pre-booking message requirement; payment method capture and authorization timing; how trip date selection integrates with Calendar availability; price breakdown display (Nightly Rate × nights + Cleaning Fee + Service Fee + taxes); what happens when a Host declines a Request to Book._
