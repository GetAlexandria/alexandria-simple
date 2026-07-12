---
type: Surface
prefLabel: Checkout
altLabels:
  - Checkout Page
  - Checkout Funnel
  - One-Page Checkout
category: [Surfaces]
subcategory: [storefront]
facets: [Entities]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/checkout-settings
  - https://shopify.dev/docs/api/checkout-extensions
---

# Checkout

## WHAT: Definition

_Stub — the purchase funnel surface: the multi-step or one-page UI through which the shopper provides contact information, shipping address, shipping method, and payment to complete an [[Entity - Checkout]] and create an [[Entity - Order]]. Shopify-hosted Checkout is opinionated and conversion-optimized; third-party customization is limited to Checkout Extensions (app blocks within Shopify's layout) and Functions (logic customization). Cart-to-Order conversion rate is the primary metric._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (the data object whose lifecycle this surface drives), [[Entity - Cart]] (the upstream Entity converted at the start of this surface), [[Entity - Order]] (created when this surface is completed), [[Surface - Order Confirmation]] (the downstream surface after completion), [[System - Payment Authorization vs Capture]] (authorization runs during this surface)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: One-page Checkout (Shopify's current default, introduced 2023) vs classic multi-step; express payment options (Shop Pay, Apple Pay, Google Pay — shown above the standard form); Checkout Extension insertion points (order summary, contact, shipping, payment, thank-you page); Checkout Functions (delivery customization, payment customization, discounts); branding customization within Shopify's hosted Checkout._
