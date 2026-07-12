---
type: Pattern
prefLabel: Cart-to-Order Lifecycle
altLabels:
  - Purchase Lifecycle
  - Commerce Lifecycle
  - Order Lifecycle
category: [Patterns]
subcategory: [lifecycle]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/storefront/current/objects/Cart
  - https://shopify.dev/docs/api/admin-rest/current/resources/order
  - https://shopify.dev/docs/api/admin-rest/current/resources/fulfillment
---

# Cart-to-Order Lifecycle

## WHAT: Definition

_Stub — the canonical state machine that defines the purchase journey: Cart → Checkout → Order → Fulfillment → Delivered → (Returned / Refunded). Each state is a first-class named Entity or Event with distinct mutation rules and distinct audience ownership. Cart is Shopper-owned and freely mutable. Checkout is jointly owned — the Shopper drives it, the System constrains it. Order is Merchant-owned; line items are immutable but Fulfillment is mutable. Fulfillment is Merchant-executed and System-tracked. Delivered is terminal unless reversed._

_`families.md` calls this lifecycle the textbook Pattern entry for the E-commerce family — it is the defining characteristic of the category. Every e-commerce platform surveyed has this state machine; Shopify's version is the most copied. The pattern is load-bearing not just as a data model but as a product design principle: naming each state gives each state distinct semantics, distinct UI surfaces, distinct API representations, and distinct error recovery paths. Most e-commerce bugs are state-machine bugs where the code treats Cart as Order or treats Checkout as Cart. Naming the states and making them explicit Entities is what prevents those bugs at the product level, not just the code level._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Cart]] (first state), [[Entity - Checkout]] (second state), [[Entity - Order]] (third state), [[Entity - Fulfillment]] (fourth state), [[Pattern - Abandoned Cart Recovery]] (the failure path at the Cart→Checkout transition), [[Economy-instance - Refund]] (the reversal path at the Delivered state)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: per-state mutation rules (what can change in each state and what cannot); per-state audience ownership (who drives each transition); the failure paths (Abandoned Cart, Checkout abandonment, Order cancellation, Return); the event webhooks that fire at each state transition; how Shopify's API schema reflects each state as a distinct type with distinct fields; the relationship between this lifecycle and Shopify's financial status model on Orders._
