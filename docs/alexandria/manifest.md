# Zone Inventory: Alexandria Meta-Library

Source: All files in `docs/alexandria/sources/`, `docs/design/principles.md`,
`docs/design/playbook.md`, `docs/design/org-chart.md`, `docs/design/system-story.md`,
`docs/design/beadification-plan.md`, `templates/reference.md`
Addendum sources: `sources/engagement-loops.md`, `sources/progression-mastery.md`,
`sources/prototypes-mockups.md`

Date: 2026-03-23

Configuration: Factory × High Novelty × High Complexity
Covered areas: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.5, 4.1, 4.2, 4.4, 5.1, 5.2+5.4
Deferred areas (no source material): 3.3, 3.4, 4.3
Covered in supplement (manifest-pt3.md): 5.3, 1.4, 1.5

---

## Expected Cards

### Standards (10)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Standard - Type Claim Test | docs/alexandria/plans/_archive/type-claim-taxonomy/plan.md | Built | Testable spec: 21-row claim-sentence rubric for verifying card typing. Operationalizes Principle - Each Card Type Makes One Kind of Claim. |
| Standard - Progressive Disclosure Levels | sources/usability-standards.md §Progressive Disclosure | Missing | Numbered tier structure (1/2/3) with defined boundaries. Testable: "does each level feel complete?" Governs all wizard UX and all agent output behavior. |
| Standard - Day-1 Complexity Ceiling | sources/usability-standards.md §Day 1 Ceiling | Missing | Quantified spec: one entry point, three questions, one output, one interaction pattern. Testable constraint on wizard and agent design. |
| Standard - Hit Print Minimum | sources/usability-standards.md §Hit Print | Missing | Minimum viable output spec — the user should get something usable at every stopping point. Testable: does each play exit leave the library in a usable state? |
| Standard - User Assumptions (Never-Violate Set) | sources/user-personas.md §User Assumptions | Missing | Seven enumerated rules agents must never violate. Each is testable against agent output. Governs all four agents. HUMAN JUDGMENT NEEDED: whether all 7 are one card or each assumption is a separate card — see Enumeration Decisions. |
| Standard - Wizard Non-Compensatory Gate | sources/decisions-wizard-design.md §Decision 16 | Missing | Defined rule: AI Mode selects pool ceiling; novelty/complexity operate within pool only. Formula with explicit pool sizes (10→13→18→22). Testable. |
| Standard - Wizard max() Combination Rule | sources/decisions-wizard-design.md §Decision 17 | Missing | Formula: `tier = max(novelty_tier, complexity_tier, floor)`. Testable arithmetic. Three documented anomaly exceptions (Decision 18). Governs tier assignment for all 22 knowledge areas. |
| Standard - Grading Sampling Rate | sources/decisions-quality-grading.md §Decision 31 | Missing | Quantified threshold: Conan samples 20% (or minimum 10 cards) of product-layer cards. `alxndr lint` checks every card. Testable partition. |
| Standard - Play Exit Status Protocol | sources/decisions-team-architecture.md §Decision 10 | Missing | Four statuses (DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT). Each has a defined meaning and defined next action. Machine-readable protocol — testable. |
| Standard - Five-Dimension Card Requirements | templates/reference.md §Five Dimensions Requirements | Missing | Testable spec per dimension: WHAT = standalone definition; WHERE = 3+ contextualized links + obligated conformance; WHY = Product Thesis/Principle link + driver; WHEN = temporal status or explicit N/A; HOW = 2+ examples + 1+ anti-example. Governs all card types. |

### Product Theses (3)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Product Thesis - Better Context Produces Better Agent Output | sources/decisions-knowledge-representation.md §Decision 1 | Missing | The primary bet: agents do better work with better context. The foundational WHY for the entire product. Decision 1 explicitly names this a "bet" with "evidence status" caveat — classic Product Thesis structure. |
| Product Thesis - Context Libraries Also Align Human Teams | sources/decisions-knowledge-representation.md §Decision 1 | Missing | Secondary bet from Decision 1: libraries also help human teams get on the same page. Explicitly noted as "in search of evidence." Separate from the primary thesis because the implications for product design diverge if one validates without the other. |
| Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward | sources/decisions-knowledge-representation.md §Decision 4 | Missing | The bet that structuring knowledge for AI retrieval (five dimensions, wikilink edges, card budgets, retrieval profiles) produces better agent output than narrative/human-forward documentation. Generates most of the type taxonomy and all of the quality machinery. |

### Principles (17)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Principle - Each Card Type Makes One Kind of Claim | docs/alexandria/plans/_archive/type-claim-taxonomy/plan.md | Built | Normative stance: types categorize claim-shape, not content topic. Parent principle for Standard - Type Claim Test. |
| Principle - Front-Load Value, Not Completeness | docs/design/principles.md §Front-load value | Missing | Rule of thumb, not a testable spec. Named principle from principles.md with explicit rationale and "what breaks" framing. Governs all construction plays. |
| Principle - Build Upstream Before Downstream | docs/design/principles.md §Build upstream | Missing | Rule of thumb governing build order. Applied in every construction play. Named in principles.md with rationale. |
| Principle - One Concept Per Card | docs/design/principles.md §One concept per card | Missing | Rule of thumb with heuristic signals (700+ words, multiple standalone subsections). Named in principles.md. Governs Sam's card creation procedure. |
| Principle - The Critic and Builder Must Be Structurally Separated | docs/design/principles.md §The critic and builder | Missing | Judgment guidance: the antagonistic quality pattern. Named principle from principles.md. Governs team architecture. Direct derivation from Decision 5. |
| Principle - Filter the Handoff, Don't Wall It | docs/design/principles.md §Filter the handoff | Missing | Rule of thumb for Conan→Sam information design. Named in principles.md. Governs surgery plan construction. Direct derivation from Decision 6. |
| Principle - Structural Quality Before Functional Quality | docs/design/principles.md §Structural quality | Missing | Rule of thumb for check ordering. Named in principles.md. Governs `alxndr lint` sweep sequence and Conan's grading priority. |
| Principle - The Linter Is Adversarial by Design | docs/design/principles.md §The linter is adversarial | Missing | Rule of thumb governing linter independence. Named in principles.md. Governs all `alxndr lint` interactions. |
| Principle - Serve Incomplete Libraries Honestly | docs/design/principles.md §Serve incomplete libraries | Missing | Rule of thumb for Bridget's assembly behavior. Named in principles.md. |
| Principle - Factory Demand Drives Library Priority | docs/design/principles.md §Factory demand | Missing | Rule of thumb: Bridget's gap signals tell Sam what to build next. Named in principles.md. |
| Principle - Attention Is a Resource with a Shape | docs/design/principles.md §Attention is a resource | Missing | Rule of thumb for briefing construction. Named in principles.md. Governs U-shaped ordering in all briefings. |
| Principle - The Feedback Loop Between Service and Construction Is the Most Valuable Signal | docs/design/principles.md §The feedback loop | Missing | Rule of thumb governing maintenance prioritization. Named in principles.md. |
| Principle - Trace Upstream Before Fixing Downstream | docs/design/principles.md §Trace upstream | Missing | Rule of thumb for maintenance sequencing. Named in principles.md. Governs cascade analysis usage. |
| Principle - Plays Must Handle Conflict, Not Just Sequencing | docs/design/principles.md §Plays must handle conflict | Missing | Rule of thumb for play orchestration design. Named in principles.md with specific resolution rules. |
| Principle - Measure Before Promoting | docs/design/principles.md §Measure before promoting | Missing | Eval/iterate rule of thumb. Named in principles.md. Governs all play versioning. |
| Principle - The System Must Learn from Its Deployments | docs/design/principles.md §The system must learn | Missing | Rule of thumb for meta-library maintenance. Named in principles.md. |
| Principle - The Playbook Documents Itself Through Versioning | docs/design/principles.md §The playbook documents itself | Missing | Rule of thumb for play changelog maintenance. Named in principles.md. |

### Systems (7)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| System - Knowledge Graph | docs/design/system-story.md §Framing; sources/decisions-knowledge-representation.md §Decision 2 | Missing | Invisible infrastructure: the typed, wikilink-connected graph structure that underlies all library operations. Builders don't say "I'm using the Knowledge Graph" — they interact with cards. The graph is the mechanism those cards are nodes of. Processes inputs (card creation, link creation) and maintains state (adjacency relationships). |
| System - Wizard Configuration Engine | docs/design/system-story.md §Configuration; sources/decisions-wizard-design.md §Decisions 12-21 | Missing | Mechanism with state: accepts three inputs (AI Mode, Novelty, Complexity), applies pool membership + sensitivity profiles + combination rules + overrides, produces tiered knowledge area assignments. Invisible to the user — they see questions and output, not the scoring engine. |
| System - Gap Analysis Engine | sources/decisions-wizard-design.md §Decision 21 | Missing | Formula-driven mechanism: `priority_score = tier_weight × gap_severity × freshness_penalty`. Produces scored, sequenced gap list from configuration × existing coverage. Invisible infrastructure that sits between wizard configuration and solicitation output. |
| System - Quality Grading Engine | sources/decisions-quality-grading.md §Decisions 28-31; docs/design/system-story.md §Quality Logic | Missing | Mechanism: five-dimension rubric scoring → letter grades → zone scores with completeness cap → system score. Invisible — Conan applies it but builders don't interact with it directly. Maintains state across grading runs (grade history). |
| System - Retrieval and Assembly Engine | sources/decisions-service-and-tooling.md §Decisions 22-24; docs/design/system-story.md §Assembly Logic | Missing | BUILD_TO_LEARN. Mechanism (partially built): retrieval profiles + graph traversal → briefing assembly following U-shaped attention ordering + card budgets. Invisible to factory builders. The current implementation is file-based; the target is MCP-mediated. |
| System - Feedback Queue | docs/design/system-story.md §Feedback; docs/design/org-chart.md §Bridget | Missing | Mechanism with state: accumulates gap signals, weak-card flags, retrieval misses, and relationship discoveries from Bridget's assembly runs. Conan consumes queue during health checks. Invisible to factory builders but visible to the library team. |
| System - Provenance Log | docs/design/system-story.md §Feedback; docs/design/org-chart.md §Bridget | Missing | Mechanism with state: records what was retrieved, searched, and decided during each assembly. Feeds analytics and validates library usage. Invisible to factory builders. |

### Zones (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Zone - Library Interior | docs/design/org-chart.md §The Team diagram | Missing | Top-level workspace where Conan and Sam operate: source assessment, inventory, card building, grading, maintenance. Builders consciously work "inside the library" vs. "at the boundary." Corresponds to the left side of the org-chart diagram. |
| Zone - Library Boundary | docs/design/org-chart.md §The Team diagram | Missing | Top-level workspace where Bridget operates: assembly, delivery, logging. The distinct territory between library and factory. Named in org-chart as a structural region. |

### Rooms (5)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Room - Source Material | docs/design/system-story.md §Seeding; docs/alexandria/source-assessment.md | Missing | Nested space within Library Interior: where source files live and are assessed. Conan enters to run Job 0. Named location within the library workflow. |
| Room - Card Repository | docs/design/system-story.md §Framing; templates/reference.md | Missing | Nested space within Library Interior: the typed-folder structure where cards live. Sam builds here. `alxndr lint` sweeps here. Named by the folder-encodes-taxonomy convention. |
| Room - Rationale Layer | docs/design/system-story.md §Part 2; docs/design/principles.md | Missing | Nested space within Card Repository: where Product Theses, Principles, and Standards live. Distinct traversal rules (3 hops for hub nodes). Named in retrieval profiles. |
| Room - Assembly Workspace | docs/design/system-story.md §Assembly; docs/design/org-chart.md §Bridget | Missing | Nested space within Library Boundary: where Bridget assembles briefings. CONTEXT_BRIEFING.md is produced here. Named by the assembly protocol. |
| Room - Feedback Workspace | docs/design/system-story.md §Feedback | Missing | Nested space within Library Boundary: where feedback-queue.jsonl and provenance-log.jsonl live. Bridget writes here; Conan reads here during health checks. |

### Overlays (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Overlay - Agent Capability Matrix | docs/design/org-chart.md §Boundaries Summary | Missing | Cross-zone constraint: the "one Yes per agent" rule applies across both Library Interior and Library Boundary. Not a room — it's a constraint visible in every zone that has agents. Gate 3 passes: the rule applies across ALL zones where agents operate. |

### Structures (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Structure - Context Briefing | docs/design/system-story.md §Assembly; docs/design/org-chart.md §Bridget | Missing | Spatial canvas within Assembly Workspace: the structured format (Task Frame, Primary Cards, Supporting Cards, Relationship Map, Gap Manifest) that organizes assembled content. Builders interact within this structure. Not a Component (not a single discrete widget) — it's a canvas that contains other elements. |
| Structure - Card | templates/reference.md §Card Templates | Missing | Spatial canvas within Card Repository: the five-section format (WHAT, WHERE, WHY, WHEN, HOW) that organizes card content. Every card type is an instance of this structure. The common substrate from which typed templates derive. |

### Primitives (1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Primitive - Card | docs/alexandria/plans/_archive/type-claim-taxonomy/plan.md; templates/reference.md | Built | Irreducible noun: Card is the atomic knowledge unit of the library. Distinguished from Template - Card (production shape) by claim-kind (ontology). |

### Components (6)

| Card | Parent | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Component - Task Frame | Structure - Context Briefing | Missing | Discrete widget within Context Briefing: the header section specifying what needs to be built, constraints, and acceptance criteria. Builders point at it: "the task frame." Gate 2 passes: a specific, bounded section. |
| Component - Gap Manifest | Structure - Context Briefing | Missing | Discrete widget within Context Briefing: the section listing topics where no card was found despite searching. Distinctive widget — Bridget explicitly produces it; factory builders read it to know what to be cautious about. |
| Component - WHAT Section | Structure - Card | Missing | Discrete section within Card structure: standalone definition, no links needed. Gate 2 passes: a specific bounded section that can be pointed at. Included because dimension-specific section behavior is needed for grading rubric conformance. |
| Component - WHERE Section | Structure - Card | Missing | Discrete section within Card structure: ecosystem relationships via wikilinks with context phrases. HUMAN JUDGMENT NEEDED: whether the five card sections are worth separate Component cards or whether the Structure - Card + Standard - Five-Dimension Card Requirements covers them adequately. |
| Component - WHY Section | Structure - Card | Missing | Discrete section within Card structure: rationale chain linking to Product Thesis/Principles. |
| Component - Wizard Output | docs/design/playbook.md §Play 0.1 | Missing | Discrete artifact-like widget: initialize-output.md (human-readable summary) + alexandria-config.json (machine-readable tier assignments). Builders point at it. Produced by a known play. Classified as Component (not Artifact) because it's consumed interactively during configuration, not edited as a content object. HUMAN JUDGMENT NEEDED: whether this is Component or Artifact — see Enumeration Decisions. |

### Artifacts (3)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Surgery Plan | docs/design/org-chart.md §Conan; docs/design/system-story.md §Maintenance | Missing | Content object produced by Conan (Job 7) and consumed by Sam. Edited during the maintenance cycle. Has a defined schema (domain context + tasks + acceptance criteria). Explicitly excluded from evaluative content by the filtered-handoff rule. |
| Artifact - Source Material File | docs/alexandria/source-assessment.md | Missing | Content object that Conan reads during Job 0 and Job 1. Produced outside the library system (by humans/conversations). Lives in `sources/`. Different lifecycle from library cards — assessed, not graded. |
| Artifact - Play Definition | docs/design/playbook.md; sources/decisions-team-architecture.md §Decision 9 | Missing | Content object: a versioned play definition with trigger, steps, agents, exit criteria, changelog, and optional benchmark results. Edited by humans during evolution. Decision 9 specifically calls plays "external artifacts" that can be versioned and benchmarked. |

### Capabilities (10)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Capability - Source Assessment | docs/design/playbook.md §Play 0.2; docs/design/org-chart.md §Conan Job 0 | Missing | Action/workflow: Conan audits source material for five-dimension coverage, classifies readiness (READY/GAPS/BLOCKED). Action-word test passes: "assessing," "auditing." Lives in Source Material room. |
| Capability - Inventory | docs/design/playbook.md §Play 0.3; docs/design/org-chart.md §Conan Job 1 | Missing | Action/workflow: Conan reads source and produces the manifest of expected cards. Action-word test passes: "inventorying," "manifesting." Lives in Library Interior. |
| Capability - Card Building | docs/design/playbook.md §Stage 1; docs/design/org-chart.md §Sam | Missing | Action/workflow: Sam creates cards from manifest using type-specific templates, following the five-dimension procedure. Action-word test passes: "building," "writing." Lives in Card Repository. |
| Capability - Grading | docs/design/playbook.md §Stage 2; docs/design/org-chart.md §Conan Job 2 | Missing | Action/workflow: Conan applies five-dimension rubric to produce card, zone, and system scores. Action-word test passes: "grading," "scoring." Lives in Card Repository / Rationale Layer. |
| Capability - Linting | docs/design/playbook.md multiple plays; docs/design/org-chart.md §Nit (Historical) | Missing | Action/workflow: `alxndr lint` runs six sweep levels of deterministic checks. Action-word test passes: "linting," "sweeping." Operates across all rooms. |
| Capability - Surgery | docs/design/org-chart.md §Conan Job 7; docs/design/system-story.md §Maintenance | Missing | Action/workflow: Conan produces six-phase fix plans for Sam. Action-word test passes: "diagnosing," "planning fixes." Lives in Library Interior. |
| Capability - Context Assembly | docs/design/org-chart.md §Bridget; docs/design/system-story.md §Assembly | Missing | Action/workflow: Bridget classifies task, loads retrieval profile, traverses graph, assembles briefing. Ten-step process. Action-word test passes: "assembling," "briefing." Lives in Assembly Workspace. |
| Capability - Cascade Analysis | sources/decisions-quality-grading.md §Decision 30; docs/design/system-story.md §Maintenance | Missing | Action/workflow: Conan traces quality issues downstream through the graph to calculate blast radius. Action-word test passes: "tracing," "analyzing cascades." Lives in Library Interior. |
| Capability - Health Check | docs/design/org-chart.md §Conan Job 8; docs/design/system-story.md §Maintenance | Missing | Action/workflow: Conan runs the assessment phase of the unified maintenance play, using a six-step diagnostic procedure. Action-word test passes: "checking health," "assessing." Lives in Library Interior. |
| Capability - Downstream Sync | docs/design/org-chart.md §Conan Job 9; docs/design/system-story.md §Maintenance | Missing | Action/workflow: Conan verifies and fixes meta-files after structural changes. Action-word test passes: "syncing," "verifying." Operates across system. |

### Agents (4)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Agent - Conan the Librarian | docs/design/org-chart.md §Conan | Built | AI team member: evaluates, diagnoses, plans. Named agent with defined capabilities (11 jobs), defined customer (library quality), defined cannot-do list. |
| Agent - Sam the Scribe | docs/design/org-chart.md §Sam | Built | AI team member: builds and fixes cards. Named agent with defined capabilities (6 skills), defined customer (library content), defined cannot-do list. |
| Agent - Nit the Picker | docs/design/org-chart.md §Nit (Historical) | Retired | Retired agent. Mechanical linting now handled by `alxndr lint` CLI. Card deleted; capability preserved in Capability - Linting. |
| Agent - Bridget the Briefer | docs/design/org-chart.md §Bridget | Built | AI team member: assembles briefings, logs feedback. Named agent with defined capabilities (7 skills), defined customer (factory builder agents), defined cannot-do list. |

### Journeys (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Journey - Library Genesis to Steady-State | docs/design/system-story.md §Part 1 (Phases 1-7); docs/design/playbook.md | Built | Multi-phase progression: Configuration → Seeding → Assembly → Implementation → Feedback → Maintenance → Evolution. Seven named phases with defined triggers, agents, and outputs. |
| Journey - Task Briefing Request | sources/usability-standards.md; sources/user-personas.md | Built | Multi-phase progression: wizard → configuration → first briefing → ongoing usage. The user-facing experience arc from discovery to proficiency. Source: usability commitments describe the arc implicitly through Level 1/2/3 progressive disclosure. |

### Aesthetics (6)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Aesthetic - Transparent Machinery | sources/aesthetic-goals.md §Crisp, not chaotic | Built | Target emotional state: scannable in 30 seconds, tables not paragraphs, legible signal. Named aesthetic pair from source. Governs all agent output format design. |
| Aesthetic - Legible Graph | sources/aesthetic-goals.md §Orderly, not wild | Built | Target emotional state: Navy SEAL discipline — purpose and order in the face of exceptions. Named aesthetic pair. Governs play execution and interrupt-driven usage behavior. |
| Aesthetic - Quiet Until Needed | sources/aesthetic-goals.md §Collegial, not emergent | Built | Target emotional state: team of colleagues, not solo artists. Named aesthetic pair. Governs agent coordination and user expectation of who is acting. |
| Aesthetic - Cumulative, Not Sisyphean | sources/aesthetic-goals.md §Swift, not surprising | Built | Target emotional state: fast feedback, predictable behavior. Named aesthetic pair. Governs `alxndr lint` pre-check role and all agent output predictability. |
| Aesthetic - Professional, Not Daffy | sources/aesthetic-goals.md §Professional, not daffy | Built | Target emotional state: personality serves legibility, not entertainment. Named aesthetic pair with per-agent specifications. Governs all agent voice and personality expression. |
| Aesthetic - Well-Run Franchise | sources/aesthetic-goals.md §The North Star | Built | North star aesthetic: every deployment feels the same, every agent runs the same plays, quality is consistent. Named "The North Star" in source. Subsumes and ties together the five pairs. |

### Dynamics (2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Dynamic - Coverage Momentum | docs/design/principles.md §Factory demand; docs/design/org-chart.md §Operating principles | Built | Emergent cross-system behavior: Bridget's assembly gaps drive Sam's build queue, which fills gaps, which improves future assemblies, which produces better factory output. Arises from the interaction of Feedback Queue (System) + Factory Demand Principle + Card Building (Capability). Not a Loop (not a designed repeating cycle) — it emerges from the agents following their principles. |
| Dynamic - Quality Ratchet | sources/decisions-quality-grading.md §Decision 32; docs/design/system-story.md §Maintenance | Built | Emergent cross-system behavior: bottom-up discovery of quality problems leads to new checks, which catch new problems, which lead to refined rules. The grading system improving itself through use. Arises from the interaction of Quality Grading Engine (System) + Health Check (Capability) + the bottom-up discovery principle. |

### Decision Cards (32)

Decision cards capture key decisions with the full architectural decision record structure. These are distinct from Principle cards (which are general rules of thumb) and Product Thesis cards (which are core bets). Decision cards record a specific choice, alternatives rejected, and conditions for reversal.

**Note:** The type taxonomy now defines a `Decision` type (one of the temporal-layer types alongside `Initiative` and `Future`). The 32 entries below are listed as `Artifact - Decision N: ...` for historical reasons. A future change should reclassify them under the `Decision` type to match the current taxonomy.

| Card | Source | Status | Classification Rationale | Flag |
|------|--------|--------|--------------------------|------|
| Artifact - Decision 1: Why Context Libraries Exist | sources/decisions-knowledge-representation.md | Missing | Institutional knowledge artifact. The founding bet. |  |
| Artifact - Decision 2: Atomic Documentation | sources/decisions-knowledge-representation.md | Missing | Institutional knowledge artifact. Justifies the card-per-concept model. |  |
| Artifact - Decision 3: Markdown Over Database | sources/decisions-knowledge-representation.md | Missing | Institutional knowledge artifact. Explicitly temporal ("for now"). |  |
| Artifact - Decision 4: AI-Native Over Human-Forward | sources/decisions-knowledge-representation.md | Missing | Institutional knowledge artifact. Core design lean. |  |
| Artifact - Decision 5: Four Agents, Not One | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. Antagonistic quality pattern. |  |
| Artifact - Decision 6: Filtered Handoffs | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. Conan→Sam information design. |  |
| Artifact - Decision 7: Nit as Independent Linter | sources/decisions-team-architecture.md | Retired | Superseded — Nit retired as agent; linting absorbed by `alxndr lint` CLI. Card deleted. |  |
| Artifact - Decision 8: Bridget as Boundary Agent | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. Two-customer problem. |  |
| Artifact - Decision 9: Plays as Team Coordination | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. gstack inspiration. |  |
| Artifact - Decision 10: Completion Status Protocol | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. Generates Standard - Play Exit Status Protocol. |  |
| Artifact - Decision 11: Agent Personality Serves Legibility | sources/decisions-team-architecture.md | Missing | Institutional knowledge artifact. Names the naming convention. |  |
| Artifact - Decision 12: Benchmark to Product Attributes | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Stability over capability. |  |
| Artifact - Decision 13: Three Axes | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Independence + combinatorial coverage. |  |
| Artifact - Decision 14: Twenty-Two Knowledge Areas | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Catalog derivation and epistemic honesty. |  |
| Artifact - Decision 15: Four Tiers | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Foundation as prerequisite, not just priority. |  |
| Artifact - Decision 16: Non-Compensatory Gate | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Generates Standard - Wizard Non-Compensatory Gate. |  |
| Artifact - Decision 17: max() Combination Rule | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Generates Standard - Wizard max() Combination Rule. |  |
| Artifact - Decision 18: Three Anomaly Override Rules | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Override rules for 3.4, 3.1, 4.1. |  |
| Artifact - Decision 19: Sensitivity Profiles as Taxonomy | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Profile taxonomy (N+strong, C+mild, etc.). |  |
| Artifact - Decision 20: Inference Gap Framing | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Why wizard questions are framed as inference gaps. |  |
| Artifact - Decision 21: Gap Analysis Scores | sources/decisions-wizard-design.md | Missing | Institutional knowledge artifact. Gap analysis formula and phased seeding. |  |
| Artifact - Decision 22: Beads as AI-Native Knowledge Unit | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. | BUILD_TO_LEARN |
| Artifact - Decision 23: Retrieval Profiles Over Free-Form Assembly | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. | BUILD_TO_LEARN |
| Artifact - Decision 24: Attention Ordering as Design Problem | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. U-shaped attention hypothesis unvalidated. | BUILD_TO_LEARN |
| Artifact - Decision 25: YAML Frontmatter as Human-First Compromise | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. Concern that AI helpers defaulted to human patterns. | BUILD_TO_LEARN |
| Artifact - Decision 26: MCP Tools as AI-Native Interface | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. Evidence status: zero. | BUILD_TO_LEARN |
| Artifact - Decision 27: Build to Learn, Not Build to Ship | sources/decisions-service-and-tooling.md | Missing | Institutional knowledge artifact. Meta-decision governing Decisions 22-26. | BUILD_TO_LEARN |
| Artifact - Decision 28: Five Dimensions as Quality Lens | sources/decisions-quality-grading.md | Missing | Institutional knowledge artifact. Bottom-up origin story. |  |
| Artifact - Decision 29: Grade Computation from Rubric | sources/decisions-quality-grading.md | Missing | Institutional knowledge artifact. Reproducibility argument. |  |
| Artifact - Decision 30: Cascade Analysis | sources/decisions-quality-grading.md | Missing | Institutional knowledge artifact. Fix-one-break-three origin. |  |
| Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics | sources/decisions-quality-grading.md | Missing | Institutional knowledge artifact. Generates Standard - Grading Sampling Rate. |  |
| Artifact - Decision 32: Bottom-Up Discovery as Design Principle | sources/decisions-quality-grading.md | Missing | Institutional knowledge artifact. The meta-principle for quality system evolution. |  |

### Lessons / Operational Knowledge Cards (11)

These 11 lessons from institutional-memory.md are also Artifacts — content objects encoding institutional knowledge from Library #1 and the meta-architecture conversation.

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Lesson: No Linter and It Shows | sources/institutional-memory.md | Missing | Anti-pattern record. Direct cause of introducing `alxndr lint`. Governs Principle - Structural Quality Before Functional Quality. |
| Artifact - Lesson: Agents Rarely Follow the Playbook | sources/institutional-memory.md | Missing | Active problem statement. Motivates software-ification of plays. |
| Artifact - Lesson: Folder Structure Misadventures | sources/institutional-memory.md | Missing | Anti-pattern record (past/present/future folders). Graph is the structure; filesystem is for navigation convenience. |
| Artifact - Lesson: Ship Small and Slow | sources/institutional-memory.md | Missing | Operational knowledge. Every PR is a rollback unit. Constrains Sam's batch size. |
| Artifact - Lesson: QA at Scale Is the Hardest User Problem | sources/institutional-memory.md | Missing | Unresolved product problem. 120 cards with no cliff's notes. Maps to knowledge area 2.5 (PRD) and missing summary capability. |
| Artifact - Lesson: Atomic Cards Are More for AI Than Humans | sources/institutional-memory.md | Missing | Tension record: atomic model is good for retrieval but fragments human comprehension. Bridget's briefings are the current answer but sufficiency is open. |
| Artifact - Lesson: The Team Design Emerged from Real Pain | sources/institutional-memory.md §Meta-architecture | Missing | Origin story for four-agent architecture. Complements Decision 5, 7, 8. |
| Artifact - Lesson: External Inspiration Matters but Shouldn't Be Source Material | sources/institutional-memory.md §Meta-architecture | Missing | Operational knowledge for maintaining the library. Lock down derived principles; treat inspiration as footnote. |
| Artifact - Lesson: Alexandria Is a Bet, Not a Plan | sources/institutional-memory.md §Meta-architecture | Missing | Strategic caution. Treat Alexandria compatibility as design constraint, not specification. |
| Artifact - Lesson: Internalization Lags Creation | sources/institutional-memory.md §Meta-architecture | Missing | Meta-problem identical to QA-at-scale. Implies every generation step needs a lightweight "did this land?" checkpoint. |
| Artifact - Lesson: The User Is the Product Expert | sources/user-personas.md §User Assumptions | Missing | Operational knowledge encoding assumption #3. Governs all agent communication design. (Note: overlaps with Standard - User Assumptions; this card captures the institutional reasoning, not the testable rule.) |

### Personas (4)

Personas are **Artifacts** — content objects encoding user knowledge, consulted during design decisions and product strategy.

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Persona: The Solo Builder | sources/user-personas.md | Missing | User knowledge artifact. Primary warm persona. JTBD: ship more to spec without a team. |
| Artifact - Persona: The Product Owner (Small Team) | sources/user-personas.md | Missing | User knowledge artifact. Primary target persona. JTBD: team orientation and coordination. |
| Artifact - Persona: The Enterprise Champion | sources/user-personas.md | Missing | User knowledge artifact. Scale persona. JTBD: AI-native organizational backbone. |
| Artifact - Persona: The Hand-Coder (Cold Persona) | sources/user-personas.md | Missing | Cold persona artifact. Value: defines who the library is NOT for and what would change this. |

### Information Architecture Cards (Area 2.1)

The type taxonomy and library folder structure are themselves information architecture artifacts for Alexandria.

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Type Taxonomy | templates/reference.md §Type Decision Tree | Missing | Content object: the 21-type classification system organized by information-flow layer (rationale, product, experience, temporal). Consulted by Conan during inventory and classification. Edited when types evolve. |
| Artifact - Library Folder Structure | templates/reference.md §Naming Conventions; docs/design/system-story.md | Missing | Content object: the folder-encodes-taxonomy convention (`product/systems/`, `rationale/principles/`, etc.). Governs all card placement. |
| Artifact - Naming Convention | templates/reference.md §Naming Conventions | Missing | Content object: `Type - Name.md` file naming, `[[Type - Name]]` wikilink format. Testable (`alxndr lint` enforces). HUMAN JUDGMENT NEEDED: whether this is an Artifact or Standard — the naming convention is testable, which suggests Standard, but it reads more like a reference document than a governing spec. |

### Noun Vocabulary Cards (Area 2.2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Noun Vocabulary | templates/reference.md; docs/design/system-story.md | Missing | Content object: the canonical glossary of product terms (card types, dimensions, agent names, play terminology). Governs all card content for terminology consistency. `alxndr lint` enforces in Sweep 5 (terminology drift). |

### Anti-Pattern Cards (Area 3.5)

The system's anti-patterns are well-documented across source files. These become standalone Artifact cards that preserve the institutional memory of what NOT to do.

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Anti-Pattern: Emergent Agent Behavior | sources/aesthetic-goals.md §Collegial, not emergent | Missing | Explicit anti-pattern with named worst case: front-agent translating, emergent play invention. Governs agent design. |
| Artifact - Anti-Pattern: Temporal Folder Structure | sources/institutional-memory.md §Folder structure misadventures | Missing | Explicit anti-pattern from Library #1. Structure must live in metadata and graph, not filesystem hierarchy. |
| Artifact - Anti-Pattern: QA by Dumping | sources/institutional-memory.md §QA at scale | Missing | Explicit anti-pattern: 120 cards with no summary, no way to assess directional correctness. No cliff's notes. |
| Artifact - Anti-Pattern: Grade Softening | sources/decisions-quality-grading.md §Decision 29; sources/decisions-team-architecture.md §Decision 5 | Missing | Explicit anti-pattern: grader softens own grades when also the fixer. Motivates structural separation. |
| Artifact - Anti-Pattern: Human-First Format by Default | sources/decisions-service-and-tooling.md §Decision 25 | Missing | BUILD_TO_LEARN. Anti-pattern: AI helpers designing AI tools defaulted to human-readable patterns (YAML, markdown, natural language). |
| Artifact - Anti-Pattern: Compensatory Pool Expansion | sources/decisions-wizard-design.md §Decision 16 | Missing | Anti-pattern: letting high novelty/complexity override mode ceiling, creating runaway documentation burden. |

### Design System Cards (Area 4.1)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Agent Voice Guide | sources/aesthetic-goals.md §The Five Pairs §Per-agent voice | Missing | Content object: per-agent personality specifications. Conan (authoritative, exacting), Sam (competent craftsperson), Bridget (professional facilitator). Consulted during agent prompt design. |

### Interaction Patterns Cards (Area 4.2)

| Card | Source | Status | Classification Rationale |
|------|--------|--------|--------------------------|
| Artifact - Play Pattern | docs/design/playbook.md §How Plays Work | Missing | Content object: the play schema (trigger, steps, agents, exit status) and shared preamble requirements. Template for all 32 plays. |
| Artifact - Filtered Handoff Pattern | sources/decisions-team-architecture.md §Decision 6; docs/design/org-chart.md | Missing | Content object: the specific information-filtering protocol for Conan→Sam surgery plans. What passes (domain context, tasks, acceptance criteria), what is blocked (grades, cascade analyses, evaluative framing). |
| Artifact - 5-Signal Decision Matrix | docs/design/system-story.md §Uncertainty Logic | Missing | Content object: the five-signal protocol (reversibility, context coverage, precedent, blast radius, domain specificity) that governs when agents search vs. proceed. Applies to all agents encountering uncertainty. |

---

## Enumeration Decisions

| Entity | Types Found | Decision | Rationale |
|--------|-------------|----------|-----------|
| User Assumptions (7 rules) | 7 numbered rules, all testable | **One card** | All seven govern the same domain (agent behavior toward users) and would always be retrieved together. A single Standard card with all seven listed as constraints is more useful to Bridget's assembly than 7 separate Standard cards that always co-appear. |
| Card Dimension Sections (WHAT/WHERE/WHY/WHEN/HOW) | 5 distinct sections with distinct grading criteria | **One card + Standard** | Standard - Five-Dimension Card Requirements covers all five with their specs. Separate Component cards for each section add overhead without agent value — the Standard is always retrieved when any section is relevant. The 3 Component cards included above (WHAT, WHERE, WHY) are retained as examples; HOW and WHEN are omitted pending HUMAN JUDGMENT NEEDED resolution. |
| Decision Cards (32 decisions across 5 files) | 32 distinct decisions in 5 thematic clusters | **Individual cards** | Each decision has distinct "what would change this" conditions, meaning they can become individually stale, individually validated, or individually cited. A per-cluster hub card would bundle decisions that have different blast radii and different validation status. Individual cards enable precise blast radius tracking. |
| Aesthetic Pairs (5 pairs + north star) | 5 named pairs + 1 named north star | **Individual cards** | Each pair governs a distinct behavioral domain (output format vs. discipline vs. team coordination vs. speed vs. personality). An agent building in the "Collegial, not emergent" space doesn't need the "Crisp, not chaotic" aesthetic in the same briefing. Individual cards enable targeted retrieval. North star is a separate card because it's the meta-principle, not a pair. |
| Anti-Patterns (distributed across source files) | Named anti-patterns across 5+ source files | **Individual cards** | Anti-patterns should be retrievable independently of the principle they violate. An agent working on assembly doesn't need all anti-patterns — just the ones relevant to the current task. Individual cards enable Bridget to retrieve anti-patterns by domain. |
| Wizard Output (initialize-output.md + alexandria-config.json) | Two files with different audiences | **One card** | The two files are produced together by Play 0.1 and consulted together. They represent one "wizard completed" artifact, not two separate content objects. |
| Persona cards (4 personas) | 3 warm + 1 cold | **Individual cards** | Each persona has a distinct JTBD, AI mode, and value proposition. An agent designing features for the Solo Builder needs different context than one designing for the Enterprise Champion. |

---

## Conformance Map

| Standard | Constrains |
|----------|------------|
| Standard - Five-Dimension Card Requirements | All card types (Artifact, System, Agent, Principle, Product Thesis, Standard, Zone, Room, Overlay, Structure, Component, Capability, Loop, Journey, Aesthetic, Dynamic) |
| Standard - User Assumptions (Never-Violate Set) | Agent - Conan (output format), Agent - Sam (question framing), Agent - Bridget (communication style), Capability - Context Assembly, Capability - Card Building |
| Standard - Progressive Disclosure Levels | Capability - Context Assembly, Artifact - Play Pattern, Journey - Task Briefing Request |
| Standard - Day-1 Complexity Ceiling | System - Wizard Configuration Engine, Capability - Source Assessment, Component - Wizard Output Widget |
| Standard - Hit Print Minimum | Capability - Card Building, Capability - Context Assembly, Artifact - Play Definition |
| Standard - Play Exit Status Protocol | All Capability cards, all Agent cards (Conan, Sam, Bridget) |
| Standard - Wizard Non-Compensatory Gate | System - Wizard Configuration Engine, Artifact - Decision 16: Non-Compensatory Gate |
| Standard - Wizard max() Combination Rule | System - Wizard Configuration Engine, Artifact - Decision 17: max() Combination Rule, Artifact - Decision 18: Three Anomaly Override Rules |
| Standard - Grading Sampling Rate | Agent - Conan (health check sampling), Capability - Grading, Capability - Health Check |

---

## Build Order

Build in this sequence (most-depended-on first):

### Phase 1: Standards

| Order | Card | Rationale |
|-------|------|-----------|
| 1.1 | Standard - Five-Dimension Card Requirements | Constrains every other card. Every card Sam writes must meet this spec. Must exist before any card building begins. |
| 1.2 | Standard - Play Exit Status Protocol | Used by every capability and agent card. Constrain references must resolve. |
| 1.3 | Standard - User Assumptions (Never-Violate Set) | Constrains all four agents. Must exist before Agent cards are written. |
| 1.4 | Standard - Progressive Disclosure Levels | Constrains wizard design, briefing design, journey maps. |
| 1.5 | Standard - Day-1 Complexity Ceiling | Constrains wizard system and assembly capability. |
| 1.6 | Standard - Hit Print Minimum | Constrains all construction plays. |
| 1.7 | Standard - Wizard Non-Compensatory Gate | Constrains wizard system card. |
| 1.8 | Standard - Wizard max() Combination Rule | Constrains wizard system card. Includes the three anomalies. |
| 1.9 | Standard - Grading Sampling Rate | Constrains grading and health check capabilities. |

### Phase 2: Product Theses and Principles

| Order | Card | Rationale |
|-------|------|-----------|
| 2.1 | Product Thesis - Better Context Produces Better Agent Output | Root WHY for all other cards. Every Principle, System, and Capability links up to this. Must exist first. |
| 2.2 | Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward | Root WHY for type taxonomy, quality machinery, and retrieval design. |
| 2.3 | Product Thesis - Context Libraries Also Align Human Teams | Secondary root thesis. Referenced by persona cards and journey cards. |
| 2.4 | Principle - Front-Load Value, Not Completeness | Governs all construction plays and build ordering. |
| 2.5 | Principle - Build Upstream Before Downstream | Governs build sequence. Active during Sam's construction. |
| 2.6 | Principle - One Concept Per Card | Governs Sam's decomposition. |
| 2.7 | Principle - The Critic and Builder Must Be Structurally Separated | Governs team architecture. Referenced by Agent cards. |
| 2.8 | Principle - Filter the Handoff, Don't Wall It | Governs Conan→Sam surgery handoff. Referenced by Artifact - Surgery Plan. |
| 2.9 | Principle - Structural Quality Before Functional Quality | Governs `alxndr lint` sweep sequence. Referenced by Capability - Linting. |
| 2.10 | Principle - The Linter Is Adversarial by Design | Governs `alxndr lint` CLI. |
| 2.11 | Principle - Serve Incomplete Libraries Honestly | Governs Bridget's assembly behavior. |
| 2.12 | Principle - Factory Demand Drives Library Priority | Governs build prioritization. Referenced by Dynamic - Demand-Driven Library Growth. |
| 2.13 | Principle - Attention Is a Resource with a Shape | Governs briefing structure. Referenced by Capability - Context Assembly. |
| 2.14 | Principle - The Feedback Loop Between Service and Construction Is the Most Valuable Signal | Governs maintenance prioritization. |
| 2.15 | Principle - Trace Upstream Before Fixing Downstream | Governs cascade analysis usage. Referenced by Capability - Cascade Analysis. |
| 2.16 | Principle - Plays Must Handle Conflict, Not Just Sequencing | Governs play design. |
| 2.17 | Principle - Measure Before Promoting | Governs play versioning. |
| 2.18 | Principle - The System Must Learn from Its Deployments | Governs meta-library maintenance. |
| 2.19 | Principle - The Playbook Documents Itself Through Versioning | Governs play changelog maintenance. |

### Phase 3: Systems

| Order | Card | Rationale |
|-------|------|-----------|
| 3.1 | System - Knowledge Graph | Most depended-on system. All card types, all capabilities, all agents operate on or within this. |
| 3.2 | System - Quality Grading Engine | Referenced by Capability - Grading, Capability - Health Check. Depends on Standards being built. |
| 3.3 | System - Wizard Configuration Engine | Referenced by Component - Wizard Output Widget and Journey - Task Briefing Request. Depends on Standards 1.4-1.8. |
| 3.4 | System - Gap Analysis Engine | Depends on Wizard Configuration Engine. |
| 3.5 | System - Feedback Queue | Referenced by Bridget, Conan, Dynamic - Demand-Driven Library Growth. |
| 3.6 | System - Provenance Log | Depends on Feedback Queue (paired infrastructure). |
| 3.7 | System - Retrieval and Assembly Engine | BUILD_TO_LEARN. Depends on Knowledge Graph and Retrieval Profiles. Build last among Systems. |

### Phase 4: Zones and Rooms

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| 4.1 | Zone - Library Interior | Product Thesis - Better Context | Root container. Rooms depend on it. |
| 4.2 | Zone - Library Boundary | Product Thesis - Better Context | Root container for Bridget's workspace. |
| 4.3 | Room - Card Repository | Zone - Library Interior | Primary workspace. Structures and Components depend on it. |
| 4.4 | Room - Rationale Layer | Room - Card Repository | Sub-room. Product Thesis, Principle, Standard cards link here. |
| 4.5 | Room - Source Material | Zone - Library Interior | Pre-build workspace. Source Assessment capability operates here. |
| 4.6 | Room - Assembly Workspace | Zone - Library Boundary | Bridget's primary room. Context Briefing Structure lives here. |
| 4.7 | Room - Feedback Workspace | Zone - Library Boundary | Feedback Queue and Provenance Log systems live here. |

### Phase 5: Overlays, Structures, Artifacts, Capabilities

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| 5.1 | Overlay - Agent Capability Matrix | All Agent cards (build in Phase 7) | Note: scaffold card can be written now; agent links filled during Phase 7. |
| 5.2 | Structure - Card | Room - Card Repository; Standard - Five-Dimension Card Requirements | The substrate all card types build from. Must exist before Component cards. |
| 5.3 | Structure - Context Briefing | Room - Assembly Workspace | Container for Component cards in Phase 6. |
| 5.4 | Artifact - Type Taxonomy | System - Knowledge Graph | Governs classification. Must exist before Sam builds product-layer cards. |
| 5.5 | Artifact - Library Folder Structure | Room - Card Repository | Governs card placement. |
| 5.6 | Artifact - Naming Convention | Standard - Five-Dimension Card Requirements | Governs card creation. |
| 5.7 | Artifact - Noun Vocabulary | Artifact - Type Taxonomy | Shared glossary. Must exist early so Sam uses consistent terms. |
| 5.8 | Artifact - Play Pattern | Standard - Play Exit Status Protocol | Template for all play definitions. |
| 5.9 | Artifact - Play Definition | Artifact - Play Pattern | The playbook artifact itself. |
| 5.10 | Artifact - Filtered Handoff Pattern | Principle - Filter the Handoff | Documents the Conan→Sam protocol. |
| 5.11 | Artifact - 5-Signal Decision Matrix | All Agent cards | Referenced during uncertainty resolution. |
| 5.12 | Artifact - Agent Voice Guide | Aesthetic cards | Consulted during agent prompt design. |
| 5.13 | Artifact - Source Material File | Room - Source Material | Meta-card about the source material artifact class. |
| 5.14 | Artifact - Surgery Plan | Capability - Surgery; Principle - Filter the Handoff | Schema card for the surgery plan artifact. |
| 5.15–5.18 | Artifact - Persona: Solo Builder, Product Owner, Enterprise Champion, Hand-Coder | Product Thesis - Better Context | User knowledge. After root thesis. |
| 5.20–5.22 | Artifact - Information Architecture: Type Taxonomy, Folder Structure, Naming Convention | (already listed above as 5.4–5.6) | — |
| 5.23 | Capability - Source Assessment | Room - Source Material; Agent - Conan | Action workflow. Conan must exist (Phase 7) but scaffold now. |
| 5.24 | Capability - Inventory | Room - Library Interior; Agent - Conan | Core build workflow. |
| 5.25 | Capability - Card Building | Room - Card Repository; Agent - Sam | Core build workflow. |
| 5.26 | Capability - Grading | System - Quality Grading Engine; Agent - Conan | Core quality workflow. |
| 5.27 | Capability - Linting | `alxndr lint` CLI | Operates across all rooms. |
| 5.28 | Capability - Surgery | Agent - Conan; Artifact - Surgery Plan | Core maintenance workflow. |
| 5.29 | Capability - Context Assembly | System - Retrieval and Assembly Engine; Agent - Bridget | Core service workflow. |
| 5.30 | Capability - Cascade Analysis | System - Knowledge Graph; Agent - Conan | Maintenance workflow. |
| 5.31 | Capability - Health Check | Multiple systems; Agent - Conan | Periodic maintenance. |
| 5.32 | Capability - Downstream Sync | Agent - Conan | Post-structural-change workflow. |

### Phase 6: Components and Decision Artifacts

Decision cards (32) and Lesson cards (11) are built in this phase because they depend on the upstream rationale layer but are themselves depended on by nothing upstream.

| Order | Card | Rationale |
|-------|------|-----------|
| 6.1 | Component - Task Frame | After Structure - Context Briefing. |
| 6.2 | Component - Gap Manifest | After Structure - Context Briefing. |
| 6.3 | Component - WHAT Section | After Structure - Card. |
| 6.4 | Component - WHERE Section | After Structure - Card. |
| 6.5 | Component - WHY Section | After Structure - Card. |
| 6.6 | Component - Wizard Output Widget | After System - Wizard Configuration Engine. |
| 6.7–6.38 | Artifact - Decisions 1–32 | Build in decision-file order (knowledge-representation → team-architecture → wizard-design → quality-grading → service-and-tooling). Within service-and-tooling, build Decision 27 (build-to-learn meta-decision) first, then 22–26. |
| 6.39–6.49 | Artifact - Lessons 1–11 | After Decision cards they reference. |
| 6.50–6.55 | Artifact - Anti-Patterns 1–6 | After Principle and Decision cards they cross-reference. |

### Phase 7: Agents

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| 7.1 | Agent - Conan the Librarian | Standard - User Assumptions; Principle - The Critic and Builder; all Capability cards Conan owns | Build Conan before the Overlay - Agent Capability Matrix can be fully linked. |
| 7.2 | Agent - Sam the Scribe | Standard - Five-Dimension Card Requirements; Principle - One Concept Per Card | |
| 7.3 | Agent - Nit the Picker (Retired) | Principle - The Linter Is Adversarial; Standard - Five-Dimension Card Requirements | Retired — linting now handled by `alxndr lint` CLI. Skip this card. |
| 7.4 | Agent - Bridget the Briefer | Standard - User Assumptions; Principle - Serve Incomplete Libraries Honestly; System - Retrieval and Assembly Engine | |

### Phase 8: Experience Layer

| Order | Card | Depends On | Rationale |
|-------|------|------------|-----------|
| 8.1 | Aesthetic - Crisp, Not Chaotic | Principle cards; Agent - Conan, Agent - Sam, Agent - Bridget | After agents — personality specs reference agent identity. |
| 8.2 | Aesthetic - Orderly, Not Wild | Principle - Plays Must Handle Conflict | |
| 8.3 | Aesthetic - Collegial, Not Emergent | Principle - The Critic and Builder; Overlay - Agent Capability Matrix | |
| 8.4 | Aesthetic - Swift, Not Surprising | Standard - Play Exit Status Protocol | |
| 8.5 | Aesthetic - Professional, Not Daffy | Artifact - Agent Voice Guide; all Agent cards | |
| 8.6 | Aesthetic - Well-Run Franchise | All Aesthetic cards (it's the synthesis) | Build last among Aesthetics. |
| 8.7 | Journey - Task Briefing Request | Standard - Progressive Disclosure Levels; Standard - Day-1 Complexity Ceiling; Artifact - Persona cards | |
| 8.8 | Journey - Library Genesis to Steady-State | All Capability cards; all Agent cards; Artifact - Play Definition | The full lifecycle journey depends on all components existing. |
| 8.9 | Dynamic - Demand-Driven Library Growth | System - Feedback Queue; Principle - Factory Demand Drives Library Priority; Capability - Card Building | Emerges from interaction of those cards — build after they exist. |
| 8.10 | Dynamic - Quality Ratchet | System - Quality Grading Engine; Capability - Health Check; Artifact - Decision 32 | |

---

## Summary

| Category | Count |
|----------|-------|
| Standards | 10 |
| Product Theses | 3 |
| Principles | 17 |
| Systems | 7 |
| Zones | 2 |
| Rooms | 5 |
| Overlays | 1 |
| Structures | 2 |
| Primitives | 1 |
| Components | 6 |
| Artifacts (Decisions) | 32 |
| Artifacts (Lessons) | 11 |
| Artifacts (Anti-Patterns) | 6 |
| Artifacts (Personas) | 4 |
| Artifacts (Information Architecture) | 3 |
| Artifacts (Noun Vocabulary) | 1 |
| Artifacts (Play/Interaction) | 5 |
| Artifacts (Design System/Voice) | 1 |
| Capabilities | 10 |
| Agents | 4 |
| Journeys | 2 |
| Aesthetics | 6 |
| Dynamics | 2 |

**Expected Total: 141 cards**

**Existing: 3 (2%)** — Primitive - Card, Principle - Each Card Type Makes One Kind of Claim, Standard - Type Claim Test (built in type-claim-taxonomy plan)

**Missing: 138**

**Misclassified: 0** (none of the 3 newly-built cards are misclassified)

**Deferred (no source material): 3 knowledge areas** — 3.3 Engagement Loops, 3.4 Progression/Mastery, 4.3 Prototypes/Mockups
**Covered in manifest-pt3.md: 3 knowledge areas** — 5.3 Roadmap, 1.4 Competitive Analysis, 1.5 Market Requirements

---

## Flags

### HUMAN JUDGMENT NEEDED

1. **Standard - User Assumptions: One card or seven?** The manifest recommends one card with all seven rules listed. If the team wants individual per-assumption standards (enabling `alxndr lint` to reference specific assumption violations by card), split into 7 cards and add 6 to the total.

2. **Component cards for card sections: All five or three?** The manifest includes WHAT, WHERE, and WHY sections as Component cards, omits WHEN and HOW. If all five dimensions warrant Component cards (for retrieval profile specificity), add 2 cards. If the Standard covers the need, reduce to 0 Component-section cards.

3. **Wizard Output: Component or Artifact?** The manifest classifies it as Component because it's consumed interactively (not edited as a content object). If the team considers initialize-output.md an editable document (the human adjusts tier assignments), reclassify as Artifact.

4. **Artifact - Naming Convention: Artifact or Standard?** The naming convention (`Type - Name.md`) is testable (`alxndr lint` enforces it), which suggests Standard. But it reads more like a reference document. If classified as Standard, it governs card creation and earns a conformance map entry.

5. **Decision cards: 32 individual cards or clustered hub cards?** The manifest recommends individual cards for blast radius precision. If 32 Decision Artifact cards are too granular for the initial build, consider 5 hub cards (one per decision file) with spoke cards for the most critical individual decisions. This would reduce Phase 6 by ~27 cards at the cost of less precise blast radius tracking.

6. **Build-to-Learn Decisions: Include HOW sections or explicitly stub them?** For Decisions 22–27, the source explicitly says HOW is thin because this is pre-validation territory. Sam should write these cards with explicit HOW stubs marked `[BUILD TO LEARN: HOW section pending prototype evidence]` rather than attempting to fill with hypotheses.

### BUILD_TO_LEARN

The following 6 decision cards (and 1 anti-pattern card derived from them) must preserve epistemic uncertainty. They describe directional bets with zero prototype validation:

- Artifact - Decision 22: Beads as AI-Native Knowledge Unit
- Artifact - Decision 23: Retrieval Profiles Over Free-Form Assembly
- Artifact - Decision 24: Attention Ordering as Design Problem
- Artifact - Decision 25: YAML Frontmatter as Human-First Compromise
- Artifact - Decision 26: MCP Tools as AI-Native Interface
- Artifact - Decision 27: Build to Learn, Not Build to Ship
- Artifact - Anti-Pattern: Human-First Format by Default (derived from Decision 25)
- System - Retrieval and Assembly Engine (partially built; target architecture unvalidated)

Cards carrying BUILD_TO_LEARN must:
- Include "Evidence status: thin / pre-validation" in their WHAT section
- Preserve the "what we don't know yet" content from source in their HOW section
- Use the WHEN section to mark these as directional ("current direction, pending validation")
- Never present the hypothesis (beads improve agent output, profiles outperform free-form assembly) as an established pattern

---

## Completion Status

**DONE_WITH_CONCERNS**

**Concerns:**
1. 3 knowledge areas deferred pending solicitation source material (3.3, 3.4, 4.3). 3 formerly deferred areas (5.3, 1.4, 1.5) now covered in manifest-pt3.md (12 additional cards).
2. Decision card count (32) and Lesson card count (11) are high. Human review recommended before Sam begins Phase 6 — confirm individual vs. clustered approach.
3. Six BUILD_TO_LEARN cards require special handling throughout Sam's construction process.
4. HUMAN JUDGMENT NEEDED flags (6 items) should be resolved before Phase 6 build begins to avoid rework.
5. Component cards for card sections (WHAT/WHERE/WHY) are included but marginal — worth confirming whether they serve retrieval needs or duplicate Standard coverage.
