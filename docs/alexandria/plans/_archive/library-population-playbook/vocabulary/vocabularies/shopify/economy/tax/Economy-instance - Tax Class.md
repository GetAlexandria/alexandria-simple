---
type: Economy-instance
prefLabel: Tax Class
altLabels:
  - Product Tax Class
  - Tax Category
category: [Economy]
subcategory: [tax]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/taxes/tax-overrides
  - https://shopify.dev/docs/api/admin-rest/current/resources/product
---

# Tax Class

## WHAT: Definition

_Stub — the what-kind-of-thing classification for tax: a label applied to a [[Entity - Product]] or [[Entity - Variant]] that determines which tax rate applies in each jurisdiction. Different product types attract different tax rates (food may be zero-rated; digital goods have special VAT rules in the EU; clothing is tax-exempt below certain price thresholds in some US states). Tax Class is the join between the product and the jurisdiction-specific tax rule._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Product]] (Tax Class is assigned at Product level), [[Entity - Variant]] (can be overridden at Variant level), [[System - Tax Calculation]] (Tax Calculation uses Tax Class to look up the applicable rate), [[Domain - Payments]] (the domain that owns tax)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Shopify's built-in tax categories (standard, clothing, food and drink, dietary supplements, digital goods); how Tax Class interacts with Shopify Tax (automatic US economic nexus) vs Basic Tax (manual rate overrides); EU OSS VAT categories; custom tax overrides for products that don't fit standard categories._
