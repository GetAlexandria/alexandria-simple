# Context Briefing

## Task Frame

**Task:** Extend the wizard to scan codebases, discover product entities, propose them to users, and validate documentation against code reality. Four milestones: Routing (input-path determination), Scanner (tiered codebase scan), Noun Proposal (interactive dialogue), and Code Walk (doc-vs-code validation).

**Target type:** System (extending the Wizard Configuration Engine and Gap Analysis Engine)

**Task type:** Architecture change (new input channel, new systems, modifications to existing wizard pipeline)

**Constraints:**
- The user is the product expert; scanner output is PROPOSED, never authoritative (Lesson: The User Is the Product Expert)
- Day-1 Complexity Ceiling must hold: adding codebase scanning must not increase the number of entry points or questions beyond the current ceiling
- Scanner must produce product-level nouns, not technical implementation details
- Progressive investigation (tree first, then schema, then targeted walk) to control token cost
- The non-compensatory gate is unchanged: codebase discovery feeds INTO the existing pool/tier system, it does not bypass it
- Must not extract commit history, performance data, or behavioral analytics from code (plan explicitly descopes these)

**Acceptance criteria:**
- M1: Two yes/no routing questions correctly determine input path (code-only, docs-only, both)
- M2: Tiered scanner produces structured noun proposals from a codebase with measured token cost per tier
- M3: Interactive dialogue takes a solo builder from code to library config in under 10 minutes
- M4: Code walk surfaces divergences between docs and code with classification (missing-from-code, missing-from-docs, evolved-past-docs)

---

## Primary Cards (full content)

### System - Wizard Configuration Engine

**Type:** System
**Relevance:** The wizard is the system being extended. Codebase discovery adds a new input channel (code signals) that feeds into the existing three-axis configuration. The scanner's output must integrate with pool membership, sensitivity profiles, and tier assignment without modifying the core algorithm.

#### WHAT: Definition

The Wizard Configuration Engine accepts three inputs -- AI Mode (decision authority level), Domain Novelty (how much the product departs from standard patterns), and Product Complexity (how interconnected the product's subsystems are) -- and produces tiered knowledge area assignments across 22 knowledge areas organized into five domains. The engine operates through a pipeline: inputs determine pool membership via a non-compensatory gate (Decision 16), sensitivity profiles map each in-pool area's response to novelty and complexity (Decision 19), the max() combination rule resolves dual-axis areas (Decision 17), and three explicit anomaly overrides handle interaction effects that the clean algebra cannot express (Decision 18). This produces 36 distinct configurations (4 modes x 3 novelty x 3 complexity), each assigning every in-pool area to one of four tiers: Foundation, Core, Amplifier, or Deprioritized.

#### WHERE: Ecosystem

- Conforms to: [[Standard - Wizard Non-Compensatory Gate]], [[Standard - Wizard max() Combination Rule]]
- Upstream of: [[System - Gap Analysis Engine]]
- Related: [[Product Thesis - Better Context Produces Better Agent Output]], [[Principle - Front-Load Value, Not Completeness]], [[Principle - Build Upstream Before Downstream]], [[Principle - Measure Before Promoting]]

#### WHY: Rationale

The engine determines which context areas will produce the greatest improvement in agent output for a specific product, given finite time and attention. Without structured configuration, teams either document everything (unsustainable) or guess what matters (unreliable). The three axes are genuinely orthogonal: a high-novelty, low-complexity product has completely different knowledge needs than a low-novelty, high-complexity one.

#### WHEN: Timeline

The engine has been built, tested across all 36 configurations, and used with real products. The interface layer was refactored in v0.4.1 for non-systems-thinkers. Stability: **Stable** (architecture and algorithm), **Calibrating** (axis boundaries, especially Pair Programmer mode), **Stable** (interface layer after v0.4.1 refactor).

#### HOW: Mechanics

Pipeline: Pool membership (non-compensatory gate) -> Sensitivity profiles -> Combination (max() rule) -> Anomaly overrides -> Tier output. Interface layer (v0.4.1) replaced the complexity question with a six-item binary checklist, added novelty disambiguation bumps, and added a configuration confirmation signal.

**Anti-Examples:**
- Wrong: Compensatory model (allowing high novelty to promote areas into the pool regardless of AI Mode)
- Wrong: Continuous scoring (1-100 instead of discrete tiers)
- Wrong: Benchmarking to AI capability instead of product attributes

---

### System - Gap Analysis Engine

**Type:** System
**Relevance:** Codebase discovery directly affects gap analysis. Currently, gap severity is determined by human self-report (Phase B: Knowledge Declaration). The scanner can provide code-validated gap severity: an area the human reports as "present" but the scanner finds no code evidence for has a different gap severity than one with rich code support. Code walk (M4) produces divergence classifications that feed directly into gap scoring.

#### WHAT: Definition

The Gap Analysis Engine compares the Wizard Configuration Engine's tier assignments against existing library state to produce scored, sequenced gaps. The core formula is `priority_score = tier_weight x gap_severity x freshness_penalty`. The engine answers the actionable question: not "what do you need?" but "what do you need that you don't have?"

#### WHERE: Ecosystem

- Depends on: [[System - Wizard Configuration Engine]], [[System - Knowledge Graph]]
- Conforms to: [[Standard - Five-Dimension Card Requirements]]
- Related: [[Principle - Front-Load Value, Not Completeness]], [[Principle - Factory Demand Drives Library Priority]], [[Capability - Health Check]]

#### WHY: Rationale

Most teams are not starting from zero. Without gap analysis, every team gets the same generic build order regardless of what they already have. The freshness penalty is critical: present-but-stale documentation creates false confidence.

#### WHEN: Timeline

Built and tested. Freshness penalty values are initial calibrations based on team judgment, not empirical measurement. Stability: **Stable** (formula structure), **Calibrating** (penalty weights, severity mappings).

#### HOW: Mechanics

Scoring: `priority_score = tier_weight x gap_severity x freshness_penalty`. Output: phased, scored gap sequence (Foundation -> Core -> Amplifier). Each gap includes a tailored solicitation prompt with mode-sensitive variants.

**Anti-Examples:**
- Wrong: Binary gap detection (present/absent without severity)
- Wrong: Ignoring freshness
- Wrong: Flat priority list without phasing

---

### Artifact - Decision 32: Bottom-Up Discovery as Design Principle

**Type:** Artifact (Decision)
**Relevance:** This is THE design principle for codebase discovery. The scanner discovers product entities bottom-up from code signals, not top-down from a taxonomy. Every quality mechanism in the library that stuck was discovered by running the system and noticing what went wrong. Codebase discovery follows the same pattern: scan -> propose -> confirm -> structure.

#### WHAT: The Choice

The quality system should continue to evolve bottom-up -- from observed problems to programmatic solutions -- rather than being designed top-down from quality theory. Every quality mechanism that stuck was discovered by running the library and noticing what went wrong.

#### WHY: Rationale

Three reasons: (1) The track record -- every quality mechanism that stuck was bottom-up discovered. (2) Context libraries are new -- no established theory exists for AI-maintained product knowledge graphs. (3) The eval/iterate mechanism is designed to continue this discovery at scale.

**Novel failure modes discovered bottom-up:**

| Failure Mode | Traditional Analog | What Is Different |
|-------------|-------------------|-------------------|
| Hollow cards | Stale documentation | Structurally present but contextually empty |
| Misleading links | Broken links | Link resolves but target has drifted |
| Grade softening | Inconsistent reviews | Grader unconsciously lowers the bar after fixing |
| Cascade staleness | Dependency rot | Fixing upstream leaves downstream stale |

**Anti-Examples:**
- Wrong: Designing quality rules from documentation best practices without running the library
- Wrong: Stopping bottom-up discovery after the initial set of rules

---

### Artifact - Roadmap: Cold Start Reduction

**Type:** Artifact (Roadmap)
**Relevance:** Codebase discovery IS the primary cold start reduction mechanism. The plan document describes the same feature this roadmap card anticipated. The scan-and-seed agent described here is being designed as the progressive codebase discovery feature.

#### WHAT: Definition

Cold Start Reduction addresses the gap between "I'm interested" and "I have something useful." Two approaches: a scan-and-seed agent that reads an existing codebase and generates a draft library (zero human input), and template libraries by domain.

#### WHY: Rationale

Competitive urgency: Theory 2 (Built-in Model Features) already has zero cold start. Every day the wizard requires a lengthy upfront conversation is a day the product is harder to adopt than the competition.

#### HOW: Implementation

**Approach 1: Scan-and-Seed Agent** -- reads codebase, generates draft library, even low quality. "A bad draft you can edit is infinitely better than a blank page." Must honestly label inferred vs. confirmed content.

**Anti-Examples:**
- Wrong: Making scan output look polished when it is actually thin -- use INFERRED/DRAFT labels
- Wrong: Building 20 domain templates before validating that template-based cold start improves adoption

---

### Artifact - Lesson: The User Is the Product Expert

**Type:** Artifact (Lesson)
**Relevance:** CRITICAL constraint for the scanner. Code signals propose; the human confirms. The scanner must NEVER generate product knowledge from inference alone. When the scanner proposes "you have a Subscription model," only the human can say "yes, that's our core billing entity" vs. "that's a deprecated experiment."

#### WHAT: The Lesson

Alexandria user is the product expert. The system's job is to structure, preserve, and serve knowledge -- not to generate it, infer it, or substitute for it. Source material comes from the human. The agents organize and maintain it. The human provides domain truth, the system provides structural discipline.

#### Anti-Examples

- An agent generating product rationale from its training data
- Filling a hollow WHY section with inferred reasoning instead of flagging for human input
- Treating the system's structural output as product decisions

---

### Artifact - Decision 14: Twenty-Two Knowledge Areas

**Type:** Artifact (Decision)
**Relevance:** The scanner needs to map code signals to these 22 areas. Not all areas have code signals (Product Vision has no code analog; Product Entities absolutely does). Understanding which areas are code-discoverable vs. document-only is essential for the routing logic (M1) and scanner design (M2).

#### WHAT: The Choice

Twenty-two knowledge areas organized into five domains. The catalog was built from an AI research project surveying product documentation types across numerous fields.

The five domains: Vision & Strategy (1.1-1.5), Architecture & Nouns (2.1-2.5), Experience & Feel (3.1-3.5), Visual & Interaction (4.1-4.4), Decision History (5.1-5.3+5.4).

#### WHY: Rationale

Twenty-two is the equilibrium point where every area has a distinct sensitivity profile and a distinct pool entry point. Boundaries have shades of gray: "Product Entities" (2.3) overlaps with "System Design" (2.4), "User Journey Maps" (3.1) overlaps with "Engagement Loops" (3.3). The areas are containers optimized for the wizard's decision, not a taxonomy claiming irreducibility.

**Anti-example:** Treating the 22 areas as fixed truth. The catalog is a stake-in-the-ground equilibrium, not a permanent answer.

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
|------|------|-------------|
| [[Product Thesis - The Bottleneck Is Context, Not Model Capability]] | Product Thesis | The root thesis. Codebase discovery extends context creation from documents-only to code+documents, making the context bottleneck easier to fill. Counter-thesis: models may eventually infer product context from code alone, making this feature a bridge to obsolescence. |
| [[Artifact - Decision 13: Three Axes]] | Artifact (Decision) | Three inputs to wizard (Mode, Novelty, Complexity) are stable. Codebase discovery does NOT add a fourth axis -- it provides a new input channel that feeds the same three axes. |
| [[Artifact - Decision 20: Inference Gap Framing]] | Artifact (Decision) | Wizard questions are framed around inference gaps. The scanner identifies code-level facts; the inference gap is what the code CANNOT tell you (intent, rationale, priority). |
| [[Artifact - Decision 21: Gap Analysis Scores]] | Artifact (Decision) | Gap scoring formula. Scanner output can refine gap_severity: code evidence for an area reduces severity; code absence despite doc claims increases it. |
| [[Artifact - Decision 12: Benchmark to Product Attributes]] | Artifact (Decision) | Axes measure product attributes, not AI capability. Scanner signals (models, routes, UI) map to product attributes (entities, capabilities, interfaces), not to technical stack characteristics. |
| [[Artifact - Decision 15: Four Tiers]] | Artifact (Decision) | Foundation tier includes Noun Vocabulary (2.2) -- the exact area most directly served by codebase entity discovery. Product Entities (2.3) is Core. |
| [[Artifact - Decision 16: Non-Compensatory Gate]] | Artifact (Decision) | Mode gates pool entry. Product Entities (2.3) enters at Short-Order Cook. Scanner must respect pool boundaries -- discovering entities in code does NOT promote 2.3 into a lower mode's pool. |
| [[Principle - Front-Load Value, Not Completeness]] | Principle | Scanner should produce usable output at every tier (tree scan first, deeper only if needed). Progressive investigation IS front-loading value. |
| [[Principle - Factory Demand Drives Library Priority]] | Principle | Scanner-discovered entities become demand signals that prioritize which areas to seed first, exactly like Bridget's assembly gaps. |
| [[Principle - The System Must Learn from Its Deployments]] | Principle | Scanner heuristics should improve from cross-deployment learning: which code patterns reliably indicate product entities across many projects. |
| [[Principle - Measure Before Promoting]] | Principle | Scanner accuracy must be eval'd before promoting. Mechanical eval (token cost, escalation rate, self-consistency) is automatable. Quality eval requires product owners. |
| [[Principle - Serve Incomplete Libraries Honestly]] | Principle | Scanner proposals are inherently incomplete -- they MUST be labeled as proposals, not facts. INFERRED/DRAFT labels prevent false confidence. |
| [[Principle - Build Upstream Before Downstream]] | Principle | Scanner discovers entities (downstream), but the wizard still needs Vision/Strategy (upstream) from humans first. Codebase discovery fills the present-tense layer; humans provide future-tense and past-tense layers. |
| [[Standard - Day-1 Complexity Ceiling]] | Standard | One entry point, three questions, one output, one interaction pattern. Routing questions (M1) must not violate this ceiling -- they should feel like a natural extension, not additional setup burden. |
| [[Standard - User Assumptions (Never-Violate Set)]] | Standard | All seven assumptions apply. #3 (user is product expert) constrains scanner proposals. #2 (time is scarce) constrains scanner runtime. #4 (invisible mechanics) means the tiered scan should be invisible -- user sees proposals, not scan phases. |
| [[Standard - Hit Print Minimum]] | Standard | Each milestone must be independently usable. M1 alone (routing) is useful. M2 alone (scanner without dialogue) produces something. M3 alone (noun proposal) is a complete workflow. |
| [[Standard - Progressive Disclosure Levels]] | Standard | Scanner output should follow progressive disclosure: Level 1 shows confirmed nouns, Level 2 shows relationships, Level 3 shows full structural analysis. |
| [[Artifact - Persona: The Solo Builder]] | Artifact (Persona) | Primary persona for code-only path. Time-poor, deep domain knowledge, likely Factory/Pair Programmer mode. "I built this alone but it doesn't feel like it." Codebase discovery is this persona's primary entry point. |
| [[Artifact - Persona: The Product Owner (Small Team)]] | Artifact (Persona) | Primary persona for docs+code path. Has strategy docs but needs code validation. Dual audience (human team + AI agents). |
| [[Artifact - Persona: The Hand-Coder (Cold Persona)]] | Artifact (Persona) | Cold persona. Short-Order Cook mode. Even with scanner, this persona is unlikely to benefit -- the library solves problems they don't have. Scanner should not be designed to warm this persona. |
| [[System - Knowledge Graph]] | System | The graph that scanner-discovered entities will eventually populate. Scanner output must be compatible with the typed node, typed edge, directional traversal model. |
| [[System - Eval Harness]] | System | The eval infrastructure for testing scanner quality. Mechanical eval (token cost, escalation rate, self-consistency) is automatable. Quality eval needs LLM-as-user with product owner personas. |
| [[Capability - Source Assessment]] | Capability | Currently the first step in library construction. Scanner output becomes a new type of "source" that Conan assesses -- but it is code-derived source, not human-provided source. Assessment criteria may differ. |
| [[Capability - Health Check]] | Capability | Health check phase 1 (source alignment) becomes more powerful with code walk data: "card says X, code says Y" is a concrete, checkable divergence. |
| [[Journey - Library Genesis to Steady-State]] | Journey | Phase 1 (Configuration) is what codebase discovery extends. The scanner provides a code-validated starting point that accelerates Phase 2 (Seeding). |
| [[Force - Coverage Momentum]] | Force | Scanner-discovered entities are a burst of coverage momentum at library genesis -- many initial cards from a single scan, jumpstarting the demand/supply cycle. |
| [[Artifact - Decision 27: Build to Learn, Not Build to Ship]] | Artifact (Decision) | Scanner design should follow build-to-learn: prototype the simplest tier (tree scan), measure whether it produces useful proposals, expand only if evidence supports it. |
| [[Artifact - Anti-Pattern: Human-First Format by Default]] | Artifact (Anti-Pattern) | Scanner output format should be designed for AI consumption (structured JSON proposals), with human-readable rendering as a view layer. |
| [[Artifact - Noun Vocabulary]] | Artifact | The canonical glossary of product terms. Scanner must map discovered code entities to vocabulary terms or propose new terms for human confirmation. |
| [[Artifact - Type Taxonomy]] | Artifact | The 18-type classification system. Scanner-discovered entities must eventually be typed (is this a System, a Capability, a Primitive?). The scanner should propose types, not assert them. |

---

## Relationship Map

```
Plan (progressive-codebase-discovery)
  |
  |-- extends --> System - Wizard Configuration Engine
  |                 |-- feeds into --> System - Gap Analysis Engine
  |                 |-- conforms to --> Standard - Wizard Non-Compensatory Gate
  |                 |-- conforms to --> Standard - Day-1 Complexity Ceiling
  |                 |-- justified by --> Product Thesis - The Bottleneck Is Context, Not Model Capability
  |
  |-- produces --> Noun proposals (new artifact type)
  |                 |-- validated by --> Human (Lesson: The User Is the Product Expert)
  |                 |-- maps to --> Artifact - Decision 14: Twenty-Two Knowledge Areas (areas 2.2, 2.3)
  |                 |-- feeds --> System - Gap Analysis Engine (code-validated severity)
  |                 |-- populates --> System - Knowledge Graph (as typed nodes after confirmation)
  |
  |-- realizes --> Artifact - Roadmap: Cold Start Reduction (Approach 1: Scan-and-Seed)
  |
  |-- follows --> Artifact - Decision 32: Bottom-Up Discovery as Design Principle
  |                 |-- applied as --> scan code -> propose nouns -> confirm -> structure
  |
  |-- constrained by --> Standard - User Assumptions (Never-Violate Set)
  |                        |-- #2 (time-scarce) --> scanner must be fast (progressive tiers)
  |                        |-- #3 (user is product expert) --> proposals, never assertions
  |                        |-- #4 (invisible mechanics) --> scan tiers hidden from user
  |
  |-- evaluated by --> System - Eval Harness
  |                      |-- mechanical eval --> token cost, escalation rate, self-consistency
  |                      |-- quality eval --> product owner validation (requires humans)
  |
  |-- serves personas:
  |     |-- Persona: The Solo Builder (code-only path, primary beneficiary)
  |     |-- Persona: The Product Owner (docs+code path, validation use case)
  |     |-- NOT Persona: The Hand-Coder (cold, not a design target)
  |
  |-- affects capabilities:
  |     |-- Capability - Source Assessment (scanner output as new source type)
  |     |-- Capability - Health Check (code walk enables source-alignment phase)
  |
  |-- anti-patterns to respect:
        |-- Anti-Pattern: QA by Dumping (scanner must summarize, not dump 50 proposals)
        |-- Anti-Pattern: Emergent Agent Behavior (scanner follows defined procedure)
        |-- Anti-Pattern: Compensatory Pool Expansion (code discovery does not bypass pool gate)
        |-- Anti-Pattern: Human-First Format by Default (output should be AI-native)
```

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
|-----------|-------|----------|-------|----------------|
| WHAT | Code signal taxonomy (which code patterns map to which knowledge areas) | yes | partial (plan.md has a table of signals) | Formalize the mapping: for each of the 22 knowledge areas, document which code signals are discoverable and which are document-only. This becomes the scanner's dispatch table. |
| WHAT | Noun proposal artifact definition | yes | no | No library card defines what a "noun proposal" is as a content object. Create an Artifact card defining the proposal format, confidence levels, and lifecycle (proposed -> confirmed -> card). |
| WHAT | Divergence classification scheme | yes | no | M4 (Code Walk) needs a classification: missing-from-code, missing-from-docs, evolved-past-docs. No library card defines these categories. Create as a Standard or Artifact. |
| HOW | Progressive investigation tiers (file tree -> schema -> targeted walk) | yes | partial (plan.md describes the concept) | No library card documents the tiered scan approach. This should become a System card (System - Codebase Scanner) describing the tier escalation mechanics. |
| HOW | Token budget management across scan tiers | yes | no | The plan mentions token cost as an eval metric but no library card describes how to manage token budgets during scanning. |
| WHERE | Integration point between scanner output and wizard Step 5 (gap analysis) | yes | no | The plan describes routing and scanning but does not specify exactly where scanner output plugs into the existing wizard pipeline. Needs an integration design. |
| WHERE | Scanner's relationship to Conan's Source Assessment | yes | no | Scanner produces code-derived "source material." How does this relate to Conan's Job 0? Is it assessed the same way? Different severity rankings? |
| WHEN | Scanner accuracy expectations (what precision/recall is acceptable for proposals) | yes | no | No quality threshold defined. The plan mentions self-consistency as a mechanical eval but no acceptance threshold. |
| WHY | Why progressive (tiered) investigation rather than single full scan | yes | partial (plan.md implies token cost) | The rationale is implicit. A Principle or Decision card explaining why progressive investigation is preferable would anchor future design decisions. |

---

## Anti-Patterns to Respect

### 1. QA by Dumping
**Risk for this feature:** The scanner could produce 30+ entity proposals and dump them on the user for review. The noun proposal dialogue (M3) MUST include a summary layer: "I found 12 product entities organized in 4 domains. Here are the top 5 that seem most important. Does this direction look right?"

### 2. Emergent Agent Behavior
**Risk for this feature:** The scanner agent could emergently decide to do more than scan -- generating card content, inferring rationale, or restructuring the wizard flow. The scanner's procedure must be explicitly defined: scan -> propose -> wait for confirmation. No autonomous card creation.

### 3. Compensatory Pool Expansion
**Risk for this feature:** Discovering many entities in code could create pressure to expand the pool beyond the mode ceiling. "But I found 20 entities!" does not justify promoting Product Entities (2.3) into a No/Low AI pool. Code discovery feeds INTO the pool system, not around it.

### 4. Human-First Format by Default
**Risk for this feature:** Scanner output could default to human-readable narrative ("I found a User model with these fields...") when structured JSON proposals would serve both the wizard pipeline and human review better. Design for AI consumption first, render for humans second.

### 5. Anti-Pattern: Grade Softening (by analogy)
**Risk for this feature:** After the scanner proposes entities and the human confirms some, there is a temptation to treat unconfirmed proposals as "probably fine" rather than honestly flagging them as unvalidated. Unconfirmed proposals must remain proposals until explicitly confirmed.

---

## Feedback (Gaps Discovered During Assembly)

1. **No library card for Codebase Scanner.** The plan describes a new system (tiered code scanning with progressive investigation), but no System card exists. This will need to be created as the feature is built, following bottom-up discovery -- build the scanner, observe what it does, then document it as a System card.

2. **Knowledge area discoverability mapping is missing.** The library has 22 knowledge areas (Decision 14) but no documentation of which areas have code signals and which are document-only. This is a prerequisite for the routing logic (M1) and should be formalized as an Artifact.

3. **The "Noun Proposal" is a new artifact type.** The type taxonomy (18 types) does not include a transient proposal artifact. Scanner proposals have a lifecycle: proposed -> confirmed -> structured as card. Whether this needs a new type or fits within existing Artifact is a design question.

4. **Source Assessment may need a variant for code-derived sources.** Conan's Job 0 assesses human-provided source material across five dimensions. Code is a fundamentally different source: high WHAT coverage, zero WHY coverage, variable WHERE coverage. A code-specific assessment variant may be needed.

5. **Gap analysis formula may need a code-confidence term.** Currently: `priority_score = tier_weight x gap_severity x freshness_penalty`. Scanner output could add a code_confidence factor: areas with strong code evidence have higher confidence scores, areas where code and docs diverge have elevated gap severity.

6. **The plan descopes M5 (Reconciliation) and M6 (Git Archaeology).** M5 is gated on an eval framework that does not exist yet. M6 is cut entirely. These boundaries should be respected -- do not design M1-M4 assuming M5 will exist.

7. **Eval strategy for scanner quality is partially specified.** Mechanical eval (token cost, escalation rate, self-consistency) is clear and automatable. Quality eval ("did the scanner find the right entities?") requires product owners -- the plan acknowledges this honestly but the eval harness does not yet have eval cases for scanning skills.

---

*Briefing assembled. 6 primary cards, 30 supporting. 9 gaps logged, 7 feedback items identified.*

*Assembly status: DONE_WITH_CONCERNS -- the library has strong coverage of the wizard and gap analysis systems but no existing cards for codebase scanning, noun proposals, or divergence classification. These are new concepts that will be created as the feature is built.*
