---
plane: product
status: confirmed
confidence: high
altitude: value
altLabels:
  - route
  - mode
evidence:
  - packages/viewer/src/components/library/viewer-routes.ts
links:
  derived_from:
    - Entity - Playbook
    - Entity - Ledger
    - Entity - Alexandria Product Library
    - Entity - Basic Product Description
    - Entity - Knowledge Bank Area
---

## WHAT

A path-to-mode mapping inside the Viewer — meaning by content, no identity
beyond its string. The routes are derived views of the domain, not new
nouns. Eighteen screens ship today: seven top-level surfaces plus eleven
library modes split across two sections, with the code as the canonical
count.

## WHY

Keeping every screen a derived view rather than an independent thing
protects the viewer from drifting away from what the product actually
models. A route earns its place only by rendering some other card's truth
back to the director, so when that underlying record changes, the screen
updates with it instead of needing its own redesign. It also keeps the
surface honest about its own size — new screens can only appear where the
domain has grown, not because a screen felt useful to add.

## WHERE

The Viewer's route table: the home landing route, an agent's own page, the
Playbook view, the Ledger view, an Info Hub view (placeholder, not yet
built), Raven's onboarding view, Raven's Knowledge Bank view, and eleven
library modes across two sections — six in the viewer section (Index,
Catalog, Workflow, Engine, Folders, Constellation) and five in the builder
section (Back, Drafts, Notepad, Confirm/Empty, Legacy reference).

## HOW

Each route is a rendering derived from a domain card: the Playbook view
from the [[Entity - Playbook]], the Ledger view from the
[[Entity - Ledger]], Raven's onboarding view from the
[[Entity - Basic Product Description]], Raven's Knowledge Bank view from
the [[Entity - Knowledge Bank Area]] set, and the library modes from the
[[Entity - Alexandria Product Library]].
