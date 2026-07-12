---
plane: product
status: confirmed
confidence: high
altitude: component
altLabels:
  - library builder
  - build section
evidence:
  - packages/viewer/src/components/library/viewer-routes.ts
  - packages/viewer/src/components/library/LibraryBrowserApp.tsx
links:
  related_to:
    - Surface - Viewer
    - Entity - Alexandria Product Library
---

## WHAT

The section of the Viewer where the library is actively built, as distinct
from the Library section's up-to-date read/browse experience. A Bundle
selector picks which build is in progress — today showing exactly one entry
("Alexandria Product") — intended to grow into a real multi-project stack,
each stacked project standing in for "the things you're working on." The
Builder's five modes are real and working, though ahead of current
practice: building out further planes (the Strategy plane, the taxonomy
work) still happens by hand outside it, because the method and schema for
that work is still unsettled.

## WHY

The Builder exists because the library is meant to be a living source of
truth that stays current, not a document written once and left to go
stale — [[Bet - Library as Living Source of Truth]] — and that wager only
holds if there is a place where the library actually gets built and kept
up, distinct from the section where it is merely read.

## WHERE

The builder section of the library route, contained within the
[[Surface - Viewer]] alongside its sibling section, the read-only Library.

## HOW

Five modes. **Back** is the live Empty Library workbench — presence,
fillable/gap/hot-spot counts per context, grouped by plane. **Drafts**
shows the Front-of-House Walk's draft overlay, empty until a walk runs.
**Notepad** shows the same presence breakdown plus Threads — not a general
work backlog, but the agent's own working notes surfaced *during* a
Front-of-House Walk specifically, which the agent reads back live to steer
that walk's conversation. **Confirm** is the EL4 empty-library-confirmation
entry point. **Legacy reference** is a read-only lens onto the old,
pre-convention library — never itself presented as a build. Each mode
renders whatever the Bundle selector currently points at, sourced from the
[[Entity - Alexandria Product Library]] catalog (or, in time, whichever
project is selected from the stack).
