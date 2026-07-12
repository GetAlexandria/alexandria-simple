---
type: Economy-instance
prefLabel: Payout
altLabels:
  - Host Payout
  - Earnings Transfer
  - Disbursement
category: [Economy]
subcategory: [host-payout]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.airbnb.com/help/article/425
  - https://www.airbnb.com/help/article/2294
---

# Payout

## WHAT: Definition

_Stub — the [[Role - Host]]'s earned revenue disbursement: the transfer of booking proceeds (less [[Economy-instance - Host Service Fee]] and applicable taxes) from Airbnb to the Host's chosen payout method, triggered approximately 24 hours after [[Role - Guest]] check-in. Payout is the Host-side counterpart to [[Entity - Payment]] on the Guest side — Airbnb holds the Guest's payment from booking until check-in, then releases the Host's share. The timing of Payout (post-check-in, not post-booking) is a deliberate trust mechanism: it allows Airbnb to verify the stay began before releasing funds._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Payment]] (the Guest Payment from which Payout is derived), [[Economy-instance - Host Service Fee]] (the fee deducted from the Payout), [[Surface - Earnings]] (the surface where Payout history is displayed), [[Entity - Reservation]] (each Payout corresponds to a completed Reservation)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Payout timing (standard: 24h after check-in; expedited options); supported payout methods (bank transfer, PayPal, Payoneer, debit card); multi-currency Payout handling; how Payouts are split when a [[Role - Co-Host]] payout share is configured; Payout failure and retry mechanics; how cancellations with partial refunds affect Payout._
