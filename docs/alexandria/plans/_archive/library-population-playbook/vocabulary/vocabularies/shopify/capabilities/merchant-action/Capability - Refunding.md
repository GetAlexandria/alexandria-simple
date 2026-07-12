---
type: Capability
prefLabel: Refunding
altLabels:
  - Refund
  - Issue Refund
  - Reverse Charge
category: [Capabilities]
subcategory: [merchant-action]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/refund
  - https://help.shopify.com/en/manual/orders/refunds-returns
---

# Refunding

## WHAT: Definition

_Stub — the act of reversing a charge against an [[Entity - Order]] and creating an [[Economy-instance - Refund]] record. Refunding can be full (entire Order amount returned) or partial (one or more line items, or a custom amount). Refunding does not automatically restock [[Entity - Inventory Item|inventory]] — restocking is a separate toggle the [[Role - Merchant]] controls during the refund flow. The [[Economy-instance - Refund]] entity records the financial reversal; the [[Entity - Order]] financial status updates accordingly._

## WHERE: Ecosystem

_Stub — links to: [[Economy-instance - Refund]] (the Entity this Capability creates), [[Entity - Order]] (the Order being refunded against), [[Entity - Inventory Item]] (optionally restocked during refund), [[Domain - Payments]] (the domain that processes the financial reversal)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: full vs partial refund; line-item refund vs custom amount refund; restock toggle (return to inventory or not); refund to original payment method vs store credit; the distinction between Refund (financial reversal) and Return (physical return of goods); refund timeline by payment method (instant for Shopify Payments; 5–10 business days for other gateways); Refund API endpoint._
