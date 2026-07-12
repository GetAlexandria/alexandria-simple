# Source Assessment: Agent Design — Chatty Kathy

**Assessor:** Conan the Librarian — Job 0
**Date:** 2026-03-23
**Configuration:** Factory × High Novelty × High Complexity
**Scope:** Single source file: `docs/alexandria/sources/agent-chatty-kathy.md`

---

## Source Material Reviewed

| # | File | Target Knowledge Area(s) |
|---|------|--------------------------|
| 1 | `sources/agent-chatty-kathy.md` | 2.3 Agent Architecture (equivalent), 3.3 Engagement Loops, 3.4 Progression/Mastery |

---

## Coverage by Dimension

### Source 1: agent-chatty-kathy.md (→ Agent Architecture, Engagement Loops, Progression/Mastery)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Fifth agent clearly named with role, customer, five capabilities, six anti-capabilities ("does NOT"), and explicit differentiation table vs. Bridget. The agent boundary is drawn precisely. |
| WHY | High | Origin story is concrete and experiential — power user pattern, the Discord anecdote, "highest-value interaction that emerged." The WHY is grounded in observed behavior, not theoretical design. The Bridget/Kathy distinction has a substantive rationale (programmatic vs. conversational, agents vs. humans). |
| WHERE | High | Rich connections throughout: Kathy → Conan (flag, assessment pipeline), Kathy → Bridget (handoff), Kathy → Sam (does not write), Kathy → Nit (does not lint). References progression-mastery.md (the "talk to the library" pattern). The six-row comparison table connects to Bridget's card directly. |
| HOW | Med | Five capabilities are described at interaction level (answers questions, brainstorms, identifies implications, challenges assumptions, surfaces connections). The pipeline mechanics (Kathy → source material → Conan) are sketched. Missing: how Kathy traverses the graph, what her retrieval profile looks like, how she decides when to flag vs. when to draft, what "opinionated within library constraints" means mechanically. |
| WHEN | Med | "What Would Change This" section is explicitly temporal — four conditions that could invalidate or reshape the design. References the progression arc stages (Faith/Inspector). Missing: when this agent would ship relative to other work, what maturity the library needs before Kathy is viable, whether this is a v1.x or v2.x feature. |

**Verdict:** Strong. This is a well-structured agent design document. WHAT and WHY are thick — the origin story, the Bridget differentiation table, and the "does NOT" list give Sam everything needed for an Agent card and several supporting cards. WHERE is unusually rich for a single-source file because it explicitly positions Kathy relative to all four existing agents. HOW has the expected gap for a pre-implementation design: the interaction patterns are clear, but the mechanics (retrieval, graph traversal, flagging logic) don't exist yet. WHEN is adequate — the "what would change this" section is honest about the design's epistemic status.

---

## Standard Candidates

| Content | Source Location | Extraction Notes |
|---------|-----------------|------------------|
| Kathy reads but does not write to the library | §What Kathy Does NOT Do | **Ready.** Hard boundary. Same pattern as the Conan/Sam separation (Decision 5). Standard candidate. |
| Kathy presents perspectives, not directives | §What Kathy Does NOT Do | **Principle candidate.** Guidance on voice and role — not testable as a spec, but a clear design constraint. |
| Bridget/Kathy customer separation (agents vs. humans) | §What Makes Kathy Different from Bridget | **Ready.** Testable: who is the customer for this interaction? If builder agent → Bridget. If human → Kathy. Clean gate. |
| Kathy uses "we" and "our" — team member framing | §Voice | **Aesthetic candidate.** Target feeling, not testable spec. Extends the existing agent voice guide. |

---

## Anti-Pattern Content

| Found | Location |
|-------|----------|
| Kathy as yes-person or cheerleader | §Voice ("She's not a yes-person or a cheerleader") |
| Kathy making decisions for the human | §What Kathy Does NOT Do ("She may have opinions... but she presents them as perspectives, not directives") |
| Kathy writing cards directly (bypassing Sam) | §What Kathy Does NOT Do |
| Kathy producing structured briefings (duplicating Bridget) | §What Kathy Does NOT Do |
| Conversational mode bolted onto Conan instead of a separate agent | §What Would Change This (acknowledged as an alternative, not dismissed) |

Anti-pattern coverage: **Strong.** The "does NOT" section is six explicit anti-patterns. The voice section adds two more (yes-person, cheerleader). The "what would change this" section honestly names the scenario where this agent shouldn't exist at all (Conan absorbs the role). This is good epistemic practice.

---

## Source Gaps

### Critical (Blocks Build)

None. The source material is sufficient to produce an Agent card, supporting Principle/Standard cards, and relationship links to existing agents. The design is pre-implementation but the conceptual content is complete enough for card building.

### Addressable (Proceed with Caution)

- **HOW gap in retrieval mechanics.** Kathy's five capabilities all require graph traversal, but the source doesn't describe how she accesses the library. Bridget has retrieval profiles and card budgets (Decision 8). Kathy has no equivalent specification. **Mitigation:** Build the Agent card with the interaction-level HOW that exists. Flag retrieval mechanics as a gap to be filled when Kathy moves from design to implementation. Sam should not invent mechanics the source doesn't provide.

- **Validation gap.** The source is explicit: this is one power user's experience. The "what would change this" section names four invalidation conditions. **Mitigation:** Cards built from this source should carry the epistemic status forward. This is a design based on observed emergent behavior, not a validated pattern. Use the same "honest hedging" approach recommended for service/tooling decisions (Decisions 22-27).

- **No connection to wizard configuration.** The source doesn't address how Kathy affects wizard pool sizes, knowledge area assignments, or tier configurations. If Kathy ships, the wizard engine needs to know about a fifth agent. **Mitigation:** Not a card-building blocker — this is an implementation concern. Note for future wizard update.

### Nice to Have

- **Multi-user dynamics.** The source names this as an open question ("facilitator agent rather than coworker agent"). A team-setting source would enrich the design but isn't required for the single-user case.

- **Concrete conversation examples.** The five capabilities are described abstractly. Example transcripts (even hypothetical) would give Sam richer material for the Agent card's capability descriptions and would ground the voice guidance.

---

## Cards This Source Enables

| Card | Type | Source Section | Notes |
|------|------|---------------|-------|
| Agent - Chatty Kathy | Agent | Entire file | Fifth AI team member. Human-facing conversational product coworker. Named agent with defined capabilities (5), defined customer (product team humans), defined cannot-do list (6 items). Same pattern as the four existing Agent cards. |
| Artifact - Bridget/Kathy Differentiation | Artifact | §What Makes Kathy Different from Bridget | Content object: the six-dimension comparison table. Institutional knowledge about why two library-reading agents exist with different customers. |
| Artifact - Decision: Fifth Agent (Kathy) | Artifact | §Origin, §Design, §What Would Change This | Institutional knowledge artifact. Design decision with origin story, rationale, and invalidation conditions. Same pattern as Decision 5 (Four Agents, Not One). |
| Principle - Read but Never Write (Conversational Agent) | Principle | §What Kathy Does NOT Do | Judgment guidance: conversational agents consume the library but never modify it. Modifications go through the standard pipeline (source → Conan → Sam). |
| Principle - Perspectives Not Directives | Principle | §What Kathy Does NOT Do, §Voice | Judgment guidance: Kathy may have opinions grounded in the library but presents them as perspectives, not directives. Human decides. |
| Aesthetic - Conversational Warmth | Aesthetic | §Voice | Target emotional state for Kathy interactions: warm, engaged, substantive. "Colleague you'd want to whiteboard with." Extends existing agent voice guide with a fifth personality. |
| Standard - Agent Customer Gate (Human vs. Builder) | Standard | §What Makes Kathy Different from Bridget | Testable spec: if the customer is a builder agent, route to Bridget. If the customer is a human, route to Kathy. Clean classification gate. |
| Loop - Product Thinking Conversation | Loop | §What Kathy Does, §Origin | Repeating activity cycle: human has product question → opens conversation with Kathy → Kathy traverses library and synthesizes → human gets insight → insight compounds into better product decisions. Trigger: human needs a product thinking partner. |
| Journey - Conversational Mastery Arc | Journey | §Origin, cross-ref progression-mastery.md | Multi-phase progression: from asking simple questions → brainstorming → pressure-testing → challenging assumptions → surfacing connections the human missed. Links to existing skill curve (progression-mastery.md stages 4-5). |

**Total: 9 cards** (1 Agent, 2 Artifact, 2 Principle, 1 Aesthetic, 1 Standard, 1 Loop, 1 Journey)

---

## Readiness: READY

**Proceed.** The source material is substantive and well-structured. WHAT and WHY are thick. WHERE connections to existing agents are explicit. The HOW gap (retrieval mechanics) is expected for a pre-implementation design and does not block card building — it blocks implementation, which is a different phase.

The key strengths:
- The Bridget/Kathy differentiation table prevents the most likely confusion (why two library-reading agents?)
- The "does NOT" list draws hard agent boundaries — same pattern that works well for the existing four agents
- The "what would change this" section preserves epistemic honesty about the design's validation status
- The origin story (emergent power user pattern) gives WHY genuine depth

The key caution: this is a design document for an unbuilt agent. Cards should reflect that status. The Agent card exists as a design, not as a deployed capability. Sam should use the same epistemic framing applied to service/tooling decisions — present the design honestly, flag what's hypothesized vs. what's observed.

**Recommended next steps:**
1. Proceed to card building for the 9 identified cards
2. Build the Agent card first — it's the anchor for the other 8
3. Link to existing Agent cards (Conan, Sam, Nit, Bridget) via the differentiation table and the "does NOT" list
4. Preserve the "what would change this" content in the Decision artifact — it's the most valuable part for future reassessment
5. Cross-reference `sources/progression-mastery.md` when building the Journey card — the "talk to the library" pattern originated there

---

**Status: DONE**
