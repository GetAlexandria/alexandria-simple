# Source Assessment: Alexandria Meta-Library

**Assessor:** Conan the Librarian — Job 0
**Date:** 2026-03-23
**Configuration:** Factory × High Novelty × High Complexity
**Scope:** All source material in `docs/alexandria/sources/`

---

## Source Material Reviewed

| # | File | Target Knowledge Area(s) |
|---|------|--------------------------|
| 1 | `sources/aesthetic-goals.md` | 3.2 Emotional/Aesthetic Goals |
| 2 | `sources/decisions-knowledge-representation.md` | 5.1 Key Decisions Log |
| 3 | `sources/decisions-team-architecture.md` | 5.1 Key Decisions Log |
| 4 | `sources/decisions-wizard-design.md` | 5.1 Key Decisions Log |
| 5 | `sources/decisions-quality-grading.md` | 5.1 Key Decisions Log |
| 6 | `sources/decisions-service-and-tooling.md` | 5.1 Key Decisions Log |
| 7 | `sources/usability-standards.md` | 4.4 Accessibility Standards |
| 8 | `sources/user-personas.md` | 1.3 User Personas/JTBD |
| 9 | `sources/institutional-memory.md` | 5.2 Lessons Learned, 5.4 Operational Knowledge |
| 10 | `sources/engagement-loops.md` | 3.3 Engagement Loops |
| 11 | `sources/progression-mastery.md` | 3.4 Progression/Mastery |
| 12 | `sources/prototypes-mockups.md` | 4.3 Prototypes/Mockups |

---

## Coverage by Dimension

### Source 1: aesthetic-goals.md (→ 3.2 Emotional/Aesthetic Goals)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Five aesthetic pairs clearly defined with concrete examples. North star articulated. |
| WHY | High | Each pair has rationale ("Navy SEALs orderly," "McDonald's franchise"). Anti-patterns named for each. |
| WHERE | Med | Agent-specific voice guidance connects aesthetics to agents. No connection to card types, retrieval, or wizard areas. |
| HOW | Med | Per-agent personality guidance is actionable. Missing: how to evaluate aesthetic compliance, what "too campy" looks like in practice beyond the examples given. |
| WHEN | Low | No temporal framing. When were these established? How do they evolve as the product matures? |

**Verdict:** Solid. WHY coverage is strong — the "not X" framing in each pair is exactly what Sam needs for card content. WHEN thinness is tolerable for an aesthetic source.

---

### Source 2: decisions-knowledge-representation.md (→ 5.1 Key Decisions)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Decisions 1-4 clearly stated. Each has a crisp "decided" line. |
| WHY | High | Every decision has alternatives rejected with rationale. "What would change this decision" sections are excellent — they capture the boundary conditions. |
| WHERE | Med | Decision 4 connects to briefing design and card structure. Decision 3 connects to beadification. Cross-references between decisions are implicit, not explicit. |
| HOW | Med | Decision 2 has concrete atomicity reasoning. Decision 4 has concrete examples (five dimensions, wikilinks, card budgets). Decision 3 light on "how to decide when to migrate." |
| WHEN | Med | Decision 3 explicitly temporal ("for now," current status, what would change). Others lack temporal framing. |

**Verdict:** Adequate. The "what would change" sections are the best feature — they encode the living nature of decisions. Cross-referencing between decisions could be stronger.

---

### Source 3: decisions-team-architecture.md (→ 5.1 Key Decisions)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Decisions 5-11 precisely stated. Four-agent split, filtered handoffs, play coordination — all crisp. |
| WHY | High | Strongest WHY coverage in the source corpus. The antagonistic quality pattern, context window focus, model optimization, filtered handoffs reasoning — deep, substantive, specific. |
| WHERE | High | Extensive connections: Conan, Sam, Nit, Bridget, gstack, Elicit, antagonistic writing article, org chart. The decisions reference each other naturally. |
| HOW | Med | Decision 6 (filtered handoffs) has concrete mechanics. Decision 9 (plays) describes the dispatching pattern. Less clear: how to add a fifth agent, how to modify handoff filters. |
| WHEN | Med | Decision 9 references gstack and Elicit as contemporary influences. Missing: when the original single-agent architecture was abandoned, timeline of the evolution. |

**Verdict:** Passes. This is the strongest source file. WHY is thick and well-argued. The antagonistic quality rationale alone justifies multiple Decision cards.

---

### Source 4: decisions-wizard-design.md (→ 5.1 Key Decisions)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Decisions 12-21 thoroughly defined. Pool sizes, tier assignments, sensitivity profiles, combination rules — comprehensive. |
| WHY | High | Deep rationale throughout. Decision 13 (three axes) is particularly well-argued with independence, combinatorial coverage, and answerability. Decision 18 (anomaly overrides) honest about tradeoffs. |
| WHERE | High | References wizard engine YAML, QA scripts, GitHub issue #753, AI focus groups. Cross-references pool sizes, profiles, tiers. |
| HOW | High | Decision 17 has an explicit formula. Decision 18 has the three specific override rules with trigger conditions. Decision 21 has the gap analysis formula. Most mechanically complete source file. |
| WHEN | Med | Decision 13 notes "confidence varies by axis" and mentions real usage as future input. Decision 16 describes how pool sizes were derived. No explicit timeline of wizard evolution. |

**Verdict:** Passes. High marks across WHAT/WHY/WHERE/HOW. The formulas and specific override rules give Sam concrete material for Decision cards. WHEN is the only thin dimension — tolerable for decisions that are current.

---

### Source 5: decisions-quality-grading.md (→ 5.1 Key Decisions)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Decisions 28-32 clearly stated. Bottom-up discovery origin story is valuable context. |
| WHY | High | Origin stories for each decision are unusually strong. "Fix one, break three" for cascade analysis. "Card #47 gets less attention" for sampling. Real experience, not theory. |
| WHERE | Med | References Conan, Nit, rubrics, dimensions. Doesn't connect to specific rubric files or grade computation skills. |
| HOW | Med | Decision 31 gives the 20% sampling rate. Decision 29 explains rubric-based grading at concept level. Missing: what the rubric actually looks like, how dimension scores combine into letter grades. |
| WHEN | Med | Bottom-up discovery framing is inherently temporal ("started with X, noticed Y, evolved to Z"). But no dates or version markers. |

**Verdict:** Adequate. The bottom-up origin stories are the standout feature — they give WHY a depth that designed-top-down decisions rarely achieve. HOW is thin because the rubric mechanics live in skill files, not in this source. Sam will need to cross-reference `skills/conan/rubrics.md` and `skills/conan/grade-computation.md` during card building.

---

### Source 6: decisions-service-and-tooling.md (→ 5.1 Key Decisions)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Decisions 22-27 stated. Beads, retrieval profiles, attention ordering, MCP tools all defined. |
| WHY | Med | Reasoning is clear but hedged. The "what we don't know yet" sections are honest but leave WHY partially unresolved. Decision 27 ("build to learn") is WHY for the whole section. |
| WHERE | Med | References beadification plan, MCP tools, eval/iterate. Fewer cross-references to other decision files than expected. |
| HOW | Low | Minimal mechanics. Decision 22 (beads) describes what they are but not how they're structured. Decision 23 (retrieval profiles) describes the concept but not the format. Decision 26 (MCP tools) says "build the simplest possible" but no specification. |
| WHEN | Med | "Evidence status" header is explicitly temporal. Decision 27 frames the whole section as pre-validation. |

**Verdict:** Thin but honest. The file explicitly flags itself as "least prototype validation" and "building to learn." This is the correct epistemic status. Sam should build Decision cards that preserve the hedging — these are directional bets, not validated patterns. HOW gaps are expected given the evidence status; flagging but not blocking.

---

### Source 7: usability-standards.md (→ 4.4 Accessibility Standards)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | User spectrum, progressive disclosure levels, day-1 complexity ceiling, "hit print" — all clearly defined. |
| WHY | Med | Implicit reasoning (time-poor users, non-technical users) but no explicit "we chose this because." The usability commitments read as assertions, not argued positions. |
| WHERE | Med | Connects to user personas (user spectrum). Doesn't connect to wizard, agents, or card design. |
| HOW | High | Progressive disclosure levels (1/2/3) are concrete and buildable. Day-1 ceiling spec is precise (one entry point, three questions, one output, one interaction pattern). "Hit print" concept is actionable. |
| WHEN | Low | No temporal context. When were these established? Are they aspirational or proven? |

**Verdict:** Adequate. Strong WHAT and HOW — the progressive disclosure levels and day-1 ceiling are standard-grade material. WHY is implicit rather than explicit. Sam should extract the quantified specs into Standard cards.

---

### Source 8: user-personas.md (→ 1.3 User Personas/JTBD)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Three warm personas + one cold persona. Jobs-to-be-done clearly articulated. Seven user assumptions with explanations. |
| WHY | High | Each persona has value proposition and contextual reasoning. The cold persona includes "what could change this." User assumptions have rationale for each. |
| WHERE | Med | AI mode connections per persona. No connection to wizard configuration, card types, or agent behavior beyond assumption #7. |
| HOW | Med | User assumptions are actionable constraints. Missing: how agents should behave differently for Persona 1 vs. Persona 2 vs. Persona 3. |
| WHEN | Low | No temporal framing. How do personas shift as the product matures? When does the cold persona warm up? |

**Verdict:** Passes. The user assumptions section is the strongest material — seven concrete rules agents must never violate. These are Standard candidates. The personas themselves are well-drawn. WHEN thinness is expected for personas (they're current-state descriptions).

---

### Source 9: institutional-memory.md (→ 5.2 Lessons Learned, 5.4 Operational Knowledge)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Eleven specific lessons, clearly scoped to LifeBuild build and meta-architecture conversation. |
| WHY | High | Each lesson includes the failure mode or pain point that produced it. "Fix one, break three," "120 cards with no summary," "agents rarely follow the playbook." |
| WHERE | Med | References Nit, Conan, Bridget, org chart, playbook. Doesn't connect specific lessons to specific plays or procedures that should address them. |
| HOW | Med | "Ship small and slow," "software-ify plays" — actionable direction. Missing: concrete remediation for each lesson. What specifically should change? |
| WHEN | Med | Two temporal sections (Library #1 vs. This Conversation) give chronological context. But no dates, versions, or "this was addressed by X." |

**Verdict:** Adequate. Valuable anti-pattern material. Every lesson is a failure mode that should produce a Principle or inform a Standard. The "internalization lags creation" meta-lesson is the kind of institutional knowledge that context libraries exist to preserve.

---

### Source 10: engagement-loops.md (→ 3.3 Engagement Loops)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Four named loops with trigger → action → reward → investment structure, plus one deferred loop. Each loop has a clear cadence. |
| WHY | High | Each loop explains what brings the user back and what compounds. The investment step — what makes the next cycle better — is explicit for each. |
| WHERE | Med | References Bridget, Conan, Nit, and the playbook (Plays 4.6/4.7). Doesn't connect loops to specific card types or retrieval profiles. |
| HOW | Med | Loop mechanics are described at the interaction level (user asks for briefing, gets gap manifest, fills gaps). Missing: how agents orchestrate each loop step-by-step. |
| WHEN | Med | Sprint cadence for release planning. "What would change this" section acknowledges loops are hypothesized, not validated. |

**Verdict:** Passes. The trigger → action → reward → investment structure gives Sam concrete material for Loop cards. The honest flagging of the Contested Truth loop as deferred is good epistemic practice. The "what would change this" section is strong.

---

### Source 11: progression-mastery.md (→ 3.4 Progression/Mastery)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | High | Five-stage arc with named stages and value thresholds. Six-level skill curve table. |
| WHY | High | Each stage explains the mental model shift, not just the feature set. The "talk to the library" pattern as emergent highest-value interaction is a strong insight. |
| WHERE | High | References wizard, Bridget, Conan, factory, the gauntlet (solicitation), Discord example. Rich connections to other product areas. |
| HOW | Med | Describes what users do at each level but not how the product facilitates transitions. Missing: what nudges a user from Inspector to Critic, from Critic to Detective? |
| WHEN | Med | Stages have time ranges (day 1, weeks 1-2, month 1-2, month 3-6, month 6+). No validation data — these are estimates from one deployment. |

**Verdict:** Passes. The skill curve table is the standout artifact — it captures the progression in a format Sam can directly decompose into Journey cards. The "talk to the library as coworker" insight may warrant its own card or feature direction.

---

### Source 12: prototypes-mockups.md (→ 4.3 Prototypes/Mockups)

| Dimension | Coverage | Notes |
|-----------|----------|-------|
| WHAT | Med | Describes what we know (human experience of quality) and what we don't (builder impact). No actual exemplars. |
| WHY | High | Honest about why exemplars don't exist (no beads, no instrumented feedback loop). The pre-validation framing is well-argued. |
| WHERE | Med | References decision files, templates, source files as closest-to-exemplar artifacts. References Alexandria and Play M.3 as future sources. |
| HOW | Low | No concrete exemplars or prototypes. "What would close the gap" section describes what's needed but can't provide it. |
| WHEN | High | Explicitly temporal — this is a pre-validation source. The evidence status is the main content. |

**Verdict:** Thin but honest. This source file is primarily a gap acknowledgment rather than substantive content. Sam can build a card that captures the pre-validation status and what evidence is needed, but there's minimal material for exemplar Artifact cards. This is expected given the product's maturity — real exemplars require deployed, instrumented libraries.

---

## Standard Candidates

| Content | Source Location | Extraction Notes |
|---------|-----------------|------------------|
| Seven user assumptions ("never violate") | user-personas.md §User Assumptions | **Ready.** These are testable constraints. Each is a Standard. |
| Progressive disclosure levels (1/2/3) | usability-standards.md §Progressive Disclosure | **Ready.** Numbered levels with clear boundaries. |
| Day-1 complexity ceiling (1 entry, 3 questions, 1 output, 1 pattern) | usability-standards.md §Day 1 | **Ready.** Quantified spec. |
| Five aesthetic pairs (X, not Y) | aesthetic-goals.md §Five Pairs | **Needs cleanup.** Aesthetic pairs are guidance, not testable specs. Could be Principles rather than Standards. |
| "Hit print" minimum viable concept | usability-standards.md §Hit Print | **Needs definition.** Concept is described but not specified — what specifically must the output include? |
| Franchise north star | aesthetic-goals.md §North Star | **Principle candidate.** Directional, not testable. |
| Bottom-up discovery as design principle | decisions-quality-grading.md §Decision 32 | **Principle candidate.** Design methodology, not testable spec. |
| max() combination rule | decisions-wizard-design.md §Decision 17 | **Ready.** Formula with defined behavior. Already in wizard engine but not a library card. |
| Non-compensatory gate (pool ceiling) | decisions-wizard-design.md §Decision 16 | **Ready.** Defined rule: mode selects pool, novelty/complexity operate within pool. |
| 20% sampling rate for judgment | decisions-quality-grading.md §Decision 31 | **Ready.** Quantified threshold. |

---

## Anti-Pattern Content

| Found | Location |
|-------|----------|
| Agent personality as entertainment ("Bob the Builder," "APOPLECTIC") | aesthetic-goals.md §Professional, not daffy |
| Emergent agent behavior (solo artists, inventing plays) | aesthetic-goals.md §Collegial, not emergent |
| Front-agent translating behind the scenes | aesthetic-goals.md §Collegial, not emergent |
| Temporal folder structure (past/present/future) | institutional-memory.md §Folder structure misadventures |
| Dumping 120 cards with no summary | institutional-memory.md §QA at scale |
| Agents not following the playbook | institutional-memory.md §Agents rarely follow the playbook |
| Grader softening own grades (self-review bias) | decisions-team-architecture.md §Decision 5 |
| Sam biased by seeing grades | decisions-team-architecture.md §Decision 6 |
| Compensatory model (novelty overriding mode ceiling) | decisions-wizard-design.md §Decision 16 |
| Impressionistic grading (anchoring, non-actionable) | decisions-quality-grading.md §Decision 29 |
| Human-first format designed by AI that defaults to human patterns | decisions-service-and-tooling.md §Decision 25 |

Anti-pattern coverage: **Strong.** Nearly every source file documents what NOT to do alongside what to do. The "not X" framing in aesthetic-goals.md and the rejected alternatives in decision files are exactly the material that prevents agents from repeating past mistakes.

---

## Source Gaps

### Critical (Blocks Build)

None. No individual gap is severe enough to block inventory. The source corpus is sufficient to produce Decision, Principle, and Standard cards for the covered knowledge areas.

### Addressable (Proceed with Caution)

- **Missing knowledge areas.** The following wizard-assigned areas have NO source material:
  - **5.3 Roadmap** — Product direction and sequencing. No source file.
  - **1.4 Competitive Analysis** — Market landscape and positioning. No source file.
  - **1.5 Market Requirements** — External constraints and opportunities. No source file.

  These are identified in `assessment.md` as solicitation prompts still to be answered. Sam cannot build cards for these areas until source material exists. **Mitigation:** Proceed with inventory and build for the areas that HAVE sources. Defer these three areas.

- **HOW gap in service/tooling decisions.** Decisions 22-27 describe concepts (beads, profiles, MCP tools) but not mechanics. Sam will produce Decision cards that are WHY-heavy and HOW-light. **Mitigation:** The source file honestly flags this as "build to learn" territory. Cards should preserve the epistemic hedge.

- **Cross-referencing between decision files.** The five decision files form a coherent whole (32 decisions), but cross-references between them are sparse. Decision 3 (markdown over database) relates to Decision 25 (YAML frontmatter) and Decision 22 (beads), but these connections are implicit. **Mitigation:** Sam should create explicit WHERE links between related Decision cards during build.

### Nice to Have

- **Timeline/chronology.** No source file includes a timeline of how the product evolved. When was the single-agent architecture abandoned? When did the four tiers replace an earlier model? When did the wizard ship? This material would enrich WHEN dimensions but isn't required for the initial build.

- **Quantified evidence.** Several decisions reference "real usage data" as what would change them, but no current metrics are documented. How many libraries have been deployed? What's the average card count? What's the grade distribution? This material would strengthen the "evidence status" framing.

- **Persona-to-behavior mapping.** User personas describe who the users are but don't map to specific agent behaviors. How should Conan's grading differ for a Solo Builder vs. an Enterprise Champion? This would strengthen the HOW dimension of persona cards.

---

## Readiness: GAPS

**Proceed with caution.** The source material is sufficient to build cards for 19 of 22 knowledge areas. Three areas (5.3, 1.4, 1.5) have no source material and must be deferred until solicitation prompts are answered.

For the covered areas, the sources are substantive. WHY coverage is the standout strength — the decision files in particular provide the kind of deep rationale that makes context libraries worth having. Anti-pattern coverage is strong across all sources.

The main caution: service/tooling decisions (Decisions 22-27) are explicitly pre-validation. Cards built from this material should carry forward the epistemic honesty of the source. Don't present bets as patterns.

**Recommended next steps:**
1. Proceed to Inventory (Job 1) for the 19 covered areas
2. Flag the 3 uncovered areas as deferred-pending-source
3. During build, have Sam cross-reference `skills/conan/rubrics.md` and `skills/conan/grade-computation.md` to fill HOW gaps in quality/grading Decision cards
4. Queue solicitation prompts for the 3 missing areas when the human is ready

---

**Status: DONE_WITH_CONCERNS**

**Concerns:**
- 3 of 22 knowledge areas have no source material (known — already flagged in assessment.md)
- Service/tooling decisions are pre-validation — cards must preserve epistemic hedging
- Cross-references between decision files are implicit — Sam must create explicit links during build
