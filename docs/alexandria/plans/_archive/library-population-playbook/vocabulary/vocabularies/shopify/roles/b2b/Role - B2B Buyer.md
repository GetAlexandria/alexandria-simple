---
type: Role
prefLabel: B2B Buyer
altLabels:
  - Wholesale Buyer
  - Business Buyer
  - Company Contact
category: [Roles]
subcategory: [b2b]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://help.shopify.com/en/manual/b2b
  - https://shopify.dev/docs/api/admin-rest/current/resources/b2b
---

# B2B Buyer

## WHAT: Definition

_Stub — a wholesale-buyer Role distinct from the standard [[Role - Customer]] consumer flow. B2B Buyers are affiliated with a Company entity in Shopify's B2B model; they see negotiated price lists, volume discounts, and net payment terms that standard Customers do not. The ordering and pricing flow is distinct: B2B Buyers may place Orders on behalf of the Company, have access to draft orders for approval, and operate under company-level credit terms rather than per-transaction payment._

## WHERE: Ecosystem

_Stub — links to: [[Role - Customer]] (the consumer-shopper contrast Role), [[Entity - Order]] (B2B Orders may include net terms instead of immediate payment), [[Economy-instance - Discount]] (B2B Buyers see negotiated price lists, not public-facing discounts), [[Pattern - Two-Audience API Split]] (B2B adds a third audience layer: business buyer on top of consumer shopper and Admin merchant)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: Company and Location model (a B2B Buyer belongs to a Company with one or more Locations); price list assignment per Company; net payment terms (Net 30, Net 60); draft order approval workflow; minimum order quantities and volume pricing; distinction from retail [[Role - Customer]] accounts in the Admin._
