---
type: Entity
prefLabel: Payment
altLabels:
  - Booking Payment
  - Guest Payment
  - Charge
category: [Entities]
subcategory: [transaction]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/92
  - https://www.airbnb.com/help/article/925
---

# Payment

## WHAT: Definition

_Stub — the financial transaction charged to a [[Role - Guest]] to hold and confirm a [[Entity - Reservation]]. A Payment covers the [[Economy-instance - Nightly Rate]] times nights, plus [[Economy-instance - Cleaning Fee]], [[Economy-instance - Service Fee]], and any applicable taxes. Airbnb processes Payment as the intermediary — it does not release the funds to the [[Role - Host]] until 24 hours after the [[Entity - Stay]] check-in, reducing fraud and dispute risk. Airbnb holds Payment until it routes the [[Economy-instance - Payout]] to the Host._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Reservation]] (the Reservation this Payment funds), [[Economy-instance - Nightly Rate]] (rate component), [[Economy-instance - Cleaning Fee]] (fee component), [[Economy-instance - Service Fee]] (platform fee component), [[Economy-instance - Payout]] (the downstream remittance to the Host after Payment is processed), [[Entity - Refund]] (the reversal of a Payment)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Payment timing (at booking vs split payments for long stays); accepted payment methods (credit card, debit card, PayPal, Apple/Google Pay, Airbnb Credits); currency handling and conversion; how Payment hold vs capture works; Payment authorization at booking vs capture at check-in window; Payment failure and retry logic._
