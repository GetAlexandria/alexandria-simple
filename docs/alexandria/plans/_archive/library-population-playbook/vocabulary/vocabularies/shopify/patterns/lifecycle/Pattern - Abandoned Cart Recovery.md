---
type: Pattern
prefLabel: Abandoned Cart Recovery
altLabels:
  - Cart Abandonment Recovery
  - Abandoned Checkout Recovery
  - Cart Recovery Email
category: [Patterns]
subcategory: [lifecycle]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/orders/recovering-abandoned-checkouts
  - https://shopify.dev/docs/api/admin-rest/current/resources/abandoned-checkout
---

# Abandoned Cart Recovery

## WHAT: Definition

_Stub — the pattern by which a [[Entity - Cart]] that never becomes a [[Entity - Checkout]] — or a Checkout that never becomes an [[Entity - Order]] — triggers an automated email or notification flow to the [[Role - Customer|shopper]] to encourage completion. Shopify's built-in abandoned checkout recovery sends a recovery email after a configurable delay if the shopper entered their email address before abandoning. Recovery rate is the primary metric._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Cart]] (the abandoned object at the first stage), [[Entity - Checkout]] (the abandoned object at the second stage), [[Pattern - Cart-to-Order Lifecycle]] (this Pattern documents the failure path at Cart→Checkout and Checkout→Order transitions), [[Role - Customer]] (the recipient of the recovery communication), [[Domain - Marketing]] (the domain that owns recovery as a marketing tactic)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: built-in Shopify abandoned checkout recovery (Admin → Marketing → Automations); recovery email timing (configurable: 1 hour, 6 hours, 10 hours after abandonment); recovery link mechanics (unique URL that restores the Checkout session); email capture requirement ([[Role - Guest]] shoppers who abandon before entering email cannot be recovered); third-party cart recovery apps (Klaviyo, Omnisend) using Shopify Checkout webhooks; recovery rate benchmarks by industry._
