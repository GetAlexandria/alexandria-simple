# Corporate Library & Federation Architecture

## Status: Research Complete, Architecture Established

Research phase completed 2026-04-10. Four research veins surveyed, candidate
corporate index produced, federation architecture established with 6 design
decisions. Ready for implementation.

## Artifacts in This Directory

### Architecture (start here)

- **[federation-architecture.md](federation-architecture.md)** — The 6 design
  decisions that define the federated zone model. This is the foundational
  document.

- **[corporate-index-synthesis.md](corporate-index-synthesis.md)** — Candidate
  corporate knowledge area index: 24 areas in 6 domains, configuration
  dimensions, pool mechanics, federation boundary analysis. NOTE: predates
  federation architecture decisions that reduced to ~18 areas in 5 domains.
  The federation architecture doc supersedes on structural decisions.

### Research

- **[research-vein-1-business-planning.md](research-vein-1-business-planning.md)**
  — SBA templates, Lean Canvas, BMC, pitch decks, strategic frameworks.
  ~25 knowledge areas identified. Systematic blind spots found.

- **[research-vein-2-operating-systems.md](research-vein-2-operating-systems.md)**
  — EOS, Scaling Up, OKRs, YC playbook, Strategyzer. Universal Knowledge
  Stack (7 layers). Four organizational complexity transitions.

- **[research-vein-3-org-knowledge.md](research-vein-3-org-knowledge.md)**
  — GitLab handbook, Valve, Netflix, Basecamp, KM literature. The "why dusty"
  analysis. Design principles for corporate libraries.

- **[research-vein-4-governance.md](research-vein-4-governance.md)**
  — Board decks, investor updates, 10-K structure, reporting tools. Freshness
  hierarchy. External accountability as anti-staleness mechanism.

## Key Findings

### The Three-Zone Model

Alexandria's federated library system has three zones, derived from the role
complexity model (sociotechnica.org/role-complexity/):

- **Market Zone** (extra-organizational) — Industry intelligence, competitive
  landscape, customer segments, regulatory environment. ~6 knowledge areas.
- **Corporate Zone** (enterprise level) — Company identity, business model,
  people, strategy, governance. ~18 knowledge areas in 5 domains.
- **Program Zone** (program/project level, one of many) — How specific
  buildable surfaces work. Product is one species of program. Marketing, ops,
  research are siblings.

### Core Design Principles

- **"Informs" not "inherits"** — Information flows bidirectionally between
  zones. A factory-floor insight can reshape market understanding. No hierarchy
  in information flow.
- **Two faces** — Nested index for humans (hierarchical bookshelf), knowledge
  graph for AI (associative, follows connections anywhere). Same knowledge,
  two access patterns.
- **The library IS institutional memory** — Not a category within itself.
  Decisions, lessons, and rationale are what every card captures. Not a
  separate section.
- **"Where you sit" refracts** — Market positioning resolves at different
  fidelity in each zone. Not duplication — refraction.
- **User never decides on federation** — The wizard scopes topology behind
  the scenes. Users answer questions about their business.

### Corporate Wizard Configuration Dimensions

1. **Organizational Complexity** (prescriptive) — Napkin → Whiteboard →
   Playbook → Operating System → Institution
2. **Functional Breadth** (advisory) — Single-function → Multi-function →
   Full-stack
3. **Governance Exposure** (advisory) — None → Advisory → Formal board →
   Public/Regulated

## Downstream Workstreams

### Workstream 1: Product Architecture Update

Update existing product docs to reflect the expanded zone model:
- `docs/design/alexandria.md` — Add zone model above genus index
- `docs/design/system-story.md` — Expand from single library to federated zones
- Wizard design docs — Product wizard scopes a Program zone, not the whole system
- Agent descriptions — Zone-aware system
- New ADR for "informs not inherits"

Use existing agent playbook plays for content updates. Largely additive — current
product docs aren't wrong, they're incomplete. The 22 product areas and genus
index still hold.

### Workstream 2: Corporate Wizard

Build the wizard engine for the Corporate zone:
- Finalize 18-area index with sensitivity profiles
- Build configuration engine (3 dimensions)
- Write solicitation prompts (mode-variant)
- Build gap analysis flow for corporate knowledge
- Wire into Raven's wizard skill

### Workstream 3: Federation Orchestration (future)

The meta-wizard that scopes the full zone topology and sequences work across
zones. Comes after workstreams 1 and 2 are solid.

## Research Methodology

Four research veins surveyed how organizations maintain institutional knowledge:

1. **Business planning frameworks** — What recurring knowledge areas do business
   plans maintain? Surveyed SBA, Lean Canvas, BMC, pitch decks, strategic
   frameworks.
2. **Operating systems & stage frameworks** — What operational knowledge must
   companies maintain? Surveyed EOS, Scaling Up, OKRs, YC, Strategyzer.
3. **Organizational knowledge management** — Why does institutional knowledge
   go stale? Surveyed company handbooks, wiki patterns, KM literature.
4. **Corporate governance** — What knowledge does external accountability force
   fresh? Surveyed board decks, 10-K structure, investor updates.

Cross-referenced findings across all four veins, mapped to the four-layer
skeleton (Identity / Domain / Experience / Temporal), and synthesized into
the candidate corporate index.
