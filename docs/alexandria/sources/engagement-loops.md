# Engagement Loops

Source material for knowledge area 3.3. From solicitation prompt conversation, 2026-03-23.

## The Four Loops (Plus One Bet)

The context library creates value through repeating cycles where a user need pulls them
into the library, the library provides something they didn't have before, and their
interaction makes the library better for next time. The agents are mechanisms inside
these loops — they're not the loops themselves.

### Loop 1: Release Planning

**Cadence:** Every sprint.

**Trigger:** It's time to ship the next set of features. The user needs to plan what
gets built and in what order.

**Action:** The user asks Bridget for a release briefing — "here's what we're building
next, what context do the builders need?" Bridget assembles from the library and returns
both the briefing and a gap manifest: here's what I found, and here's what's missing.

**Reward:** The user knows, before any builder starts work, which areas of context are
strong and which are thin. The gap manifest is the answer to "what will my agents get
wrong if I don't fill this in?" Builders get better context briefings, which means
better first-pass output, fewer corrections, less rework.

**Investment:** The user fills in the key gaps — adding source material, answering
solicitation prompts, updating stale cards. Each gap filled makes the next sprint's
release planning start from a more complete library. The library compounds: sprint 1
has thin context, sprint 5 has dense context, sprint 10 has a library that barely needs
updating because the foundation is solid.

This is the primary engagement loop. It's the one that turns the library from a
one-time artifact into a living system. The sprint cadence creates a natural rhythm —
you don't have to remember to maintain the library, the planning process pulls you in.

### Loop 2: Incident Response

**Cadence:** Event-driven. Something breaks or a problem is reported.

**Trigger:** A bug, an outage, a customer complaint, a failed test — anything that
requires understanding the product to solve.

**Action:** The user runs the problem through the library. Not as a brainstorming partner
or solution generator — the library isn't that. It's your source of truth for users
(who's affected and what they care about), past learning (have we seen this pattern
before, what did we learn), and future vision (where is this area of the product
headed). The library provides the footprint a solution can live within — the constraints,
the intentions, the context that a fix needs to respect.

**Reward:** Solutions that fit. Instead of a patch that fixes the immediate problem but
conflicts with the product strategy, or a prototype that solves it elegantly but violates
a standard the developer didn't know about, the builder has context to evaluate options
against. Multiple solutions can be tested because the evaluation criteria come from the
library, not from whoever happens to be in the room.

**Investment:** The incident itself becomes source material. What broke, why, what was
the fix, what did we learn? This feeds back into the library as institutional memory
(5.2/5.4) and potentially updates decision records (5.1) or anti-patterns (3.5). The
next incident in the same area starts from a richer knowledge base.

### Loop 3: Strategy Cascade

**Cadence:** Event-driven. A significant strategic shift — new market data, competitive
move, pivot, major user insight.

**Trigger:** Something changes at the strategy level. A new Product Thesis, a revised
vision, a market shift that invalidates assumptions.

**Action:** The user updates the source of the change in the library — a Product Thesis,
a strategy card, a market requirement. Then Conan runs cascade analysis: given this
change at the top, which downstream cards are now stale or misaligned? The blast radius
becomes visible.

**Reward:** The user can see exactly which areas of the product are affected by the
strategic shift. Not "everything needs to change" and not "just update the strategy
doc" — a specific, scoped set of downstream impacts. This is the core value: the graph
structure means a change at one node propagates visibly through the system. The user
is essentially designing a new release or series of releases to address all the changes
that need to get made, with the library showing them the full scope.

**Investment:** The updated cards and the cascade itself become part of the library's
history. The graph gets more connected with each cascade — relationships that were
implicit become explicit. The next strategic shift starts from a graph that better
represents the real dependencies in the product.

### Loop 4: Alignment Sweep

**Cadence:** Scheduled/automated. Nightly, idle tokens, pre-health-check.

**Trigger:** Nit runs automated integrity checks (Play 4.6: Alignment Sweep, Play 4.7:
Integrity Gate). These are unattended, mechanical checks that detect drift — structural
issues, stale cards, config drift, broken links, source-card freshness.

**Action:** Nit produces a machine-readable report. When drift is detected, the user is
brought in to provide guidance or approve fixes. This isn't reactive (the user didn't
notice a problem) — it's the library calling for attention before problems compound.

**Reward:** Drift is caught early, before it cascades. A card that's gone stale gets
flagged before a builder retrieves it and makes decisions based on outdated context.
A structural issue gets caught before Conan wastes grading cycles on it.

**Investment:** Each fix the user approves (or each piece of guidance they provide)
makes the automated checks more useful — the library stays healthier, so the next
alignment sweep finds less. The gap between "library state" and "reality" stays small
because drift is continuously detected and corrected rather than accumulating until
someone notices.

This loop is the quietest — the user isn't initiating it. But it's what turns the
library from something you maintain into something that maintains itself with your
approval. PR #25 adds the plays that make this loop concrete.

### Loop 5: Contested Truth

**Cadence:** Event-driven. A meeting, conversation, or decision surfaces a disagreement
or an unresolved question that affects the library.

**Trigger:** Play 5.6 (Signal Intake) classifies a claim as Contested or Open Question.

**Action:** Solomon parks the claim in the signal queue with positions, evidence, affected
cards, resolution criteria, and a revisit date. The library does NOT update to reflect the
claim — it records that the claim exists and is unresolved. Raven surfaces contested claims
during product conversations so humans are aware of what's unsettled.

**Resolution:** When evidence arrives (experiment results, executive decision, user data,
team alignment), the human resolves the claim. Solomon helps draft source material from the
resolution. The resolved claim routes to Play 5.2 (Source Update). The signal queue entry
is marked resolved with the outcome.

**Reward:** Disagreements become trackable. The library captures not just what was decided
but what was contested, what evidence was gathered, and how it was settled. Resolved claims
become the highest-quality source material because they carry the full reasoning chain.

**Investment:** Each resolved dispute becomes institutional memory with provenance. The
library grows stronger from disagreement, not weaker.

## What Would Change This

- **Real sprint data** showing which loops users actually complete and which they skip.
  The Release Planning loop is the hypothesized primary loop, but real usage might show
  that Incident Response is what actually brings people back most often.
- **Multi-user deployments** stress-testing the Contested Truth loop. The loop is now
  formalized (Play 5.6 + Solomon + signal queue), but real-world volume will reveal
  whether the triage process scales.
- **Automation maturity** changing the Alignment Sweep from "Nit runs, human approves"
  to "Nit runs, Nit fixes, human reviews." That shifts the investment step and changes
  the loop structure.
- **A new loop we haven't imagined.** The library is a novel product category — the
  engagement loops are hypothesized from first principles and one deployment, not
  validated across many users. There may be a daily micro-loop (quick card lookup before
  starting work) or a quarterly macro-loop (library-wide retrospective) that emerges
  from real usage.
