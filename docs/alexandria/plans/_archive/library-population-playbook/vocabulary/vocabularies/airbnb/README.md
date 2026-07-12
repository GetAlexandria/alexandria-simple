# The Airbnb Vocabulary

The Airbnb Vocabulary — the worked example of what the Vocabulary module would emit if Airbnb's product owner ran it against airbnb.com. Airbnb demonstrates: a structurally two-sided marketplace, the cleanest two-audience signature in the corpus (Trip vs Reservation for the same data), Superhost as both Role and Economy facet, and the lifecycle-as-Pattern entry (Inquire → Book → Stay → Review).

## Folder structure

```
airbnb/
├── _signature/
│   └── Standard - Airbnb Nomenclature Signature.md
├── roles/
│   ├── guest-side/
│   │   ├── Role - Guest.md
│   │   └── Role - Co-Traveler.md
│   ├── host-side/
│   │   ├── Role - Host.md
│   │   ├── Role - Co-Host.md
│   │   └── Role - Superhost.md
│   └── platform/
│       └── Role - Customer Support.md
├── entities/
│   ├── listing/
│   │   ├── Entity - Listing.md          (load-bearing; two-paragraph WHAT)
│   │   ├── Entity - Property.md
│   │   ├── Entity - Room.md
│   │   ├── Entity - Amenity.md
│   │   └── Entity - Photo.md
│   ├── booking/
│   │   ├── Entity - Reservation.md      (two-paragraph WHAT; Trip/Reservation split)
│   │   ├── Entity - Trip.md             (two-paragraph WHAT; felt-experience naming)
│   │   └── Entity - Stay.md
│   ├── communication/
│   │   ├── Entity - Message.md
│   │   ├── Entity - Inquiry.md
│   │   └── Entity - Thread.md
│   ├── review/
│   │   ├── Entity - Review.md
│   │   ├── Entity - Rating.md
│   │   └── Entity - Response.md
│   └── transaction/
│       ├── Entity - Payment.md
│       ├── Entity - Refund.md
│       └── Entity - Resolution.md
├── surfaces/
│   ├── guest-side/
│   │   ├── Surface - Search.md
│   │   ├── Surface - Map View.md
│   │   ├── Surface - Listing Detail Page.md    (two-paragraph WHAT)
│   │   ├── Surface - Booking Flow.md
│   │   ├── Surface - Wishlist.md
│   │   └── Surface - Trips Dashboard.md
│   └── host-side/
│       ├── Surface - Host Dashboard.md
│       ├── Surface - Calendar.md
│       ├── Surface - Listing Editor.md
│       └── Surface - Earnings.md
├── capabilities/
│   ├── guest-action/
│   │   ├── Capability - Searching.md
│   │   ├── Capability - Filtering.md
│   │   ├── Capability - Booking.md
│   │   └── Capability - Cancelling.md
│   ├── host-action/
│   │   ├── Capability - Listing Creation.md
│   │   ├── Capability - Pricing.md
│   │   └── Capability - Accepting.md
│   └── shared/
│       ├── Capability - Reviewing.md
│       └── Capability - Messaging.md
├── systems/
│   ├── System - Search Ranking.md       (user_visible: false)
│   ├── System - Smart Pricing.md        (user_visible: false)
│   ├── System - Trust and Safety.md     (user_visible: false)
│   ├── System - Verification.md         (user_visible: false)
│   └── System - AirCover.md             (user_visible: true; facets: [Economy])
├── patterns/
│   ├── lifecycle/
│   │   ├── Pattern - Two-Sided Lifecycle.md    (two-paragraph WHAT)
│   │   └── Pattern - Cancellation.md
│   ├── two-audience/
│   │   ├── Pattern - Two-Audience Surfaces.md  (two-paragraph WHAT; families.md exemplar)
│   │   └── Pattern - Communication Thread.md
│   └── trust/
│       ├── Pattern - Review Cycle.md
│       └── Pattern - Superhost Qualification.md
├── economy/
│   ├── guest-payment/
│   │   ├── Economy-instance - Nightly Rate.md
│   │   ├── Economy-instance - Cleaning Fee.md
│   │   ├── Economy-instance - Service Fee.md
│   │   └── Economy-instance - Security Deposit.md
│   ├── host-payout/
│   │   ├── Economy-instance - Payout.md
│   │   └── Economy-instance - Host Service Fee.md
│   ├── rating-economy/
│   │   ├── Economy-instance - Star Rating.md
│   │   └── Economy-instance - Superhost Status.md   (facets: [Roles])
│   └── pricing-tools/
│       └── Economy-instance - Smart Pricing.md
└── domains/
    ├── Domain - Stays.md
    └── Domain - Experiences.md
```

61 stubs + 1 signature card = 62 files.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — guest-side (Guest, Co-Traveler); host-side (Host, Co-Host, Superhost); platform (Customer Support)
- **entities/** — listing (Listing, Property, Room, Amenity, Photo); booking (Reservation, Trip, Stay); communication (Message, Inquiry, Thread); review (Review, Rating, Response); transaction (Payment, Refund, Resolution)
- **surfaces/** — guest-side (Search, Map View, Listing Detail Page, Booking Flow, Wishlist, Trips Dashboard); host-side (Host Dashboard, Calendar, Listing Editor, Earnings)
- **capabilities/** — guest-action (Searching, Filtering, Booking, Cancelling); host-action (Listing Creation, Pricing, Accepting); shared (Reviewing, Messaging)
- **patterns/** — lifecycle (Two-Sided Lifecycle, Cancellation); two-audience (Two-Audience Surfaces, Communication Thread); trust (Review Cycle, Superhost Qualification)
- **economy/** — guest-payment (Nightly Rate, Cleaning Fee, Service Fee, Security Deposit); host-payout (Payout, Host Service Fee); rating-economy (Star Rating, Superhost Status); pricing-tools (Smart Pricing)
- **systems/** — flat (all engine-internal; user_visible: false except AirCover)
- **domains/** — flat (Stays, Experiences)

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

## Stub frontmatter shape

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard | Domain>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single-value YAML list — drives the file path
subcategory: [<tags>]          # view-time grouping tags; empty list [] if none
facets: [<other-categories>]   # only for genuine multi-category cards; omit otherwise
user_visible: <true | false>
status: stub
proposed_by: <raven | director>
source_evidence: [<real URLs>]
---
```

**Facets in this Vocabulary.** Two concepts carry `facets:` in this vocabulary:

- `Role - Superhost.md`: `category: [Roles]`, `facets: [Economy]` — Superhost is both a Role tier and an Economy-status. Primary home is Roles (the persona and permissions face); Economy facet signals the resource-and-value mechanics in `Economy-instance - Superhost Status.md`.
- `System - AirCover.md`: `category: [Systems]`, `facets: [Economy]` — AirCover is both a System (the claims-processing engine) and a sold product with user-facing brand value.
- `Economy-instance - Superhost Status.md`: `category: [Economy]`, `facets: [Roles]` — the Economy-layer face of the Superhost Role.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

## Note: Airbnb as the two-audience exemplar

This product is the `families.md` canonical exemplar for the **two-audience problem made structural**. Airbnb is not just two audiences accessing different views — it is two separate product stacks (Guest product and Host product) on the same backend data layer. The Trip/Reservation pair is the sharpest naming data point in this corpus: the same database record, named deliberately differently depending on the reading audience. Guest product uses felt-experience names (Trip, Wishlist, Stay); Host product uses mechanism names (Reservation, Calendar, Earnings). The structural split is visible in the surface taxonomy (guest-side vs. host-side subfolders throughout), in the capability taxonomy (guest-action vs. host-action), and in the naming signature itself (rule 2 and rule 3 are the two halves of the same structural fact).

Directors building two-sided marketplaces should start here: name the Guest nouns, name the Host nouns, accept that some concepts will have two names for the same data, and treat that duality as a feature of honest product vocabulary rather than an inconsistency to resolve.
