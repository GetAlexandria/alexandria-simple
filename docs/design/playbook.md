# Alexandria Playbook

How the team runs the library. Every play is a coordinated motion — triggered by an
event, executed by multiple agents, ending with a clear status. No play is owned by
a single agent. The agents are workers; the plays are the work.

**See also:** `org-chart.md` for who does what and why. This document covers how they
do it together.

---

## How Plays Work

**A play is a complete motion from trigger to done.** It has a trigger (what kicks it
off), steps (what happens in what order), agents at each step, and an exit status.

**Exit statuses:**

| Status | Meaning | What happens next |
|--------|---------|-------------------|
| DONE | Play completed successfully. All gates passed. | Next play in the lifecycle can proceed. |
| DONE_WITH_CONCERNS | Completed, but something is off. Not blocking. | Next play can proceed. Concerns logged for human review. |
| BLOCKED | Cannot proceed. Missing input, unresolvable conflict, or quality gate failed. | Human decides: fix the blocker and retry, or skip with documented rationale. |
| NEEDS_CONTEXT | Insufficient information to execute. Not a failure — a request. | Human provides the missing context. Play resumes. |

**Shared preamble:** Every play starts with orientation. Read the library README, check
the feedback queue for relevant items, note any active concerns from prior plays. This
is not a formality — agents working without orientation produce context-free output.

**Downstream sync rule:** Every play that changes library structure (new cards, renames,
folder changes, type changes) must end with Conan running downstream sync + a direct
`ax lint paths <repo-root>` check. This is a rule embedded in plays, not a
standalone play.

**Mechanical linting is embedded, not standalone.** Structural checks appear as direct
`ax lint ...` steps inside plays, not as separate agent dispatches. The exception
is the deep mechanical sweep inside Health Check and Alignment Sweep, where the CLI runs
exhaustively as a diagnostic step.

**Bridget's demand signal.** When Bridget assembles a briefing and discovers gaps (cards
that should exist but don't), those gaps are a prioritization signal. The next card Sam
builds should be what Bridget couldn't find, not just the next item on the inventory.
Plays that involve both construction and service should route Bridget's gap signal to
Sam's build queue.

**Versioning.** Plays are versioned artifacts. Each play has a version number, a changelog
(what changed and why, with evidence), and optionally benchmark results (before/after on
real libraries). When a play is revised, the new version is staged as a draft for human
review before replacing the canonical version. This supports the eval/iterate loop: measure
whether a play change actually improved outcomes, don't just assume it did.

**Interrupt-driven usage.** The lifecycle stages below describe the natural progression, but
real usage is interrupt-driven. A founder builds 10 cards, needs a briefing tomorrow, goes
back to building, discovers a type is wrong. Bridget must be able to assemble from an
incomplete library and be honest about what's missing. Plays in later stages can be invoked
before earlier stages are complete — they just produce more DONE_WITH_CONCERNS exits.

---

## Stage 0: Genesis

The library doesn't exist yet. Someone has decided to build one. These plays establish
what to build, assess whether the source material supports it, and create the scaffolding.

---

### Play 0.1: Configuration

**Trigger:** Human decides to build a context library for a product.

**Agents:** Human + Raven

**Inputs:** A product to document. Source material (design docs, strategy memos, specs —
whatever exists). The human's sense of how novel the domain is, how complex the product
is, and how heavily AI agents are involved.

**Steps:**

1. **Initialize flow asks three questions.** AI Mode (how agentic is the workflow?), Domain Novelty
   (how much does this product depart from standard patterns?), Product Complexity (how many
   interconnected subsystems?). These are structured prompts with examples and scales.

2. **Initialize flow runs the configuration engine.** Pool membership + sensitivity profiles + mode
   floors + override rules → a ranked list of 22 knowledge areas assigned to tiers:
   Foundation (must build), Core (should build), Amplifier (build if time allows),
   Deprioritized (skip unless specific need arises).

3. **Human reviews and adjusts.** The initialize flow structures the question; the human
   decides the answer. A knowledge area the initialize flow scored as Amplifier might be
   Foundation for this particular product because the human knows something the initialize
   flow doesn't.

4. **Initialize flow writes configuration.** Output: `initialize-output.md` (human-readable summary) and
   `alexandria-config.json` (machine-readable tier assignments).

5. **Initialize flow runs gap analysis.** If this is an existing library being reconfigured, compare
   recommendations against current coverage. Produce gap scores — how many assembly tasks
   would be degraded if each gap persists. Output: gap analysis appended to `initialize-output.md`.

6. **Initialize flow produces solicitation prompts.** For each knowledge gap, generate the specific
   questions a human would need to answer (or the specific source material sections to read)
   to fill that gap. This is the bridge between "we need X" and "here's how to get X."

**Exit:** DONE (configuration written) or NEEDS_CONTEXT (source material too thin to even
assess — human needs to provide more).

---

### Play 0.2: Source Assessment

**Trigger:** Configuration exists. Source material has been identified.

**Agents:** Conan

**Inputs:** Source material files. Configuration from Play 0.1.

**Steps:**

1. **Conan audits source material.** Five-dimension coverage assessment: does the source
   contain enough WHAT (feature descriptions), WHERE (relationship descriptions), WHY
   (rationale and motivation), HOW (implementation detail, examples, anti-examples), and
   WHEN (status, timeline, decisions)?

2. **Conan identifies gaps by dimension.** WHY and HOW gaps are most severe — they're
   hardest to recover from because a card author cannot invent rationale without human
   input. WHAT gaps are less severe because boundaries can often be inferred.

3. **Conan classifies readiness.** READY (proceed with confidence), GAPS (proceed with
   caution — flag issues as they arise), or BLOCKED (stop — critical dimensions missing
   across the board, cards will be hollow).

4. **If GAPS or BLOCKED:** Conan produces a specific list of what's missing, framed as
   questions for the human or as sections that source material should cover.

**Exit:** DONE (READY — proceed to inventory), DONE_WITH_CONCERNS (GAPS — proceed but
expect thin cards in specific areas), or BLOCKED (source material insufficient — human
must provide more before inventory).

---

### Play 0.3: Inventory and Scaffold

**Trigger:** Source assessment passes (READY or GAPS with human go-ahead).

**Agents:** Conan → Sam

**Inputs:** Source material. Configuration from Play 0.1. Source assessment from Play 0.2.

**Steps:**

1. **Conan reads the source and produces the manifest.** Every card that should exist: card
   type, source reference, build order, and classification rationale. The build order is
   strict: Standards first → Product Thesis/Principles → cross-cutting Systems → containers
   (Zones → Rooms) → contained elements → leaf nodes → Agents/Prompts.

2. **Conan flags classification uncertainties.** Ambiguous items get `HUMAN JUDGMENT NEEDED`
   flags with the specific question and Conan's best guess.

3. **Human reviews the manifest.** Adds items Conan missed, removes items that don't warrant
   cards, resolves classification flags.

4. **Sam creates the folder structure.** Directories for each type, empty README, the
   reference document with templates and naming conventions.

5. **Sam verifies the scaffold.** Run `ax lint cards <library-path>` to check
   folder structure against expected types from config, then run
   `ax lint paths <repo-root>` to confirm the reference doc and README paths
   resolve correctly.

**Exit:** DONE (manifest approved, scaffold verified) or NEEDS_CONTEXT (classification
questions that the human and Conan can't resolve from source material alone).

---

## Stage 1: Construction

Cards are being built for the first time. The build follows a strict order because
downstream cards reference upstream cards — you can't write a good Component card before
the Room it lives in exists.

---

### Play 1.1: Upstream Build

**Trigger:** Inventory and scaffold complete.

**Agents:** Sam (iterating)

**Inputs:** Manifest (upstream section: Standards, Product Theses, Principles). Source
material.

**Steps:**

1. **Sam builds Standards first.** These constrain everything downstream. Each Standard gets
   the full five-dimension treatment: WHAT (what the standard specifies), WHERE (what domains
   it governs), WHY (why this constraint exists), WHEN (when it was established), HOW
   (concrete rules, examples, anti-examples).

2. **Sam runs the structural CLI checks on the Standards batch.** Run
   `ax lint lines <library-path>`, `ax lint cards <library-path>`, and
   `ax lint graph <library-path>`. This covers line-level hygiene, card structure,
   and graph integrity (do wikilinks between Standards resolve? do conformance links point
   to cards that exist or are in the manifest?).

3. **Sam fixes lint findings.** Broken links, missing sections, naming issues.

4. **Sam re-runs the same CLI checks.** Repeat until clean.

5. **Sam builds Product Theses and Principles.** These are the WHY layer — the bets and
   rules of thumb that justify everything downstream. Product Theses are particularly
   important: every product-layer card will trace its WHY back to a Product Thesis. A stub
   Product Thesis infects the entire downstream subgraph.

6. **Sam runs the same structural CLI checks on the rationale batch.** Run
   `ax lint lines <library-path>`, `ax lint cards <library-path>`, and
   `ax lint graph <library-path>`. Same cycle: lint, fix, re-lint.

**Exit:** DONE (all upstream cards built, structural lint clean) or DONE_WITH_CONCERNS (built, but
source material had WHY gaps flagged in Source Assessment — some rationale cards are
thinner than ideal).

---

### Play 1.2: Upstream Gate

**Trigger:** Upstream build complete.

**Agents:** Conan

**Inputs:** Upstream cards (Standards, Product Theses, Principles).

**Steps:**

1. **Conan spot-checks upstream cards.** Not a full grade — an abbreviated assessment of
   whether these cards are substantial enough to be load-bearing references. Key question:
   "If a product-layer card links its WHY to this Product Thesis, will the link provide
   real context or just point at a stub?"

2. **Conan runs `ax lint grades <grade-report-or-library-path>`** on the
   spot-check results. Do the assessments match countable evidence?

3. **Conan issues a gate decision.** PROCEED (upstream is solid enough to build on), FIX
   FIRST (specific cards are too thin — send back to Sam before proceeding), or ESCALATE
   (source material gap — human must provide rationale content that doesn't exist in any
   source).

**Exit:** DONE (PROCEED — move to product layer), BLOCKED (FIX FIRST or ESCALATE — loop
back to Play 1.1 for targeted fixes or to human for more source material).

---

### Play 1.3: Product Layer Build

**Trigger:** Upstream gate passes.

**Agents:** Sam (iterating)

**Inputs:** Manifest (product-layer section: Zones, Rooms, Overlays, Structures,
Components, Artifacts, Capabilities, Primitives, Systems). Source material. Upstream
cards (for WHY links and conformance links).

**Steps:**

1. **Sam builds cards in manifest order.** Containers first (Zones, then Rooms), then
   contained elements (Structures, Components, Artifacts, Capabilities), then cross-cutting
   (Systems, Overlays), then Primitives. Each card gets the full five-dimension treatment.

2. **Sam applies containment rules.** Every Room links to its Zone. Every Component links
   to its Structure or Room. Every Artifact links to its Room. Every conformance-obligated
   card links to its constraining Standard. Missing containment = structural deficiency.

3. **Sam runs the structural CLI checks after each batch** (where a batch is a type
   group — all Zones, then all Rooms, etc.). Run `ax lint lines <library-path>`,
   `ax lint cards <library-path>`, `ax lint graph <library-path>`, and
   `ax lint layers <library-path>`. This covers structure, links, graph integrity,
   and layer-level checks (minimum population, cross-layer links).

4. **Sam fixes lint findings.** Iterate until the batch is structurally clean.

5. **Sam reports progress.** "Done: 12 cards. Flagged: 2 for human judgment. Ready for
   next batch."

**Exit:** DONE (all product-layer cards built, structural lint clean) or DONE_WITH_CONCERNS (built,
but some classification flags unresolved or some HOW sections thin due to source gaps).

---

### Play 1.4: Experience Layer Build

**Trigger:** Product layer stable.

**Agents:** Sam (iterating)

**Inputs:** Manifest (experience-layer section: Loops, Journeys, Aesthetics, Dynamics).
Source material. Product-layer cards (for containment links — Loops link to Rooms and
Capabilities, Journeys link to Loops and Agents, etc.).

**Steps:**

1. **Sam builds experience-layer cards.** These describe how the product feels over time:
   repeating activity cycles (Loops), multi-phase progression arcs (Journeys), target
   emotional states (Aesthetics), and emergent cross-system behaviors (Dynamics).

2. **Sam applies containment rules.** Loops link to Room(s) and Capability(ies). Journeys
   link to Loop(s) and Agent(s). Aesthetics link to Room(s), Loop(s), Component(s).
   Dynamics link to System(s).

3. **Sam runs the structural CLI checks.** Run `ax lint lines <library-path>`,
   `ax lint cards <library-path>`, `ax lint graph <library-path>`, and
   `ax lint layers <library-path>`. Same cycle.

**Exit:** DONE (all experience-layer cards built, structural lint clean).

---

### Play 1.5: Temporal Enrichment

**Trigger:** All layers built.

**Agents:** Sam

**Inputs:** All existing cards. Source material (especially decision records, timeline
documents, roadmaps).

**Steps:**

1. **Sam enriches WHEN sections across existing cards.** During initial construction, WHEN
   sections often get minimal treatment ("Implemented" or "Planned"). This pass adds
   substantive temporal context: when was this decided? what changed since the original
   design? what's planned for the next version? what diverges between vision and reality?

2. **Sam creates temporal-layer cards** if the source material supports them: Decision
   cards (recording important product decisions and their rationale), Initiative cards
   (tracking ongoing work), Future cards (recording planned but not-yet-started work).

3. **Sam runs the structural CLI checks on all touched cards.** Run
   `ax lint lines <library-path>`, `ax lint cards <library-path>`, and
   `ax lint graph <library-path>`.

**Exit:** DONE (WHEN sections enriched, temporal cards created) or DONE_WITH_CONCERNS
(source material didn't have much temporal content — WHEN sections are thin but exist).

---

### Play 1.6: First Graph Review

**Trigger:** All layers built, with the `lines`, `cards`, `graph`, and `layers` CLI checks
clean.

**Agents:** Conan

**Inputs:** The complete library as built.

**Steps:**

1. **Conan runs the full-graph CLI checks.** Run `ax lint graph <library-path>`,
   `ax lint layers <library-path>`, and `ax lint library <library-path>`.
   This is the first time anyone looks at the whole library as a connected system. The CLI
   produces: broken link count, orphan card count, bidirectional gap count, layer
   population counts, coverage percentages, and type distribution.

2. **Conan reviews the graph topology report.** Key questions: Are there islands
   (disconnected subgraphs)? Does every product-layer card connect to at least one
   rationale card? Are there card clusters with no cross-links? Is the type distribution
   reasonable (not 30 Components and 0 Standards)?

3. **Conan produces a graph health assessment.** HEALTHY (proceed to grading), STRUCTURALLY
   WEAK (specific topology issues to fix before grading), or FUNDAMENTALLY DISCONNECTED
   (the graph has islands — major construction gaps).

**Exit:** DONE (HEALTHY — proceed to quality pass), BLOCKED (structural issues that need
construction-level fixes, not quality-level fixes — loop back to the appropriate build
play).

---

## Stage 2: First Quality Pass

Cards exist and are structurally sound. Now we evaluate whether they're actually good —
substantive, accurate, useful for assembly.

---

### Play 2.1: Grade

**Trigger:** First Graph Review passes.

**Agents:** Conan

**Inputs:** All library cards. Rubrics and grade computation model.

**Steps:**

1. **Conan runs the pre-grade CLI checks.** Run `ax lint lines <library-path>`,
   `ax lint cards <library-path>`, `ax lint graph <library-path>`,
   `ax lint layers <library-path>`, and `ax lint library <library-path>`.
   Clean the floor before Conan touches it. Any structural defects caught here are cheaper
   to fix than discovering them mid-grade. If the CLI finds issues, Sam fixes them and
   Conan re-runs the checks before proceeding.

2. **Conan grades every card.** Five dimensions, equal weight (20% each). Each dimension
   gets a letter grade A-F against explicit rubric criteria. Card grade = weighted average.
   Zone grade = average of card grades with completeness cap (fewer than 25% of expected
   cards = max grade D). System grade = average of zone grades.

3. **Conan produces grade artifacts.** Card reports (per-card grades with commentary),
   zone scorecards (zone grades with coverage notes), system health report (system grade
   with identified weakness clusters).

4. **Conan runs `ax lint grades <grade-report-or-library-path>`.** This is the
   antagonistic check. For each graded card, the CLI verifies: does Conan's WHERE grade
   match the countable link count? Does the HOW grade match the example/anti-example
   count? Does the WHEN grade match section existence? It flags discrepancies — not to
   overrule Conan's judgment, but to catch cases where the judgment doesn't match the
   evidence.

5. **Conan reviews the discrepancy flags.** Adjusts grades where the CLI caught a mistake.
   Documents rationale where the discrepancy is intentional (e.g., "WHERE has 5 links but
   they're all containment — no lateral connections, so B not A despite link count").

**Exit:** DONE (library graded, antagonistic check reconciled).

---

### Play 2.2: Improvement Loop

**Trigger:** Grade complete. System grade below target, or specific weakness clusters
identified.

**Agents:** Conan → Sam → Conan (iterating)

**Inputs:** Grade artifacts. All library cards.

**Steps:**

1. **Conan diagnoses root causes.** Traces weak grades upstream. A product-layer card
   weak on WHY → check the linked Product Thesis. Stub upstream = upstream fix (affects
   all downstream cards). Substantive upstream = card-level fix only. Calculates blast
   radius for each root cause.

2. **Conan produces prioritized recommendations.** High blast radius + upstream position =
   fix first. Tier 1 (fix immediately), Tier 2 (fix next), Tier 3 (fix when convenient),
   Tier 4 (accept for now).

3. **Conan produces surgery plans for Tier 1 and Tier 2.** Six-phase fix plans for Sam.
   Each plan includes: domain context ("what good looks like"), specific tasks ("create/
   edit these cards"), acceptance criteria ("done when X"). Plans do NOT include grades,
   cascade analysis, or diagnostic framing — Sam writes to the source material, not to
   Conan's opinion.

4. **Sam executes surgery plans.** Works through Tier 1 first, then Tier 2. Runs self-check
   on all modified cards.

5. **Sam runs regression checks.** After Sam's fixes, run `ax lint graph <library-path>`
   plus any affected sweep-6 commands (`grades`, `plans`, `initialize`, `paths`, `counts`,
   `briefings`, `sync`, `internal-consistency`) to verify no new broken links, orphans, or
   structural issues were introduced. If regression is found, Sam fixes and re-runs the
   relevant commands.

6. **Conan reviews Sam's work (Job 7).** Re-grades fixed cards. Produces before/after delta
   report. Pass or fail gate.

7. **If fail:** Loop back to step 3 with a revised surgery plan. Conan adjusts based on
   what the first round revealed.

8. **If pass:** Conan runs downstream sync if any structural changes were made.

**Exit:** DONE (all targeted fixes pass review) or DONE_WITH_CONCERNS (some Tier 2 items
deferred to maintenance cycle — documented).

---

### Play 2.3: Type Audit

**Trigger:** Improvement loop passes. Library has settled.

**Agents:** Conan → Sam

**Inputs:** All library cards. Type taxonomy decision tree.

**Steps:**

1. **Conan runs the type audit (Job 6).** Applies the decision tree to every card:
   Interaction Test, Component Litmus, Overlay Test, Action-word Test. Looks for common
   misclassifications (System vs. Component, Capability vs. Component, System vs. Dynamic).

2. **Conan flags reclassifications.** For each proposed change: current type, proposed type,
   the gate that triggered the reclassification, and the downstream impact (what changes
   if this card changes type — folder, containment links, retrieval profile behavior).

3. **Human reviews reclassification proposals.** Some are clear (a "Component" that fails
   the Interaction Test is definitely a System). Some are judgment calls. Human approves
   or rejects each.

4. **Sam executes approved reclassifications.** Rename file, move to correct folder, update
   containment links.

5. **Sam runs `ax lint graph <library-path>` plus
   `ax lint paths <repo-root>`.** Verify all links updated, no broken references,
   and meta-file paths still resolve.

6. **Conan runs downstream sync.**

**Exit:** DONE (all types verified or corrected) or DONE_WITH_CONCERNS (ambiguous cases
documented for future review).

---

## Stage 3: Service

The library serves the factory. Bridget assembles context briefings for builder agents.
This stage can begin before Stage 2 is complete — Bridget assembles from whatever exists
and is honest about what's missing.

---

### Play 3.1: Context Assembly

**Trigger:** A builder agent needs context for a task.

**Agents:** Bridget

**Inputs:** Task description from builder agent. Library cards. Retrieval profiles.
Task modifiers.

**Steps:**

1. **Bridget classifies the task.** Target type (what kind of thing is being built?) and
   task type (feature, bug fix, refactor, new component, architecture change).

2. **Bridget loads the retrieval profile** for the target type. The profile specifies
   mandatory categories, traversal depth, dimension priority, lateral scope, and anti-pattern
   requirements.

3. **Bridget applies task modifiers.** Bug fixes prioritize HOW (implementation detail).
   Feature work prioritizes WHY (rationale). Refactoring prioritizes WHERE (relationships).

4. **Bridget finds seed cards.** Keyword search + type-based glob → 2-4 highest-relevance
   starting points.

5. **Bridget expands via retrieval profile.** Read seeds, extract wikilinks, follow mandatory
   upstream links (WHY chains, containment parents, conforming Standards), grep for reverse
   edges. Stop at profile-specified hop depth.

6. **Bridget checks mandatory categories.** If any mandatory category is missing, search
   specifically for it. If still not found, log the gap.

7. **Bridget assembles the briefing.** Write `CONTEXT_BRIEFING.md` following U-shaped
   attention ordering: Task Frame → Primary Cards (3-5 in full) → Supporting Cards
   (summaries) → Relationship Map → Gap Manifest. Apply card budget for complexity tier.

8. **If the library is incomplete:** Bridget assembles from what exists and produces an
   explicit gap manifest: "No card exists for [topic]. Builder should proceed with caution
   on [dimension]." Honest gaps are more useful than refusing to serve.

9. **Bridget runs `ax lint briefings <repo-root>`.** Mandatory categories present?
   Card budget within range? All referenced cards exist? Provenance entry well-formed?

10. **Bridget logs provenance.** What was retrieved, what was searched, what decisions were
    made. Append to `provenance-log.jsonl`.

11. **Bridget triages feedback.** Gap manifest entries, weak cards encountered, retrieval
    misses, discovered relationships → classify as noise or actionable. Actionable items
    go to `feedback-queue.jsonl`.

12. **If builder hits uncertainty during work:** The 5-signal decision matrix governs.
    2+ search signals → builder queries the library. Bridget facilitates. Max 3 rounds per
    uncertainty, then documented default assumption. Log the query and outcome.

**Exit:** DONE (briefing delivered, provenance logged, feedback triaged).

---

### Play 3.2: Briefing Retrospective

**Trigger:** Builder completes a task that used a context briefing.

**Agents:** Bridget → Conan

**Inputs:** Completed task outcome. Provenance log entry. The original briefing.

**Steps:**

1. **Bridget reviews the session.** Did the briefing serve the builder? Did the builder
   have to search independently (indicating gaps)? Did the builder make product-domain
   decisions that contradicted the briefing (indicating weak or misleading cards)? Did the
   builder ignore cards that were included (indicating over-inclusion)?

2. **Bridget scores the assembly.** Dimensions: completeness (did the briefing cover what
   was needed?), accuracy (did the cards reflect reality?), relevance (was the card budget
   well-spent?), sufficiency (did the builder need to search beyond the briefing?).

3. **Bridget logs the retrospective.** Findings go to the feedback queue with a
   "retrospective" source tag, distinguishing them from assembly-time gap findings.

4. **Conan consumes during the next health check.** Retrospective findings are
   higher-quality signal than assembly-time gap findings because they're validated against
   actual task outcomes.

**Exit:** DONE (retrospective logged).

---

### Play 3.3: Retrieval Profile Tuning

**Trigger:** Pattern in provenance data — a retrieval profile consistently over-retrieves
(builders ignore half the cards) or under-retrieves (builders keep searching for the same
missing thing).

**Agents:** Conan → Bridget

**Inputs:** Provenance analytics showing the pattern. The retrieval profile in question.

**Steps:**

1. **Conan reviews the evidence.** Is this a profile issue (wrong mandatory categories,
   wrong traversal depth, wrong card budget) or a library issue (cards that should exist
   don't)? If it's a library issue, route to the Improvement Loop instead.

2. **Conan drafts a profile revision.** Adjusts mandatory categories, traversal depth,
   dimension priority, or card budget based on the evidence.

3. **Bridget validates with dry-run assemblies.** Re-runs recent assemblies with the revised
   profile. Compares output: fewer irrelevant cards? Missing categories now present? Card
   budget better utilized?

4. **Bridget verifies the updated profile file.** Run `ax lint paths <repo-root>`
   for referenced types and file pointers, plus `ax lint counts <repo-root>` for
   traversal-depth and mandatory-category arithmetic. Are the referenced types valid? Do
   traversal depth numbers make sense? Are mandatory categories types that exist in the
   library?

5. **Conan runs downstream sync** if the profile change affects other meta-files.

**Exit:** DONE (profile updated, validated, synced) or BLOCKED (evidence is ambiguous —
needs more data before changing the profile).

---

### Play 3.4: Product Conversation

**Trigger:** A human asks a product question, wants to pressure-test an idea, needs to
understand implications of a change, or wants to brainstorm and problem-solve on a product
topic.

**Agents:** Raven + Human

**Inputs:** The human's question or topic. The library as it currently exists. The signal
queue, feedback queue, and provenance log (for institutional context).

**Steps:**

1. **Raven orients.** Shared preamble: README, feedback queue, signal queue, active
   concerns. Raven also checks provenance log for recent assemblies related to the topic
   (what have builders been working on nearby?).

2. **Raven finds seed cards.** Keyword + type search for 2-4 cards relevant to the
   question. Same traversal mechanics as Bridget's assembly, but without retrieval profiles
   or card budgets — Raven follows the graph wherever the question leads.

3. **Raven traverses the graph.** Follow wikilinks from seed cards: containment parents,
   WHY chains, related agents and systems, relevant decisions. Also check:
   - Signal queue for contested/open claims in this area
   - Feedback queue for gaps and weak cards in this area
   - Provenance log for retrieval patterns (is this an area builders use heavily?)

4. **Raven synthesizes a narrative response.** Not a card dump or a briefing — a
   conversational response that connects the dots, names tensions, and presents the
   library's position with appropriate caveats. Specifically:
   - What the library says (grounded in cards, with references)
   - What the library doesn't say (gaps, thin areas)
   - What's contested or unresolved (signal queue items)
   - What Conan thinks is weak (health report findings)
   - What builders have been experiencing (provenance patterns)

5. **Raven offers follow-up.** A related question the human may not have considered, or a
   thread the conversation could naturally follow.

6. **If the conversation produces actionable output:**
   - New insight → Raven writes a handoff note to `sources/incoming/` for Solomon to triage
   - Contested truth discovered → handoff to Solomon, or Raven logs to signal queue directly
   - Gap identified → Raven logs to feedback queue (demand signal for Sam)
   - Build decision → handoff to Bridget for task-scoped briefing
   - Stale/weak card found → Raven writes a flag note for Conan

**Exit:**
- DONE — question answered, conversation complete.
- DONE_WITH_CONCERNS — answered, but the library is thin in this area and the answer
  carries low confidence. Concern logged.
- NEEDS_CONTEXT — the question touches areas the library doesn't cover at all.

**Does NOT trigger downstream sync** — no library structure changes.

---

## Stage 4: Maintenance

The library is alive and drifting. Cards become stale as the product evolves. Feedback
accumulates. The maintenance cycle catches degradation before it compounds.

---

### Play 4.1: Health Check + Quality Cycle

**Trigger:** Periodic (quarterly), feedback queue accumulation, explicit request, or
weekly pulse (library-wide lint metrics).

**Agents:** Conan → Human → Conan → Sam → lint CLI → Conan (iterating)

**Inputs:** The entire library. Feedback queue. Provenance log. Current quality targets.

**Steps:**

#### Phase 1: Assess

1. **Conan runs `ax lint library <library-path>` and reviews current alignment
   signals.** Coverage percentages, type distribution, link health, orphan count,
   terminology drift, and any current source-card freshness or coverage-drift findings
   from Play 4.6 form the quantitative backdrop for Conan's assessment.

2. **Conan grades the scope that matters.** Use the standard maintenance sample for
   judgment-based grading: 20% of product-layer cards (minimum 10), biased toward hub
   cards and other high-blast-radius areas.

3. **Conan runs cascade analysis.** Weak cards are traced upstream to distinguish root
   causes from symptoms before anyone starts fixing things.

4. **Conan reviews the feedback queue and provenance log.** Deduplicates repeated gaps,
   scores accumulated severity, incorporates retrospective findings from Play 3.2, and
   treats repeated missing-card demand as maintenance input rather than re-running a
   standalone inventory-reconciliation phase.

5. **Conan produces a health report.** System grade, trend (improving/stable/degrading),
   top-priority issues, blast-radius-ranked repair candidates, and a proposed repair scope.

6. **Human reviews the report.** Approves the repair scope, narrows it, or asks for more
   context before repair begins.

#### Phase 2: Repair

7. **Conan diagnoses root causes and prioritizes fixes.** High blast radius + high demand
   signal = fix first. Bridget's repeated gap signals move missing-card work ahead of
   lower-value cleanup.

8. **Conan produces surgery plans for the approved work.** Plans include domain context,
   concrete card changes, and acceptance criteria, but not grades or diagnostic framing.

9. **Sam executes the surgery plans.** Self-check runs on all modified cards before handoff.

10. **Run regression checks.** Re-run `ax lint graph <library-path>` plus any
    relevant sweep-6 commands for the touched surface:
    `ax lint paths <repo-root>`, `ax lint grades <grade-report-or-library-path>`,
    `ax lint plans <repo-root>`, `ax lint counts <repo-root>`,
    `ax lint sync <repo-root>`, `ax lint briefings <repo-root>`,
    `ax lint initialize <repo-root>`, and
    `ax lint internal-consistency <repo-root>`. If structural changes were made,
    Conan also runs downstream sync before closing the cycle.

11. **Conan re-grades the repaired surface and produces a delta report.** Before/after
    movement is explicit: which cards improved, which root causes remain, and whether the
    library is now healthy enough.

12. **If the library is still below standard:** Loop back to step 7 with revised priorities.
    If the highest-impact issues are resolved, document deferrals and close the cycle.

**Exit:** DONE (assessment completed and repair brought the library back to an acceptable
state), DONE_WITH_CONCERNS (highest-impact repairs landed, but lower-priority work was
deferred), or NEEDS_CONTEXT (human review could not approve a repair scope without more
information).

---

### Play 4.3: Provenance Analytics

**Trigger:** Periodic (monthly) or explicit request.

**Agents:** Bridget → Conan

**Inputs:** `provenance-log.jsonl`. `feedback-queue.jsonl`. Assembly history.

**Steps:**

1. **Bridget analyzes usage patterns.** Which cards are retrieved most? Which are never
   retrieved? Which gaps recur? Which retrieval profiles correlate with builder success vs.
   failure? Which task types generate the most uncertainty queries?

2. **Bridget produces an analytics report.** Hot cards (high retrieval frequency), cold
   cards (zero retrievals), recurring gaps (same missing card across multiple assemblies),
   profile effectiveness (success rate by retrieval profile), and uncertainty hotspots
   (task types that generate the most builder searches).

3. **Conan reviews the report.** Cold cards: are they genuinely unnecessary (deprioritize
   or retire) or is the retrieval profile missing them (profile tuning needed)? Recurring
   gaps: are these cards that should be built (route to construction) or knowledge that
   doesn't exist in source material (route to human)? Profile effectiveness: route poor
   performers to Play 3.3.

**Exit:** DONE (analytics produced, action items routed to appropriate plays).

---

### Play 4.4: Card Retirement

**Trigger:** A product concept is deprecated or superseded.

**Agents:** Conan → Sam

**Inputs:** The card(s) to retire. Reason for retirement.

**Steps:**

1. **Conan assesses blast radius.** Search for the card name across the entire library.
   Every match is a card that references it. Count by type. Identify which references
   need updating (changing the link target) vs. removing (the relationship no longer
   exists).

2. **Conan produces a retirement plan.** Which cards to delete, which references to update,
   which references to remove, and in what order.

3. **Sam executes the retirement plan.** Updates referencing cards first (so links don't
   break), then deletes the retired card.

4. **Sam runs `ax lint graph <library-path>` plus
   `ax lint paths <repo-root>`.** Verify no broken links remain. Verify all
   meta-file references are updated.

5. **Conan runs downstream sync.**

**Exit:** DONE (card retired, references cleaned up, no broken links).

---

### Play 4.5: Terminology Migration

**Trigger:** A product renames a concept.

**Agents:** Sam → Conan

**Inputs:** Old term, new term, scope of the change.

**Steps:**

1. **Sam sweeps for all instances of the old term.** Run `ax lint lines <library-path>`
   for terminology checks plus `ax lint library <library-path>` for the broader
   terminology scan. Every file, every reference, every context phrase. Produce a complete
   hit list.

2. **Sam updates cards.** Rename files where the card name changed. Update all wikilinks
   that used the old name. Update context phrases and content. Update card titles.

3. **Sam re-runs the verification commands.** Re-run `ax lint lines <library-path>`,
   `ax lint library <library-path>`, and `ax lint graph <library-path>`.
   Verify the old term is gone (zero hits). Verify the new term's links all resolve.
   Verify no collateral broken links.

4. **Conan reviews for semantic accuracy.** Did the rename change meaning, not just words?
   If the rename reflects a conceptual change (not just a word change), affected cards may
   need content updates beyond find-and-replace.

5. **Conan runs downstream sync.** Meta-files (retrieval profiles, agent definitions,
   templates) may reference the old term.

**Exit:** DONE (all instances migrated, verified, synced).

---

### Play 4.6: Alignment Sweep

**Trigger:** Scheduled (nightly/weekly), idle token budget, or explicit request.

**Agents:** lint CLI

**Inputs:** The entire library. Meta-files (retrieval profiles, agent definitions, skill
files, templates, reference doc). `alexandria-config.json`.

**Steps:**

1. **Run exhaustive sweep-1 through sweep-3 CLI checks.** Run
   `ax lint lines <library-path>`, `ax lint cards <library-path>`, and
   `ax lint graph <library-path>`. This is the mechanical floor that ensures
   nothing has drifted structurally since the last human-initiated play.

2. **Run `ax lint library <library-path>`.** Coverage drift (cards appeared or
   disappeared?), terminology consistency, type distribution anomalies, orphan count,
   bidirectional gap count.

3. **Run the full sweep-6 command set directly.** Use `ax lint paths <repo-root>`,
   `ax lint grades <grade-report-or-library-path>`, `ax lint plans <repo-root>`,
   `ax lint counts <repo-root>`, `ax lint sync <repo-root>`,
   `ax lint briefings <repo-root>`, `ax lint initialize <repo-root>`, and
   `ax lint internal-consistency <repo-root>`. Do all paths in meta-files resolve?
   Do skill file references point to real files? Do retrieval profile mandatory categories
   reference types that exist?

4. **Check source-card freshness.** Are any source files newer (by git commit date) than
   the cards built from them? This is a date comparison, not a content judgment —
   flagging staleness, not diagnosing it.

5. **Check config drift.** Does `alexandria-config.json` match the library's actual state?
   Card count per tier, knowledge areas present vs. assigned, gap statuses.

6. **Produce a structured report.** Pass/fail per check category, specific findings with
   severity, overall green/yellow/red status. Machine-readable (JSON or structured
   markdown) so it can feed into Play 4.1 as the quantitative baseline.

**What this play does NOT do:** Content quality assessment, semantic accuracy, grading,
cascade analysis, or any judgment-based evaluation. Those are Conan's domain (Play 4.1).
This play answers "is the library structurally sound?" not "is the library good?"

**Relationship to Play 4.1:** The alignment sweep is the quantitative floor for the health
check. When Conan runs Play 4.1, the alignment sweep report is an input — Conan starts
from the CLI's structural findings rather than re-discovering mechanical issues during
judgment work. Running 4.6 before 4.1 saves Conan's token budget for what only Conan can do.

**Orchestration note:** This play is designed for unattended execution — no human initiation
required, no judgment gates, no NEEDS_CONTEXT exits. When scheduling infrastructure exists
(cron, token budget awareness, opportunistic dispatch), this is the first play to automate.

**Exit:** DONE (report produced, all checks ran) or DONE_WITH_CONCERNS (checks ran but
findings exceed a severity threshold — route to Play 4.1 for Conan's assessment).

---

### Play 4.7: Integrity Gate

**Trigger:** Inline, before any structure-changing play completes. Embedded as the final
verification step.

**Agents:** Current play owner + lint CLI

**Inputs:** The set of changed files (cards, meta-files) from the current play. The
library graph neighborhood of those files (1-hop linked cards).

**Steps:**

1. **Run `ax lint graph <library-path>` scoped to changed files + neighbors.** Did
   the changes create broken links, orphans, or containment violations within the change
   boundary?

2. **Run the relevant sweep-6 checks scoped to changed files.** Use `ax lint paths <repo-root>`
   for meta-file pointers, `ax lint counts <repo-root>` when numeric constraints
   changed, and `ax lint plans <repo-root>`, `ax lint initialize <repo-root>`,
   `ax lint grades <grade-report-or-library-path>`, `ax lint briefings <repo-root>`,
   `ax lint sync <repo-root>`, or `ax lint internal-consistency <repo-root>`
   if those surfaces changed. Did the changes break any cross-system references or
   integrity rules?

3. **Report the results.** Clean (no issues) or findings with severity. Findings block play
   completion — the play cannot exit DONE with integrity failures in its change set.

**Relationship to the downstream sync rule:** The playbook preamble requires downstream
sync + the cross-system `paths` family after structural changes. Play 4.7 extends that to
full graph integrity on the change boundary — not just "do meta-file paths resolve" but
"did the cards I touched break any links, create orphans, or violate containment?" The
downstream sync rule remains (it handles meta-file updates); Play 4.7 handles the
card-graph side.

**Scope:** Change-local, not library-wide. Play 4.6 is the library-wide sweep. Play 4.7
is the per-change gate. Both are mechanical, both are CLI-driven, but they run at
different granularities and different frequencies.

**Exit:** DONE (change set is clean) or BLOCKED (integrity failures in the change set —
fix before the parent play can complete).

---

## Stage 5: Evolution

The product changed. The library must change. Evolution is different from maintenance —
maintenance fixes quality in existing content, evolution adds or restructures content to
reflect a new reality.

---

### Play 5.1: New Domain Addition

**Trigger:** Product adds a new area (new zone, new feature domain, new agent cluster).

**Agents:** All relevant agents + lint CLI.

**Inputs:** Source material for the new area. Existing library for cross-references.

**Steps:**

A mini-Genesis scoped to the new area:

1. Source Assessment (Play 0.2) on the new area's source material.
2. Inventory (Play 0.3) for the new area — manifest of expected cards.
3. Upstream Build (Play 1.1) if new Standards or rationale cards are needed.
4. Product Layer Build (Play 1.3) for the new area's cards.
5. First Graph Review (Play 1.6) — verify the new area integrates with the existing graph
   (no islands, cross-references to existing cards present).
6. Grade (Play 2.1) the new area.
7. Improvement Loop (Play 2.2) if needed.
8. Bridget updates retrieval profiles to include the new area.
9. Run the full sweep-6 command set (`paths`, `grades`, `plans`, `counts`, `sync`,
   `briefings`, `initialize`, `internal-consistency`) to verify system-wide integrity.
10. Conan runs downstream sync.

**Exit:** DONE (new area integrated) or stages within may BLOCK individually.

---

### Play 5.2: Source Update

**Trigger:** Source material revised (new design doc version, updated strategy, changed
requirements).

**Agents:** Conan → Sam

**Inputs:** Updated source material. Previous source material (for diff). Existing cards.

**Steps:**

1. **Conan checks epistemic status.** Is this source material the output of a triage
   (Play 5.6), or did it arrive un-triaged? If un-triaged, Conan asks: "Is this material
   fully decided, or does it contain contested or speculative claims?" If
   contested/speculative, route to Play 5.6 first. If the human confirms it's settled,
   proceed.

2. **Conan runs source assessment against the new material.** Identifies drift: cards that
   no longer reflect the source. New concepts that need cards. Removed concepts whose cards
   should be retired.

3. **Conan produces an update plan.** Cards to modify, cards to create, cards to retire.
   Prioritized by blast radius.

4. **Sam executes updates.** Modified cards first (highest blast radius), then new cards,
   then retirements (via Play 4.4).

5. **Sam runs regression checks.** Use `ax lint graph <library-path>` plus the
   relevant sweep-6 checks (`grades`, `plans`, `initialize`, `paths`, `counts`, `briefings`,
   `sync`, `internal-consistency`) after modifications.

6. **Conan runs downstream sync.**

**Exit:** DONE (library aligned to updated source) or DONE_WITH_CONCERNS (some new
concepts need source material that doesn't exist yet — flagged for human).

---

### Play 5.3: Structural Change

**Trigger:** Type rename, folder reorganization, card split/merge, template change.

**Agents:** Conan → Sam

**Inputs:** The proposed change. Existing library state.

**Steps:**

1. **Conan plans the change.** Blast radius assessment. Migration path: what changes in
   what order. Identifies all affected files: cards, meta-files, skill files, agent
   definitions, templates.

2. **Sam executes the migration.** Renames, moves, splits, merges as planned.

3. **Sam runs `ax lint graph <library-path>` plus the full sweep-6 command set.**
   This is the most comprehensive mechanical run outside of a full QA — structural changes
   can break anything.

4. **Conan runs downstream sync.** Updates all meta-files to reflect the new structure.

5. **Conan re-runs the relevant sweep-6 checks.** Verify downstream sync didn't introduce
   new issues.

**Exit:** DONE (structure changed, all references updated, verified) or BLOCKED (migration
revealed a dependency that can't be resolved without human decision).

---

### Play 5.4: Type Taxonomy Evolution

**Trigger:** A new card type is needed, or an existing type should split.

**Agents:** All relevant agents + lint CLI.

**Inputs:** The proposed taxonomy change. Evidence from library usage (why the current
taxonomy is insufficient).

**Steps:**

1. **Conan designs the change.** What's the new type (or how does the split work)? What
   does the decision tree look like with this change? What are the containment relationships?
   What retrieval profile does the new type need?

2. **Human reviews the taxonomy proposal.** This is a significant architectural decision —
   it affects every downstream system.

3. **Sam updates affected cards.** Reclassify cards that belong to the new type. Create the
   new folder. Update containment links.

4. **Run `ax lint graph <library-path>` plus the relevant sweep-6 checks.**

5. **Bridget updates retrieval profiles and validates with dry-run assemblies.** Does the
   new type assemble correctly? Does the profile produce useful briefings?

6. **Conan runs comprehensive downstream sync.** Decision tree, containment table, templates,
   agent definitions, retrieval profiles — everything that encodes the taxonomy.

7. **Run the final sweep-6 command set (`paths`, `grades`, `plans`, `counts`, `sync`,
   `briefings`, `initialize`, `internal-consistency`).**

**Exit:** DONE (taxonomy evolved, all systems updated, validated).

---

### Play 5.5: Library Split

**Trigger:** A library grows too large or serves too many distinct domains.

**Agents:** All relevant agents + lint CLI.

**Inputs:** The proposed split boundary. Existing library.

**Steps:**

1. **Conan identifies the cut line.** Which cards go to which library? What cross-library
   references need to be preserved or converted? What shared rationale cards (Product
   Theses, Principles, Standards) are needed by both sides?

2. **Human reviews the split plan.** Shared rationale cards may need to be duplicated or
   one library may inherit them and the other references them externally.

3. **Sam creates the new library scaffold and migrates cards.** Copies, not moves, for
   shared cards. Moves for domain-specific cards.

4. **Verify both libraries are internally consistent.** Run `ax lint all <library-a-path>`
   and `ax lint all <library-b-path>`.

5. **Bridget updates assembly routing.** Which library serves which task types? Can a
   briefing pull from both libraries for cross-domain tasks?

6. **Conan runs downstream sync on both libraries.**

**Exit:** DONE (two healthy libraries) or BLOCKED (the domain boundary is too entangled
to split cleanly — human must reconsider).

---

### Play 5.6: Signal Intake

**Trigger:** Human pushes raw signal to the library. Examples:
- "We had a meeting about X. Here are the notes."
- "CEO said we're doing Y. I'm not sure the team agrees."
- "This Slack thread has implications for the product."
- "I had a conversation with a customer that changes how I think about Z."
- Raven writes a handoff note after a product conversation surfaces actionable signal.

**Agents:** Solomon + Human

**Inputs:** Raw signal (meeting notes, transcript, Slack export, email, verbal summary,
Raven handoff note). The library as it currently exists (for Solomon to compare against).

**Steps:**

1. **Human delivers raw signal.** Drops a file in `sources/incoming/` or describes the
   signal conversationally to Solomon. Format doesn't matter — Solomon reads anything.

2. **Solomon reads the library.** Shared preamble: README, feedback queue, signal queue,
   active concerns. Then Solomon identifies which existing cards, knowledge areas, and open
   questions the signal touches. This is graph traversal applied to relevance matching.

3. **Solomon extracts claims.** From the raw signal, Solomon identifies discrete claims —
   factual assertions, directional decisions, proposed changes, open questions, and
   contradictions. Each claim is a single statement that either does or doesn't affect
   the library's current state.

4. **Solomon runs tension detection on each claim.** For each extracted claim, Solomon
   compares it against the library and the signal queue, checking tension signals T1-T7
   (see `skills/solomon/tension-detection.md`). Solomon presents each claim with its
   tension analysis. The human classifies each claim after seeing Solomon's work:

   | Status | Meaning | Route |
   |--------|---------|-------|
   | **Settled** | Passes the settledness test. | Write up as source material → Play 5.2 |
   | **Contested** | Tensions unresolvable. Multiple positions exist. | Park in signal queue |
   | **Open question** | Not enough information. Needs investigation. | Park in signal queue |
   | **Supersedes** | Settled AND explicitly replaces existing library content. | Source material → Play 5.2 (with supersession note) |
   | **Noise** | Doesn't affect the library. | Drop with logged reason |

5. **Solomon drafts source material for settled claims.** For Settled or Supersedes claims,
   Solomon helps the human write them up as proper source material — not cards, but the kind
   of structured document that Conan can assess and Sam can build from. For Supersedes
   claims, Solomon includes a supersession header: what it replaces, which cards are
   affected, what the previous position was.

6. **Solomon logs contested and open claims to the signal queue.** Each entry includes: the
   claim, epistemic status, who holds what position, what evidence exists, what would resolve
   it, which library cards it would affect if resolved, and when to revisit.

7. **Solomon summarizes the triage.** Produces a triage report: N claims extracted, M
   settled (routed to source material), P contested (parked), Q open questions (parked),
   R noise (dropped).

**Exit:**
- DONE — all claims triaged, settled claims written as source material, contested/open
  claims parked in signal queue.
- DONE_WITH_CONCERNS — triage complete, but some claims were hard to classify. Concerns
  documented for human review.
- NEEDS_CONTEXT — the raw signal is too ambiguous to extract claims from. Human needs to
  provide more context about what happened and what was decided vs. discussed.

**Does NOT trigger downstream sync** — no library structure changes. Source material
written during this play feeds into Play 5.2, which handles its own downstream sync.

---

## Crosscutting

---

### Play X.1: Disaster Recovery

**Trigger:** Mass broken links, accidental deletion, bad merge, corrupted cards.

**Agents:** All relevant agents + lint CLI.

**Inputs:** The damage. Git history.

**Steps:**

1. **Run `ax lint all <library-path>` to assess damage.** How many broken links?
   How many missing cards? How many structural violations? Produce a damage report.

2. **Conan triages.** What's recoverable from git history (restore from prior commit)? What
   needs rebuilding (card existed but was corrupted)? What needs new construction (card
   never existed and the gap was revealed by the disaster)?

3. **Sam rebuilds.** Restore from git where possible. Rebuild from source where needed.

4. **Re-run `ax lint all <library-path>`.** Verify recovery is complete.

5. **Bridget validates assembly still works.** Dry-run a few common assembly types. Verify
   briefings are functional.

6. **Conan runs downstream sync.**

**Exit:** DONE (library restored to healthy state) or DONE_WITH_CONCERNS (some content
was irrecoverably lost — documented for rebuild during next maintenance cycle).

---

## Meta Plays

These plays apply to the meta-library — the context library that backstops the Context
Library open source project itself. They describe how the system learns from its own
deployments.

---

### Play M.1: Learning Ingestion

**Trigger:** A user reports a pattern, lesson, or issue from their context library
deployment.

**Agents:** Conan → Sam

**Inputs:** The user report. Existing meta-library cards.

**Steps:**

1. **Conan assesses the report.** Is this a new concept (needs a new card), an update to
   an existing card (adds a WHEN entry, enriches a dimension), or noise (already captured,
   or not generalizable)?

2. **If new concept:** Conan classifies it (what type? where in the meta-library taxonomy?)
   and adds it to the inventory.

3. **Sam writes or updates the card.** Source: the user report plus any corroborating
   evidence from other deployments.

4. **Sam runs `ax lint lines <library-path>`, `ax lint cards <library-path>`,
   and `ax lint graph <library-path>`.** Verify structural integrity of the
   new/updated card.

5. **Conan runs downstream sync** if the learning affects meta-files (e.g., a new best
   practice for retrieval profiles).

**Exit:** DONE (learning incorporated) or NEEDS_CONTEXT (the report is interesting but
needs corroboration from more deployments before acting on it).

---

### Play M.2: Template Propagation

**Trigger:** A meta-library change implies the templates in `templates/` should update.

**Agents:** Conan → Sam

**Inputs:** The meta-library change. Current templates.

**Steps:**

1. **Conan identifies affected templates.** A revised understanding of card types, new best
   practices for dimension content, changed examples — any meta-library change that should
   flow into what new libraries are scaffolded from.

2. **Sam updates templates.** Match the template to the current meta-library state.

3. **Sam verifies templates.** Run `ax lint paths <repo-root>` for template
   references, plus any needed `ax lint counts <repo-root>` checks for example
   lists or structured enumerations. Do template paths resolve? Do template examples match
   current naming conventions? Are template sections consistent with the reference document?

**Exit:** DONE (templates updated and verified).

---

### Play M.3: Cross-Library Pattern Detection

**Trigger:** Multiple user libraries independently surface the same issue or pattern.

**Agents:** Conan

**Inputs:** Aggregated feedback from multiple library deployments. Meta-library cards.

**Steps:**

1. **Conan identifies the pattern.** N libraries report the same gap, confusion, or failure
   mode. Is this systemic (indicates a problem with the initialize flow, a card type, a rubric
   criterion, or a retrieval profile) or coincidental (similar products independently hit
   the same domain-specific challenge)?

2. **If systemic:** Conan diagnoses the root cause. Is it an initialize misconfiguration (the
   tier assignments are wrong for this product shape)? A missing card type (the taxonomy
   can't express this concept)? A rubric blind spot (the grading criteria don't catch this
   quality issue)? A retrieval profile gap (assemblies for this task type consistently miss
   important context)?

3. **Conan recommends a system-level fix.** Routes to the appropriate play: Template
   Propagation (M.2) for template issues, Type Taxonomy Evolution (5.4) for type issues,
   Retrieval Profile Tuning (3.3) for profile issues, or Learning Ingestion (M.1) for
   new knowledge.

4. **For significant changes:** Use the eval/iterate pattern. Stage the proposed change.
   Run comparative assemblies or builds with old vs. new. Measure whether the change
   actually improves outcomes. Only promote to canonical after evidence supports it.

**Exit:** DONE (pattern identified, root cause diagnosed, fix routed) or NEEDS_CONTEXT
(pattern is suggestive but not yet strong enough to act on — flag for monitoring).

---

## Play Index

| # | Play | Stage | Trigger | Key Agents |
|---|------|-------|---------|------------|
| 0.1 | Configuration | Genesis | Human decides to build a library | Human, Wizard |
| 0.2 | Source Assessment | Genesis | Configuration exists | Conan |
| 0.3 | Inventory & Scaffold | Genesis | Source assessment passes | Conan, Sam |
| 1.1 | Upstream Build | Construction | Scaffold complete | Sam |
| 1.2 | Upstream Gate | Construction | Upstream build complete | Conan |
| 1.3 | Product Layer Build | Construction | Gate passes | Sam |
| 1.4 | Experience Layer Build | Construction | Product layer stable | Sam |
| 1.5 | Temporal Enrichment | Construction | All layers built | Sam |
| 1.6 | First Graph Review | Construction | Structural lint clean on 1-4 | Conan |
| 2.1 | Grade | Quality | Graph review passes | Conan |
| 2.2 | Improvement Loop | Quality | Grade below target | Conan, Sam |
| 2.3 | Type Audit | Quality | Improvement loop passes | Conan, Sam |
| 3.1 | Context Assembly | Service | Builder needs context | Bridget |
| 3.2 | Briefing Retrospective | Service | Builder completes task | Bridget, Conan |
| 3.3 | Retrieval Profile Tuning | Service | Provenance shows pattern | Conan, Bridget |
| 3.4 | Product Conversation | Service | Human asks a product question | Raven, Human |
| 4.1 | Health Check + Quality Cycle | Maintenance | Periodic or triggered | Conan, Human, Sam, lint CLI |
| 4.3 | Provenance Analytics | Maintenance | Periodic (monthly) | Bridget, Conan |
| 4.4 | Card Retirement | Maintenance | Concept deprecated | Conan, Sam |
| 4.5 | Terminology Migration | Maintenance | Product renames a concept | Sam, Conan |
| 4.6 | Alignment Sweep | Maintenance | Scheduled, idle tokens, or explicit | lint CLI |
| 4.7 | Integrity Gate | Maintenance | Inline before structure-changing play completes | Current play owner + lint CLI |
| 5.1 | New Domain Addition | Evolution | Product adds new area | All relevant agents + lint CLI |
| 5.2 | Source Update | Evolution | Source material revised | Conan, Sam |
| 5.3 | Structural Change | Evolution | Type rename, reorg, split/merge | Conan, Sam |
| 5.4 | Type Taxonomy Evolution | Evolution | New type needed or type split | All relevant agents + lint CLI |
| 5.5 | Library Split | Evolution | Library too large for one domain | All relevant agents + lint CLI |
| 5.6 | Signal Intake | Evolution | Human pushes raw signal | Solomon, Human |
| X.1 | Disaster Recovery | Crosscutting | Mass breakage | All relevant agents + lint CLI |
| M.1 | Learning Ingestion | Meta | User reports pattern/lesson | Conan, Sam |
| M.2 | Template Propagation | Meta | Meta-library change affects templates | Conan, Sam |
| M.3 | Cross-Library Pattern Detection | Meta | Multiple libraries surface same issue | Conan |

---

*32 plays. 6 lifecycle stages + crosscutting + meta. Source material for the Context
Library's meta-library. This document will be decomposed into knowledge graph cards by
the team.*
