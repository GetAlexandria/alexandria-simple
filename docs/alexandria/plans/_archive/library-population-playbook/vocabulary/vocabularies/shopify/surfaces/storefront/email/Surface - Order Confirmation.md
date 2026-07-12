---
type: Surface
prefLabel: Order Confirmation
altLabels:
  - Thank You Page
  - Order Status Page
  - Post-Purchase Page
category: [Surfaces]
subcategory: [storefront, email]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/orders/status-tracking
  - https://shopify.dev/docs/api/checkout-extensions/post-purchase
---

# Order Confirmation

## WHAT: Definition

_Stub — the post-purchase landing surface and transactional email sent after [[Entity - Checkout]] completes and an [[Entity - Order]] is created. The Order Confirmation page (Thank You page) shows the Order number, line items, shipping address, and fulfillment tracking when available. The Order Confirmation email is the Merchant's highest-open-rate communication. Both surface and email carry the same data; the email extends the shopper relationship past the browser session._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Order]] (the Order this surface confirms), [[Surface - Checkout]] (the upstream surface that completed), [[Entity - Fulfillment]] (tracking information appears here as Fulfillments are created), [[Pattern - Cart-to-Order Lifecycle]] (Order Confirmation is the terminus of the forward lifecycle path)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Thank You page customization (Checkout Extensions post-purchase extension point); Order status page (the ongoing tracking surface accessible via the link in the confirmation email); transactional email customization (Notification templates in Admin); upsell opportunity on Thank You page (post-purchase offer apps); Order Confirmation as the trigger for fulfillment workflows._
