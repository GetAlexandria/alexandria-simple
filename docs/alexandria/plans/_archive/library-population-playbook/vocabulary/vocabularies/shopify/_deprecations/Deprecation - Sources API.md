---
type: Deprecation
prefLabel: Sources API
replaced_by: Payment Methods API
deprecation_date: ~2019
reason: Sources represented payment instruments in a way that couldn't cleanly support local payment methods (SEPA, iDEAL, Bancontact) or wallets. The Sources model assumed a relatively flat payment instrument tree; the Payment Methods abstraction unified direct card charges, redirect-based methods, and wallet flows under one noun, making it possible for Shopify Payments and third-party providers to expose the same interface.
migration_note: Sources remain callable in existing integrations, but new integrations must use Payment Methods. Shopify ran both APIs concurrently through the transition period; new partner apps built after ~2019 were directed to Payment Methods exclusively.
status: deprecated
source_evidence:
  - https://shopify.dev/docs/api/admin-rest/current/resources/payment-methods
---

# Deprecation - Sources API

## WHAT (the tombstone)

_The payment-instrument model Shopify used before Payment Methods. Sources represented a payment instrument — a card, a bank account — as a reusable object you could charge. The model worked for simple card payments but couldn't cleanly represent redirect-based local payment methods (SEPA Direct Debit, iDEAL, Bancontact) where the authorization flow is asynchronous and the "instrument" is more like a session than a reusable credential._

_The Payment Methods API unified the abstraction: a Payment Method is the canonical noun for any payment instrument regardless of type, flow, or provider. The migration ran over several years with both endpoints supported, consistent with Shopify's long-tail-integration approach to deprecations._

_Per the `families.md` note on deprecation as prose: this tombstone is how the library records the migration. If "Sources API" appears in older partner integration code or pre-2019 help articles, it refers to what is now called Payment Methods._

## Active replacement

[[System - Payment Authorization vs Capture]] — the two-phase commit model that Payment Methods enables cleanly.
