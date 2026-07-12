# Solomon Triage Report: TCLoA Product Thinking Session

**Date:** 2026-03-31
**Source:** Product thinking session (`.context/tcloa-\*.md` files)

## Summary

| Metric | Count |
|---|---|
| Claims extracted | 25 |
| Settled | 14 |
| Contested | 5 |
| Open questions | 0 |
| Speculative (deferred) | 6 |
| Noise | 0 |

## Settled Claims -> Source Material

| Claim | Source File |
|---|---|
| TCLoA is a construction system, not an exemplar library | `docs/alexandria/sources/solomon-source-2026-03-31-identity-and-genus.md` |
| Genus test = marketplace test | `docs/alexandria/sources/solomon-source-2026-03-31-identity-and-genus.md` |
| Four always-genera, three conditional genera | `docs/alexandria/sources/solomon-source-2026-03-31-identity-and-genus.md` |
| Strategy knowledge lives in product library identity layer | `docs/alexandria/sources/solomon-source-2026-03-31-identity-and-genus.md` |
| WHY chain is the federation mechanism | `docs/alexandria/sources/solomon-source-2026-03-31-federation-and-architecture.md` |
| Documentation-as-conversation is the operating principle | `docs/alexandria/sources/solomon-source-2026-03-31-federation-and-architecture.md` |
| The slideshow URL is live | `docs/alexandria/sources/solomon-source-2026-03-31-federation-and-architecture.md` |
| Separation of concerns governs factory agents | `docs/alexandria/sources/solomon-source-2026-03-31-factory-team-design.md` |
| Four factory roles: Builder, Reviewer, Checker, Observer | `docs/alexandria/sources/solomon-source-2026-03-31-factory-team-design.md` |
| Coordinator is orchestration, not an agent | `docs/alexandria/sources/solomon-source-2026-03-31-factory-team-design.md` |
| Full 6-role library team is universal deployment unit | `docs/alexandria/sources/solomon-source-2026-03-31-bridge-agents-and-library-team.md` |
| Factory crew (4 roles) is additive at factory nodes only | `docs/alexandria/sources/solomon-source-2026-03-31-bridge-agents-and-library-team.md` |
| Build sequence: 5 phases from handshake to repeat | `docs/alexandria/sources/solomon-source-2026-03-31-build-sequence.md` |

Note: "The slideshow URL is live" is claim 14, captured under federation-and-architecture as a factual record.

## Contested Claims -> Signal Queue

| Claim | Revisit By | Resolution Needed |
|---|---|---|
| Species list within genera | 2026-09-30 | Real-world factory instantiation at Phase 4 to test whether species categories are useful |
| Factory agent character naming | 2026-06-30 | Decision before Factory #1 crew implementation: branded characters or functional role names? |
| Factory agent card type | 2026-06-30 | Test existing Agent template with factory agent fields; decide extend vs. new type |
| "Inherit with interpretation" mechanism | 2026-09-30 | Phase 4 cross-library WHY chain resolution will force decision among three options |
| Option C confirmation (spec in library, execution in factory) | 2026-06-30 | Dan needs to explicitly confirm or reject; test by writing one factory agent spec as library card |

All contested claims written to `docs/alexandria/signal-queue.jsonl`.

## Speculative (Deferred -- Not Formalized)

- **Internal factories** — Teams that print things for internal consumers (not marketplace). May soften the marketplace test. Deferred because it does not affect Phases 1-3 and needs real-world examples to evaluate.
- **Altitude-specific type vocabularies** — Corporate-altitude types (Strategic Bet, Market Position) vs. factory-altitude types (Domain, Component). Some preliminary thinking exists but no design work. Deferred pending Phase 4 data.
- **Cross-node Bridget assembly** — When a factory Bridget needs corporate context, how does she get it? Named as architectural requirement but no mechanism designed. Deferred pending federation implementation.
- **Global analytics across local Bridget/Raven logs** — If 30+ Bridgets and Ravens each produce local logs, aggregation creates organizational intelligence. No mechanism exists. Deferred as a Phase 5+ concern.
- **Organizational dashboard** — Raven-as-interface to cross-factory health picture. Vision articulated but no spec. Deferred as Phase 5+ infrastructure.
- **Is documentation-as-conversation THE thesis?** — Dan described it as "the life's blood of the modern smart company." If this is the primary thesis (organizational intelligence rather than agent context), the white paper framing should lead with organizations, not agents. Unresolved and deliberately not formalized until the build sequence tests it empirically through Phases 1-3.

## Observations

**1. Session produced architecture, not implementation.** All 14 settled claims are architectural decisions and design principles. None are implementation specifications. The build sequence (Phase 1-3) is the path from architecture to implementation. Sam's work should focus on Principle and Standard cards, not Component or System cards, because the settled material is at the rationale layer, not the product layer.

**2. The bridge agent correction has the widest blast radius.** The universal library team claim affects all six agent cards, the Boundary Agent Differentiation artifact, the Agent Capability Matrix, and the Agent Customer Gate standard. This is approximately 10 cards that need updates, touching roughly 85 downstream references across the library.

**3. Two design docs are confirmed stale.** The Raven Handoff blocks and the session handoff both flag `docs/design/alexandria.md` (wrong genus taxonomy, wrong identity statement, wrong compound library example) and `docs/design/system-story.md` (incomplete — does not acknowledge federated architecture). These are Session B work, not Session A.

**4. The impossible job pattern is a generalization of an existing principle.** The library already has "Principle - The Critic and Builder Must Be Structurally Separated." The impossible job pattern is the general case. The new Principle card should reference the existing one as a specific instance, not replace it.

**5. Known error in tcloa-agent-architecture.md was avoided.** Per the handoff instructions, the "Factory agents are both producers AND sensors" conclusion from that document was not used. The corrected factory team design from `tcloa-factory-team-design.md` was used instead.

**6. Contested claims cluster around Phase 4 dependencies.** Four of the five contested items (species list, inherit-with-interpretation, factory agent card type, Option C) become actionable at Phase 4. Only factory agent naming is potentially needed sooner (Phase 1-2 if Factory #1 crew gets implemented). This clustering confirms the build sequence's gating logic: do not over-design for Phase 4+ before Phase 3 is complete.
