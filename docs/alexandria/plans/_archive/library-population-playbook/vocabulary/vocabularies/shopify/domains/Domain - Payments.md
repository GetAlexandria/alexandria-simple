---
type: Domain
prefLabel: Payments
altLabels:
  - Payments Domain
  - Payment Processing
  - Commerce Payments
category: [Domains]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/transaction
  - https://help.shopify.com/en/manual/payments
---

# Payments

## WHAT: Definition

_Stub — the domain that owns payment processing, tax, and refunds: the financial layer of the [[Pattern - Cart-to-Order Lifecycle]]. The Payments domain owns [[System - Payment Authorization vs Capture]], [[System - Tax Calculation]], [[Economy-instance - Refund|Refunds]], [[Economy-instance - Currency]], and payment gateway integrations. Shopify Payments is Shopify's first-party payment processor; third-party gateways integrate via the Payment Gateway API._

## WHERE: Ecosystem

_Stub — links to: [[System - Payment Authorization vs Capture]] (the two-phase commit system), [[System - Tax Calculation]] (tax as a Payments concern), [[Economy-instance - Refund]] (financial reversal), [[Economy-instance - Currency]] (denomination), [[Entity - Checkout]] (where payment is collected)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Shopify Payments (first-party processor, eliminates transaction fees); third-party gateway integration (adds transaction fee on top of gateway fee); Payment Methods API (the current abstraction for payment instruments — replaced [[Deprecation - Sources API]]); fraud protection (Shopify Protect for chargebacks); payouts and bank settlement; Shop Pay Installments (BNPL)._
