# Context Briefing

## Task Frame

**Task:** Harden `src/tools/lint.ts` into a complete standalone tool covering all six sweep levels from `skills/nit/sweeps.md`. Then add a health-check pre-flight output mode (`--format health-check`) so Conan's Job 8 (`skills/conan/job-health-check.md`) can consume structured CLI output for the mechanically computable assessment steps instead of delegating mechanical work to Nit-the-agent. Finally, refactor Conan's health-check skill to call the CLI for those steps.

**Target type:** System (CLI tool hardening + agent skill refactor)
**Task type:** feature (new sweep 6 coverage + new output mode) + refactor (Conan health-check)
**Constraints:**
- Must not break existing sweeps 1–5 or their tests
- Sweep 6 checks that require LLM judgment (e.g., "is this prose consistent with YAML?") remain Nit-agent work — only deterministic, file-system-provable checks belong in the CLI
- The CLI must remain Bun-native; no new runtime dependencies
- Exit codes must be stable: exit 1 on any error-severity finding, exit 0 otherwise
- Conan's health-check skill must still work without the CLI (graceful degradation if the binary is not on PATH); the CLI is a fast-path, not a hard dependency

**Acceptance criteria:**
- `bun run src/tools/lint.ts --sweep 6 --library <path>` runs all deterministic Sweep 6 checks and emits findings in the existing `Finding` schema
- `bun run src/tools/lint.ts --format health-check --library <path>` emits a structured JSON object that maps to Conan's inventory reconciliation and any other mechanically computable health-check assessment steps
- `skills/conan/job-health-check.md` has a new section instructing Conan to run the CLI pre-flight and consume its output before beginning the assessment
- `src/tools/lint.test.ts` has tests for at least the deterministic Sweep 6 rules and the health-check output mode
- `bun test` passes with no regressions

---

## Primary Cards (full content)

### Agent - Nit the Picker
**Type:** Agent
**Relevance:** Defines Nit's six sweep levels, the mechanical/judgment boundary, the adversarial independence principle, and the explicit "software-ification path" that motivates this hardening work.

**WHAT:** Nit the Picker is the mechanical linter for Alexandria. He runs deterministic, boolean checks across cards, wikilinks, file paths, wizard arithmetic, and agent output. He operates at six sweep levels from single-line hygiene to full cross-system verification. Nit is not a critic or judge.

**WHERE:** Home in Domain - Library Interior and Domain - Library Boundary. Conforms to Governance - Agent Capability Matrix. Coordinates with Conan (sweeps before/after grading) and Bridget (briefing compliance). Depends on System - Knowledge Graph.

**WHY:** Library #1 was built without a linter. Structural inconsistencies accumulated silently until Conan was spending context window on problems a mechanical checker would have caught instantly. Nit exists because this pain was measurable. Independence is structural: Nit checks Conan's grades against countable evidence; if embedded in Conan that would be self-review.

**WHEN:** Third agent added. Extracted from Conan when mechanical checks were found to degrade judgment-based grading. Current status: Implemented with 6 sweep levels. **Not yet through eval-driven hardening** — a dedicated hardening pass is expected. (This task IS that hardening pass for the CLI dimension.)

**HOW:** Six sweep levels. Sweep 1 (Line): markdown hygiene, terminology consistency, wikilink syntax. Sweep 2 (Card): five H2 sections, naming convention, folder placement, stub sections, word count. Sweep 3 (Graph): broken wikilinks, orphan cards, bidirectional gaps, duplicates. Sweep 4 (Layer): minimum population, cross-layer links, inventory reconciliation. Sweep 5 (Library): coverage metrics, type distribution, JSONL validation. Sweep 6 (Cross-system): path resolution, plan status, wizard arithmetic, grade-evidence reconciliation, briefing compliance, internal consistency, regression detection.

Voice: terse and factual. "12 cards checked. 3 findings. 1 critical, 2 notes."

---

### skills/nit/sweeps.md — Sweep 6 Detail
**Type:** Skill (source of truth for sweep definitions)
**Relevance:** Sweep 6 is entirely absent from the current CLI. This is the implementation spec for what must be added.

**WHAT:** Sweep 6 (Cross-System) covers six deterministic rule families and two judgment-requiring rule families:

Deterministic (CLI-appropriate):
1. **Path resolution** — skill files and agent definitions that reference other files by path; does the target exist? Missing = warning.
2. **Plan status verification** — plan steps marked `[x]` whose output file does not exist = warning; steps marked `[ ]` whose output already exists = note.
3. **Wizard arithmetic** — pool sizes must total correctly (mode-specific counts). Mismatch = critical.
4. **Design doc counts** — documents stating specific counts ("22 knowledge areas", "16 card types") — verify against reality. Mismatch = warning.
5. **Grade-evidence reconciliation** — WHERE link count, missing dimensions cap, HOW example count, word count vs. atomicity flag. Discrepancy = note.
6. **Briefing compliance** — mandatory categories from retrieval profile present, card budget met, provenance logged, all referenced cards exist.

Partially deterministic (boundary cases):
7. **Internal consistency** — prose vs. structured data (YAML, pseudocode, tables). The count/enumeration sub-checks are deterministic; the "prose agrees with YAML semantics" sub-check is judgment.
8. **Regression detection** (PR context) — new broken links, new orphan cards, new stub sections, new naming violations. All deterministic but require two snapshots (before/after).

---

### skills/conan/job-health-check.md — Job 8 Health Check
**Type:** Skill
**Relevance:** The second half of the task. Inventory reconciliation and parts of Standards Health are mechanically computable. The refactor adds a CLI pre-flight step that Conan calls before beginning the assessment.

**WHAT:** Job 8 is Conan's periodic big-picture library assessment. In the current skill text, that assessment is organized into six internal steps: Source Alignment, Inventory Reconciliation, Standards Health, Product Thesis/Principle Health, Product Layer Sampling, and Cascade Analysis.

**Inventory Reconciliation:** Mechanically computable — expected cards vs. actual files on disk. Missing cards, unexpected cards, misclassified cards. This is a file-exists check only, not a content check. The lint CLI's sweep 5 already partially covers this (coverage metrics, type distribution). A health-check output mode could emit this data pre-computed.

**Standards Health:** Structural sub-checks are mechanical: "Does the WHY section link to ≥1 Principle?" is a link-count check Nit can run. "Does the card have an anti-example?" is a text-pattern check. Content judgment ("Is WHAT concrete?") remains Conan's domain.

**Later assessment steps:** Primarily judgment-based (WHY reasoning quality, content sampling, cascade trace). These remain Conan's exclusive work.

**Trigger:** Periodic (quarterly), after major source updates, explicit "how healthy is the library?" request.

**Output contract:** Full inline report — all tables, data, recommendations — not a summary. Ends with `**Status: DONE**` or `**Status: DONE_WITH_CONCERNS**`.

---

### src/tools/lint.ts — Current Implementation
**Type:** System (CLI source)
**Relevance:** The HOW layer for this task — the existing code that must be extended. Understanding what is already implemented prevents duplicating work and shows the extension points.

**WHAT:** TypeScript CLI implementing sweeps 1–5. Imports `Library` from `src/lib/graph.ts`. CLI flags: `--library`, `--sweep` (1-5 or "all"), `--format` (text|json). Exports `Finding` interface with `severity`, `file`, `line`, `sweep`, `rule`, `message`, `fix?`. Exit code 1 if any error-severity finding.

**Current sweep coverage:**
- Sweep 1: heading hierarchy, wikilink syntax, naked URLs, trailing whitespace
- Sweep 2: missing sections, naming convention, unknown type, folder placement, stub sections, word count >700, link count <3
- Sweep 3: broken wikilinks (via `library.brokenLinks()`), orphan cards (via `library.orphans()`), bidirectional gaps (via `library.bidirectionalGaps()`), duplicate card names from scan errors
- Sweep 4: underpopulated layers, missing WHY chain (product → rationale links), containment obligations
- Sweep 5: missing core types, low link density, JSONL validation for feedback-queue.jsonl and signal-queue.jsonl

**Missing from current implementation:**
- Sweep 6 entirely
- `--sweep 6` or `--sweep all` resolving above 5 (currently validates sweeps 1–5 only, exits with error on 6)
- `--format health-check` output mode
- No concept of "two snapshots" for regression detection (PR context)

**Extension points:**
- `main()` sweep range validation rejects >5 — needs updating to 1–6
- `sweep5()` returns `[Finding[], Record<string, unknown>]` — the metrics object is a natural seed for the health-check format
- `formatJson()` and `formatText()` are the two output formatters — `formatHealthCheck()` would be a third

---

## Supporting Cards (summaries)

| Card | Type | Key Insight |
| --- | --- | --- |
| [[Artifact - Decision 7: Nit as Independent Linter]] | Artifact | Nit is independent specifically so each sweep can be automated without touching Conan. Software-ification is the explicit long-run thesis — "Nit agent becomes a thin orchestration wrapper that calls tools." |
| [[Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]] | Artifact | Mechanical checks must be exhaustive (100%), never sampled. CLI implementation enables this at zero LLM cost. |
| [[Agent - Conan the Librarian]] | Agent | Conan's exclusive capability is grading — cannot run mechanical checks. Health Check (Job 8) is specifically where Nit/CLI pre-flight integrates. Inventory reconciliation is file-exists only, not content judgment. |
| [[Capability - Linting]] | Capability | Linting is Nit's exclusive capability; the CLI is the mechanically hardened expression of that capability. |
| [[Capability - Health Check]] | Capability | Conan's health-check capability; the CLI pre-flight enriches inventory reconciliation and related structural checks with deterministic data before Conan begins judgment-heavy steps. |
| [[Principle - The Linter Is Adversarial by Design]] | Principle | Nit answers to the evidence, not to Conan. The CLI makes this concrete: output is machine-verifiable, not LLM-interpretable. |
| [[Principle - Structural Quality Before Functional Quality]] | Principle | Structural checks must clear before judgment-based grading. CLI pre-flight in health-check enforces this sequence programmatically. |
| [[Standard - Five-Dimension Card Requirements]] | Standard | Defines the structural requirements the CLI checks: five H2 sections, naming, placement, link counts. |
| [[System - Knowledge Graph]] | System | `src/lib/graph.ts` — the `Library` class that the lint CLI builds on. All graph traversal (broken links, orphans, bidirectional gaps) flows through here. |

---

## Relationship Map

- `src/tools/lint.ts` depends-on `src/lib/graph.ts` — `Library.fromDirectory()` is the entry point for all card parsing and graph traversal
- `src/tools/lint.ts` depends-on `src/lib/cli.ts` — `parseArgs()` handles flag parsing
- [[Agent - Nit the Picker]] governs `src/tools/lint.ts` — the skill definitions in `skills/nit/sweeps.md` are the authoritative specification the CLI must implement
- [[Agent - Conan the Librarian]] calls-output-from `src/tools/lint.ts` — after refactor, Job 8 health-check skill instructs Conan to run the CLI pre-flight
- `skills/conan/job-health-check.md` depends-on `skills/nit/sweeps.md` — inventory reconciliation overlaps with Sweep 5 mechanics; the CLI pre-flight makes this explicit
- [[Artifact - Decision 7: Nit as Independent Linter]] justifies the hardening direction — the software-ification thesis is the "why now" for adding Sweep 6 to the CLI
- The lint CLI entry point delegates to `src/tools/lint.ts` — the wrapper layer is not part of this slice

---

## Gap Manifest

| Dimension | Topic | Searched | Found | Recommendation |
| --- | --- | --- | --- | --- |
| HOW | Sweep 6 implementation spec — which sub-rules are deterministic vs. judgment | Yes | Partial — `skills/nit/sweeps.md` lists all rules but does not explicitly label each as CLI-appropriate vs. agent-only | Add a `<!-- CLI: yes/no -->` annotation per rule in `sweeps.md`, or document the boundary in the implementation plan |
| HOW | Health-check pre-flight JSON schema — what exact fields Conan expects to consume | Yes | Not found — `job-health-check.md` has no structured output contract for machine consumption | Define the `--format health-check` JSON schema as part of implementation; document it in `skills/conan/job-health-check.md` under a new "CLI Pre-flight" section |
| HOW | Regression detection (sweep 6 PR mode) — requires two snapshots | Yes | Not found — no prior-state snapshot mechanism exists in the codebase | Scope this out of the initial hardening; treat it as a future capability. Document the exclusion in the plan. |
| WHEN | Eval coverage for the lint CLI | Yes | Not found — `Agent - Nit the Picker` explicitly notes "Nit has not yet been through eval-driven hardening." The lint CLI has deterministic tests but no eval cases. | After implementing Sweep 6, add an eval case under `skills/nit/` per the EVALS.md guide |
| WHERE | `Capability - Linting` card content | Yes | Card referenced in Nit's WHERE section but not read — content not surfaced during assembly | Low priority — the capability card unlikely to contain implementation-blocking detail |
| WHERE | `System - Knowledge Graph` library card | Yes | Card referenced but not read — this is `src/lib/graph.ts` described as a library card | Low priority for this task; graph.ts was read directly |

---

## Completion Status

**Status:** DONE_WITH_CONCERNS

**Concerns:**
1. The mechanical/judgment boundary in Sweep 6 is implicit in `sweeps.md` but not annotated. The implementer must make a judgment call about which sub-rules to include in the CLI. The briefing provides a reasoned split in the Primary Cards section, but it has not been validated against the Nit agent's intended behavior.
2. The `--format health-check` JSON schema does not exist yet. The implementer will need to design it. The briefing identifies inventory reconciliation as the clearest mechanical target, but the exact fields Conan expects to consume must be agreed between the implementer and the `job-health-check.md` refactor.
3. Regression detection (PR context) in Sweep 6 requires two-snapshot diffing, which is architecturally new for the CLI. Recommend scoping it out of this task.
