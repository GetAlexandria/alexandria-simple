# Key Decisions: Team Architecture

Source material for knowledge area 5.1. Synthesized from design conversations and
architectural documents, 2026-03-23.

## Decision 5: Four agents, not one

**Decided:** Four specialized agents (Conan, Sam, Nit, Bridget) with non-overlapping
capabilities.

**Alternative rejected:** A single "librarian" agent that grades, builds, checks, and
assembles.

**Why four:**

- **The antagonistic quality pattern.** When the same agent grades and fixes, it
  unconsciously softens its own findings. Structural separation between critic (Conan),
  builder (Sam), and linter (Nit) ensures that evaluation is honest, construction is
  focused, and verification is independent. This was directly inspired by the
  antagonistic writing architecture (Zelda Felfenlagger / ghostwriter / QA script
  separation documented at sociotechnica.org/notebook/antagonistic-writing/).

- **Context window focus.** Each agent's context window stays focused on its job. Conan
  loads rubrics and grade computation. Sam loads card templates and source material.
  Bridget loads retrieval profiles and the graph. A single agent would need all of this
  simultaneously, degrading performance on each task.

- **Model optimization.** Different jobs have different compute profiles. Conan's
  assessment work benefits from a reasoning model. Sam's high-volume card writing can
  use a faster model. Nit's mechanical checks could eventually become software entirely.
  A single agent forces one model choice for all jobs.

**What would change this decision:** If model context windows become large enough and
cheap enough that loading everything simultaneously has no quality or cost penalty, the
case for separation weakens. But the antagonistic quality argument holds regardless of
model capability — it's about incentive structure, not compute.

## Decision 6: Filtered handoffs, not information walls

**Decided:** Sam receives domain context ("what good looks like"), specific tasks, and
acceptance criteria from Conan's surgery plans. Sam does NOT receive grades, cascade
analyses, or diagnostic framing.

**Alternative considered:** Full information wall (the antagonistic writing article's
approach — the ghostwriter doesn't know the editor's diagnoses at all).

**Alternative considered:** Full transparency (Sam sees everything Conan sees).

**Why filtered:**

- The article's information wall works for prose revision because the ghostwriter's job
  is stylistic — voice execution. Card writing is different. Sam builds knowledge graph
  nodes that need to accurately represent relationships. Without domain context (why a
  conformance link matters, what the governed domain is), Sam writes technically correct
  but contextually hollow link phrases.

- Full transparency biases Sam toward Conan's framing. If Sam knows Conan gave a C+,
  Sam writes to hit B+ rather than writing what's true about the source material.

- The filter passes domain context (improves card quality) and blocks evaluative
  judgments (prevents bias). Surgery plans include "what good looks like" exemplars and
  relationship rationale, but not grades, scores, or Conan's opinion of the current state.

**What would change this decision:** Evidence that Sam's card quality is the same with
or without domain context would simplify the handoff to just task + acceptance criteria.
Evidence that Sam produces better cards when seeing grades would argue for more
transparency. Neither has been tested.

## Decision 7: Nit as independent linter, not Conan sub-agent

**Decided:** Nit is a separate agent answering to the evidence, not a sub-process of
Conan.

**Alternative rejected:** Conan runs mechanical checks as part of grading (the original
architecture — Conan did everything).

**Why independent:**

- **Adversarial independence.** Nit checks Conan's grades against countable evidence
  (grade-evidence reconciliation). If Nit were Conan's sub-agent, this adversarial check
  would be self-review — an agent checking its own work. Independence makes the
  antagonistic pattern real.

- **Exhaustive coverage.** Conan's health check samples 20% of product-layer cards.
  Nit checks every card, every link, every path — because mechanical checks are cheap
  and judgment is expensive. Embedding mechanical checks inside judgment-based jobs
  means they inherit the sampling rate.

- **Software-ification path.** Nit's six sweep levels are all candidates for conversion
  to actual code (CLI tools, GitHub Actions, MCP tools). Separating Nit from Conan
  means each sweep can be automated independently. Sweep 3 (broken wikilinks) is
  practically a shell script already. If Nit's checks were embedded in Conan's grading
  job, extracting them into software would require surgery on Conan's procedures.

**What would change this decision:** If all of Nit's sweeps were automated into software
tools, the "Nit agent" becomes a thin orchestration wrapper that calls tools and formats
output. At that point, Nit might merge back into the play orchestration layer rather
than being a named agent.

## Decision 8: Bridget as boundary agent, not Conan Mode 1

**Decided:** Bridget is a separate agent working at the library-factory boundary.

**Alternative rejected:** Conan Mode 1 (Context Assembly) — the original architecture
where Conan both assembled briefings and maintained the library.

**Why separate:**

- **Different customers.** Conan's customer is the library's quality. Bridget's customer
  is the builder agents in the factory. A single agent serving two customers makes
  trade-offs between them — spending assembly time on quality observations instead of
  getting the briefing to the builder, or rushing assembly to get back to maintenance.

- **Different directions.** Conan faces inward (library quality). Bridget faces outward
  (factory needs) and backward (feedback to Conan). The feedback loop between Bridget
  and Conan — gap signals, retrieval misses, retrospective findings — only works cleanly
  when they're separate agents with a defined handoff (the feedback queue).

- **Demand signal.** Bridget's gaps tell Sam what to build next. This factory-demand-
  drives-library-priority principle requires Bridget to be independent enough to
  advocate for the factory's needs, not subordinated to Conan's maintenance priorities.

**What would change this decision:** If assembly becomes a purely mechanical process
(pre-computed graph traversals, cached briefings, no judgment required), Bridget becomes
a software tool rather than an agent. The feedback triage and retrospective analysis
would still require agent judgment, but they could be folded into Conan's health check.

## Decision 9: Plays as team coordination, not agent-owned jobs

**Decided:** Plays are coordinated team motions defined in a playbook. Agent definitions
are thin (identity, voice, constraints, tools). Play logic lives beside agents, not
inside them.

**Alternative rejected:** The original architecture where Conan had 10 jobs baked into
his agent definition and the sequencing logic was embedded in job descriptions.

**Why plays:**

- **Orchestration from outside.** If play logic lives inside agents, an orchestrator
  can't dispatch plays — it can only invoke agents and hope they figure out which job
  to run. Plays as external definitions enable external orchestration: read the play,
  dispatch the right agent for each step, manage handoffs, check gates.

- **Team coordination.** The original jobs were single-agent operations. Plays coordinate
  multiple agents: Sam builds → Nit checks → Conan grades → Nit verifies grades. The
  coordination logic doesn't belong inside any one agent.

- **Inspired by gstack.** Garry Tan's gstack architecture uses skills (slash commands)
  as complete workflows with setup, procedure, and exit criteria. Skills ARE the plays.
  The agents are thin identities; the skills are where the logic lives. This pattern
  directly influenced the decision to pull job logic out of agent definitions.

- **Versioning and eval/iterate.** Plays as external artifacts can be versioned, have
  changelogs, and be benchmarked. A job embedded in an agent definition can't be
  independently versioned or compared against a prior version. The eval/iterate pattern
  (inspired by the Elicit product design lab) requires plays to be discrete, measurable
  units of work.

**What would change this decision:** If agent definitions get a native mechanism for
versioned, composable, externally-dispatchable job definitions (something beyond skill
files), the play/agent separation might converge.

## Decision 10: Completion status protocol

**Decided:** Every play exits with one of four statuses: DONE, DONE_WITH_CONCERNS,
BLOCKED, NEEDS_CONTEXT.

**Alternative rejected:** No standardized exit — plays just end, and the human figures
out what happened.

**Why statuses:**

- **Orchestration requires machine-readable exits.** An orchestrator dispatching plays
  needs to know: did it work? Can I proceed to the next play? Do I need human input?
  Without standardized statuses, the orchestrator would need to parse natural language
  output to determine what happened.

- **DONE_WITH_CONCERNS is the key status.** Binary pass/fail doesn't capture the real
  world. A build can complete with known thin areas (source gaps flagged in assessment).
  A grade can complete with discrepancy flags that need human review but don't block
  the next play. This status allows the system to keep moving while preserving
  transparency about concerns.

- **Inspired by gstack.** The completion status protocol (DONE / DONE_WITH_CONCERNS /
  BLOCKED / NEEDS_CONTEXT) is a direct adaptation of gstack's exit states, extended
  with NEEDS_CONTEXT to handle the common case where the play can't proceed because
  information is missing (not because something failed).

**What would change this decision:** If play orchestration moves entirely into software
(not agent-driven), the status protocol might expand to include more granular states
or structured error types. The current four statuses are optimized for human readability
and agent-to-agent handoffs.

## Decision 11: Agent personality serves legibility, not entertainment

**Decided:** Agents have memorable names and distinct voices, but personality serves
identification and predictability, not amusement.

**Alternative rejected:** Generic agent names (Agent 1, Agent 2) or purely functional
names (Grader, Builder, Linter, Assembler).

**Alternative rejected:** Heavily themed or narrative personalities (RPG characters,
movie characters).

**Why memorable-but-professional:**

- Names like "Conan the Librarian" and "Sam the Scribe" tell you what the agent does
  without reading the docs. "Nit the Picker" is literally the job description. "Bridget
  the Briefer" encodes both the bridge metaphor and the output format.

- The naming convention (common name + "the [job]") is a pattern that extends to new
  agents without requiring a theme. It's generative, not a fixed reference.

- Personality (Conan's exacting standards, Sam's cheerful competence, Nit's tireless
  thoroughness) makes the agents distinguishable in output. You know who produced a
  report by reading it. But the personality never makes the agent unpredictable — you
  always know what each agent will do.

- The north star is a well-run franchise: consistent, predictable, professional, with
  just enough personality to be memorable and recognizable.

**What would change this decision:** If users find the names confusing or unprofessional
in enterprise contexts, functional names could be offered as an alias system. The
personality is in the voice, not just the name — the voice would persist regardless of
what you call the agent.
