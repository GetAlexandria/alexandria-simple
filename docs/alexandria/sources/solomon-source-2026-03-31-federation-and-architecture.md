# Source Material: Federation and Architecture

**Date:** 2026-03-31
**Origin:** Product thinking session (Raven + Dan)
**Triaged by:** Solomon

---

## Claim 1: WHY chain is the federation mechanism

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner identification during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

The existing WHY chain (every card links to a Product Thesis, every Product Thesis links to a strategic bet) IS the cross-altitude connection mechanism for federation. Federation is not a new system — it is an extension of the existing WHY chain to cross-library scope.

Today, the WHY chain works within one library:

```
Component card (factory level)
  WHY -> Product Thesis card (same library)
    WHERE -> parent: root thesis (same library)
```

In a federated system, the chain crosses libraries:

```
Component card (software factory library)
  WHY -> Product Thesis card (software factory library)
    WHY -> "in service to" -> Strategic Bet (corporate context)

Campaign card (marketing factory library)
  WHY -> Channel Strategy card (marketing factory library)
    WHY -> "in service to" -> Strategic Bet (corporate context)
```

Both factory libraries' WHY chains trace back to the same corporate bet. When a second factory is added, the same WHY chain extends upward to a shared corporate bet.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Component - WHY Section | update — note cross-library extension path | 16 (all cards reference WHY sections) |
| Loop - Strategy Cascade | update — cascade extends cross-library in federated model | 16 |
| Product Thesis - The Bottleneck Is Context, Not Model Capability | update — may serve as corporate-level bet across multiple factory libraries | 13 |

### Context for Conan

This is architecturally significant because it means the federation mechanism already exists in embryonic form. Every card's WHY link is a proto-federation connection. When the system grows to multiple factories, the WHY chain does not need to be invented — it needs to be extended. The Component - WHY Section card should note this future extension path without over-engineering the current implementation.

### Raw Signal Reference

`.context/tcloa-build-sequence.md`, "The WHY chain as the connection mechanism" section.

---

## Claim 2: Documentation-as-conversation is the operating principle for all context libraries

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner assertion during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

Documents are not records. They are participants in an ongoing organizational conversation. The distinction:

**A dead document:**
- Was written once, sits in a folder
- Gets consulted when someone remembers it exists
- Slowly drifts from reality
- Has no mechanism for being challenged by new information

**A conversational document (card):**
- Has explicit assumptions (WHAT), rationale (WHY), and temporal context (WHEN)
- Is linked via typed edges (WHERE) so changes propagate
- Has validation criteria that define what would change it
- Is actively served to agents and humans (assembly)
- Receives feedback when it fails to serve well (feedback queue)
- Gets challenged by incoming signal (signal queue)
- Triggers cascade analysis when it changes

The existing library mechanisms — signal queue, feedback queue, cascade analysis, WHY chains, five dimensions — are the first generation of documentation-as-conversation infrastructure. Documentation-as-conversation is the philosophy that makes these mechanisms make sense.

At organizational scale, the federated smart company is not a set of static context libraries but a set of ongoing conversations at different altitudes, connected by inheritance and signal flow.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| System - Signal Queue | update — identified as documentation-as-conversation mechanism | 4 |
| System - Feedback Queue | update — identified as documentation-as-conversation mechanism | 25 |
| Loop - Strategy Cascade | update — identified as documentation-as-conversation mechanism | 16 |
| Principle - The Feedback Loop Between Service and Construction Is the Most Valuable Signal | update — this IS documentation-as-conversation applied to service | 18 |

### Context for Conan

This claim names and elevates a pattern that already exists implicitly in the library. The signal queue, feedback queue, and cascade analysis are already conversational mechanisms — they make cards respond to new information. What is new is the explicit naming of this as the operating principle, and the assertion that it applies at every altitude in a federated system, not just at the factory level. A new Principle card should capture this.

### Raw Signal Reference

`.context/tcloa-federated-architecture.md`, "Documentation-as-Conversation" section.

---

## Claim 3: The slideshow URL is live

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner confirmation — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

The canonical external-facing TCLoA presentation is hosted at:
`https://sociotechnica-org.github.io/life-build-book/static/context-library.html`

This is live and available for external communication.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Artifact - Product Roadmap | update — note external presentation exists | 12 |

### Context for Conan

This is a factual record. The slideshow is a communication artifact that may be referenced by cards discussing external positioning or the product story.

### Raw Signal Reference

`.context/tcloa-session-handoff.md`, Section 3, "The slideshow is hosted at a fixed URL."
