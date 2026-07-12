# Residual Gaps

Every Stage-2 question, Hot Spot, and out-of-scope suspect not resolved by a director answer is listed here. These are not confirmed card values.

## Confirmed Sections

### Library (library)

- context: library
- plane: product
- answer event: e6c9e228-427a-4a5a-808d-3ed941d9cf07
- card count: 3
- unknown count: 0
- summary:
  The knowledge store — company knowledge made atomic and organized into cards so agents and humans can use it. Each division or business unit has its own library with three planes: the work of that division, strategy, and learning. The Company Library is the planned federation of all division libraries. The first library being built is Product — describing Alexandria itself.

### Viewer (product-shell)

- context: product-shell
- plane: product
- answer event: 48e61807-df91-413f-aa8a-5e6b400303bf
- card count: 8
- unknown count: 0
- summary:
  The visual, traversable interface that makes the whole system real and usable to a human director — what you get instead of just a prompt window. The director works across the Viewer (the web UI) and the AX CLI together. The Viewer translates the library, playbook, ledger, and agents into something you can see and interact with, with each agent represented spatially as a coin.

## hot-spot-trigger-design-vs-runtime - The product story presents triggers as first-class programmatic conditions that fire plays; shipped code has exactly two kinds, derived on read and never materialized. Is the bigger trigger surface planned, cut, or is the derived-on-read pair the intended model?

- kind: hot_spot
- origin: source
- confidence: high
- placement: Product -> Ledger
- reason: Director ruled unresolved: triggers are underspecified, the domain knowledge lives with the cofounder, and the bigger trigger surface is not cut. Carry as a residual gap.
- concerned cards:
  - Mechanism - Trigger (ledger/Mechanism/Mechanism - Trigger.md)
- evidence:
  - packages/ax/src/domain/triggers.ts
  - packages/alexandria-plugin/CLAUDE.md

## hot-spot-viewer-readme-routes - The viewer README says "/" is the only route while the code ships twelve-plus. The scan treated code as canon — confirm, and should the README be corrected?

- kind: hot_spot
- origin: source
- confidence: high
- placement: Product -> Product-shell
- reason: Director deferred: needs to discuss with cofounder (Jess) whether code or README is canon and whether the README should be corrected. The scan's assumption (code is canon) is provisional until confirmed.
- concerned cards:
  - Surface - Viewer (product-shell/Surface/Surface - Viewer.md)
  - Component - Viewer Route (product-shell/Component/Component - Viewer Route.md)
- evidence:
  - packages/viewer/README.md
  - packages/viewer/src/components/library/viewer-routes.ts

## hot-spot-project-altitude - Does the Project sit at context altitude (the bounded workspace everything lives in) or aggregate (initialized into a configured state)? Provisional: context — confirm.

- kind: hot_spot
- origin: source
- confidence: medium
- placement: Product -> Product-shell
- reason: Director does not recognize "Project" as a familiar product noun in this context. Needs investigation into how it's being used in the data model before a ruling can be made.
- concerned cards:
  - Entity - Project (product-shell/Entity/Entity - Project.md)
- evidence:
  - packages/ax/CLAUDE.md

## hot-spot-vision-naming - Which name is canonical — the director-facing "Basic Product Description" or the internal vision id (raven.vision.* events, /raven/vision route)? The card is drafted with the director-facing name; ratify or rename.

- kind: hot_spot
- origin: source
- confidence: medium
- placement: Product -> Vision-onboarding
- reason: Director deferred: "Basic Product Description" stays as the director-facing card name; internal code still uses legacy "vision" naming (raven.vision.* events, /raven/vision route). Needs a code cleanup pass when things are stable.
- concerned cards:
  - Entity - Basic Product Description (vision-onboarding/Entity/Entity - Basic Product Description.md)
- evidence:
  - packages/ax/src/domain/raven-vision.ts
  - packages/viewer/src/components/library/viewer-routes.ts
