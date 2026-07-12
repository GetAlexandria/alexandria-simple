---
type: Entity
prefLabel: Checkout
altLabels:
  - Checkout Session
category: [Entities]
subcategory: [lifecycle]
facets: [Surfaces]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/storefront/current/objects/Checkout
  - https://shopify.dev/docs/api/admin-rest/current/resources/checkout
---

# Checkout

## WHAT: Definition

_Stub — the finalization handoff; the second named state in the [[Pattern - Cart-to-Order Lifecycle]]. Checkout is a distinct object from [[Entity - Cart]] with stricter mutation rules: once a shopper enters Checkout, payment information is collected, [[Economy-instance - Tax Class|taxes]] are calculated, and [[System - Inventory Reservation|inventory is reserved]]. Line items can still be changed but the constraints tighten progressively as the shopper advances through the funnel steps. Checkout is where payment authorization happens; completing Checkout creates an [[Entity - Order]]._

_The Cart-to-Checkout transition is a meaningful state boundary, not just a UI step. At the Cart stage, no payment is involved and inventory is not held. At the Checkout stage, a [[System - Inventory Reservation]] is created, [[System - Tax Calculation]] runs per jurisdiction, and [[System - Payment Authorization vs Capture]] begins. This transition is why Cart and Checkout are two separately named Entities rather than states within one object: they have different mutation semantics, different persistence models, and are served by different APIs. The Checkout facet [[Surface - Checkout]] is the UI surface the shopper walks through; this Entity card describes the data object and its lifecycle position._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Cart]] (the prior state — Cart converts to Checkout), [[Entity - Order]] (the next state — Checkout completion creates an Order), [[Surface - Checkout]] (the UI surface the shopper experiences during this Entity's lifetime), [[System - Inventory Reservation]] (triggered at Checkout entry), [[System - Tax Calculation]] (runs during Checkout), [[System - Payment Authorization vs Capture]] (authorization happens at Checkout completion), [[Pattern - Cart-to-Order Lifecycle]] (Checkout is the second named state)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Checkout steps (Contact / Shipping / Payment in multi-step; all-in-one in one-page Checkout); Checkout token (the persistent identifier for a Checkout session); abandoned Checkout recovery window; the distinction between Storefront API Checkout (deprecated in favor of Cart + Checkout Sheet) and Checkout API; Shopify-hosted Checkout vs headless Checkout; extensibility points (Checkout Extensions, Functions)._
