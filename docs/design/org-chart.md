# Alexandria Team: Org Chart

The five active agents that build, maintain, and serve the context library. Mechanical
checks still run, but they now run through `ax lint` instead of through a live Nit
agent surface.

---

## The Team

The library has three zones: the Library (inside), the Factory Boundary, and the Human
Boundary. On the inside, Conan and Sam build and maintain the knowledge graph. At the Factory
Boundary, Bridget bridges the library to builder agents. At the Human Boundary, Raven serves
humans as a product thinking partner and Solomon triages raw signal from the world into the
library pipeline. Mechanical, countable standards are enforced through CLI tooling rather than
through a sixth active agent.

```
                         ┌──────────────────────┐
                         │     Human Owner      │
                         │  Strategy · Sources   │
                         │  Priority · Truth     │
                         └──────────┬───────────┘
                                    │ directs all
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
┌ ─ HUMAN BOUNDARY ─ ─ ┐  ┌ ─ ─ LIBRARY ─ ─ ─ ─ ┐  ┌ ─ FACTORY BOUNDARY ─ ┐
│                       │  │                      │  │                      │
│ ┌───────────────────┐ │  │ ┌──────────────────┐ │  │ ┌──────────────────┐ │
│ │ Raven the Maven   │ │  │ │ Conan the        │ │  │ │ Bridget the      │ │
  │                   │      │ Librarian        │      │ Briefer          │
│ │ Brainstorms       │ │  │ │                  │ │  │ │                  │ │
│ │ Problem-solves    │ │  │ │ Evaluates        │─surgery─┐ │ Assembles  │ │
  │ Pressure-tests    │      │ Diagnoses        │  plans  │   │ Delivers │
│ │ Traces            │ │  │ │ Plans            │    │  │ │ │ Logs      │ │
│ └─────────┬─────────┘ │  │ └──────────────────┘    │  │ └──────┬─────┘ │
│           │           │  │                         │  │        │       │
│           │ handoff   │  │                         ▼  │  │     │       │
│           ▼           │  │ ┌──────────────────┐       │        ▼
│ ┌───────────────────┐ │  │ │ Sam the          │◄──────┘  │  FACTORY   │
│ │ Solomon the       │ │  │ │ Scribe           │       │  │ (builders) │
  │ Sorter            │      │                  │
│ │                   │ │  │ │ Builds           │       │  │            │
│ │ Triages signal    │──source──► Fixes        │       │
│ │ Parks contested   │ │  │ └──────────────────┘       │  │            │
  │ Drafts source     │                                  └ ─ ─ ─ ─ ─ ─ ─┘
│ └───────────────────┘ │  │                            │
│                       │  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
│   THE WORLD           │
│   (meetings, Slack,   │
│    email, chats)      │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### How to read this

**Inside the library:** Conan evaluates and plans. Sam builds and fixes. Conan directs Sam
via filtered surgery plans (domain context and tasks, not grades or diagnostic framing).
Sam hands finished work back to Conan for review.

**At the factory boundary:** Bridget is the bridge between the library and whatever the
factory produces (code, prose, messages). She reads the library, shapes knowledge into
briefings for builder agents, and logs what was used and what was missing. Her feedback
flows back to Conan for the maintenance cycle.

**At the human boundary:** Raven is the library's product thinking partner for humans —
brainstorming, problem-solving, pressure-testing ideas, tracing implications. Solomon is the
library's intake gatekeeper — classifying raw signal from the world (meetings, Slack, email,
conversations) by epistemic status before it enters the pipeline. Raven faces outward (library
→ human). Solomon faces inward (world → library). Raven hands off to Solomon when conversation
surfaces actionable signal.

**Everywhere:** Mechanical, deterministic standards are still enforced across the system,
but the enforcement now runs through `ax lint` and other tooling rather than through
a live Nit agent in the org chart. The historical Nit section below captures the old sweep
model that informed that tooling.

### Operating principles

**Bridget's demand signal.** When Bridget assembles from an incomplete library and discovers
gaps, those gaps tell Sam what to build next. The next card Sam writes should be what
Bridget couldn't find, not just the next item on the inventory. This turns the factory
into a demand signal for the library — more efficient than building speculatively and
hoping the factory needs what you built.

**Interrupt-driven usage.** The lifecycle runs Genesis → Construction → Quality → Service,
but real usage is interrupt-driven. A founder builds 10 cards, needs a briefing tomorrow,
goes back to building. Bridget must assemble from an incomplete library and be honest about
what's missing rather than refusing to serve until quality passes.

**Versioned plays.** Plays are versioned artifacts with changelogs and optionally benchmark
results. When a play is revised, the new version is staged as a draft for human review.
The eval/iterate loop applies: measure whether a change actually improved outcomes before
promoting it to canonical. See `playbook.md` for the full play definitions.

**Filtered handoffs.** Sam receives domain context ("what good looks like"), specific tasks,
and acceptance criteria. Sam does NOT receive grades, cascade analyses, or diagnostic
framing. Sam writes to the source material, not to Conan's opinion of the current state.
This is a semantic filter on the surgery plan, not an information wall — rich context
improves Sam's output, evaluative judgments bias it.

---

## Conan the Librarian

**Role:** Editor and critic. Evaluates library quality, diagnoses root causes of weakness,
plans what needs to be built or fixed, and reviews whether fixes worked. The only agent that
touches the grading rubric.

**Customer:** The library's quality.

**Skills (11 jobs):**

| Job | Skill File | What It Does |
|-----|-----------|--------------|
| 0 | `job-source-assessment.md` | Audits source material before inventory. Gates the build. |
| 1 | `job-inventory.md` | Reads source, produces manifest of expected cards with types and build order. |
| 2 | `job-grade.md` | Applies five-dimension rubric to produce card, zone, and system scores. |
| 2.5 | `job-spot-check.md` | Abbreviated grade of upstream cards before downstream builds begin. |
| 3 | `job-diagnose.md` | Traces weaknesses to root causes. Calculates blast radius. |
| 4 | `job-recommend.md` | Prioritizes fixes by blast radius × severity × effort. |
| 5 | `job-review.md` | Re-grades after Sam's fixes. Produces before/after delta. Pass/fail gate. |
| 6 | `job-audit.md` | Verifies type classification, atomicity, and conformance. |
| 7 | `job-surgery.md` | Produces actionable fix plans for Sam. Six-phase protocol. |
| 8 | `job-health-check.md` | Periodic big-picture assessment at the front of the unified maintenance cycle. |
| 9 | `job-downstream-sync.md` | Verifies/fixes meta-files after structural changes. |

**Supporting skills:**

| Skill | What It Does |
|-------|--------------|
| `rubrics.md` | Grading criteria for all five dimensions. Misclassification signals. Type-specific notes. |
| `grade-computation.md` | Math model for card, zone, and system scores. Completeness caps. Rage meter. |
| `type-taxonomy.md` | Type decision tree, containment relationships, classification guardrails. |
| `card-standards.md` | Five dimensions requirements, atomicity rules, build-phase awareness. |
| `voice.md` | Tone and communication standards. Rage meter. |

**Cannot do:** Write or edit library cards. Assemble context briefings.

**Information filtering rule:** Surgery plans (Job 7) handed to Sam include domain context
("what good looks like"), task specifics ("create/edit/delete these cards"), and acceptance
criteria ("done when X"). They do NOT include Conan's evaluative judgments about the current
state (grades, cascade analysis, diagnostic framing). Sam should write to the source material,
not to Conan's opinion.

---

## Sam the Scribe

**Role:** Builder. Creates new cards from inventory and fixes existing cards from surgery
plans. The only agent that writes library card content.

**Customer:** The library's content.

**Skills (5):**

| Skill | What It Does |
|-------|--------------|
| `card-creation.md` | Step-by-step procedure for building cards. WHAT first, then WHERE, WHY, WHEN, HOW. |
| `decomposition.md` | Decision tree for extracting cards from source material. 6-step classification. |
| `link-patterns.md` | Standard phrases for relationship context on every link type. |
| `self-check.md` | Per-card and batch checklists. Structure, links, conformance, containment. |
| `library-organization.md` | Type-to-folder mapping and library navigation. |

**Cannot do:** Grade cards. Diagnose root causes. Evaluate type classification. Assemble
context briefings.

**What Sam receives from Conan:** Surgery plans with domain context, specific tasks, and
acceptance criteria. NOT grades, cascade analyses, or diagnostic framing.

**What Sam produces:** Completed cards, fix reports, self-check results. Hands off to Conan
for review (Job 5) or runs CLI lint checks for regression checking.

---

## Nit the Picker (Historical)

**Role:** Former mechanical linter. Nit originally ran deterministic, boolean checks across
the entire library and verified that judgment-based work (Conan's grades, Sam's cards,
Bridget's briefings) matched countable evidence. This role has been retired as a live agent;
the checks now run through `ax lint`.

**Customer:** The library's structural integrity.

**Historical sweep model (now implemented as tooling):**

| Sweep | Scope | What It Checks |
|-------|-------|----------------|
| 1: Line | Within a card | Markdown hygiene, terminology consistency, wikilink syntax, naked links |
| 2: Card | Single card | Five H2 sections, naming convention, folder placement, stub sections, word count, link counts |
| 3: Graph | Card-to-card | Broken wikilinks, orphan cards, bidirectional gaps, duplicate detection |
| 4: Layer | Rationale / product / experience / temporal | Minimum population, cross-layer link presence, inventory reconciliation (file-exists only) |
| 5: Library | Whole library | Coverage metrics, type distribution, feedback queue schema validation, terminology sweep |
| 6: Cross-system | Library + agents + skills + initialize + templates | Path resolution, plan status verification, initialize arithmetic, design doc counts, grade-evidence reconciliation, regression detection |

**Cannot do:** Judge content quality. Evaluate type classification. Assess whether a WHY
section is substantive. Make any call that requires reading comprehension beyond pattern
matching.

**What Nit historically checked:**

| Whose Work | What Nit Checks | Sweeps |
|-----------|----------------|--------|
| **Sam's** cards | Structure, naming, links, stubs, folder placement | 1, 2, 3, 4 |
| **Conan's** grades | Grade-evidence consistency (do scores match countable link counts, section existence, example counts?) | 6 |
| **Bridget's** briefings | Mandatory categories present? Card budget met? Provenance logged? All referenced cards exist? | 6 |
| **The library** itself | Coverage metrics, type distribution, terminology drift, orphan detection | 3, 4, 5 |
| **The system** (agents, skills, initialize, templates) | Path resolution, plan status, initialize arithmetic, design doc accuracy | 6 |

**Former trigger points:**

| Trigger | Sweeps to Run | Why |
|---------|--------------|-----|
| Sam finishes building | 1, 2, 3, 4 | Clean the floor before Conan grades |
| Before Conan grades | 1, 2, 3 | No point grading cards with structural defects |
| After Conan grades | 6 (grade-evidence) | Antagonistic check: do grades match countable evidence? |
| After Bridget assembles | 6 (briefing checks) | Verify briefing meets profile requirements |
| PR pre-merge | All 6 | Full regression gate |
| Weekly pulse | 5 | Library-wide health metrics dashboard |
| After structural change | 3, 6 | Catch broken links and path drift |

**Software-ification outcome:**

Every one of Nit's sweeps was a candidate for conversion to actual code — CLI tools, GitHub
Actions, MCP tools. That conversion has now happened for the active product surface, which is
why Nit was retired as a runtime agent.

| Sweep | Software Form | Complexity |
|-------|--------------|------------|
| 1: Line | Markdown linter config + terminology grep script | Low |
| 2: Card | Card structure validator (parse H2s, check naming regex, verify folder) | Low |
| 3: Graph | Wikilink resolver (parse all `[[links]]`, glob for targets, report breaks) | Medium |
| 4: Layer | Inventory diff tool (manifest vs. file system) | Medium |
| 5: Library | Metrics dashboard (card counts, link counts, coverage %, type distribution) | Medium |
| 6: Cross-system | Integration test suite (path checks, arithmetic checks, schema validation) | High |

Priority order for conversion: Sweep 3 (Graph) first — broken wikilinks are the highest-value
automated check and the most tedious to run manually. Then Sweep 2 (Card), then Sweep 5
(Library metrics).

---

## Bridget the Briefer

**Role:** The bridge between the library and the factory. Bridget works at the boundary —
library on one side, factory on the other. Her job is translation: raw knowledge graph nodes
become contextual briefings shaped for a specific task. She knows what the factory needs to
build right now, she knows what the library has, and she bridges the gap.

The factory is whatever produces the output — code, prose, messages, artifacts. Bridget
doesn't care what the factory makes. She cares that the builder agents inside the factory
have the right context, at the right level of detail, for the task in front of them.

**Faces two directions:**
- **Toward the library:** Reads cards, traverses the graph, applies retrieval profiles. Read-only — she never modifies the library.
- **Toward the factory:** Delivers `CONTEXT_BRIEFING.md` to builder agents. Shapes content using U-shaped attention ordering and card budgets.
- **Back toward Conan (indirect):** Logs gaps, weak cards, retrieval misses, and discovered relationships to the feedback queue. Conan consumes these during health checks. Bridget doesn't tell Conan what to do — she leaves evidence for Conan to find.

**Customer:** Builder agents in the factory (code writers, prose writers, message writers —
whatever the factory produces).

**Skills (7 — currently housed under `skills/ax-brief/`):**

| Skill | What It Does |
|-------|--------------|
| `SKILL.md` | Overview of when/how to use the library. Card anatomy. Graph navigation. |
| `protocol.md` | The briefing contract. Roles, format, card budgets, attention ordering, 5-signal decision matrix, handoff flow. |
| `retrieval-profiles.md` | Type-specific retrieval instructions. 15 profiles with mandatory categories, traversal depth, dimension priority. |
| `traversal.md` | How to navigate the knowledge graph. Finding cards, following edges, traversal patterns. |
| `task-modifiers.md` | How task type (feature, bug fix, refactor, new component, architecture change) affects assembly. |
| `feedback-queue-schema.md` | Schema for logging library gaps and weak cards discovered during assembly. |
| `provenance-schema.md` | Schema for logging what was retrieved, what was searched, what decisions were made. |

**Cannot do:** Grade cards. Write or edit cards. Diagnose library quality issues.

**The assembly sequence:**

1. Task arrives from builder agent
2. Classify task (target type + task type)
3. Load retrieval profile for the target type
4. Apply task modifier for the task type
5. Find seed cards (keyword + type search)
6. Expand via retrieval profile (traverse graph, check mandatory categories)
7. Assemble briefing (U-shaped attention ordering, card budget)
8. Deliver `CONTEXT_BRIEFING.md`
9. Log provenance
10. Triage feedback (gaps, weak cards, retrieval misses, discovered relationships)

**Honey-do list (software-ification):**

| Capability | Software Form | Complexity |
|-----------|--------------|------------|
| Seed card search | Index/search tool over card files | Medium |
| Graph traversal | Pre-computed adjacency list from wikilink parsing | Medium |
| Mandatory category check | Validator that checks briefing against profile requirements | Low |
| Card budget enforcement | Count cards in briefing, compare to complexity tier | Low |
| Provenance logging | Structured logger (currently JSONL, could be DB) | Medium |
| Feedback deduplication | Dedup + severity scoring on feedback queue | Medium |
| Assembly cache | Cache common traversal paths, invalidate on card change | High |

Priority order for conversion: Graph traversal first (pre-computed adjacency list dramatically
speeds up every assembly). Then mandatory category check + card budget enforcement (cheap
validators that make assembly auditable). Then assembly cache.

---

## Raven the Maven

**Role:** Product thinking partner. The library's resident product expert for humans.
Brainstorms, problem-solves, pressure-tests ideas, traces implications, and surfaces
connections — always grounded in the knowledge graph. The interpretive layer between
human narrative thinking and the library's graph structure.

**Customer:** Humans (product owners, founders, team members) making product decisions.

**Skills (1 job):**

| Job | Skill File | What It Does |
|-----|-----------|--------------|
| 1 | `job-product-conversation.md` | Traverses the graph, synthesizes narrative answers, brainstorms, pressure-tests. |

**Faces outward:** Toward humans. Reads the library, signal queue, feedback queue, provenance
log, and health reports to give humans a complete picture — not a filtered one. Writes handoff
notes (for Solomon), feedback queue entries (demand signal), and flag notes (for Conan).

**Cannot do:** Write or edit library cards. Grade cards. Assemble briefings. Run mechanical
checks. Triage raw signal.

---

## Solomon the Sorter

**Role:** Signal intake and triage. The library's epistemic gatekeeper. Classifies raw signal
from the world (meetings, Slack, emails, conversations) by epistemic status before it enters
the library pipeline. Confirms settledness — everything that isn't demonstrably settled gets
parked.

**Customer:** The library's intake funnel.

**Skills (1 job + 2 reference skills):**

| Job | Skill File | What It Does |
|-----|-----------|--------------|
| 1 | `job-signal-triage.md` | Extracts claims, runs tension detection (T1-T7), facilitates human classification. |

| Skill | What It Does |
|-------|--------------|
| `tension-detection.md` | Seven mechanical tension signals for comparing claims against the library. |
| `signal-queue-schema.md` | JSONL schema for parking contested and open claims. |

**Faces inward:** From the world toward the library. Reads raw signal, compares it against
the library graph and signal queue, produces source material (for settled claims) and signal
queue entries (for contested/open claims).

**Cannot do:** Write or edit library cards. Grade cards. Assemble briefings. Run mechanical
checks. Answer product questions.

---

## Boundaries Summary

| | Write cards | Grade cards | Assemble briefings | Human conversations | Signal triage |
|---|---|---|---|---|---|
| **Conan** | No | **Yes** | No | No | No |
| **Sam** | **Yes** | No | No | No | No |
| **Bridget** | No | No | **Yes** | No | No |
| **Raven** | No | No | No | **Yes** | No |
| **Solomon** | No | No | No | No | **Yes** |

Five active agents. Five active mandates. No overlap. No dual mandates.
Mechanical checks remain mandatory, but they are tooling rather than a sixth active agent row.

---

## Relationships Between Agents

**Conan → Sam:** Conan directs Sam via filtered surgery plans. Sam builds and fixes cards,
hands them back to Conan for review. This is the only direct management relationship.

**Solomon → Conan (indirect via source material):** Solomon triages raw signal and produces
source material for settled claims. That source material enters Play 5.2, where Conan
assesses it. Solomon also flags contested truths for Conan's diagnostic. Solomon produces
inputs that Conan consumes — similar to Bridget's indirect relationship via the feedback
queue, but through source material and the signal queue.

**Raven → Solomon (handoff):** When a product conversation surfaces actionable signal,
Raven writes a handoff note to `sources/incoming/` for Solomon to triage. This gives Solomon
full context without the human having to re-explain. Raven and Solomon are peers in the
Human Boundary zone — no management relationship.

**Raven → Conan (indirect via flags):** Raven flags stale or weak cards discovered during
conversation. Conan decides whether to act on the flag.

**Raven → Bridget (handoff):** When conversation leads to "we should build this," the human
can invoke Bridget for a task-scoped briefing. Raven suggests the handoff but doesn't direct
Bridget.

**Bridget → Conan (indirect):** Bridget discovers library gaps during assembly and logs them
to the feedback queue. Conan consumes the queue during health checks. Bridget never tells
Conan what to do — she leaves evidence. Conan decides what to act on.

**Bridget → Factory:** Bridget delivers context briefings to builder agents. The builders
produce output (code, prose, messages). After the work is done, outcomes flow back through
the provenance log, which Conan also consumes.

**Lint → Everyone:** The `ax lint` CLI checks all agents' output against mechanical
standards. Lint is adversarial by design — independent verification, not collaboration.
Lint findings are non-negotiable. A broken link is a broken link.

**Lint ↔ Conan (sequenced):** Lint runs before Conan grades (catch structural defects
first) and after Conan grades (verify grades against evidence). This is the antagonistic
quality pattern: the editor and the linter work in sequence, not in coordination.

---

## Cross-Team Information Flow

```
                    AT THE HUMAN BOUNDARY
                    =====================

Human asks question ──► Raven (traverse graph, synthesize answer)
                              │
                              ├──► Narrative conversation (product thinking)
                              │
                              ├──► Feedback queue (gap demand signal)
                              │
                              └──► Handoff note ──► Solomon (if actionable signal)

Raw signal arrives ──► Solomon (extract claims, run tension detection)
  (meetings, Slack,          │
   email, chats)             ├──► Settled claims ──► source material ──► Play 5.2
                             │
                             ├──► Contested/open ──► signal queue
                             │
                             └──► Triage report


                    INSIDE THE LIBRARY
                    ==================

Source Material ──► Conan (assess, inventory) ──► Sam (build cards)
                                                       │
                                                       ▼
                                                 ax lint (check cards)
                                                       │
                                                       ▼
                                                 Conan (grade)
                                                       │
                                                       ▼
                                                 ax lint (check grades)
                                                       │
                                                       ▼
                                                 Conan (diagnose, recommend, surgery plan)
                                                       │
                                                       ▼
                                          ┌─── Sam (fix cards) ◄── filtered plan
                                          │         │               (context + tasks,
                                          │         ▼                NOT grades)
                                          │   ax lint (regression)
                                          │         │
                                          │         ▼
                                          └── Conan (review) ──► PASS or loop back


                    AT THE FACTORY BOUNDARY
                    =======================

Task arrives ──► Bridget (read library, assemble briefing)
                       │
                       ├──► CONTEXT_BRIEFING.md ──► Builder (produce output)
                       │                                  │
                       ├──► Provenance log                ▼
                       │                            Outcome logged
                       └──► Feedback queue
                                  │
                                  ▼
                            Conan (health check consumes feedback + provenance + signal queue)
                                  │
                                  ▼
                            Maintenance cycle (diagnose → recommend → surgery → fix)


                    EVERYWHERE (ax lint)
                    =========================

                    Lint checks Sam's cards      (after build)
                    Lint checks Conan's grades   (after grade)
                    Lint checks Bridget's briefs (after assembly)
                    Lint checks the library      (weekly pulse)
                    Lint checks the system       (pre-merge, post-change)
```
