# Source Material: Bridge Agents and Library Team

**Date:** 2026-03-31
**Origin:** Product thinking session (Raven + Dan)
**Triaged by:** Solomon

---

## Claim 1: Full 6-role library team is universal deployment unit at every library node

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner correction of prior analysis — Credibility: 6, Tier: E1
**Tensions checked:** T-CONSISTENCY checked against Artifact - Decision 5: Four Agents, Not One (extends, does not contradict)

### Content

The full six-role library team (Sam, Conan, Nit, Solomon, Bridget, Raven) is the atomic deployment unit at every library node in a federated system. Remove any role and the system degrades:

- Sam needs Conan's diagnoses to know what to fix
- Conan needs Nit's mechanical checks as input to grading
- Solomon needs signal from Bridget's feedback queue and Raven's handoffs
- Bridget needs Sam's cards to assemble
- Raven needs the full graph to synthesize

The configuration varies by altitude — type vocabularies, retrieval profiles, quality rubrics, and wizard configuration all change — but the six-role structure is invariant.

Corrected model:

```
LIBRARY TEAM (exists at EVERY library node)
  Sam (Builder)       -- constructs and repairs the library's cards
  Conan (Critic)      -- diagnoses quality, plans repairs
  Nit (Checker)       -- mechanical verification
  Solomon (Sorter)    -- triages incoming signal
  Bridget (Assembler) -- outward-facing: assembles context for AI consumers
  Raven (Thinker)     -- outward-facing: thinking partner for human consumers
```

This corrects the prior analysis (tcloa-factory-team-design.md) which asserted "Bridget has no factory equivalent" and "Raven has no factory equivalent." Both are library roles that face outward and deploy wherever a library deploys.

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Agent - Bridget the Briefer | correction — Bridget is "outward-facing library role for AI consumers" not "bridge to the software factory" | 8 |
| Agent - Raven the Maven | correction — Raven is "outward-facing library role for human consumers" not "product question answerer" | 8 |
| Agent - Sam the Scribe | update — add federated context (deploys at every node) | 3 |
| Agent - Conan the Librarian | update — add federated context (deploys at every node) | 4 |
| Agent - Nit the Picker | update — add federated context (deploys at every node) | 4 |
| Agent - Solomon the Sorter | update — add federated context (deploys at every node) | 9 |
| Artifact - Boundary Agent Differentiation | update — library team as universal deployment unit, factory crew as add-on | 8 |
| Artifact - Decision 5: Four Agents, Not One | update — now six agents, universal at every node | 18 |
| Governance - Agent Capability Matrix | update — needs federated deployment context | 4 |
| Standard - Agent Customer Gate (Human vs. Builder) | update — gate applies at every altitude | 3 |

### Context for Conan

This is the most impactful correction from the session. It reframes the organizational architecture from "library team + factory mapping" to "universal library team + factory add-on." All six agent cards need updates to describe their role in the federated architecture. Bridget and Raven require the most significant reframing — from factory-specific descriptions to altitude-agnostic library roles.

### Raw Signal Reference

`.context/tcloa-bridge-agents-at-every-node.md`, "The Corrected Model" section and "What This Means for the Architecture."

---

## Claim 2: Factory crew (4 roles) is additive at factory nodes only

**Authority:** Dan (product owner) — Reliability: A
**Evidence:** Direct product owner approval during session — Credibility: 6, Tier: E1
**Tensions checked:** None fired

### Content

Factory crews (Builder, Reviewer, Checker, Observer) attach to factory-level library nodes. They are the production layer that sits on top of the knowledge layer.

A factory node has TEN roles: six library team + four factory crew.
A corporate node has six roles: the library team only (no factory crew, because corporate does not produce marketplace output).

The asymmetry is clean:
- The library team is universal (every node has knowledge to maintain and serve)
- The factory crew is factory-specific (only factory nodes produce output)
- Bridget and Raven are library roles, not factory roles, and they deploy wherever the library deploys

### Library Impact

| Affected Card | Impact | Blast Radius |
|---|---|---|
| Artifact - Boundary Agent Differentiation | update — add factory crew as additive layer | 8 |
| Domain - Library Boundary | update — boundary now includes factory crew interface | 2 |

### Context for Conan

This clarifies the organizational topology. The library team is the invariant; the factory crew is the variable. This distinction matters for the build sequence: Phase 1-3 work on one factory node (10 roles). Phase 4 adds a second factory node (another 10 roles) plus begins to need corporate-level roles (6 roles, library team only). The Boundary Agent Differentiation artifact needs the most significant update to capture both layers.

### Raw Signal Reference

`.context/tcloa-bridge-agents-at-every-node.md`, "The Corrected Model" section.
