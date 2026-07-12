---
type: Economy-instance
prefLabel: Refund
altLabels:
  - Refund Record
  - Reverse Charge
category: [Economy]
subcategory: [discount]
facets: [Capabilities]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/refund
  - https://help.shopify.com/en/manual/orders/refunds-returns
---

# Refund

## WHAT: Definition

_Stub — the reverse-charge Economy event against an [[Entity - Order]]: a record of money returned to the [[Role - Customer|shopper]] against a completed purchase. A Refund records which line items were refunded, at what amounts, whether stock was restocked, and the financial transaction that reversed the charge. Refund is the Economy-instance facet of [[Capability - Refunding]] — the Capability is the action; this card describes the resulting economic record._

## WHERE: Ecosystem

_Stub — links to: [[Capability - Refunding]] (the Capability that creates this Economy-instance), [[Entity - Order]] (the Order being partially or fully reversed), [[Entity - Inventory Item]] (optionally restocked when a Refund is issued), [[Domain - Payments]] (the domain that processes the financial reversal)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Refund data structure (refund_line_items, transactions, order_adjustments); full vs partial refund amounts; refund to original payment method vs store credit (gift card); Refund as a distinct object from Return (Return is the physical goods movement; Refund is the financial reversal — they can be decoupled); Refund settlement timing; how Refunds affect Order financial status._
