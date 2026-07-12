# Source Material: Federation and Staged Expansion

**Date:** 2026-04-10
**Origin:** meeting
**Origin detail:** Strategy sessions, 2026-04-09 and 2026-04-10, Chapel Hill (Jess + Dan)
**Triaged by:** Solomon + Jess

## Settled Claims

### Claim 1: Cross-library data layer — federation is the architectural direction

**Authority:** Dan (co-founder, product owner) — identified the cross-library data layer as a core product component during the strategy session. Jess confirmed the direction.
**Evidence:** Dan raised the cross-library data layer as a missing piece in the initial product boundary diagram: "The cross library data layer. This is what you were talking about in the one pager as the thing that allows us to learn across all [libraries]." Both co-founders agreed this is part of the core trifecta ("the cross-library data layer about the agents and plays").
**Evidence tier:** E2 (expert judgment — architectural direction from co-founders)
**Source reliability:** A
**Content credibility:** 4 (direction is clear; implementation details are deferred)
**Tensions checked:** T5 checked — echoes the existing signal queue item `tcloa-inherit-with-interpretation-20260331` about cross-library context flow mechanics. This claim reinforces the direction but does not resolve the mechanical implementation question (Options A/B/C remain open). T1 checked — no contradiction with existing library positions. The federation concept in `solomon-source-2026-03-31-federation-and-architecture.md` is reinforced, not contradicted.

**Settled with deferral from human classification:** "We don't need to build this yet, but need to know that federated is where we're going." The architectural direction is settled. Implementation is deferred. Federation is the direction.

**Library impact:**
- **Affected cards:** [[System - Knowledge Graph]], [[Component - WHY Section]], existing federation source material
- **Impact type:** update — reinforce federation as settled architectural direction; flag implementation as deferred
- **Blast radius:** medium (3-5 cards)

---

### Claim 2: S/S'/S'' staged expansion — architecture portion is product territory

**Authority:** Dan (co-founder, product owner) — proposed the S/S'/S'' framework during the strategy session. Jess confirmed and refined.
**Evidence:** Dan described the framework: "The minimal slice is S, and it has these things around it, like S prime and S double prime, that we're not actually going to do. But if we architect S such that we could do those things, then we get acquired for this by being able to point to these."
**Evidence tier:** E2 (expert judgment — strategic framing from co-founders)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — no contradiction. Library has no current position on staged expansion. T6 checked — medium blast radius, primarily affects roadmap and architecture cards.

**Settled partially from human classification:** "Agreed — architecture part is product — need a roll-out plan." The architecture portion (how S is designed to accommodate S' and S'') belongs in the product library. Company-level concerns (acquisition strategy, business model choices) belong in a separate company library.

**Library impact:**
- **Affected cards:** [[Artifact - Product Roadmap]], potentially new card for S/S'/S'' framework
- **Impact type:** update — roadmap needs staged expansion framing; new card may be needed for the architectural expansion framework
- **Blast radius:** low-medium (2-4 cards)

---

### Claim 3: Product/company library separation — a company is a group of federated libraries

**Authority:** Jess (co-founder, technical lead) — classification commentary: "A company is a group of federated libraries. More to come on this. This will expand Alexandria's product surface area."
**Evidence:** Logical extension of the federation architecture and the marketplace test (established in prior triage). If factories are defined by the marketplace test, and a company has multiple factories, then a company is a federation of factory libraries plus corporate-level context.
**Evidence tier:** E2 (expert judgment — architectural reasoning)
**Source reliability:** A
**Content credibility:** 4 (directional, details TBD)
**Tensions checked:** T5 checked — echoes and reinforces the federation direction from Claim 1 above and from the March 31 triage session. T6 checked — this is a product surface area expansion with potentially high blast radius when implemented, but for now it's directional.

**Settled directionally from human classification:** Federation is the direction. A company = a group of federated libraries. This is a product surface area expansion. Details TBD. "Can be gestured at for now."

**Library impact:**
- **Affected cards:** [[Agent - Solomon the Sorter]] (federated architecture section), federation source material, potentially [[Artifact - Product Roadmap]]
- **Impact type:** update — reinforce federation as the multi-library model; add company = federation of libraries as directional position
- **Blast radius:** low for now (2-3 cards get directional updates); high when implementation begins

## Context for Conan

These three claims form a coherent federation story: (1) the cross-library data layer is a core product component with federation as the direction, (2) the product should be architecturally designed for staged expansion (S/S'/S''), and (3) at the company level, federation means a company is a group of libraries. All three are directionally settled but implementation-deferred.

The March 31 triage session already established the WHY chain as the federation mechanism and the marketplace test for genus classification. These claims reinforce that direction without adding new mechanical detail. The signal queue item `tcloa-inherit-with-interpretation-20260331` (mechanical implementation of cross-library context flow) remains open and is not resolved by these claims.

Sam should update existing federation-related cards with the reinforced direction and consider whether the S/S'/S'' framework warrants its own decision card or belongs as an update to the Product Roadmap.

## Raw Signal Reference

- `docs/alexandria/sources/2026-04-09/meeting-1.txt` — Cross-library data layer identified
- `docs/alexandria/sources/2026-04-09/meeting-2.txt` — S/S'/S'' framework discussed
- `docs/alexandria/sources/2026-04-10/jess-personal-reflection.txt` — Federation reflection
