# ADR 003: "Informs" Not "Inherits" — Bidirectional Information Flow in the Zone Model

**Status:** Accepted
**Date:** 2026-04-10
**Context:** Federation architecture ratified during Raven wizard session, 2026-04-10;
design decisions captured in `docs/alexandria/plans/_archive/corporate-library-research/federation-architecture.md`

---

## Decision

Information flow between zones in the federated library system is **bidirectional and
circulatory**. The architectural vocabulary uses **"informs"** throughout — never "inherits,"
"flows down," or "flows up" — to capture this correctly.

Any zone can generate an insight that flows to any other zone. There is no terminal
direction.

## Context

When the three-zone model (Market / Corporate / Program) was designed, an early framing
described information flow as hierarchical: corporate context "flows down" to program
libraries; signal "flows up" from the factory floor. This framing is structurally accurate
for the *index face* (how humans navigate the nested hierarchy) but incorrect for the
*graph face* (how information actually moves between zones).

Examples that break the hierarchical framing:

- A factory-floor discovery (a user behavior pattern, an unexpected technical constraint)
  can reshape corporate strategy. Signal doesn't just flow up as raw input — it becomes
  insight that propagates back down and sideways.
- A market-level shift (a regulatory change, a competitor move) can simultaneously reshape
  corporate positioning and multiple program-level architecture decisions. It doesn't flow
  "down" in sequence; it informs all affected zones.
- A program-level architectural decision can surface an implicit assumption in the corporate
  strategy that was never made explicit. The program zone informs the corporate zone about
  a gap in its own knowledge.

The word "inherits" is especially wrong. Inheritance implies a one-way contract: child
receives from parent. But a corporate strategy card doesn't just broadcast to program
libraries — it is informed by what program libraries discover, updated when program-level
reality contradicts it, and sometimes superseded by what a program learns.

## The Two-Face Principle

This decision introduces a distinction between two access patterns for the same knowledge:

| Face | Structure | Consumer | Navigation |
|------|-----------|----------|------------|
| **Index** | Nested zones: Market → Corporate → Program | Humans | Hierarchical, structured, bookshelf |
| **Knowledge Graph** | Nodes with bidirectional "informs" edges | AI agents | Associative, follows connections anywhere |

The **index face** is hierarchical. Zones are nested. Humans drill down and up. A corporate
strategy card lives "above" a program card in the index. This nesting is real and useful for
navigation.

The **graph face** is not hierarchical. Wikilinks don't respect zone boundaries. An AI agent
following a WHY chain can traverse from a program-level component card to a corporate
strategic bet to a market landscape card — or in any other direction. Information flows
wherever the edges lead.

Both faces are correct. Neither face is the whole truth. The index face is not wrong
because information flows bidirectionally; the graph face is not wrong because zones are
structurally nested.

## Implementation

**Vocabulary rules:**

- ✓ "The market zone informs the corporate positioning decision"
- ✓ "This program-level finding informs the corporate strategy"
- ✓ "Corporate strategy informs how each program interprets its architecture"
- ✗ "Corporate strategy flows down to program libraries"
- ✗ "Signal flows up from the factory floor"
- ✗ "Program libraries inherit from the corporate zone"

**Cross-library wikilinks** are the primary mechanism. A program card that is informed by a
corporate card links to it: `[[Corporate - Strategic Bet: Context is the bottleneck]]`. The
Strategy Cascade loop traces blast radius across zone boundaries when any card changes.

**The signal queue** routes insights to whichever zone needs them, regardless of structural
nesting. A factory-floor signal doesn't "go up" — it goes to the zone(s) it is relevant to,
which may include multiple zones simultaneously.

**For the index (human view):** Updates are presented within zone structure. A human reviews
changes in context — "here's what changed in the Corporate zone this quarter." The hierarchy
is a navigation aid, not a constraint on information flow.

**For the graph (AI view):** Agents follow edges without regard to zone boundaries. A
retrieval traversal that starts in a Program zone may follow WHY chains into the Corporate
zone and then into the Market zone. This is correct behavior, not a violation of structure.

## Consequences

- All product documentation (design docs, agent definitions, wizard framing) uses
  "informs" instead of "inherits," "flows down," or "flows up."
- Agent cascade analysis must traverse cross-zone links, not just same-zone links.
- The signal queue implementation routes to the most relevant zone(s), not just "upward."
- New zone-level libraries (Corporate zone, Market zone) will use the same wikilink
  mechanism for cross-zone references that program-level libraries already use for
  cross-card references.
- The wizard framing explicitly acknowledges that it configures a Program zone, not the
  whole federated system.
