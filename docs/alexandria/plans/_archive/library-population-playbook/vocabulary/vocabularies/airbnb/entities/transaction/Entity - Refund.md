---
type: Entity
prefLabel: Refund
altLabels:
  - Cancellation Refund
  - Guest Refund
category: [Entities]
subcategory: [transaction]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/1320
  - https://www.airbnb.com/help/article/47
---

# Refund

## WHAT: Definition

_Stub — the return of [[Entity - Payment]] funds to a [[Role - Guest]] following a cancellation or a dispute resolution. Refund amount is governed by the [[Pattern - Cancellation]] policy attached to the [[Entity - Listing]] at booking time — Flexible, Moderate, and Strict policies define how much of the total Payment is returned based on how far in advance the cancellation occurs. [[Role - Customer Support]] can issue Refunds outside normal policy via [[Entity - Resolution]] in qualifying circumstances._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Payment]] (the Payment being reversed), [[Entity - Reservation]] (the Reservation being cancelled), [[Pattern - Cancellation]] (the policy that determines Refund amount), [[Entity - Resolution]] (a Resolution can trigger an out-of-policy Refund), [[Role - Customer Support]] (the role that can authorize Refunds outside normal policy), [[Economy-instance - Payout]] (Host Payout is adjusted when a Refund is issued)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Refund calculation under each cancellation policy tier; service fee refundability; cleaning fee refundability; Refund timing (processing days by payment method); extenuating circumstances policy and how it affects Refund eligibility; Airbnb Credits as a Refund vehicle._
