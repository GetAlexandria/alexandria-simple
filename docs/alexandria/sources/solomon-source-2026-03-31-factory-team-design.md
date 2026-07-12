# Source Material: Factory Team Design

**Date:** 2026-03-31
**Origin:** Product thinking session (Raven + Dan)
**Triaged by:** Solomon

---

## Claim 1: Separation of concerns governs factory agents — one verb per role, no "and also"

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner correction of prior analysis — Credibility: 6, Tier: E1
**Tensions checked:** T-CONSISTENCY checked against Principle - The Critic and Builder Must Be Structurally Separated (aligned), Artifact - Decision 5: Four Agents, Not One (aligned)

### Content

Factory agents cannot be producers AND sensors. The same principle that governs library agents — Conan cannot write, Sam cannot grade, Nit cannot make judgment calls — must govern factory agents.

A blended role (produce AND sense) is an "impossible job" — a role where success at one responsibility undermines success at the other. The failure pattern has five diagnostic markers:

1. **Two competing verbs** that pull attention in opposite directions
2. **Conflicting consumers** with incompatible needs
3. **Self-evaluation built in** (the builder judging the build)
4. **"And also" accretion** — the role description grew by adding responsibilities
5. **Non-isolable accountability** — when something fails, you cannot tell which function failed

A well-designed agent job has: one verb, a clear "does NOT do" list, non-competing consumers, evaluable performance, and a stable attention target.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Principle - The Critic and Builder Must Be Structurally Separated | update — extends principle from library agents to all agents including factory | 28 |
| Artifact - Decision 5: Four Agents, Not One | update — the reasoning extends to factory team design | 18 |
| Governance - Agent Capability Matrix | update — needs to address factory agent capabilities | 4 |

### Context for Conan

This claim extends an existing library principle (critic/builder separation) to a broader organizational design principle. The impossible job pattern is the general case; the critic/builder separation is a specific instance. A new Principle card should capture the general pattern, with the existing cards as instantiations.

### Raw Signal Reference

`.context/tcloa-factory-team-design.md`, "Why Blended Roles Fail: The Impossible Job Pattern" and "What Makes a Well-Designed vs. Impossible Agent Job" sections.

---

## Claim 2: Four factory roles — Builder, Reviewer, Checker, Observer

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner approval during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

Each factory has a crew of four specialized agents:

| Role | Verb | What It Does | Does NOT Do |
|---|---|---|---|
| Factory Builder | PRODUCES | Produces factory output (code, content, campaigns). Receives context from Bridget. | Evaluate its own work. Report signal to the library. |
| Factory Reviewer | EVALUATES | Reviews builder output against library standards, principles, and domain knowledge. Diagnoses problems, specifies changes. | Make the changes itself. Sense marketplace signal. |
| Factory Checker | VERIFIES | Runs deterministic checks on factory output (tests, formatting, compliance, naming). | Review for product quality. Make judgment calls. |
| Factory Observer | WATCHES | Monitors factory operations and marketplace interactions. Extracts signal and routes to Solomon. | Produce factory output. |

The mapping to library roles:
- Sam (Builder) maps to Factory Builder
- Conan (Critic) maps to Factory Reviewer
- Nit (Checker) maps to Factory Checker
- Solomon (Sorter) maps to Factory Observer (reversed direction — Solomon sorts inbound, Observer senses outbound)

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Artifact - Boundary Agent Differentiation | update — needs factory agent layer | 8 |
| Agent - Solomon the Sorter | update — Observer is the factory-side signal source feeding Solomon | 9 |
| Agent - Bridget the Briefer | update — Bridget serves the factory crew, not just "the factory" | 8 |

### Context for Conan

The four factory roles are a direct parallel to the library team's role separation. The same design logic that produced four library agents (Decision 5) produces four factory agents. The Observer role is the critical correction — it separates the sensing function that was incorrectly merged with the builder in the prior analysis (tcloa-agent-architecture.md).

### Raw Signal Reference

`.context/tcloa-factory-team-design.md`, "The Four Factory Roles" section and "Summary: The Factory Team Architecture."

---

## Claim 3: Coordinator is orchestration, not an agent with production capabilities

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner approval during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

The coordinator in a factory team is NOT an agent with its own production, review, checking, or sensing capabilities. It is a dispatch/sequencing layer — analogous to how the library works today (no "library coordinator agent"; the human or a skill dispatches to the right agent based on the task).

Three implementation options were identified:
1. Explicit orchestrator agent (dispatch only, no production capabilities)
2. Skill-based orchestration (factory workflow skill sequences agents)
3. Human-as-orchestrator (current state for solo founder)

Recommendation: start with Option 3 (human) for Factory #1, move to Option 2 (skill) when sequencing becomes routine, Option 1 (agent) when multiple factories exceed human orchestration capacity.

This prevents the "player-coach" failure mode — the engineering manager who also writes code, where both coordination and production suffer.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Artifact - Play Definition | update — plays are a form of skill-based orchestration | 5 |
| Artifact - Play Pattern | update — factory workflow as play pattern | 4 |

### Context for Conan

This aligns with the existing library's implicit orchestration model: humans and skills dispatch to agents, agents do not dispatch to each other. The coordinator claim makes this pattern explicit and extends it to factory teams.

### Raw Signal Reference

`.context/tcloa-factory-team-design.md`, "The Coordinator Question" section.
