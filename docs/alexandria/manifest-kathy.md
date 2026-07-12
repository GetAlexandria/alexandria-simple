# Card Inventory: Agent Design — Chatty Kathy

Source: `docs/alexandria/sources/agent-chatty-kathy.md`
Source Assessment: `docs/alexandria/source-assessment-kathy.md`
Date: 2026-03-23
Configuration: Factory x High Novelty x High Complexity

---

## Expected Cards

### Agents (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Agent - Chatty Kathy | agent-chatty-kathy.md (entire file) | Built | Step 4 of decision tree: "Is this an AI team member? The agent -> Agent." Fifth named agent with defined role (human-facing product coworker), defined customer (product team humans), five capabilities, six-item cannot-do list. Same classification pattern as the four existing Agent cards in the primary manifest. |

### Principles (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Principle - Read but Never Write (Conversational Agent) | agent-chatty-kathy.md §What Kathy Does NOT Do | Built | Step 1: "Judgment guidance (a rule of thumb) -> Principle." Not a testable spec — it is a design constraint governing how conversational agents interact with the library. The boundary is clear (Kathy reads, Sam writes) but it is framed as a rule of thumb for agent design, not a quantified gate. Parallels the primary manifest's Principle - The Critic and Builder Must Be Structurally Separated. |
| Principle - Perspectives Not Directives | agent-chatty-kathy.md §What Kathy Does NOT Do, §Voice | Built | Step 1: "Judgment guidance (a rule of thumb) -> Principle." Governs Kathy's voice and role: opinions grounded in the library are presented as perspectives, not instructions. Not testable as a spec (you cannot mechanically verify "perspective vs. directive" in output). Judgment-based guidance for agent behavior. |

### Standards (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Standard - Agent Customer Gate (Human vs. Builder) | agent-chatty-kathy.md §What Makes Kathy Different from Bridget | Built | Step 1: "Testable spec (concrete rules) -> Standard." Clean binary gate: if customer is a builder agent, route to Bridget; if customer is a human, route to Kathy. Mechanically testable — you can classify any interaction by asking "who initiated this?" This is the boundary spec between Bridget and Kathy. |

### Aesthetics (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Aesthetic - Conversational Warmth | agent-chatty-kathy.md §Voice | Built | Step 5: "Target emotional state -> Aesthetic." The source defines a target feeling: "colleague you'd want to whiteboard with," warm, engaged, substantive. Not a testable rule (Principle) or a repeating cycle (Loop). It is the emotional register for Kathy interactions. Gate 1 check: builders do not say "I'm using conversational warmth" — it is a felt quality, not an interaction point. Containment: links to Agent - Chatty Kathy and Loop - Product Thinking Conversation. Extends Aesthetic - Professional, Not Daffy (primary manifest) with a fifth agent personality. |

### Artifacts (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Bridget-Kathy Differentiation | agent-chatty-kathy.md §What Makes Kathy Different from Bridget | Built | Step 2: "Content object -> Artifact." The six-dimension comparison table (Customer, Interaction, Output, Voice, Trigger, Value) is a discrete content object encoding institutional knowledge about why two library-reading agents exist with different customers. Consulted during agent design, not interacted with as a spatial canvas or widget. Same pattern as Artifact - Filtered Handoff Pattern in the primary manifest. |
| Artifact - Decision: Fifth Agent (Kathy) | agent-chatty-kathy.md §Origin, §Design, §What Would Change This | Built | Step 2: "Content object -> Artifact." Institutional knowledge artifact following the same pattern as the 32 Decision cards in the primary manifest. Records the choice to create a fifth agent, the origin story (emergent power user pattern), the rationale (highest-value interaction), alternatives considered (Conan absorbs the role), and four explicit invalidation conditions. HUMAN JUDGMENT NEEDED: this could be numbered as Decision 33 to continue the primary manifest's sequence, or kept as a standalone design decision outside the numbered series since it comes from a different source file. |

### Loops (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Loop - Product Thinking Conversation | agent-chatty-kathy.md §What Kathy Does, §Origin | Built | Step 5: "Repeating activity cycle -> Loop." The source describes a repeating cycle: human has product question -> opens conversation with Kathy -> Kathy traverses library and synthesizes -> human gets insight -> insight compounds into better product decisions -> human returns with next question. Trigger: human needs a product thinking partner. Not a one-time journey (it repeats per question). Not a capability (it describes the full interaction cycle, not Kathy's action alone). Gate 5 check: "Repeating activity cycle" — yes, the source explicitly describes this as the "most valuable daily interaction." Containment: links to Agent - Chatty Kathy and Capability - Context Assembly (Kathy's graph traversal is a variant of assembly). |

### Journeys (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Journey - Conversational Mastery Arc | agent-chatty-kathy.md §Origin; cross-ref sources/progression-mastery.md | Built | Step 5: "Multi-phase progression arc -> Journey." The source describes a multi-phase progression: asking simple questions -> brainstorming -> pressure-testing -> challenging assumptions -> surfacing connections the human missed. This maps to the existing progression-mastery.md stages 4-5 (Inspector -> Architect). Not a Loop (it is not repeating — it is a skill curve with distinct phases the human moves through over time). Containment: must link to Loop - Product Thinking Conversation (the repeating cycle that composes this arc) and Agent - Chatty Kathy. HUMAN JUDGMENT NEEDED: this Journey depends on sources/progression-mastery.md for its stage definitions, but that source was assessed separately in Part 2. The Journey card should cross-reference the progression-mastery cards when they are built. If progression-mastery cards are not yet inventoried, this card should be built with explicit stubs for the stage links. |

### Capabilities (5)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Capability - Product Question Answering | agent-chatty-kathy.md §What Kathy Does | Built | Step 2: "Action/workflow -> Capability." Primary interaction mode: human asks product question, Kathy traverses library, synthesizes answer. Has trigger, procedure, and distinct output. Externalized from Agent card during Play 4.2. |
| Capability - Assumption Challenging | agent-chatty-kathy.md §What Kathy Does | Built | Step 2: "Action/workflow -> Capability." Pressure-testing mode: Kathy identifies unstated assumptions and challenges them with library evidence. Externalized from Agent card during Play 4.2. |
| Capability - Connection Surfacing | agent-chatty-kathy.md §What Kathy Does | Built | Step 2: "Action/workflow -> Capability." Cross-domain insight mode: Kathy surfaces non-obvious connections between library cards the human hasn't considered. Externalized from Agent card during Play 4.2. |
| Capability - Idea Pressure Testing | agent-chatty-kathy.md §What Kathy Does | Built | Step 2: "Action/workflow -> Capability." Brainstorming mode: Kathy helps explore and stress-test product ideas using library context. Externalized from Agent card during Play 4.2. |
| Capability - Implication Tracing | agent-chatty-kathy.md §What Kathy Does | Built | Step 2: "Action/workflow -> Capability." Downstream analysis mode: Kathy traces downstream implications of a proposed change through the knowledge graph. Externalized from Agent card during Play 4.2. |

---

## Cross-References to Primary Manifest

Cards in this inventory link to the following primary manifest cards. These must exist (or be scaffolded) before Kathy cards that depend on them.

| Kathy Card | Primary Manifest Card | Relationship |
|------------|----------------------|--------------|
| Agent - Chatty Kathy | Agent - Conan the Librarian | Kathy flags contested truths to Conan; Kathy drafts source material for Conan's pipeline |
| Agent - Chatty Kathy | Agent - Sam the Scribe | Kathy does not write cards — Sam does. Hard boundary. |
| Agent - Chatty Kathy | Agent - Nit the Picker | Kathy does not lint — Nit does. Hard boundary. |
| Agent - Chatty Kathy | Agent - Bridget the Briefer | Customer separation (humans vs. builder agents). Differentiation table. Handoff path. |
| Standard - Agent Customer Gate | Agent - Bridget the Briefer | Gate determines Bridget routing |
| Standard - Agent Customer Gate | Standard - User Assumptions (Never-Violate Set) | Agent Customer Gate extends the user assumptions into the Bridget-Kathy boundary |
| Aesthetic - Conversational Warmth | Aesthetic - Professional, Not Daffy | Extends the fifth pair with Kathy's personality spec |
| Aesthetic - Conversational Warmth | Artifact - Agent Voice Guide | Adds fifth agent to the voice guide |
| Artifact - Decision: Fifth Agent (Kathy) | Artifact - Decision 5: Four Agents, Not One | Extends the original team architecture decision with a fifth agent |
| Artifact - Decision: Fifth Agent (Kathy) | Artifact - Decision 8: Bridget as Boundary Agent | The Kathy/Bridget separation refines Bridget's boundary role |
| Artifact - Bridget-Kathy Differentiation | Agent - Bridget the Briefer | Bridget is one side of the differentiation table |
| Principle - Read but Never Write | Principle - The Critic and Builder Must Be Structurally Separated | Same structural separation pattern applied to conversational agents |
| Principle - Read but Never Write | Capability - Card Building | Card Building is Sam's exclusive domain — Kathy defers to this |
| Loop - Product Thinking Conversation | Capability - Context Assembly | Kathy's graph traversal is a conversational variant of Bridget's assembly |
| Loop - Product Thinking Conversation | System - Knowledge Graph | Kathy reads from the graph |
| Journey - Conversational Mastery Arc | Journey - Library Genesis to Steady-State | The mastery arc operates within the library's steady-state phase |
| Capability - Product Question Answering | System - Knowledge Graph | Kathy reads from the graph to answer questions |
| Capability - Assumption Challenging | System - Knowledge Graph | Kathy traverses decision records and linked alternatives in the graph |
| Capability - Connection Surfacing | System - Knowledge Graph | Kathy traverses graph edges to find non-obvious connections |
| Capability - Idea Pressure Testing | System - Knowledge Graph | Kathy traverses the graph to pressure-test ideas against existing library content |
| Capability - Implication Tracing | System - Knowledge Graph | Kathy traces downstream graph edges |

---

## Cross-References to Supplement Manifest (Part 2)

| Kathy Card | Supplement Card (Expected) | Relationship |
|------------|---------------------------|--------------|
| Journey - Conversational Mastery Arc | Cards from sources/progression-mastery.md | The mastery arc maps to stages 4-5 of the progression model. Exact card names pending Part 2 inventory completion. |
| Loop - Product Thinking Conversation | Cards from sources/engagement-loops.md | The conversation loop is an engagement loop variant. Cross-reference pending Part 2 inventory. |

---

## Conformance Map

| Standard | Constrains |
|----------|------------|
| Standard - Agent Customer Gate (Human vs. Builder) | Agent - Chatty Kathy, Agent - Bridget the Briefer |
| Standard - Five-Dimension Card Requirements (primary manifest) | All 14 cards in this inventory |
| Standard - Play Exit Status Protocol (primary manifest) | Agent - Chatty Kathy |
| Standard - User Assumptions (primary manifest) | Agent - Chatty Kathy |

---

## Build Order

Build in this sequence (upstream before downstream, most-depended-on first).

### Phase K1: Upstream (Standard, Principles)

These are rationale-layer cards. They must exist before the Agent and experience-layer cards that reference them.

| Order | Card | Depends On (Primary Manifest) | Rationale |
|-------|------|-------------------------------|-----------|
| K1.1 | Standard - Agent Customer Gate (Human vs. Builder) | Standard - User Assumptions (primary 1.3) | Testable spec. Constrains both Kathy and Bridget. Must exist before Agent cards reference it. |
| K1.2 | Principle - Read but Never Write (Conversational Agent) | Principle - The Critic and Builder Must Be Structurally Separated (primary 2.7) | Judgment guidance. Governs Kathy's relationship to the library. Must exist before Agent - Chatty Kathy references it. |
| K1.3 | Principle - Perspectives Not Directives | (none — standalone principle) | Judgment guidance. Governs Kathy's voice and role. Must exist before Agent and Aesthetic cards reference it. |

### Phase K2: Artifacts (Institutional Knowledge)

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| K2.1 | Artifact - Decision: Fifth Agent (Kathy) | Artifact - Decision 5 (primary 6.7), Artifact - Decision 8 (primary 6.10) | Decision record. Build before Agent card so the Agent card can reference the design rationale. |
| K2.2 | Artifact - Bridget-Kathy Differentiation | Agent - Bridget the Briefer (primary 7.4) | Content object. Build before Agent - Chatty Kathy so the Agent card can reference it. Depends on Bridget's card existing (or being scaffolded). |

### Phase K3: Agent

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| K3.1 | Agent - Chatty Kathy | K1.1, K1.2, K1.3, K2.1, K2.2; primary manifest Agent cards (7.1-7.4) | Anchor card. All experience-layer and Capability cards depend on this. Build after upstream rationale and artifacts. |

### Phase K3.5: Capabilities

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| K3.5.1 | Capability - Product Question Answering | K3.1 (Agent - Chatty Kathy) | Primary interaction mode. Must link to Agent card and System - Knowledge Graph. |
| K3.5.2 | Capability - Assumption Challenging | K3.1 (Agent - Chatty Kathy) | Pressure-testing mode. Must link to Agent card and System - Knowledge Graph. |
| K3.5.3 | Capability - Connection Surfacing | K3.1 (Agent - Chatty Kathy) | Cross-domain insight mode. Must link to Agent card and System - Knowledge Graph. |
| K3.5.4 | Capability - Idea Pressure Testing | K3.1 (Agent - Chatty Kathy) | Brainstorming mode. Must link to Agent card and System - Knowledge Graph. |
| K3.5.5 | Capability - Implication Tracing | K3.1 (Agent - Chatty Kathy) | Downstream analysis mode. Must link to Agent card and System - Knowledge Graph. |

### Phase K4: Experience Layer

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| K4.1 | Aesthetic - Conversational Warmth | K3.1 (Agent - Chatty Kathy); Aesthetic - Professional, Not Daffy (primary 8.5) | Target feeling. Must link to Agent card and extend existing aesthetic cards. |
| K4.2 | Loop - Product Thinking Conversation | K3.1 (Agent - Chatty Kathy); System - Knowledge Graph (primary 3.1) | Repeating cycle. Must link to Agent and System cards. |
| K4.3 | Journey - Conversational Mastery Arc | K4.2 (Loop - Product Thinking Conversation); K3.1 (Agent - Chatty Kathy) | Multi-phase arc. Depends on Loop (which composes it) and Agent. Build last — most downstream card. |

---

## Enumeration Decisions

| Entity | Options | Decision | Rationale |
|--------|---------|----------|-----------|
| Kathy's five capabilities (answers questions, brainstorms, identifies implications, challenges assumptions, surfaces connections) | 5 separate Capability cards vs. described within Agent card | **5 separate Capability cards** | Originally decided "within Agent card," but reversed during Play 4.2 health check (commit b173a31). Each capability has enough procedural depth (trigger, steps, examples, anti-examples) to warrant its own five-dimension card. The Agent card's WHERE section links to all five; the HOW section references them. This aligns with how Conan's capabilities are externalized into separate Capability cards in the primary manifest. |
| Kathy's six anti-capabilities ("does NOT") | 6 separate Anti-Pattern cards vs. within Agent card | **Within Agent card** | The "does NOT" list defines the agent boundary. It belongs in the Agent card's Anti-Examples section, not as standalone anti-pattern artifacts. Each anti-capability is a one-liner, not a rich institutional memory entry like the primary manifest's anti-pattern cards. |
| Voice guidance ("we/our", "holds opinions loosely", "asks follow-ups", "admits ignorance") | Separate Aesthetic cards per voice trait vs. one Aesthetic card | **One Aesthetic card** | All four voice traits compose a single emotional register (conversational warmth). They are always relevant together. Splitting would create four cards that always co-appear in retrieval. |

---

## Epistemic Status Note

This source describes a **pre-implementation design** based on one power user's emergent behavior. The source is explicit about this: "Right now this is one power user's experience." Four invalidation conditions are named.

All cards built from this source should:
- Note in WHEN that this is a design, not a deployed capability
- Preserve the "what would change this" content (especially in Artifact - Decision: Fifth Agent)
- Avoid presenting the five capabilities as validated patterns — they are hypothesized interaction modes
- Use the same epistemic framing applied to BUILD_TO_LEARN cards in the primary manifest (honest hedging, evidence status noted)

This is NOT flagged as BUILD_TO_LEARN because the design is grounded in observed behavior (the power user pattern exists and is described from experience). It is closer to "DESIGN_PROPOSED" — the pattern is real, the agent formalization is hypothesized.

---

## Summary

| Category | Count |
|----------|-------|
| Agents | 1 |
| Principles | 2 |
| Standards | 1 |
| Capabilities | 5 |
| Aesthetics | 1 |
| Artifacts | 2 |
| Loops | 1 |
| Journeys | 1 |

**Expected Total: 14 cards**

**Existing: 14 (100%)**

**Missing: 0**

---

## Flags

### HUMAN JUDGMENT NEEDED

1. **Artifact - Decision: Fifth Agent numbering.** Should this be numbered Decision 33 (continuing the primary manifest's sequence) or kept as a standalone design decision? The primary manifest's 32 decisions come from five thematic source files (knowledge-representation, team-architecture, wizard-design, quality-grading, service-and-tooling). Kathy's design decision comes from a different source lineage (agent design, not architecture decisions). Numbering it as 33 implies it belongs to the same series; keeping it unnumbered preserves the source boundary. Recommend: keep unnumbered unless the team decides to fold agent design decisions into the main decision series.

2. **Journey - Conversational Mastery Arc dependency on progression-mastery.md.** The mastery arc maps to stages 4-5 of the progression model described in sources/progression-mastery.md. That source is assessed in Part 2 but its cards are not yet inventoried in a manifest the author can reference. Sam should build this Journey card with explicit stub links (e.g., `[[Journey - Mastery Curve]]` or equivalent) and fill them when the Part 2 inventory is complete.

3. **Aesthetic - Conversational Warmth vs. extending Aesthetic - Professional, Not Daffy.** The primary manifest's Professional, Not Daffy aesthetic includes per-agent personality specifications. Kathy's warmth could be folded into that existing card as a fifth agent entry rather than a standalone Aesthetic card. Recommend: standalone card, because Kathy's warmth is a qualitatively different register from the other four agents' professional detachment — it is the first agent designed for emotional engagement rather than professional distance. But this is a judgment call.

---

## Completion Status

**DONE**

Fourteen cards identified. All classifications follow the type taxonomy decision tree. Build order respects upstream-before-downstream. Cross-references to primary manifest are mapped. Three HUMAN JUDGMENT NEEDED flags are noted but none block the build — Sam can proceed with the recommended defaults and adjust if the team overrides.
