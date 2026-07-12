---
type: Entity
prefLabel: Order
altLabels:
  - Purchase
  - Transaction
category: [Entities]
subcategory: [lifecycle]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/order
  - https://help.shopify.com/en/manual/orders
---

# Order

## WHAT: Definition

_Stub — the post-purchase record; the third named state in the [[Pattern - Cart-to-Order Lifecycle]]. An Order is created when [[Entity - Checkout]] is completed. Order line items are immutable after creation — the [[Role - Merchant]] cannot change what was purchased or at what price (though they can edit certain Order properties). What remains mutable is Fulfillment: the Merchant can create, edit, and track [[Entity - Fulfillment|Fulfillments]] against the Order after it is placed. Orders live in the Admin API — Order is a Merchant noun, not a Storefront noun. The shopper encounters the Order via the [[Surface - Order Confirmation]] surface and email._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (the prior state that created this Order), [[Entity - Fulfillment]] (the Fulfillment(s) against this Order), [[Entity - Customer]] (the Customer record this Order is attributed to, or null for [[Role - Guest]] orders), [[Surface - Order Confirmation]] (the post-purchase surface showing Order details), [[Capability - Fulfilling]] (the capability that advances this Order's Fulfillment), [[Capability - Refunding]] (the capability that reverses charge against this Order), [[Domain - Fulfillment]] (the domain that owns Order execution)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Order number and ID (sequential display number vs internal GID); financial status (Pending / Authorized / Partially Paid / Paid / Partially Refunded / Refunded / Voided); fulfillment status (Unfulfilled / Partially Fulfilled / Fulfilled); Order editing (Shopify Plus — add/remove line items post-creation within constraints); Order notes and tags; risk assessment; the relationship between Orders and Transactions (a Shopify Order can have multiple financial Transactions — auth, capture, refund)._
