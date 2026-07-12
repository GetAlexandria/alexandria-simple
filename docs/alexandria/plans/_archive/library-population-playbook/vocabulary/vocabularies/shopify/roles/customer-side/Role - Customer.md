---
type: Role
prefLabel: Customer
altLabels:
  - Shopper
  - Buyer
category: [Roles]
subcategory: [customer-side]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/customers
  - https://shopify.dev/docs/api/storefront
---

# Customer

## WHAT: Definition

_Stub — the shopper buying from a [[Entity - Shop]]; the primary audience of the Storefront API. A Customer has a persistent account: saved addresses, [[Entity - Order]] history, and optional saved payment details. This is the Shopper-side Role — the counterpart to [[Role - Merchant]] on the Admin side. The same human is a Customer from Shopify's Storefront perspective and a record in the Admin perspective; the two representations are named differently across the two APIs._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Customer]] (the Customer's data record — same concept, Entity facet), [[Entity - Cart]] (the Customer's active pre-purchase session), [[Surface - Online Store]] (the surface the Customer shops on), [[Pattern - Two-Audience API Split]] (the API divide that makes Customer the Storefront-side noun and Order/Fulfillment the Admin-side nouns)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Customer account creation (signup vs guest checkout conversion); saved addresses and payment methods; Customer tags and segmentation for Merchant use; Customer vs [[Role - Guest]] distinction (Guest completes checkout without an account)._
