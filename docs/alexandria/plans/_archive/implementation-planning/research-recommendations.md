# Implementation Planning: Recommended Improvements from Fowler Research

Research across 26 articles from martinfowler.com/tags/project-planning. Each recommendation
traced to the source article(s) and rated by impact.

---

## Tier 1: Fundamental Additions (change how the skill works)

### 1. Success Outcomes Layer
**Source:** Alignment Map

Add an intermediate layer between the user's goal and the tickets. "Success Outcomes" are
observable product changes that together constitute achieving the goal. Each ticket traces
to an outcome. This prevents the "search-in-one" failure — tickets that are technically
correct but drift from the actual objective.

```markdown
## Success Outcomes
| ID | Outcome | How We'd Validate It |
|----|---------|---------------------|
| O-1 | Tenants are fully isolated at the data layer | Query as Tenant A returns zero Tenant B data |
| O-2 | Users can switch tenants without re-auth | Session persists across tenant switch |
```

Tickets get `outcome: O-1` in frontmatter. Orphan detection (tickets without outcomes,
outcomes without tickets) goes in the DAG tool.

### 2. Scope Tiers (Must / Should / Could)
**Source:** Fixed Price, Fixed Scope Mirage, Five Pound Bag

Every plan should structure tickets into three tiers:
- **Must** — without these, the goal is not meaningfully achieved
- **Should** — significantly improves the outcome but could be deferred
- **Could** — rounds out the vision, first to cut

This replaces the implicit "everything in the plan is committed" assumption. The skill
should force scope negotiation when ticket count exceeds capacity, not silently produce
an overcommitted plan. Add `tier: must | should | could` to ticket frontmatter.

### 3. Structured Scope Definition (Is / Is Not / Does / Does Not)
**Source:** Lean Inception

Replace the flat "In scope / Out of scope" with a four-quadrant framing:
- **This plan IS:** "a multi-tenant data isolation layer"
- **This plan IS NOT:** "a billing or subscription system"
- **This plan DOES:** "add tenant scoping to all queries"
- **This plan DOES NOT:** "migrate existing single-tenant customers"

The negative framing forces harder thinking than "Out of scope" alone.

### 4. Required vs Presumptive Gap Classification
**Source:** YAGNI

During gap analysis, classify each identified gap as:
- **Required for goal** — cannot achieve the stated goal without this
- **Presumptive** — related and plausible, but not strictly necessary

Presumptive items go to a "Deferred Unless Validated" section, not into tickets.
This gives the skill a principled reason to push back on scope — "this is real work,
but it's not needed yet." Without this, the skill decomposes the entire gap into tickets
regardless of whether each piece is necessary.

### 5. Hypothesis + Validation Criteria in Release Doc
**Source:** Lean Inception (MVP Canvas), Scope Limbering

Frame each implementation plan as an experiment:
```markdown
## Hypothesis
We believe row-level security will handle our first 100 tenants without
significant query performance degradation.

## Validation Criteria (check after Phase 2)
- [ ] p99 query latency < 200ms with 50 simulated tenants
- [ ] Zero cross-tenant data leakage in integration tests
```

If validation fails, downstream tickets may change. This reframes the plan from
"a march" to "an instrument for learning."

---

## Tier 2: Process Improvements (change how the planning conversation works)

### 6. Roller-Skate Staging
**Source:** Roller Skate Implementation

When a feature is large or risky, ask: "Can we deliver the *value* with a simpler
implementation first?" Each stage delivers full user value — it's the implementation
sophistication that increases. This is not horizontal slicing; it's shipping a working
degraded version before building the polished one.

Add to the planning conversation as a third response to complexity:
1. **Decide now** — pick an approach
2. **Spike first** — investigate before committing
3. **Stage it** — ship the simpler version, plan the sophisticated version later

### 7. Capacity Envelope + "What Do I Take Out?"
**Source:** Five Pound Bag, Timeboxed Iterations

Ask in Step 1: "How many people? What's the time horizon?" Compute a rough capacity
envelope. After ticket decomposition, if tickets exceed capacity, force the conversation:

> "This plan has 22 tickets. At ~8 tickets in the time window, you can fit 8.
> Which features could be deferred? Or should we extend the timeline?"

The skill should refuse to hand back an overcommitted plan without making the user
choose. This is the Five Pound Bag discipline.

### 8. Decision-Driven Estimation (opt-in, not default)
**Source:** Purpose of Estimation

Before estimating, ask: "Are there decisions that depend on knowing how long this takes?"
If no — skip estimation entirely. If yes — estimate only at the granularity the decision
needs (S/M/L, not hours). The skill should never produce estimates by default.

### 9. "Imagine the Refactoring" Test for Enablers
**Source:** YAGNI

Before creating a spike enabler, ask: "If we skip this and just build with approach A,
how expensive would it be to refactor to approach B later?" If cheap — skip the spike,
ship the feature, refactor if needed. This directly reduces enabler count and shortens
the critical path.

### 10. Codebase Health / Malleability Assessment
**Source:** Is Quality Worth Cost, YAGNI, Slack

Ask Conan for context about codebase health in the goal area: test coverage, tech debt
hotspots, deploy difficulty. This shapes planning conservatism:
- **High malleability** (good tests, easy deploys) → defer aggressively, fewer enablers
- **Low malleability** (brittle, untested) → more conservative, more up-front investigation

Creates cleanup/remediation enablers where needed: "Fix auth middleware before building
on top of it."

---

## Tier 3: Release Doc Enrichments (better output)

### 11. RAID Table (Risks, Assumptions, Issues, Dependencies)
**Source:** Programs in Product Mode

Add a structured section to the release doc for things that aren't decisions but
need tracking. Prompt during planning: "What could go wrong? What are we assuming?"

### 12. Phase Transition Checkpoints
**Source:** Timeboxed Iterations, Continuous Flow, Scope Limbering

At each phase boundary, prompt a checkpoint:
- What did we learn that changes our understanding?
- Does the goal still make sense?
- Should Phase N+1 tickets be refined or dropped?

Pre-wire "re-planning triggers" in the release doc.

### 13. Deferred Section with Chain Rule
**Source:** Five Pound Bag (+ LifeBuild's CANNOT DO pattern)

Track what was explicitly deferred. When running the skill again, scan prior plans
for unresolved deferred items and surface them.

### 14. Slack Budget
**Source:** Slack, Timeboxed Iterations

Reserve 1-2 ticket slots per phase as intentionally unallocated. Make it visible:
"Phase 2: 6 tickets allocated, 2 slots reserved for signals from Phase 1."

### 15. Walking Skeleton Enabler
**Source:** Programs in Product Mode

When a goal spans 3+ systems that must integrate, generate a "skeleton" enabler in
Phase 1 that wires the end-to-end path with stubs. All feature tickets blocked by it.

### 16. Parallel Width / Ramp-Up Warnings
**Source:** Large Agile Projects, Premature Ramp Up

The DAG tool should compute parallel width per phase. Flag phases where width exceeds
team size or where ramp-up between phases exceeds 2x.

### 17. Execution Strategy Recommendation
**Source:** Continuous Flow, Timeboxed Iterations

Based on the plan's certainty profile, recommend an execution mode:
- High certainty → continuous flow (pull queue)
- High uncertainty → timeboxed iterations with reviews
- Mixed → flow with checkpoints after enablers

---

## Tier 4: Nice-to-Have Enrichments (optional fields, not core)

### 18. Effort / Value / Uncertainty Scoring
**Source:** Lean Inception

Optional lightweight annotation: effort (S/M/L), value (S/M/L), uncertainty (low/med/high).
Surfaces during planning conversation for the user to adjust. Drives enabler creation for
high-uncertainty tickets.

### 19. Persona Traceability
**Source:** Lean Inception

Each feature ticket traces to a persona. Tickets without persona links need justification
(may be legitimate enablers). Helps verify vertical slicing — you slice along journeys.

### 20. Scope Confidence Markers
**Source:** Scope Limbering

Mark each scope area as high/medium/low confidence. Low-confidence areas get broader
acceptance criteria and are prime candidates for roller-skate staging.

### 21. Design Weight Classification
**Source:** Design Payoff Line

Classify tickets as design-weight high (many dependents, long-lived) vs low (throwaway).
High-weight tickets get design-quality acceptance criteria. Low-weight tickets explicitly
note "optimize for speed."

### 22. Downstream Impact Count in DAG Tool
**Source:** Design Payoff Line

Compute transitive dependent count per ticket. Flag tickets with >3 downstream dependents
as "design-critical" in the release doc.

### 23. Mermaid DAG Output
**Source:** Programs in Product Mode (information radiator)

Add `--format mermaid` to the DAG tool for visual dependency graphs in the release doc.
Renders natively in GitHub markdown.

### 24. Retrospective Section
**Source:** Five Pound Bag, Yesterdays Weather

Add a retrospective template to the release doc. After execution: planned vs actual
ticket count, what was cut/added, tickets/week. Future plans use this as velocity input.

---

## What We Should NOT Do

- **Don't add story points or velocity tracking infrastructure.** Keep everything in
  markdown. The skill does rough S/M/L if asked, nothing more.
- **Don't build iteration/sprint management.** The skill produces plans, not project
  management. Execution is the user's domain.
- **Don't over-formalize the conversational steps.** Gates should be lightweight
  confirmations, not ceremony.
- **Don't add all of these at once.** Tiers 1-2 should inform the skill design. Tiers
  3-4 are options the skill can surface but shouldn't require.

---

## Decisions (from dialogue with user, 2026-03-25)

### Accepted into v1 core skill:
1. **Success Outcomes layer** — skill proposes outcomes, user reacts. Own files in outcomes/ dir
2. **Scope tiers (Must/Should/Could)** — at outcome level, inherited by tickets with overrides
3. **Required vs Presumptive** — input to scope tiers, not parallel classification
4. **Roller-skate staging** — conversational decomposition strategy, not formal type
5. **"Imagine the refactoring" gut-check** — conversational when proposing enablers
6. **RAID table** — in release doc, linked risks propagated to ticket context
7. **End-to-end first principle** — strong default for sequencing
8. **Personas** — referenced in context when available, guides slicing
9. **Mermaid DAG** — `--format mermaid` in DAG tool, embedded in release doc

### Accepted as companion skills (separate issues):
10. **`/revise-plan`** — triggered by re-planning gates planted during planning
11. **`/complete-plan`** — closes out plan, captures deferred items + retrospective

### Deferred (need team context or future planning modes):
- Structured scope definition (Is/IsNot/Does/DoesNot) — future enhancement
- Hypothesis/bet-driven planning — future alternative planning mode
- Capacity envelope + scope negotiation — needs team context
- Decision-driven estimation — needs team context
- Slack budget — needs team context
- Parallel width / ramp-up warnings — needs team context
- Execution strategy recommendation — needs team context
- Effort/value scoring — estimation territory

### Skipped:
- Scope confidence markers
- Design weight classification
- Downstream impact count in DAG tool

### New agents identified:
- **Bob the Builder** — codebase assessment + technical spike execution (future)
