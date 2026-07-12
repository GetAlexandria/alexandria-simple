---
type: System
prefLabel: Tax Calculation
altLabels:
  - Tax Computation
  - Sales Tax
  - VAT Calculation
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/tax-line
  - https://help.shopify.com/en/manual/taxes
---

# Tax Calculation

## WHAT: Definition

_Stub — the per-jurisdiction tax lookup and application system that runs during [[Entity - Checkout]]. Tax Calculation determines the tax amount owed on an [[Entity - Order]] based on the shipping destination, the [[Economy-instance - Tax Class]] of each line item, and the [[Role - Merchant]]'s tax registration status in that jurisdiction. Shopify Basic Tax (rules-based) and Shopify Tax (automated, US-focused) are the two built-in calculation engines._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (Tax Calculation runs during Checkout), [[Economy-instance - Tax Class]] (the product-type classification that determines applicable tax rates), [[Entity - Order]] (tax amounts are recorded on the Order), [[Domain - Payments]] (the domain that owns tax as part of the payment total)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Shopify Basic Tax vs Shopify Tax (Avalara-powered, US Economic Nexus automation); VAT for EU and UK (OSS registration, reverse charge for B2B); tax-inclusive vs tax-exclusive pricing; tax exemptions (customer tags for tax-exempt B2B buyers); manual tax overrides per product and jurisdiction; the interaction between [[Economy-instance - Tax Class]] and shipping tax rules._
