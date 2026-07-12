# Source Material: TCLoA Identity and Genus Taxonomy

**Date:** 2026-03-31
**Origin:** Product thinking session (Raven + Dan)
**Triaged by:** Solomon

---

## Claim 1: TCLoA is a construction system, not an exemplar library

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner correction during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

The ~190 cards at `docs/alexandria/` are the construction system documenting itself — a special case. The system IS the product: agents, wizard, tooling, templates, type taxonomy, quality system, and deterministic tooling layer. Downstream libraries built using this system (e.g., a LifeBuild product library) are exemplars. Exemplars are produced BY the system; they are not the system itself.

This corrects the white paper draft (v0.1) which called the existing software product library "the exemplar." The correct architecture diagram places TCLoA at the center with exemplars radiating outward, not TCLoA below an exemplar in a stack.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| docs/design/alexandria.md | correction — identity statement wrong | High (referenced by genus taxonomy, all design docs) |
| Artifact - Product Roadmap | update — product identity description | 12 (downstream roadmap items) |
| Artifact - Roadmap: Exemplar Library Registry | update — clarifies what exemplars are | 3 |
| Artifact - Roadmap: Beadification and MCP Compatibility | update — system vs. exemplar framing | 5 |

### Context for Conan

This is an identity-level correction that affects how every card describes the product. The system is not "a working knowledge layer for one product" but "the construction system for product knowledge layers." Any card that describes what TCLoA is or does needs to use this framing. The self-documenting library is a special case, not the primary product.

### Raw Signal Reference

`.context/tcloa-part4-revision.md`, "What We Actually Built" section.

---

## Claim 2: The marketplace test definitively resolves genus classification

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner decision during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

The definitive test for "is this a genus?" is: **does the output cross shipping/receiving and land in the marketplace where economic value is created?**

If yes: it is a factory output, the library that serves it is a factory library, and the genus is defined by what that factory prints.

If no: it is internal context. It lives at the corporate or divisional level and feeds into factory libraries. It is not a genus.

This replaces the prior seven-genus flat taxonomy with a concrete, testable criterion.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| docs/design/alexandria.md | correction — genus taxonomy is stale | High (genus definitions govern wizard configuration) |
| Artifact - Decision 14: Twenty-Two Knowledge Areas | update — genus framing affects knowledge area organization | 8 |

### Context for Conan

The marketplace test is the missing piece that made the genus taxonomy feel arbitrary. It provides a concrete, repeatable test anyone can apply: does the output cross shipping/receiving? This should be captured as the authoritative genus classification method in Alexandria doc and any card that references genera.

### Raw Signal Reference

`.context/tcloa-federated-architecture.md`, "The Genus Question: Definitively Resolved" section.

---

## Claim 3: Four always-genera and three conditional genera

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner decision during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

Applying the marketplace test yields a refined taxonomy:

**Always a genus** (output always reaches marketplace):
- I. Software (code)
- II. Prose (written works)
- III. Communications (messages)
- IV. Media (experiences)

**Genus when sold, corporate context when internal:**
- V. Professional Services (consulting, strategy, advisory) — genus when the strategy doc IS the product
- VI. Research & Analysis (academic papers, market reports) — genus when published for external consumption
- VII. Education & Training (courses, curricula) — genus when students are the market

**Never a genus** (never reaches marketplace):
- Internal strategy, internal research, internal training — these are corporate or divisional context

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| docs/design/alexandria.md | correction — seven-genus flat list is wrong | High |

### Context for Conan

The conditional genera are the key insight. Operations/Research/Education are not invalid — they are context-dependent. The same activity (strategy analysis) is a genus in a consulting firm and corporate context in a product company. The marketplace test resolves this ambiguity without eliminating legitimate use cases.

### Raw Signal Reference

`.context/tcloa-federated-architecture.md`, "The Genus Question: Definitively Resolved" section, taxonomy table.

---

## Claim 4: Strategy knowledge lives in product library identity layer, not separate library

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner correction during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

A startup's strategy knowledge belongs in the product library's identity layer (Product Theses, Principles, Decisions). It is not a separate "strategy library." The compound library pattern example in Alexandria doc that shows Software + Strategy is architecturally wrong — strategy belongs in the product library's identity layer.

The separate strategy library pattern applies only when strategic analysis IS the product (a consulting firm). A better compound library example: Software + Communications + Documentation.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| docs/design/alexandria.md | correction — compound library example is wrong | Medium |
| Product Thesis - The Bottleneck Is Context, Not Model Capability | update — this IS corporate-level strategy living in the product library's identity layer | 13 |

### Context for Conan

This resolves a tension in the current library where Product Theses and strategic Principles feel like they belong at a different altitude than Component specs and System descriptions. They do belong at a different altitude — but that altitude is the identity layer of the same library, not a separate library. The current structure (mixing corporate-level and factory-level content) is correct for a simple company where the corporate bet and the product bet are the same thing.

### Raw Signal Reference

`.context/tcloa-part4-revision.md`, "Where the metaphor strains" section.
