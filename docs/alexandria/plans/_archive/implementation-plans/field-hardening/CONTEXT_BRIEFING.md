# Context Briefing

## Task Frame

**Task:** Assemble library context for Field Hardening, a seven-stream meta-plan targeting a near-term release, covering taxonomy single-source-of-truth, blocked-card-first flow, agent-name curtain, top-1 rule, one-at-a-time questioning, jargon sweep, and slash-command prefix normalization.
**Target type:** Agent / Artifact / Standard (multi-surface — spans agent behavior, vocabulary governance, and skill surface)
**Task type:** architecture (refactor + behavior hardening across seven intersecting work streams)
**Constraints:** Raven is the sole user-facing voice — internal agent names (Sam, Conan, Solomon, Bridget) must not appear in user-facing prose. The skill naming convention (`name: <short>` in SKILL.md frontmatter, host auto-prefixes `ax:`) is stable — do not manually add prefixes. Three vocabularies (22 wizard knowledge areas, 18 card types, 15 retrieval profiles) are currently misaligned; work stream 1 must not widen that gap. The three-tier interaction model and top-1 rule have no library cards yet — these are net-new design decisions, not refinements of existing cards.
**Acceptance criteria:** Each work stream has a named library grounding (or an explicit gap call-out); the builder can make implementation decisions without fabricating rationale; gaps are enumerated so Sam knows what to build next.

---

## Primary Cards (full content)

### Artifact - Type Taxonomy
**Type:** Artifact
**Relevance:** Work stream 1 (taxonomy single-source-of-truth). The 18-type decision tree is the authoritative classification system. Scoreboard matchers, linter folder checks, `KNOWN_TYPES`, and knowledge-area-to-card-type mapping must all derive from this one source — not from the six duplicate files identified in the scratchpad.

Full content: The Type Taxonomy is an 18-type classification system organized as a five-step decision tree (WHY layer → Product Thesis/Principle/Standard; user-facing interaction → Domain/Section/Governance/Template/Component/Artifact/Capability/Primitive; invisible infrastructure → System; AI team member → Agent; experience over time → Loop/Journey/Experience Goal/Force). It defines containment relationships (Section must link to Domain; Component must link to Template or Section or Governance; etc.) and four classification guardrails (Interaction Test, Component Litmus, Governance Test, Action-word Test). The taxonomy is consulted by Conan during inventory, enforced by `alxndr lint`'s folder-placement checks, used by Sam when building cards, and governs the node types in the Knowledge Graph.

Key constraint for work stream 1: The scratchpad identifies seven places where type/link information is duplicated (Conan's type-taxonomy.md, Sam's card-creation.md, Sam's library-organization.md, Sam's link-patterns.md, Sam's self-check.md, Sam's decomposition.md, Bridget's retrieval-profiles.md, and `docs/alexandria/reference.md`). The scratchpad notes that `reference.md` is "the 7th copy of the type decision tree BUT Conan's downstream sync treats it as canonical." Work stream 1 must designate one canonical source and point all others at it rather than duplicating content.

WHAT: 18-type classification with 5-step decision tree and 4 guardrails. WHERE: Contained by [[Section - Card Repository]]; governs [[Artifact - Library Folder Structure]], [[Artifact - Naming Convention]], [[System - Knowledge Graph]], [[Capability - Inventory]], [[Capability - Linting]], [[Template - Card]]. WHY: Typed nodes enable type-based retrieval profiles, type-specific grading criteria, and type-aware traversal that untyped documents cannot support. WHEN: Stable (concept), Extensible (new types trigger Downstream Sync). HOW: Decision tree → containment table → four guardrails → type origin annotations.

---

### Artifact - Noun Vocabulary
**Type:** Artifact
**Relevance:** Work streams 1 and 6 (taxonomy SSoT and jargon sweep). This is the canonical glossary that governs terminology across all library cards, agent output, and user-facing communication. Work stream 6 must check user-facing prose against this vocabulary — and also against assumption #3 of the Never-Violate Set, which says "ask in product language, not system language."

Full content: The Noun Vocabulary defines authoritative names for card types (18), agent names (Conan the Librarian, Sam the Scribe, Bridget the Briefer, Solomon the Sorter, Raven the Maven), workflow terms (play, surgery plan, spot-check, assembly, briefing), quality terms (dimension, rubric, grade, sweep, lint target), structural terms (wikilink, context phrase, containment, conformance), and newer term categories (Planning Terms, Eval Terms, System Terms). Usage rule: "In user-facing output, prefer plain language first and introduce the canonical term parenthetically when needed." The vocabulary is organized by the four-layer structure: Rationale layer (Product Thesis, Principle, Standard) → Domain layer (12 types) → Experience layer (Loop, Journey, Experience Goal, Force).

Key constraint for work stream 6: The jargon sweep must distinguish between terms that are internal-only (agent names, card types, lint targets, sweep levels) and terms that are legitimate user vocabulary when introduced carefully (knowledge areas, library, sessions). The Never-Violate Set assumption #3 is the test: if a user would need to understand Alexandria's internal system to parse it, the term is jargon. Agent names — Sam, Conan, Solomon, Bridget — are system-internal; Raven is the one agent name that crosses the user boundary.

WHAT: Canonical glossary of product terms. WHERE: Contained by [[Section - Card Repository]]; governs all cards, agent output, user-facing communication; related to [[Artifact - Type Taxonomy]], [[Artifact - Naming Convention]], [[Capability - Linting]] (sweep 5 checks terminology drift). WHY: Terminology drift makes search unreliable; agents match on terms not concepts. WHEN: Stable (core terms), Growing (new terms added as product evolves). HOW: Four-layer structure → term categories table → card type origins table → usage rules.

---

### Agent - Raven the Maven
**Type:** Agent
**Relevance:** Work streams 3, 4, and 5 (agent-name curtain, top-1 rule, one-at-a-time questioning). Raven is the sole user-facing voice. The agent-name curtain means Raven never surfaces Sam, Conan, Solomon, or Bridget by name to the user. The top-1 rule (no library card yet) and one-at-a-time questioning both constrain Raven's concierge greeting and interview cadence.

Full content: Raven is the outward-facing library role — human-facing thinking partner for the product owner and team. She reads the knowledge graph, signal queue, feedback queue, provenance log, and health reports. She does product question answering, idea pressure testing, implication tracing, assumption challenging, and connection surfacing. She does NOT write cards (Sam), grade (Conan), lint (CLI), triage signal (Solomon), or produce structured briefings (Bridget). From Turn 4 onward she produces a rolling handoff block for Solomon/feedback queue/Conan. She uses evidence tier signaling (Tier 1: library-grounded, Tier 2: library-inferred, Tier 3: general knowledge). `/library` is her sole invocation surface — `/wizard` was collapsed into `/library` as an internal `initialize` sub-procedure (FEAT-045). She is governed by [[Standard - Agent Customer Gate (Human vs. Builder)]], [[Standard - Conversational Warmth]], [[Standard - Professional, Not Daffy]], and [[Principle - Read but Never Write (Conversational Agent)]].

Key constraints for work streams 3/4/5:
- Work stream 3 (agent-name curtain): Raven must never say "I'm handing this to Sam" or "Conan will grade that." She can say "that gets added to the library" or "that goes through our quality process." The curtain is already implied by the customer gate, but needs to be explicit in Raven's skill files.
- Work stream 4 (top-1 rule): The scratchpad notes "Raven concierge greeting — state-driven orientation (state read + top-1 nudge + open invitation). No card or implementation." This is a net-new design decision. The library has no card for the three-tier interaction model or top-1 rule. The builder must create these.
- Work stream 5 (one-at-a-time questioning): The scratchpad notes Raven walks interviews section by section. The grouped conversational proposal flow (Decision 37) provides a prior precedent for this pattern but applies to the scanner, not Raven.

WHAT: Human-facing library thinking partner. WHERE: [[Domain - Library Boundary]], [[Section - Assembly Workspace]]; conforms to [[Standard - Agent Customer Gate (Human vs. Builder)]], [[Standard - Five-Dimension Card Requirements]], [[Standard - Play Exit Status Protocol]], [[Standard - User Assumptions (Never-Violate Set)]]. WHY: Delivers library context to humans who make product decisions; primary mechanism for human alignment. WHEN: Raven + Solomon split from Chatty Kathy; eval hardening (2026-03) enforced rolling handoff and evidence tiers; FEAT-045 collapsed /wizard into /library. HOW: Five conversational capabilities (Q&A, pressure testing, implication tracing, assumption challenging, connection surfacing); reads five institutional sources; rolling handoff block from Turn 4; evidence tier signaling; boundary outputs to Solomon inbox, feedback queue, Conan flags.

---

### Agent - Sam the Scribe
**Type:** Agent
**Relevance:** Work stream 2 (blocked-card-first flow). Sam's card-drafting behavior determines whether blocked cards (cards a builder needs but that don't exist) get prioritized. Understanding his job sequence and input path is essential before wiring the blocked-card-first signal.

Full content: Sam is the library card craftsman — the only agent that writes library card content. Three jobs: (1) Card creation from Conan's inventory, (2) Card fixing from surgery plans, (3) Self-check. Build order: Standards first, then Product Theses/Principles, then product-layer cards. Self-check is real verification (structure, link resolution, link annotation, content substance) before handoff to `alxndr lint`. Sam is curious, not reckless: when uncertain about type, containment, or links, he searches before guessing. He is governed by [[Principle - Build Upstream Before Downstream]], [[Principle - Filter the Handoff, Don't Wall It]], [[Principle - One Concept Per Card]], and [[Principle - Output Discipline]].

Key constraint for work stream 2: The current input path for Sam is Conan's inventory (for new cards) and Conan's surgery plans (for fixes). There is no "blocked card" signal path — no mechanism for Bridget's gap manifests to trigger Sam directly. The [[Loop - Release Planning]] card says "Sam builds cards to fill gaps identified in Bridget's gap manifests" but this is aspiration, not wired behavior. The scratchpad confirms the build pipeline is disconnected: "wizard → Solomon → Conan → Sam is the intended flow, but nothing connects the stages." Work stream 2 must design the signal path from gap manifest → Sam, without bypassing Conan's quality gate.

WHAT: Library card craftsman — three jobs (create, fix, self-check). WHERE: [[Domain - Library Interior]], [[Section - Card Repository]], [[Section - Rationale Layer]]; conforms to [[Governance - Agent Capability Matrix]], [[Standard - Five-Dimension Card Requirements]], [[Standard - Play Exit Status Protocol]]. WHY: Dedicated builder because combining building and grading produces quality softening; filtered handoffs prevent Sam from accommodating Conan's framing rather than source material. WHEN: Extracted from original single-agent model; eval hardening (2026-03) validated fix-cards as distinct job. HOW: Job 1 (create from inventory, WHAT-first construction), Job 2 (fix from surgery plans, Tier 1 first), Job 3 (self-check: structure/links/substance before handoff).

---

### Artifact - Decision: Skill Naming Convention
**Type:** Artifact
**Relevance:** Work stream 7 (slash-command prefix normalization). This is the settled architectural decision governing how plugin skills name themselves. The builder needs this to understand what "normalization" means in context — and what would be wrong to do.

Full content: Plugin skills use short `name:` fields in SKILL.md frontmatter (`name: library`, `name: plan`, `name: brief`). Claude Code auto-prefixes the namespace: users invoke `/alexandria:<name>`. Skills must never manually prefix `alexandria:` — doing so produces double-namespace output (`/alexandria:alexandria:library`). This decision was formalized during planning-polish (2026-04). The resulting convention: every skill's `name:` field is a short, namespace-free identifier. Examples: `library`, `plan`, `brief`, `sync-tickets`. Wrong: `alexandria:library`, `alexandria-plan`.

Key constraint for work stream 7: The task description says "rename all user-visible skills to `/ax:<skill>`." This conflicts with the settled decision. The current invocation surface is `/alexandria:<name>`. If the plugin namespace is changing from `alexandria` to `ax` (because the plugin is now called `ax` or the manifest `name` field changed), that is a plugin manifest change, not a skill `name:` field change. The builder must determine: (a) is the plugin-level `name` in `plugin.json` changing? (b) or is this a per-skill rename within the existing namespace? These are different operations. The decision card establishes that skills own only the short name; the host owns the prefix.

WHAT: Plugin skills use short `name:` fields; host auto-prefixes namespace. WHERE: Governs [[System - Wizard Configuration Engine]]; related to [[Artifact - Naming Convention]], [[Artifact - Decision 26: MCP Tools as AI-Native Interface]]. WHY: Manual prefixing produces double-namespace output; coupling skill files to host prefix format breaks portability. WHEN: Decided during planning-polish (2026-04); stable. HOW: Each skill's `name:` = short identifier; resulting slash command = `/alexandria:<name>`; anti-examples show double-namespace failure mode.

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Standard - Agent Customer Gate (Human vs. Builder)]] | Standard | Testable routing gate: builder requests → Bridget; human conversation → Raven; signal intake → Solomon. No overlap case. This is the mechanism that enforces the agent-name curtain structurally. |
| [[Standard - User Assumptions (Never-Violate Set)]] | Standard | Seven hard constraints including #3 (product language not system language), #4 (invisible mechanics), #7 (no surprise delegation). Work streams 3, 5, and 6 all bump against these. |
| [[Standard - Conversational Warmth]] | Standard | Four required traits for Raven: team membership framing, loosely held opinions, follow-up questions, honest ignorance. One-at-a-time questioning (work stream 5) must honor the follow-up question trait. |
| [[Standard - Professional, Not Daffy]] | Standard | Per-agent voice calibration. Raven's warmth must not tip into effusive agreement; Bridget has no personality quirks. Both matter for the jargon sweep if user-facing prose currently reads as daffy. |
| [[Standard - Progressive Disclosure Levels]] | Standard | Three levels (Min Viable, Core, Full). Framing obligation: each level must feel complete, not "30% done." One-at-a-time questioning (work stream 5) should respect this — don't overwhelm in session 1. |
| [[Artifact - Agent Voice Guide]] | Artifact | Per-agent personality table: Conan (authoritative/exacting), Sam (cheerful craftsman), Bridget (competent facilitator), CLI (no voice). Relevant to jargon sweep — these personalities must not leak into user-facing output. |
| [[Artifact - Decision 5: Four Agents, Not One]] | Artifact | Foundational separation-of-concerns decision. Establishes why agent names encode roles (Scribe, Briefer, etc.) and why the roles must not collapse. The agent-name curtain does not undo this — it localizes these names to the library interior. |
| [[Artifact - Decision: Single Entry Point]] | Artifact | `/library` is Raven's sole invocation surface. `/wizard` is retired. `initialize` is an internal sub-procedure. Relevant to work stream 7: if `/ax:library` is the new invocation, this card needs updating. |
| [[Artifact - Decision 37: Grouped Conversational Proposal Flow]] | Artifact | Summary-first, domain-grouped review for the Codebase Scanner. Established precedent for one-at-a-time sectioned questioning (work stream 5), though that decision applied to scanner proposals, not Raven interviews. |
| [[Principle - One Verb Per Agent Role]] | Principle | Raven THINKS, Sam BUILDS, Conan GRADES, Solomon TRIAGES, Bridget ASSEMBLES. This is what the agent-name curtain protects — users see one coherent voice (Raven), not a committee. |
| [[Principle - Read but Never Write (Conversational Agent)]] | Principle | Raven reads the graph and writes only boundary outputs (handoff notes, feedback queue entries, flag notes). Hard constraint on work stream 3: Raven cannot write the blocked cards herself. |
| [[Capability - Linting]] | Capability | `alxndr lint` sweep 5 checks terminology drift against the Noun Vocabulary. Work stream 6 (jargon sweep) can leverage this as a mechanical check before and after the sweep. |
| [[Loop - Release Planning]] | Loop | "Sam builds cards to fill gaps identified in Bridget's gap manifests." This is the aspirational home for work stream 2's blocked-card-first signal path — currently unimplemented (pipeline disconnected per scratchpad). |
| [[System - Knowledge Graph]] | System | Foundational mechanism that all agents traverse. Type taxonomy, retrieval profiles, and SAM's link patterns all derive from this graph's node types. Taxonomy SSoT (work stream 1) is ultimately a question of which source defines the graph's type vocabulary. |
| [[Governance - Agent Capability Matrix]] | Governance | Sam's exclusive capability is card writing; Conan's is grading; Bridget's is context assembly. The matrix is the reference point if work stream 3 needs to document what Raven can and cannot expose to users. |

---

## Relationship Map

- [[Artifact - Type Taxonomy]] is-source-of-truth-for [[Artifact - Noun Vocabulary]] (type names in the vocabulary come from the taxonomy — taxonomy is upstream)
- [[Artifact - Type Taxonomy]] should-be-referenced-by [[Capability - Linting]] (lint folder checks should derive from taxonomy, not maintain their own KNOWN_TYPES list)
- [[Agent - Raven the Maven]] conforms-to [[Standard - Agent Customer Gate (Human vs. Builder)]] (gate enforces that Raven serves only human customers — structural basis for the agent-name curtain)
- [[Agent - Raven the Maven]] conforms-to [[Standard - Conversational Warmth]] (one-at-a-time questioning and top-1 rule must honor warmth traits, especially follow-up questions)
- [[Agent - Sam the Scribe]] depends-on [[System - Feedback Queue]] indirectly via [[Agent - Conan the Librarian]] (blocked-card signal path: gap manifest → feedback queue → Conan → Sam is the intended but unwired flow)
- [[Artifact - Decision: Skill Naming Convention]] governs [[System - Wizard Configuration Engine]] (naming convention determines how /ax:library vs /alexandria:library works — the plugin manifest `name` field is the actual lever)
- [[Standard - Professional, Not Daffy]] constrains [[Agent - Raven the Maven]] via [[Standard - Conversational Warmth]] (warmth must not tip into Daffy — relevant to jargon sweep prose quality)
- [[Artifact - Noun Vocabulary]] is-checked-by [[Capability - Linting]] (sweep 5 terminolgy drift check — jargon sweep can use this as a mechanical gate)
- [[Standard - User Assumptions (Never-Violate Set)]] assumption-3 constrains work-stream-6 (product language first; system language only on opt-in — this is the test for what counts as jargon)
- [[Artifact - Decision 37: Grouped Conversational Proposal Flow]] precedents [[Agent - Raven the Maven]] one-at-a-time-questioning (same UX pattern, different surface — scanner vs Raven interviews)

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| WHAT | Three-tier interaction model (Tier 1: talk, Tier 2: named actions, Tier 3: slash commands) | Scratchpad line 31; all agent cards; all standard cards | Nothing — scratchpad explicitly flags "No card exists yet" | Sam must create a new card. Type: Artifact (a design decision). This card is load-bearing for work streams 3, 4, and 5. |
| WHAT | Top-1 rule (surface single most important next move) | Scratchpad line 33; Raven card; all standard cards | Nothing — scratchpad explicitly flags "No card or implementation" | Sam must create a new card. Type: Standard (a testable behavioral constraint on Raven). This card governs work stream 4. |
| WHAT | Raven concierge greeting (state read + top-1 nudge + open invitation) | Scratchpad line 32; Raven card; all loop/journey cards | Nothing — scratchpad explicitly flags "No card or implementation" | This may fold into the top-1 rule card, or become a separate Capability card. Needed before work stream 4 can be implemented. |
| WHAT | Blocked-card signal path (gap manifest → Sam trigger) | Sam card; Loop - Release Planning; Loop - Alignment Sweep | Aspirational reference in [[Loop - Release Planning]] only — the pipeline is confirmed disconnected | The wiring design is a net-new decision. Builder must design: does it go gap manifest → feedback queue → Conan → Sam, or is there a shorter path? Document as an Artifact decision card. |
| WHAT | Knowledge-area-to-card-type mapping (explicit table) | Scratchpad lines 62/67; Type Taxonomy; Noun Vocabulary | Scratchpad confirms: "No explicit knowledge-area → card-type mapping — Conan figures it out agentically during inventory. Major confusion source." | Sam must create a mapping artifact. This is the core deliverable of work stream 1 alongside designating a canonical source. |
| WHAT | Agent-name curtain (explicit rule prohibiting internal agent names from user-facing output) | Raven card; Agent Voice Guide; all standards | Nothing explicit — the customer gate implies it but no card names it | Consider adding a clause to [[Standard - Agent Customer Gate (Human vs. Builder)]] or creating a short Standard card. This is a user-facing UX constraint, not just a routing rule. |
| WHERE | Three-vocabulary alignment (22 wizard areas, 18 card types, 15 retrieval profiles) | Scratchpad lines 62/67; Noun Vocabulary; Type Taxonomy; Bridget retrieval profiles | Scratchpad confirms all three are disconnected — "5 wizard areas have no card type, 3 card types have no wizard area, Bridget missing rationale layer profiles" | This is a design exercise, not a card gap. The knowledge-area→card-type mapping (above) partially addresses it. Full alignment may require a separate planning track. |
| HOW | One-at-a-time questioning cadence for Raven interviews | Raven card; Standard - Conversational Warmth; Decision 37 | Decision 37 covers scanner, not Raven; Raven card has no section-by-section interview procedure | Add to Raven's HOW section or create a new Capability card for "Section-by-Section Elicitation." |

---

## Anti-Patterns

Work streams in this plan are at risk of the following documented anti-patterns:

- **[[Artifact - Anti-Pattern: Compensatory Pool Expansion]]** — Work stream 1 must not solve the duplicate-type-info problem by adding yet another canonical source. The solution is to designate one of the existing sources (likely `reference.md`) and delete or redirect the others.
- **[[Artifact - Anti-Pattern: Emergent Agent Behavior]]** — Work stream 3 (agent-name curtain) must not be implemented by having Raven improvise which names to hide. It must be an explicit, checkable rule in Raven's skill files — not emergent discretion.
- **[[Artifact - Anti-Pattern: Planning Without Library Separation]]** — Work stream 2's blocked-card signal path design should be recorded as a library decision card (Artifact type), not buried in the implementation plan prose. Otherwise the design decision becomes invisible to future agents.
- **[[Artifact - Anti-Pattern: Human-First Format by Default]]** — Work stream 6 (jargon sweep) should produce a lint rule or vocabulary check, not just a one-time prose edit. Without a mechanical gate, jargon drifts back.

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

**Concern 1 — Three cards are missing that are load-bearing for work streams 3, 4, and 5.** The three-tier interaction model, the top-1 rule, and the Raven concierge greeting have no library cards. The builder cannot derive these from existing cards — they are net-new design decisions. Sam must build these before work streams 3, 4, and 5 can be implemented faithfully.

**Concern 2 — Work stream 7 has a potential conflict with the settled skill naming decision.** The task description says "rename all user-visible skills to `/ax:<skill>`." The current settled decision is that Claude Code auto-prefixes `/alexandria:` and skills use short `name:` fields. If the plugin manifest `name` or `id` is changing from `alexandria` to `ax`, that is a plugin.json change — not a per-skill change. The builder must resolve this before touching skill files.

**Concern 3 — The blocked-card signal path (work stream 2) has no wiring in the current system.** The pipeline is confirmed disconnected. The builder is designing new infrastructure, not wiring existing hooks. This is scoped work, not a quick configuration.
