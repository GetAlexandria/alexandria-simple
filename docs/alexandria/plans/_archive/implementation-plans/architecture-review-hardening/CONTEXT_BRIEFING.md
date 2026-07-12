# Context Briefing

## Task Frame

**Task:** Architecture Review Hardening — expand `alxndr lint` with new sweep-6 checks (grade-evidence reconciliation, briefing compliance, doc count verification, internal consistency, conformance checking, downstream sync detection); make L1-L5 a CI gate on every commit; fix terminology drift in `docs/design/alexandria.md`; collapse `/wizard` into `/library`; retire Nit as a standalone agent; standardize agent file format across all six agent files; and collapse Health Check + Quality Cycle into one unified play.

**Target type:** Architecture (multi-surface: System, Agent, Capability, Loop, Artifact — cross-system restructure)

**Task type:** architecture

**Constraints:**
- Do not change the card taxonomy, the five-dimension card format, or the grading rubric — those are stable
- Nit's mechanical checks must continue to run; only the agent dispatch overhead is retired (the CLI tool replaces the agent persona for L1-L5; L6 checks become CLI targets callable by any agent)
- Existing eval baselines must hold or improve — verify before merging
- All CI checks must pass (`bun run check`, `bun test`) before PR merge
- Devin Review comments must be addressed before merge
- Use PRs; do not commit directly to main

**Acceptance criteria:**
- `alxndr lint all` runs grade-evidence reconciliation, briefing compliance, doc count verification, internal consistency, conformance checking, and downstream sync detection without invoking Nit agent
- `bun run check` / `bun test` pass cleanly with new lint checks included
- L1-L5 sweeps are wired into CI (fail PR if findings at error severity)
- `docs/design/alexandria.md` terminology matches `Artifact - Type Taxonomy` (Domain/Section/Template, not Zone/Room/Structure/Overlay)
- `/library` handles both first-time setup and returning sessions; `/wizard` is removed as a user-facing command
- All six agent files share a consistent format (frontmatter + sections)
- Health Check and Quality Cycle are described as one play with assess + repair phases in `docs/design/playbook.md`
- Agent card for Nit (`Agent - Nit the Picker.md`) updated to reflect the retired agent / absorbed-into-CLI status; `agents/nit.md` removed or converted to a CLI-pointer stub

---

## Primary Cards (full content)

### Agent - Nit the Picker

**Type:** Agent
**Relevance:** This is the agent being retired. Full content needed to understand the capabilities being absorbed into `alxndr lint`, the relationships that need to be re-wired, and the anti-patterns the agent card guards against. The retirement decision turns on whether every remaining agentic job becomes deterministic software.

**WHAT:** Nit the Picker is the mechanical linter for Alexandria. He runs deterministic, boolean checks across cards, wikilinks, file paths, wizard arithmetic, and agent output. He answers questions that have yes/no or arithmetic answers. He operates at six sweep levels from single-line hygiene to full cross-system verification. Nit is not a critic or judge — he does not evaluate whether content is good or correctly classified. His customer is structural integrity, served through exhaustive mechanical coverage.

**WHERE:**
- Home: [[Domain - Library Interior]] (sweeps cards, links, structures inside the library); [[Domain - Library Boundary]] (checks Bridget's briefings at the boundary); [[Section - Card Repository]] (sweeps 1-4 targets)
- Conforms to: [[Governance - Agent Capability Matrix]]; [[Standard - Five-Dimension Card Requirements]]; [[Standard - Play Exit Status Protocol]]; [[Standard - User Assumptions (Never-Violate Set)]]
- Capabilities: [[Capability - Linting]]
- Coordinates with: [[Agent - Conan the Librarian]] (pre-grade and post-grade sequencing); [[Agent - Sam the Scribe]] (post-build structural validation); [[Agent - Bridget the Briefer]] (briefing compliance checks)
- Depends on: [[System - Knowledge Graph]]
- Related: [[Principle - The Linter Is Adversarial by Design]]; [[Principle - Structural Quality Before Functional Quality]]; [[Artifact - Decision 7: Nit as Independent Linter]]; [[Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]]; [[Artifact - Lesson: No Linter and It Shows]]; [[Artifact - Lesson: The Team Design Emerged from Real Pain]]

**WHY:**
- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]] — structural integrity of cards determines retrieval quality
- Principle: [[Principle - The Linter Is Adversarial by Design]] — independence is the structural guarantee that mechanical quality is never subordinated to editorial judgment
- Principle: [[Principle - Structural Quality Before Functional Quality]] — structural checks must clear before judgment-based grading begins
- Driver: Library #1 was built without a linter. Structural drift went unchecked — card format drift, missing sections, broken wikilinks — until the grading agent was spending context on problems a mechanical checker would have caught instantly.

**WHEN:** Third agent added to the team. Originally Conan performed both grading and mechanical checks; mixing boolean checks into judgment-based grading degraded both. Decision 7 formalized Nit as an independent linter. Current status: Implemented — 6 sweep levels. Note: Nit has NOT been through eval-driven hardening like the other five agents (2026-03 cycle). His sweep definitions and mechanical checks remain as designed; a dedicated hardening pass was expected but is superseded by the retirement decision.

**HOW:** Six sweep levels: `lines` (sweep 1: line hygiene, terminology, wikilink syntax, naked links); `cards` (sweep 2: five H2 sections, naming, folder placement, stub sections, word count, link counts); `graph` (sweep 3: broken wikilinks, orphans, bidirectional gaps, duplicates); `layers` (sweep 4: population, cross-layer links, inventory reconciliation, manifest fidelity); `library` (sweep 5: coverage metrics, type distribution, feedback queue schema, terminology sweep); sweep 6 (CLI-implemented: `grades`, `plans`, `wizard`; manual families: `paths`, `counts`, `briefings`). Voice is terse and factual. Relationship to team is adversarial by design — independent verification, not collaboration.

---

### Artifact - Type Taxonomy

**Type:** Artifact
**Relevance:** The terminology drift in `docs/design/alexandria.md` is a conflict between old terminology (Zones, Rooms, Structures) and the current taxonomy (Domains, Sections, Templates). The fix requires knowing the authoritative current type list to do the replacement correctly. Also load-bearing for confirming whether 22 types is the right count after any taxonomy changes.

**WHAT:** The 18-type classification system governing what kind of card every piece of product knowledge becomes. Organized as a five-step decision tree: (1) WHY layer → Product Thesis, Principle, Standard; (2) user-interaction layer → Domain, Section, Governance, Template, Component, Artifact, Capability, Primitive; (3) invisible infrastructure → System; (4) AI team member → Agent; (5) experience over time → Loop, Journey, Experience Goal, Force. Consulted by Conan during inventory and classification; edited when the type system evolves.

**WHERE:**
- Contained by: [[Section - Card Repository]]
- Conforms to: [[Standard - Five-Dimension Card Requirements]]
- Related: [[Artifact - Library Folder Structure]]; [[Artifact - Naming Convention]]; [[Template - Card]]; [[System - Knowledge Graph]]; [[Capability - Inventory]]; [[Capability - Linting]]; [[Principle - One Concept Per Card]]

**WHY:**
- Product Thesis: [[Product Thesis - AI-Native Knowledge Representation Outperforms Human-Forward]] — typed nodes enable type-based retrieval profiles, type-specific grading criteria, and type-aware traversal rules
- Driver: Without a taxonomy, every card is "a document." Agents cannot apply type-specific retrieval profiles, Nit cannot validate folder placement, and Conan cannot check containment relationships.

**WHEN:** Established at library inception. Current taxonomy has 18 types derived from product architecture vocabulary combined with general knowledge management types. Explicitly architecture-agnostic. Stability: Stable (the concept of typed cards), Extensible (new types may be added).

**HOW — Decision Tree:**
1. Is this about WHY we build? → Product Thesis (a bet) | Principle (rule of thumb) | Standard (testable spec)
2. Do users consciously interact? → Navigate TO it: Domain (top-level), Section (nested); Cross-cutting constraint across all Domains: Governance; Interact WITHIN: Template (spatial canvas), Component (specific widget), Artifact (content object), Capability (action/workflow); Core data entity: Primitive
3. Invisible infrastructure? → System
4. AI team member? → Agent
5. Experience over time? → Loop (repeating cycle) | Journey (multi-phase progression) | Experience Goal (target feeling) | Force (emergent cross-system behavior)

**Four Classification Guardrails:** (1) Interaction Test: builders say "I'm using X"? No → System. (2) Component Litmus: can you point at one discrete widget? No → not Component. (3) Governance Test: persists across ALL domains? No → not Governance. (4) Action-word Test: verbs in name/description? → Capability.

**Note on count:** The taxonomy has 18 base types. The scratch pad notes 22 total when Decision, Initiative, Future, and Release (temporal/release layer) are included. `docs/design/alexandria.md` claiming "22 knowledge areas" refers to the wizard's 22 knowledge areas — a different count. Both counts need verification during the doc-count fixes.

---

### Agent - Bridget the Briefer (library card)

**Type:** Agent
**Relevance:** Briefing compliance is one of the new L6 checks being added to `alxndr lint`. The card defines exactly what "compliant" means — mandatory sections, provenance requirements, the output contract. Also relevant because Nit's retirement removes the agent that was verifying Bridget's briefings; that verification moves fully to the CLI tool.

**WHAT:** Outward-facing library role — the assembly interface between Alexandria and its AI consumers. Faces two directions: toward the library (reading cards, traversing the graph, applying retrieval profiles) and toward the factory (delivering briefings that help builder agents make aligned decisions). Never modifies the library. Serves factory builder agents and planning skills through a ten-step assembly procedure. Output contract is strict: exact filename (`CONTEXT_BRIEFING.md`), mandatory sections (Task Frame, Primary Cards, Supporting Cards, Relationship Map, Gap Manifest, Completion Status). Provenance and feedback written to separate files (`provenance-log.jsonl`, `feedback-queue.jsonl`), not embedded in the briefing.

**WHERE:**
- Home: [[Domain - Library Boundary]]; [[Section - Assembly Workspace]]; [[Section - Feedback Workspace]]
- Conforms to: [[Governance - Agent Capability Matrix]]; [[Standard - Five-Dimension Card Requirements]]; [[Standard - Play Exit Status Protocol]]; [[Standard - User Assumptions (Never-Violate Set)]]
- Capabilities: [[Capability - Context Assembly]]
- Coordinates with: [[Agent - Conan the Librarian]] (indirect feedback: Bridget logs, Conan decides); [[Agent - Nit the Picker]] (briefing compliance checks — NOTE: this relationship changes with Nit's retirement; the compliance check moves to CLI)
- Depends on: [[System - Retrieval and Assembly Engine]]; [[System - Knowledge Graph]]; [[System - Feedback Queue]]; [[System - Provenance Log]]; [[Template - Context Briefing]]

**WHY:**
- Product Thesis: [[Product Thesis - Better Context Produces Better Agent Output]]
- Principle: [[Principle - Serve Incomplete Libraries Honestly]]
- Principle: [[Principle - Factory Demand Drives Library Priority]]
- Principle: [[Principle - Attention Is a Resource with a Shape]]
- Driver: The library-factory boundary needed a dedicated bridge. Without Bridget, library knowledge stayed inside the library — builder agents either got no context or got raw cards without task-specific shaping.

**WHEN:** Fourth agent added to the team. Eval-driven hardening (2026-03) established the strict output contract: exact filename, mandatory sections, provenance and feedback in separate files. Release 2 (2026-03-26) added implementation planner as a new customer type (Step 2 of planning).

**HOW — Ten-step procedure:** (1) Task arrives; (2) Classify (target type + task type); (3) Load retrieval profile; (4) Apply task modifier; (5) Find seed cards; (6) Expand via retrieval profile; (7) Check mandatory categories; (8) Assemble briefing with U-shaped attention ordering; (9) Log provenance to `provenance-log.jsonl`; (10) Triage feedback to `feedback-queue.jsonl`. Voice is professional facilitator. Competence is the personality.

**Anti-examples:**
- Wrong: Bridget discovers a hollow WHY section and fills it with inferred reasoning. She logs to feedback queue for Conan/Sam to address.
- Wrong: Briefing of 50 cards with no task frame or gap manifest — this is the QA by Dumping anti-pattern.

---

### Architecture Review Scratchpad (2026-04-10)

**Type:** Source / working document (not a library card, but the authoritative task specification)
**Relevance:** This is the primary source of truth for the full scope of this task. It contains the specific list of candidates, the rationale for each, the architectural questions being resolved, and the open items that are NOT in scope for this implementation plan.

**Key decisions from the scratchpad that bound this task:**

1. **L1-L5 → CI gate:** All deterministic sweeps (lines, cards, graph, layers, library) should run on every commit as a gate. Never needs to be "requested." Only exception: transient construction state (Sam mid-batch). L6 (antagonistic grade check) stays as a play step since it only makes sense after Conan grades.

2. **New L6 CLI targets:** Grade-evidence reconciliation, briefing compliance, doc count verification, internal consistency checks, and conformance checking should be deterministic software in `alxndr lint`. Currently agentic (Nit reads cards, counts links, compares to Conan's grades) but counting is completely deterministic.

3. **Nit retirement:** If remaining manual L6 checks become software, Nit has no agentic job left. Every play where Nit appears either becomes CI (L1-L5) or a CLI call any agent can make (L6). Nit gets absorbed into the CLI tool. 6 agents → 5 agents. Agent personality could survive as CLI flavor text but agent dispatch overhead goes away.

4. **Terminology drift fix:** `docs/design/alexandria.md` uses old terminology ("Zones, Components, Systems" in the skeleton table) while active `type-taxonomy.md` uses current terms (Domain, Section, Template). Needs reconciliation.

5. **Collapse /wizard into /library:** `/library` is the single entry point. First visit with no library triggers setup automatically (silent skill, not user-invocable). `/wizard` as a user-facing command goes away — renamed "first-time setup" internally, made a silent sub-procedure of `/library`. Removes user confusion about which to run.

6. **Agent file format standardization:** Inconsistent sections across 6 agent files. Should have a canonical template.

7. **Health Check + Quality Cycle collapse:** Health Check (Job 8) is the assessment half (discover what's wrong). Quality Cycle (Grade→Diagnose→Recommend→Surgery→Fix→Review) is the repair half. Grade (Job 2) is arguably a step within Health Check, not a standalone job. Consider collapsing into one play with two phases: assess, then repair.

**Items explicitly NOT in scope for this plan (from scratchpad):**
- Three-tier quality checking model (design exercise)
- Persisted quality state / grade cache (major design exercise)
- Comprehensive data modeling (major design exercise)
- Build pipeline connection / Solomon→Conan handoff (separate)
- `core/` directory deletion (separate cleanup PR)
- 22 card types reduction (open question, not decided)
- Concurrent Solomon flow redesign (separate)

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Agent - Conan the Librarian]] | Agent | Conan explicitly does NOT run mechanical checks (that's Nit's job). With Nit retired, Conan's agent file must be updated to reflect that L1-L5 are now CI and L6 checks are CLI calls. The division-of-labor section changes. |
| [[Agent - Sam the Scribe]] | Agent | Sam coordinates with Nit on post-build structural validation. With Nit retired, Sam's `agents/sam.md` must update the Nit coordination reference; the play step "hand off to Nit" becomes "CI gate catches structural issues." |
| [[Agent - Raven the Maven]] | Agent | Raven dispatches Nit when structural issues surface. With Nit retired, Raven's dispatch table loses the Nit row; structural issues are caught by CI before Raven encounters them. Also: `/wizard` collapse means Raven's Job 2 entry point changes. |
| [[Capability - Linting]] | Capability | The capability that Nit was the exclusive owner of. With Nit retired, this capability is performed by the `alxndr lint` CLI tool directly. The library card for this capability needs updating. |
| [[Artifact - Decision 5: Four Agents, Not One]] | Artifact | The original architectural decision creating 4 specialized agents. This task changes it to 5 agents (the sixth, Nit, is retired). The Decision card needs a WHEN update noting the retirement and the rationale (mechanical checks fully deterministic now). |
| [[Artifact - Decision 7: Nit as Independent Linter]] | Artifact | The decision that created Nit as independent rather than a Conan sub-agent. The retirement does NOT reverse this decision's rationale — the independence principle stands, but the implementation moves from agent to CLI tool. WHEN section should record this evolution. |
| [[Artifact - Lesson: No Linter and It Shows]] | Artifact | The lesson that created Nit: Library #1 had no linter. This lesson is still valid and should NOT be deleted — it explains why `alxndr lint` exists, even after Nit's retirement as an agent. |
| [[Artifact - Anti-Pattern: Grade Softening]] | Artifact | Grade-evidence reconciliation (one of the new L6 checks) is the primary guard against this anti-pattern. The check already exists in sweep definitions; this task makes it a CLI implementation. |
| [[Loop - Alignment Sweep]] | Loop | Currently driven by Nit running exhaustive mechanical checks. With Nit retired, this loop is driven by CI + `alxndr lint` calls from Conan or any agent. The loop card needs updating to remove Nit as the driver. |
| [[Principle - The Linter Is Adversarial by Design]] | Principle | Foundational WHY for Nit's independence. The principle transfers to the CLI tool — `alxndr lint` is still adversarial by design (answers to the evidence, not the team). The principle card remains valid; no update needed. |
| [[Principle - Structural Quality Before Functional Quality]] | Principle | Unchanged. The principle still holds. CI enforcement of L1-L5 strengthens this principle's implementation — structural checks now run automatically, not on request. |
| [[Artifact - Decision: Skill Naming Convention]] | Artifact | The `/wizard` → `/library` collapse touches skill naming and entry-point conventions. This decision card governs naming — check it before renaming the wizard skill. |

---

## Relationship Map

- `agents/nit.md` implements [[Agent - Nit the Picker]] (the agent card defines what the agent file must contain — retirement affects both)
- `agents/nit.md` coordinates-with `agents/conan.md` (pre-grade sweeps, post-grade grades check); this coordination becomes CLI calls
- `agents/nit.md` coordinates-with `agents/bridget.md` (briefing compliance); this moves to `bin/alxndr lint briefings`
- `agents/nit.md` coordinates-with `agents/sam.md` (post-build structural validation); this moves to CI gate
- `src/tools/lint-core.ts` implements [[Capability - Linting]] — new L6 targets must be added here
- `src/tools/lint-grades.ts` extends `src/tools/lint-core.ts` (grade-evidence reconciliation is a partial implementation already present)
- `src/tools/lint-briefings.ts` extends `src/tools/lint-core.ts` (briefing compliance check is already implemented)
- `skills/nit/sweeps.md` defines the sweep targets Nit executes — the manual L6 families (`counts`, internal consistency, conformance, downstream sync) are currently described here as prose, not implemented
- `docs/design/playbook.md` contains [[Loop - Alignment Sweep]] and Health Check (Play 4.1) and Quality Cycle (Play 2.2) — the collapse of Health Check + Quality Cycle requires editing this file
- `docs/design/alexandria.md` contains-terminology-from old type taxonomy — the terminology fix is an edit to this file
- `skills/raven/job-initialize.md` implements `/wizard` entry point — the collapse into `/library` requires editing this file and the skill dispatch table
- `agents/conan.md` depends-on `agents/nit.md` (the division-of-labor section) — must update to remove Nit references
- [[Artifact - Type Taxonomy]] constrained-by current type vocabulary — the terminology drift in `docs/design/alexandria.md` violates this

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| HOW | Exact implementation spec for the new L6 CLI targets (conformance checking, downstream sync detection) | yes | partial | The scratchpad describes these as "candidates" but does not specify the data structures or algorithms. Builder should read `src/tools/lint-manifest.ts` (which already has `extractConformanceLinks`) to understand what infrastructure exists before implementing. |
| HOW | What "agent file format standardization" means concretely — what sections should exist, in what order | yes | no | No canonical agent file template exists in the library. Builder must audit all 6 agent files (`agents/*.md`) and derive the pattern from the majority before standardizing. The scratchpad flags this as an open question ("should there be a canonical template?") without answering it. |
| WHY | Rationale for collapsing `/wizard` into `/library` beyond user confusion — does this affect eval coverage? | yes | partial | The scratchpad gives user confusion as the reason. No eval coverage for the wizard skill is documented as affected. Builder should check `bin/alexandria-eval list wizard` before making changes. |
| WHEN | Which plays in `docs/design/playbook.md` still reference Nit explicitly and must be updated | yes | partial | Nit appears in plays 0.2, 0.3, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3.1, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7 — nearly every play. The playbook requires a systematic find-and-replace plus a conceptual rewrite of the plays where Nit was the primary agent. |
| WHERE | Blast radius of removing `agents/nit.md` — which skills, tests, and config files reference it | yes | partial | `agents/nit.md` is referenced in `skills/shared/play-protocol.md` (model routing table), `docs/design/playbook.md` (multiple plays), and potentially CI configuration. Builder should `grep -r "nit" agents/ skills/ tests/ config/` before deletion. |
| HOW | CI wiring spec — how does `bun run check` get extended to run `bin/alxndr lint all` as a gate | yes | no | No card documents the CI pipeline configuration. Builder must read `package.json` and `.github/workflows/` to understand where to wire the lint gate. This is implementation detail outside the library's scope — proceed from code inspection. |

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

Two concerns:

1. **Nit retirement blast radius is large.** Nearly every play in `docs/design/playbook.md` references Nit. The playbook rewrite is the largest single task in this plan and is not fully specced in the scratchpad. The builder will need to make judgment calls about how to rewrite play steps that previously read "Nit runs sweep X." Recommended approach: for L1-L5 references, rewrite as "CI gate enforces structural integrity — no play step needed"; for L6 references, rewrite as "`bin/alxndr lint <target>` (callable by any agent or CI)."

2. **Agent file format standardization is underspecified.** The scratchpad flags this as an open question without a proposed answer. The builder must audit all six agent files, derive a canonical structure, and apply it consistently. This is a higher-judgment task than the mechanical changes. Recommend the builder read all six agent files before writing a line of code for this item.
