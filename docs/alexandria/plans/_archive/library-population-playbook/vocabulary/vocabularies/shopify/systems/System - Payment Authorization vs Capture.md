---
type: System
prefLabel: Payment Authorization vs Capture
altLabels:
  - Auth and Capture
  - Two-Phase Payment
  - Manual Capture
category: [Mechanisms]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/transaction
  - https://help.shopify.com/en/manual/payments/shopify-payments/payment-capture
---

# Payment Authorization vs Capture

## WHAT: Definition

_Stub — the two-phase payment commit model: Authorization (a hold placed on the shopper's payment method at [[Entity - Checkout]] completion, confirming funds are available) and Capture (the actual transfer of funds, which happens later when the [[Entity - Order]] is ready to fulfill). This split exists because Merchants may want to verify stock, review fraud risk, or wait for pre-order windows before actually charging the shopper. Authorization holds funds without moving them; Capture moves them._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Checkout]] (Authorization happens at Checkout completion), [[Entity - Fulfillment]] (Capture typically happens when Fulfillment is ready), [[Entity - Order]] (the Order's financial status tracks Authorization and Capture states), [[Domain - Payments]] (the domain that owns this system)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: automatic vs manual capture settings in Admin (automatic captures immediately at Checkout; manual requires Merchant action); authorization hold window (typically 7 days for cards — must capture before expiry or re-auth); capture on fulfillment (a common pattern — configure Shopify to auto-capture when Fulfillment is created); voiding an authorization (cancel the hold without capturing); partial capture; payment gateway support variation (not all gateways support manual capture)._
