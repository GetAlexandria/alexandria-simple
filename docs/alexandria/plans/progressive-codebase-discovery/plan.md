# Codebase Discovery: What, Why, and How

## The Job To Be Done

A product context library captures the knowledge that helps teams and AI agents make
better product decisions. That knowledge has three temporal layers:

| Layer | What it answers | Best source |
|-------|----------------|-------------|
| **Future** | Where are we going? What's the strategy? | Documents, human input |
| **Present** | What exists today? How does it fit together? | Code + documents + human input |
| **Past** | What did we try? What did we learn? | Retros, ADRs, analytics history |

Today, the wizard handles Future well — it ingests strategy docs, roadmaps, and product
vision, then structures them into atomic, traversable cards. But it has a gap: **it has
no way to verify what actually exists right now.** A product owner can describe their
notification system, but only the codebase can confirm whether that system is live, dead,
or half-built.

Codebase discovery closes that gap. Its job is narrow and specific:

> **Given a product owner's description of their product, confirm what actually exists
> in the codebase today, surface what they forgot to mention, and flag what they described
> but doesn't exist yet.**

That's it. It's a present-tense reality check.

## Who This Is For

**If a user has documentation but no code** — they use the current wizard. Nothing changes.

**If a user has code but no documentation** — they need a way in. Today, the wizard asks
them to provide documents they don't have. Codebase discovery gives them an entry point:
the agent scans their code, proposes product-level nouns ("you have Users, Projects,
Notifications, Billing"), and the human confirms, corrects, and adds the intent layer
("Notifications is our core engagement system, not a utility").

**If a user has both** — codebase discovery validates docs against code and surfaces
divergences: features described in docs but missing from code, features in code that
docs don't mention, and features that have evolved past what docs describe.

### User Stories

**Solo builder, code-first:**
> As a developer who built my product before writing any docs, I want the wizard to look
> at my codebase and propose what my product does, so that I can confirm and annotate it
> with product intent rather than writing documentation from scratch.

**Product owner, docs exist:**
> As a product owner with existing strategy docs, I want the wizard to check my docs
> against what's actually in the codebase, so that I know where my documentation has
> drifted from reality.

**Team lead, onboarding AI agents:**
> As a team lead setting up AI-assisted development, I want the context library to
> accurately reflect what our product looks like today, so that builder agents don't
> make decisions based on outdated descriptions.

## What We Are Looking For (From Code)

The codebase tells us about the **present**. Specifically:

| Signal | What it tells us | Example |
|--------|-----------------|---------|
| Models / schemas | What entities exist | "There's a `Subscription` model with status, plan_id, renewal_date" |
| Routes / endpoints | What the product exposes | "There's a `/api/billing/upgrade` endpoint" |
| UI components / pages | What users see | "There's a `DashboardPage` with analytics widgets" |
| Module structure | How things are organized | "Billing, Auth, and Notifications are separate domains" |
| Dead code / unused models | What's been abandoned | "There's a `Referral` model with no routes or UI" |

The agent proposes product-level nouns from these signals. The human confirms which are
real product concepts vs. implementation details. This takes less than 10 minutes for a
typical project.

**What we are NOT extracting from code:**
- Commit history, PR narratives, or git archaeology (the past is better captured
  contemporaneously through retros and ADRs, not reconstructed)
- Performance characteristics or usage patterns (that's analytics)
- Technical implementation details (the library is product-level, not technical)

## What Codebase Discovery Does NOT Need To Do

Analytics is a separate input channel to the library — not something the code walk
replaces or replicates. The library absolutely should contain analytics context: which
dashboards matter, what the key metrics are, how features are performing, and where red
flags are emerging. When an AI team sees a performance red flag in the library, they
should be able to take a crack at fixing it.

But that context comes from **analytics tooling and tuned reports**, not from walking
the codebase. The code walk's job is structural ("what exists and how does it connect"),
not behavioral ("how is it performing and who's using it").

This matters for scoping the scanner. The code walk does NOT need to:

| Not in scope for code walk | Why | Where it comes from instead |
|---------------------------|-----|----------------------------|
| Feature usage / adoption rates | Behavioral, not structural | Product analytics (Amplitude, Mixpanel, etc.) |
| Conversion funnels / drop-off | Requires user session data | Funnel analytics + tuned reports |
| Performance / latency trends | Operational, not product-structural | APM / observability dashboards |
| User sentiment / complaints | Qualitative, external | Support tickets, NPS, user research |
| A/B test results / launch impact | Requires time-series comparison | Experiment platforms + cohort analysis |

These are all legitimate library content — they just arrive through a different door.
The analytics path into the library looks like constructing and maintaining a tuned
report: identify which metrics matter for which product areas, connect them to the
relevant library cards, and keep them current. That's a different feature from codebase
discovery, and conflating the two would make both worse.

## How We Validate This (Eval Approach)

There are two different things to evaluate, and they require different methods.

### Mechanical eval: progressive investigation efficiency

This we can measure without a product owner in the loop:

- **Token cost per tier**: how much does each escalation level cost?
- **Escalation rate**: how often does tier 1 (tree) resolve without needing tier 2+?
- **Self-consistency**: does tree + schema scanning find the same nouns as a full walk?

These are automated checks we can run against any codebase. They tell us whether the
progressive approach is actually saving tokens without losing accuracy.

### Quality eval: does the library match reality?

The core question — "did the wizard produce a library that accurately represents this
product?" — can only be answered by a product owner who knows the product. Open source
repos with marketing sites test whether the scanner can match *public descriptions*,
but that's not the job. Marketing sites describe what a product *sells*, not what it
*is*. And open source projects rarely have product-owner-level internal documentation
publicly available.

The honest eval plan:

1. **Our own projects first.** Run the progressive wizard against our own codebases
   where we are the product owners. We know the right answers.
2. **Friendly projects.** Ask collaborators to run it and tell us what it got right
   and wrong.
3. **Measure what we can mechanically.** Token cost, escalation patterns, and
   self-consistency across project sizes and tech stacks.

This gives us real quality signal without pretending we can eval product understanding
from the outside.

## Implementation Sequence

| Milestone | What ships | Value |
|-----------|-----------|-------|
| **M1: Routing** | Two yes/no questions determine the input path | Users aren't asked for docs they don't have |
| **M2: Scanner** | Tiered codebase scan produces structured noun proposals | Agent can read a codebase and describe it in product terms |
| **M3: Noun Proposal** | Interactive dialogue: propose → shape → confirm → configure | Solo builder goes from code to library config in <10 min |
| **M4: Code Walk** | Frame-guided exploration validates doc claims against code | "Your docs say X, your code says Y" |
| M5: Reconciliation | Formal divergence classification and gap score adjustment | Deferred until Phase 2 eval framework exists |
| ~~M6: Git Archaeology~~ | ~~Mine commit history for decision context~~ | Descoped — past context is better captured contemporaneously |

M1-M3 are the core value. M4 is high-value for doc+code users. M5 is gated on eval.
M6 is cut.
