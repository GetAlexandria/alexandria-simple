# Product Roadmap

Source material for knowledge area 5.3. From solicitation prompt conversation, 2026-03-24.

## Required to Ship

### 1. User-Funded Token Model

Users must power the library with their own AI subscription or API key. Conductor
already solves this for its users. At minimum, any user with their own API key should
be able to run the full pipeline. Us fronting the token bill on libraries is not
plausible at any scale.

### 2. Beadification (MCP Compatibility + Data Model Cleanup)

These are the same effort. The beadification plan (`docs/design/beadification-plan.md`)
covers both: Phase 1 is the data model cleanup (card schema, YAML frontmatter, parser,
SQLite index), Phases 2-5 build MCP compatibility, beads integration, agent migration,
and composability
on top of that foundation.

The critical nuance: this is a moving target. The MCP landscape, factory options, and
agent harness capabilities are shifting fast. We need at least one agent or team member
keeping track of the landscape — adoption trends, new factory entrants, protocol
changes — so we don't ship compatibility with yesterday's ecosystem. It's not just
shipping capabilities, it's monitoring and updating them.

Note: the beadification plan was originally written for the LifeBuild monorepo
(`packages/context-library/`). It needs adaptation for the standalone plugin repo.

### 3. The Demo ("15-Minute Library")

The product needs a category-creating demonstration. Take a real open-source project.
Run the wizard. Show the before/after of an AI agent making a decision with and without
the library. The demo must make people feel the pain of the gap they currently don't
notice — nobody is angry about not having a context library yet, so we have to create
category awareness through demonstration, not explanation.

This should be recorded and shareable. It's our primary adoption artifact.

### 4. Cold Start Reduction

The wizard currently requires a significant upfront conversation. We need to close
the gap between "I'm interested" and "I have something useful."

Two approaches, probably both:

**Scan and seed agent.** An agent that reads an existing codebase and generates a draft
library — even low quality. A bad draft you can edit is infinitely better than a blank
page. This is the highest-impact cold start reduction because it requires zero human
input to produce something.

**Template libraries by domain.** Pre-built card sets for common project types (SaaS app,
mobile app, API platform, CLI tool). Users customize rather than create from scratch.

Both of these feed the exemplar library strategy described in the backlog section.

## Extremely Important, Could Survive Without

### 5. Integration with Team/Documentation Tools

Compatibility with popular team and documentation solutions — Notion, Linear, Confluence.
Build capacity to sweep and vacuum context from these environments. We need this to run
tests with larger teams that live in these tools. It's okay to start with 1-3 integrations,
but we need something — to have tackled the "how do I get my existing knowledge into the
library" problem.

This is also a cold start reducer: if a team already has their product knowledge in Notion,
importing it into the library is faster than answering wizard questions from scratch.

### 6. Factory of Record

If someone hasn't yet selected a factory and wants one as a result of having the library,
we should have a pre-paired full-stack solution available. Think Rails recommending
PostgreSQL, not Vercel locking you into Next.js. We offer support for the whole stack.
We point users to the open source factory we're most familiar with, in part to lower
support burden and increase likelihood of success.

This matters because the library's value is realized through the factory. A library
without a factory is a reference manual nobody reads. A library paired with a factory
is a production system.

## Core Quality of Life (Backlog)

### 7. Exemplar Library Registry

We need example library builds to pull from. This is useful in several ways:

- Users can view or temporarily borrow a relevant build for a section they haven't
  thought through
- Libraries can be pre-populated with known patterns for a particular category,
  increasing velocity when a user is building something that isn't particularly novel
- Agents could be editing rather than writing from scratch, saving time and tokens
- We may be able to take an elicitation-to-elicitation approach — we might not have
  a full editable context library for B2B finance apps, but we have some elements
  fairly locked down or with exemplar material

**How to bootstrap the registry:** Conduct a study to determine which builds would get
the most useful coverage. Then run factory jobs — Jess or Danvers doing wizard sessions
to put together libraries for generic apps, the median apps AI are making in common
categories. Could even be us making ideas we want to make and getting coverage that way.
Manufacture some initial exemplars, then start updating (with permission) with high-
performance real ones that users create.

**Distribution model:** Cards are already Markdown files in a folder — inherently
copy-pasteable. A browsable catalog of card templates organized by domain, installable
via CLI, where community members contribute cards about domains they know without
needing to understand Alexandria codebase.

### 8. Parallel Build Pipeline

Right now there's an elicitation process, then later, a build. What if we built the
library at the end of every wizard stage, flagging questions, and giving the user a
slate of questions for an entire phase to complete the library level for that phase?

This isn't an architecture change. The pipeline already handles incremental source →
atomic cards. Conan already has the skills to take one set of documents and make them
atomic, then wire the next set up with the first. We've done this in practice: one
huge context dump for the meta-library, then a small one, then a third. Running 22
small dumps is architecturally no different.

The implementation question: does the wizard emit source material per-stage instead of
one big dump at the end? If yes, the existing plays handle the rest. We could show
building progress on a bar somewhere. Different agents could work in parallel on
different stages.

### 9. Programmatic Improvement Flagging

We've recently added ability to improve and test agent, library, and factory elements.
But we don't have a programmatic way to flag for that cue and work improvement
opportunities. The system should surface "this card was consulted during 5 failed
builds" or "this Standard hasn't been conformance-checked in 3 months" without a
human asking.

### 10. Automatic Maintenance on Idle Tokens

For library improvement and sweeping, set it up so maintenance gets done automatically
using likely-to-be-unused tokens. Nit's Alignment Sweep (Play 4.6) and Integrity
Gate (Play 4.7) are already designed for unattended execution — they just need
scheduling infrastructure.

### 11. AI-Assisted Elicitation

The wizard's elicitation process currently asks a lot of the user. Even without exemplar
work baked in, our AI could offer example work to look at and react to — based on what
it knows about the product — as a way to reduce friction and increase velocity. "Here's
what a typical SaaS onboarding card looks like. Does this match your product, or what's
different?" Reacting is easier than creating.

### 12. Alexandria of Alexandria

At least the shapes and patterns of potential library+factory pairings. Putting this out
there could invite inventors to invent and fill in — like a plugin ecosystem, but for
knowledge structures rather than code.

## Core Growth Areas (Design, Don't Build Yet)

### 13. Visual Traversable Interface

The library and/or factory have a visual, traversable interface. Like LifeBuild's UI
but for the knowledge graph itself. Users can see the card graph, trace relationships,
spot gaps visually.

### 14. Product Expert Wizard Agent

The wizard comes with an agent who is a product expert — asks tough questions, gives
you a critique when you're done. Not just elicitation but active challenge of your
product thinking. "You said your target user is non-technical, but your onboarding
requires three configuration steps. How do you reconcile that?"

### 15. Print a Company

You don't just use the wizard and library to build your software — you use it to build
the product team that launches and supports it. You build a company. The progression
from "backstop AI builders" to "build the product team" to "print a company" is a
clear expansion arc.

Important context: we're pre-PMF on the core product. It's possible that the "print
company" capability is more market-interesting than what we're currently building. But
we need to crawl before we walk, and without a great product context library, the
printed colleagues won't be great.

### 16. Adjacent System Expansion

Expand library+factory to adjacent in-organization systems. The writing expansion,
marketing expansion, colleague expansion. The library isn't just for software — it's
for any domain where AI agents need structured product knowledge to make good decisions.

## Project Infrastructure

These are project-level concerns required for the open source project to grow, distinct
from product features.

### 17. Community Contribution Model

The product is knowledge, not code. Contributors should be able to write cards about
domains they know without understanding Alexandria codebase. The registry
model (item 7) enables this, but we also need: contribution guidelines for card
authors, quality review process for community cards, a way to credit contributors.

### 18. Adoption Trigger

The demo (item 3) is the adoption trigger, but the broader pattern is repeated,
shipped-feature demonstrations — not one big reveal. Each demonstration builds on
the previous one's audience.

## What Would Change This

- **PMF signal on the core product.** If we find that users aren't retaining after the
  wizard, the roadmap priorities shift from expansion to retention mechanics. Everything
  after "Required to Ship" is contingent on the core loop working.

- **A competitor emerging with a simpler cold start.** If someone ships a "scan your
  codebase, get a context library" tool that's good enough, our wizard-first approach
  becomes a liability. Cold start reduction jumps to #1 priority.

- **The MCP landscape stabilizing (or fragmenting).** If MCP becomes truly universal,
  beadification gets simpler. If the ecosystem fragments into competing protocols,
  beadification gets much harder and the "monitoring the landscape" concern becomes
  a full-time job.

- **"Print a company" proving more interesting than "backstop builders."** If the
  market response to the expansion vision is stronger than the core product, we
  might need to skip ahead and build the company-printing capability before
  perfecting the library mechanics.

- **Spreading too thin before proving deep value.** If we expand to multiple
  factories/harnesses before proving value on one, we risk building integrations
  nobody uses in production. Nail Claude Code first, expand later.

- **Real usage data.** Everything above is hypothesis. We have one deployed meta-library
  (this one) and one customer library (LifeBuild, now sunset). The roadmap should be
  treated as a living document that reshapes based on what the first 10 real users
  actually do.
