# Architecture Review Scratch Pad
**Date:** 2026-04-10
**Purpose:** Breadth-first inventory of the entire library, noting what needs to change without stopping to change it. Output will feed into multiple implementation plans.

---

## Software Candidates (things that are currently agentic but should be deterministic software)

### From Conan Review
- [ ] **Inventory reconciliation** — diff expected cards vs actual cards (currently Conan reads everything manually)
- [x] **Conformance checking** — does a product-layer card link to its governing Standard? (boolean check, no judgment needed) → **FEAT-040**
- [x] **Downstream sync deviation detection** — compare meta-files to reference.md (currently Conan reads 13 files manually) → **FEAT-042**
- [ ] **Health check result caching** — run expensive 6-phase check, cache result, only re-run phases affected by changes since last check *(deferred — data layer)*

### From Nit / Health Check Review
- [x] **L1-L5 sweeps should be CI, not a play step** — agents call `alxndr lint` at play steps where Nit was dispatched. L6 stays as a play step. → **FEAT-043**
- [x] **Nit pre-sweep step disappears from Health Check play** — play starts at Conan: Grade, agents call CLI for structural checks. → **FEAT-043**
- [x] **Grade-evidence reconciliation should be software** — counting links, examples, section existence is completely deterministic. → **FEAT-037**
- [x] **Briefing compliance check should be software** — mandatory categories present? card budget met? provenance logged? → **FEAT-038**
- [x] **Design doc count verification should be software** — docs that claim "22 knowledge areas" — verify against reality. → **FEAT-039**
- [x] **Internal consistency checks — mostly software** — YAML vs table vs list count/set comparisons are deterministic. → **FEAT-041**
- [ ] **Source freshness tracking should be software** — track source file checksums and card-last-modified dates. *(deferred — data layer)*
- [ ] **Inventory reconciliation (manifest vs filesystem) is already partially software** — L4 lint checks do some of this. *(partially addressed by existing lint; full solution deferred — data layer for manifest persistence)*
- [x] **Nit may not need to exist as an agent** — absorbed into CLI tool. 6 agents → 5 agents. → **FEAT-046**

---

## UX / Design Notes

### From Raven Discussion
- [ ] **Three-tier interaction model** — Tier 1: just talk, Tier 2: named actions, Tier 3: slash commands. No card exists yet.
- [ ] **Raven concierge greeting** — state-driven orientation (state read + top-1 nudge + open invitation). No card or implementation.
- [ ] **Top-1 rule for suggestions** — surface single most important thing, hold rest until asked
- [ ] **User maturity detection** — Raven's greeting sophistication should scale with relationship depth (open question)

---

## Architectural Questions (things to resolve)

- [x] **Agent file format standardization** — inconsistent sections across agent files. Should there be a canonical template? → **FEAT-047**
- [ ] **Job dispatch vs skills** — jobs are multi-step plays living as prose in skill files. With orchestration, these become real workflows. How do we transition?
- [ ] **Conan job file format** — are all 11 jobs the right set? Are some redundant? Do any need merging or splitting?
- [x] **Health Check and Quality Cycle are one play, not two** — collapse into assess + repair phases. → **FEAT-048**
- [ ] **Assessment phases 1-2 should be continuous infrastructure, not periodic assessment** — *(deferred — data layer)*
- [ ] **Incremental assessment instead of full 6-phase** — *(deferred — data layer, needs persisted state)*
- [ ] **Three-tier quality checking model** — *(deferred — data layer, needs persisted state for tier 2 triggers)*
- [ ] **CRITICAL: No persisted quality state** — *(deferred — data layer)*
- [ ] **Build pipeline is disconnected** — wizard → Solomon → Conan → Sam is the intended flow, but nothing connects the stages.
- [ ] **Wizard doesn't invoke Conan's build sequence** — /library never dispatches Conan for Source Assessment or Inventory.
- [ ] **Solomon → Conan handoff gap** — Solomon produces source material but nothing triggers Conan.
- [x] **Collapse /wizard into /library** — /library is the single entry point. Wizard renamed to "initialize" internally. `alexandria-config.json` → `alexandria-config.json`. → **FEAT-045**
- [ ] **Two ingestion paths need clarity** — First-time vs ongoing ingestion distinction isn't documented.
- [ ] **Solomon should be in the wizard flow** — source material IS epistemically uncertain.

---

## Cleanup / Deletion Candidates

- [x] **`core/` directory should be deleted** — ✅ Done (PR #335)
- [x] **`docs/design/alexandria.md` has terminology drift** — → **FEAT-044**
- [ ] **22 card types may be too many for S** — Section/Template/Component/Governance are GUI-specific. Could collapse for non-software libraries.
- [ ] **Three vocabularies are disconnected** — Wizard (22 knowledge areas), Sam (18 card types), Bridget (15 retrieval profiles). Different lists, don't line up.
- [ ] **5 wizard areas have no card type** — Market Requirements, Competitive Analysis, Full GDD/PRD, Prototypes, Roadmap.
- [ ] **3 card types have no wizard area** — Component, Agent, Prompt emerge during construction, not scoping.
- [ ] **Bridget missing rationale layer profiles** — No retrieval profiles for Product Thesis, Principle, Standard.
- [ ] **"Standard" is overloaded in wizard** — Both "Design System" and "Accessibility Standards" map to same card type.
- [ ] **No explicit knowledge-area → card-type mapping** — Conan figures it out agentically during inventory. Major confusion source.

---

## Research / Evaluation Needed

- [ ] **Evaluate linting libraries** — holistically review our software linting to see if existing libraries could replace hand-coded solutions in alxndr lint. We may be reinventing wheels. Check: markdown-lint extensions, JSON schema validators, graph validation libraries, YAML consistency checkers, etc.

---

## Major Design Exercises Needed

- [ ] **Comprehensive data modeling for the library** — Currently fragmented across multiple formats: signal-queue.jsonl, feedback-queue.md, provenance-log.jsonl, alexandria-config.json, grades (ephemeral), run history (nonexistent). May need a central event log for the whole library. Exercise: consider all data models holistically and design a format that is comprehensive and well-fit. NOT prescribing the answer yet — this is an exercise to go through. Related: Conan's grade persistence, Raven's state reads, Solomon's queue, Bridget's provenance, incremental assessment triggers. All of these are currently separate ad-hoc formats that may benefit from unified design.

---

## Bridget Findings

- [ ] **Bridget doesn't use alxndr retrieve CLI** — Does all graph traversal agentically via Glob/Grep/Read. Token-expensive, slow. The retrieve CLI implements the same logic but isn't wired in. She should call `alxndr retrieve` for card selection, then focus agentic work on narrative assembly.
- [ ] **Retrieval profiles married to type taxonomy** — 15 profiles for 18 types (missing rationale layer). Non-software libraries would need different profiles.
- [ ] **Task modifiers could be config** — 5 task types, each just shifts dimension priorities. Simple enough to be a YAML table, not a markdown file.
- [ ] **Feedback queue format is inconsistent** — Schema says `.jsonl`. Raven and Conan reference `.jsonl`. Bridget's agent file explicitly says `.md` ("not .jsonl"). Actual file on disk is `.md`. One format, one file needed. Part of data modeling exercise.
- [ ] **Context briefings should be ephemeral, not persisted** — CONTEXT_BRIEFING.md is a rendered view of library cards, assembled for one task at one moment. Nothing original — all derived from cards on disk. Can be regenerated anytime. The unique value (gaps) is captured by the feedback queue. Currently saved inside implementation plans for traceability, but that's redundant if feedback queue + provenance log work. Stop saving briefings to disk.
- [ ] **Signal queue should be in the db and renamed** — "signal queue" sounds like an inbox, but it's actually a parking lot for undecided claims. Consider: contested-claims, pending, holds, undecided. — currently signal-queue.jsonl on disk. Multiple agents read it (Solomon, Raven, Conan). Schema is evolving (old entries use string arrays, new entries use richer objects). Part of data modeling exercise.
- [ ] **Feedback queue and provenance log get sprinkled across directories** — Should be single append-only files at library root (`docs/alexandria/feedback-queue.jsonl` and `docs/alexandria/provenance-log.jsonl`), alongside config and signal queue. Currently written wherever the briefing happens (e.g., inside implementation plan directories). Same fix for both: one canonical location, append-only.
- [ ] **Retrieval strategy: don't rewrite, eval-wrap, then replace** — Context briefings work well today. Don't rewrite the retrieval system now. Priority order: (1) Wire Bridget to call `alxndr retrieve` instead of manual Glob/Grep/Read — speed win, no quality risk. (2) Strengthen evals around retrieval quality (what was missing, what was irrelevant). (3) Later, test pure software retrieval against agentic, replace if comparable. The search width definitions (broad/narrow/maximum) are currently vibes, not numbers — formalizing those into the retrieve CLI config would be part of step 3.
- [ ] **Three vocabularies misaligned** — see detail above in Cleanup section

---

## Solomon Findings

- [ ] **Library needs an inbox concept** — no standard place to drop files before triage. You paste into chat. For a 50-page spec, you'd want to drop a file and say "triage this."
- [ ] **No processing state on source files** — can't tell which sources have been inventoried/turned into cards vs still waiting. No status field, no flag. Need processing state (frontmatter, log, or db). Part of data modeling.
- [ ] **No provenance link from source material back to raw signal** — solomon-source files don't point to the original transcript/thread/doc that produced them.
- [ ] **No batch triage** — Solomon handles one signal at a time in conversation. Can't say "triage these 5 docs."
- [ ] **Session-start is 11/20 steps software** — but NOT one monolithic CLI command. Separate composable tools: read config (JSON parse), library state (glob/count, partially in lint L5), scoreboard (already exists), drift detection (new, general-purpose). Raven calls them in sequence and does the 5 agentic steps: conversational framing, honesty, transition acknowledgment, listening, regression weight.
- [ ] **Codebase scanner should be a CLI tool** — scanner.md is 135 lines of glob patterns, string manipulation, filtering against a hardcoded list, and grouping by directory structure. Zero judgment. Under 100ms as software. Currently agentic (Raven does Glob/Grep calls). Prime candidate for `alxndr scan` CLI.
- [ ] **skills/wizard/ is confusing** — 9 files. SKILL.md is the old entry point (should die per FEAT-045). The other 8 are reference material Raven loads on demand. Directory LOOKS like a standalone skill but is really Raven's reference shelf. Consider renaming to `skills/initialize/` per the terminology decision and making the reference nature clear.
- [ ] **assessment.md contains a hidden handoff** — The seeding sequence is a prioritized build queue: "Update" areas → Conan (source exists, re-inventory + card updates). "Create" areas → Solomon/inbox (no source, needs gathering). This routing logic is buried in prose nobody acts on. Should become actual inbox items or work queue entries. The assessment itself can stay conversational, but the seeding sequence is actionable data.
- [ ] **assessment.md should probably not be a persisted file** — If killed, also review `skills/wizard/assessment-generation.md` (84 lines, procedure for generating it) and `skills/wizard/output-formats.md` (339 lines, templates including assessment). Both may become dead or need rework. — It's Raven saying "here's where we stand." That's a conversational turn, not an artifact. Stale the moment it's written (card counts change). Nobody else reads it. If library has proper state (config, scoreboard derivation, event log), Raven reconstructs current state on session-start. Same argument as striking session_notes. If someone wants to share the assessment, that's a "save conversation excerpt" problem.
- [ ] **Raven → Sam for config artifacts is unnecessary overhead** — Raven has Write tool, CAN write files. The "never write" rule is policy, not technical. For library CARDS the policy makes sense (quality gate via Sam's procedure + Conan grading). But for config artifacts (wizard-config.json, assessment.md), Sam adds a round trip with no quality value. Consider: Raven writes config artifacts directly, Sam only for library cards.
- [ ] **Scoreboard renderer works but derivation is agentic** — `src/tools/scoreboard.ts` renders ASCII progress bars from JSON, works great. But computing fill percentages from library state (which cards exist for each knowledge area, how complete they are) is done agentically by Raven. Need a CLI command that reads config + globs library + computes fill + pipes to renderer. The renderer is the easy part.
- [ ] **Raven should check for completed plans on session-start** — When /library opens, Raven should check if any in-progress implementation plans have tickets that completed (merged PRs, closed issues). Surface to human: "3 tickets from Architecture Review Hardening merged overnight. Want to run /complete-plan?" Part of the concierge greeting.
- [ ] **Use git for drift detection instead of directory heuristics** — session-start checks for `src/`, `app/` dirs as a proxy for "has project changed." Git log since last config date is more accurate and tells you exactly what changed. Replaces the 8-step greenfield-to-brownfield detection with one git query.
- [ ] **Strike session_notes entirely** — designed field in wizard-config.json, never implemented, never written. Redundant if event logging exists. Remove from job-wizard-mode.md, plan docs, and any schema references.
- [ ] **Drift detection done differently in two places** — Raven's /library session-start detects codebase-vs-library drift (8 of 20 steps for greenfield-to-brownfield, which is just one case of drift). Conan's Source Alignment detects source-vs-library drift. Same concept, different scope, different implementation. Should be one drift detection system.
- [ ] **Conan doesn't actually read signal queue** — Schema says he should flag stale claims during health check, but his job file and agent file have zero signal-queue references. Aspirational, not wired.
- [ ] **Solomon's library search is a good candidate for vector search** — "does anything contradict this claim?" is semantic similarity, not keyword matching. Grep misses semantically related but keyword-different cards. Vector search would also simplify the doors — "find relevant cards" step collapses to embed + nearest-N. Ties into storage-as-implementation-detail decision. Part of data layer / retrieval evolution.
- [ ] **Raven → Solomon handoff is manual** — Raven writes handoff blocks but nothing routes them. Fix: Raven writes to inbox, Solomon reads inbox. Solves the handoff problem without needing orchestration.
- [ ] **Inbox could unify multiple input channels** — Raven handoffs, human file drops, Conan flags, Bridget feedback, eventually webhooks. One inbox, multiple writers, Solomon consumes. Part of data modeling — inbox, signal queue, feedback queue, provenance log may all be the same underlying append-only event log.
- [ ] **CONVERSATION_COMPLETE.sentinel is eval pollution in production** — Solomon writes a sentinel file to project root on completion, solely so the eval harness can detect job finish. This litters the user's project directory. Fix: remove sentinel from Solomon's agent/job files, have eval harness detect completion via status marker (`**Status: DONE**`) instead, add sentinel to .gitignore as safety net, delete existing file.

---

## Unified Retrieval

- [ ] **FALSE NEGATIVE DETECTION via log diff** — Compare "what retrieval returned" vs "what the agent actually Read during the session." The delta = false negatives (cards that exist, should have been surfaced, weren't). Automatic, no human reporting needed. Compounds over time: "for System tasks, retrieval consistently misses Standard - Y" → profile self-improvement. THIS IS THE LEARN MOTION MADE CONCRETE.
- [ ] **HIGHEST LEVERAGE: One retrieval path for all agents** — Raven, Solomon, Bridget, Sam, Conan all need to find relevant cards. Each currently has its own grep approach (11 doors across Raven + Solomon, plus Bridget's profiles). Unify into one retrieval layer (alxndr retrieve or vector search). Benefits: single place to optimize, complete cache miss log across all agents, demand-ranked build priority (most-missed cards = most needed), natural place for vector search. The feedback queue becomes comprehensive demand signal, not just Bridget's gaps. Probably the single highest-leverage infrastructure change.

---

## CLI Integration Audit

- [ ] **Audit every CLI command against agent usage** — Go through each `alxndr` subcommand (lint, grade, retrieve, dag, tensions, scoreboard, wizard, health-check, sync-issues, update-check, route) and check: is it being called from the right places in agents/skills? Are there agents doing agentically what the CLI already does? Bridget not calling `retrieve` is one instance — there may be more. This is a systematic sweep, not ad hoc.

---

## Areas Reviewed
- **Conan** — 3 sequences (Build, Quality, Maintain), 11 jobs, 5 reference skills. Extensive findings above.
- **Nit** — All software. Agent being retired (FEAT-046).
- **Bridget** — One job (context assembly), 7 skill files, 15 profiles. Extensive findings above.
- **Sam** — 3 jobs (create, fix, self-check), 6 skill files (~1340 lines). Extensive findings above.
- **Raven** — 2 jobs (product conversation, wizard mode), 9 skill files (~2229 lines). Biggest agent. Findings: routing is 5 paths not 245; 2/7 archetypes orphaned; provenance log aspirational; lenses may be guidance not mechanical; all 5 doors are manual grep that retrieve CLI could handle; greenfield-to-brownfield is just drift detection (general case: product moved, library didn't); session-start 20 steps is over-specified (8 steps for one niche case); handoff block is real + eval-enforced; tier signaling is real + eval-enforced; Raven→Sam handoff loop in wizard mode works.
- **Solomon** — 1 job (signal triage), 8 skill files (~1687 lines). Clean architecture. Uses tensions CLI for T1/T5/T6 pre-screening. 6 doors for signal types. Findings: sentinel eval pollution, no inbox, no source provenance link, no batch triage, Raven handoff is manual, signal queue naming, vector search candidate, no processing state on sources, Conan doesn't actually read signal queue despite schema claiming it.
## Sam Findings

- [ ] **Type/link info duplicated across 6 files** — Should be one canonical source. Currently spread across:
- [ ] **  (1) Sam's card-creation.md Step 3** — link patterns for 9 of 18 types (missing Domain, System)
- [ ] **  (2) Sam's library-organization.md** — type-to-folder mapping (18 types)
- [ ] **  (3) Conan's type-taxonomy.md** — containment relationships + decision tree
- [ ] **  (4) Bridget's retrieval-profiles.md** — always-include + traversal depth (15 of 18 types)
- [ ] **  (5) Sam's link-patterns.md** — 321 lines of canned phrases per type, also repeats containment
- [ ] **  (6) Bridget's SKILL.md** — layer/folder/type table
- [ ] **link-patterns.md is over-engineered** — 321 lines of canned phrases for wikilink context. A 5-line rule would suffice.
- [ ] **Time estimates in Sam's files** — card-creation.md (12) and self-check.md (3). Human checklist leftovers. Sweep to remove.
- [ ] **rules.md duplicates card-creation.md** — 30 lines restating what the 416-line procedure already covers. Candidate for deletion.
- [ ] **self-check.md is 318 lines of mostly duplication** — Candidate for heavy pruning or deletion.
- [ ] **decomposition.md is another copy of the type decision tree** — Steps 1-5 restate Conan's type-taxonomy.md. Also has stale terminology ("zone/room" on line 132).
- [ ] **Sam has 5 of 7 files with overlapping type info** — card-creation, library-organization, link-patterns, self-check, decomposition. Massive internal duplication. Could be half the size with one canonical type reference.
- [ ] **TOTAL: 7 files across agents with overlapping type/link info** — Conan type-taxonomy, Sam's 5 files, Bridget's retrieval-profiles. Need one canonical source.
- [ ] **Sam evals: 13/14 on both cases, consistent fabrication failure** — Sam invents wikilinks to cards that don't exist (Standard - Privacy, Primitive - Task). Self-check says "linked note exists? check" but isn't catching it. Could be a lint check: verify all wikilink targets exist on disk.

---

## Playbook Findings

- [ ] **30 plays, only 10 Real** — 10 fully wired, 9 partial (jobs exist, orchestration implicit), 11 aspirational (documented, never built).
- [ ] **Real plays cluster around core loop** — Configuration, Grade, Improve, Serve, Signal Intake, Health Check, Alignment Sweep, Integrity Gate.
- [ ] **Aspirational plays are maintenance + evolution** — Card retirement, terminology migration, structural change, taxonomy evolution, library split, disaster recovery, learning ingestion. None built.
- [ ] **Briefing Retrospective (3.2) is aspirational** — this is the Learn motion. Designed on paper, never implemented. Key gap.
- [ ] **Playbook is a design doc, not executable** — play-protocol.md tells agents to read playbook.md for play definitions, but no agent actually does. Job files contain everything agents need. The playbook reference in play-protocol is a dead pointer. — Zero agents read playbook.md at runtime. Actual play logic lives in agent job files. Playbook is a 1357-line spec for humans. Can drift from agent implementations without anyone noticing. When playbook says X and job file says Y, job file wins.
- [ ] **No play-level orchestration exists** — Jobs exist but flows between jobs aren't scripted. No "run Play 1.1" command.
- [ ] **Playbook is 1357 lines** — may be over-specified for what's actually implemented. Consider pruning aspirational plays to a roadmap section.

---

## Areas Reviewed
- **Conan** — 3 sequences (Build, Quality, Maintain), 11 jobs, 5 reference skills. Extensive findings above.
- **Nit** — All software. Agent being retired (FEAT-046).
- **Bridget** — One job (context assembly), 7 skill files, 15 profiles. Extensive findings above.
- **Sam** — 3 jobs (create, fix, self-check), 6 skill files (~1340 lines). Extensive findings above.
- **Solomon** — 1 job (signal triage), 8 skill files (~1687 lines). Extensive findings above.
- **Raven** — 2 jobs (product conversation, wizard mode), 9 skill files (~2229 lines). Extensive findings above.
- **Shared skills** — play-protocol.md (91 lines, but references two nonexistent files + dead playbook pointer), plus a deprecated orchestration reference doc (67 lines, dead — nobody loads it).
- [ ] **Remove both shared skill files** — the deprecated orchestration reference doc is dead (nobody loads it). `play-protocol.md` has three broken references (nonexistent README, nonexistent feedback-queue, dead playbook pointer). The useful parts of play-protocol (completion statuses, model discipline) should be inlined into agent files or replaced by a simpler shared convention. Don't maintain a shared file that's mostly broken.
- [ ] **play-protocol.md shared preamble references nonexistent files** — tells every agent to read `docs/alexandria/README.md` (doesn't exist) and `docs/alexandria/feedback-queue.jsonl` (doesn't exist, format inconsistent). Every agent silently fails steps 1 and 2 of the preamble on every job. Also has dead pointer to playbook.md that no agent follows.
- **Playbook** — 30 plays, 10 real, 9 partial, 11 aspirational.

## Template Findings

- [ ] **reference.md is the 7th copy of the type decision tree** — BUT Conan's downstream sync treats it as canonical. This arguably IS the one source of truth. The other 6 files should reference it, not duplicate it.
- [ ] **library-readme.md template never gets instantiated** — Template exists for `docs/alexandria/README.md` but nobody runs the scaffolding step that would create it. That's why play-protocol's "read the README" instruction always fails.
- [ ] **An unused Claude workflow snippet template is dead** — nobody references it. No agent, skill, or setup script loads or mentions it. Probably meant for manual copy-paste into CLAUDE.md but no instruction exists.
- [ ] **An unused sources README template is dead** — nobody references it. It also contains a rule saying agents do not search sources, which contradicts actual usage (Solomon writes there, Conan reads there, Raven reads there).

---

## Areas Not Yet Reviewed
- [ ] Planning skills — /plan, /revise-plan, /complete-plan, /sync-tickets (used them today but never reviewed internals)
- [ ] Alexandria-upgrade skill
- [ ] CLI tools — which exist, which are missing, which need improvement
- [ ] Evals — which skills have coverage, which don't, are the evals good?
- [ ] Web viewer — current state, what it should become

---

_This scratch pad will be updated throughout the architecture review session. Items move from here into implementation plans when we're ready to act._
