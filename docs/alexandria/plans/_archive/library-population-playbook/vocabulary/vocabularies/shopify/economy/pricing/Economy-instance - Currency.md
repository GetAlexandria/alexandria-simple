---
type: Economy-instance
prefLabel: Currency
altLabels:
  - Store Currency
  - Pricing Currency
category: [Economy]
subcategory: [pricing]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/payments/currency
  - https://shopify.dev/docs/api/admin-rest/current/resources/shop
---

# Currency

## WHAT: Definition

_Stub — the pricing denomination for a [[Entity - Shop]]. A Shop has a primary store currency in which [[Entity - Product]] prices are set. Shopify Markets enables multi-currency storefronts where prices are displayed in the shopper's local currency, converted from the store currency. Currency affects both display (what the shopper sees) and settlement (what the [[Role - Merchant]] receives from the payment processor)._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Shop]] (store currency is a Shop-level setting), [[Entity - Cart]] (Cart totals are displayed in the active currency), [[Entity - Order]] (Orders record both presentment currency and settlement currency), [[Domain - Payments]] (currency is a Payments domain concern)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: store currency vs presentment currency (what the Merchant sets prices in vs what the shopper sees); Shopify Markets multi-currency (automatic conversion, local pricing rules, price rounding); settlement currency (what hits the Merchant's bank account); currency conversion fees; fixed vs auto-converted multi-currency prices._
