# Institutional Memory

Source material for knowledge areas 5.2 (Lessons Learned) and 5.4 (Operational Knowledge).
From solicitation prompt conversation, 2026-03-23.

## Lessons from Library #1 (LifeBuild)

### No linter, and it shows

The first library was built without Nit (or any linting function). The result: structural
inconsistencies that a mechanical checker would have caught immediately. Card format drift,
missing frontmatter, inconsistent wikilink conventions. Conan was doing grading work that
should have been pre-screened. The honey-do lists in the org chart are largely derived from
these gaps.

### Agents rarely follow the playbook

Even with plays defined, the agents in practice don't consistently follow the playbook.
This is a core problem the meta-library needs to solve — the playbook exists as design
documentation, but it's not yet the operational contract that agents execute against.
Software-ification of plays (making them machine-executable, not just human-readable) is
critical.

### Folder structure misadventures

Early runs produced organizational schemes that were *about* the cards rather than *of*
the cards. One run created past/present/future folders — temporal organization imposed on
the folder structure instead of on the cards themselves. The lesson: structure must live in
the card metadata and wikilink graph, not in the filesystem hierarchy. Filesystem is for
human navigation convenience; the graph is the real structure.

### Ship small and slow

Lots of small PRs. Every PR is a rollback unit. When you're generating 20+ cards in a
run, you need the ability to catch and revert problems at the individual card level. Atomic
cards are great for this — the splash zone of a change is bounded. But atomic cards also
mean the splash zone of an *error* is bounded, which cuts both ways: you can fix one card
without touching others, but you can also have errors hiding in 20 cards that each need
individual attention.

### QA at scale is the hardest user problem

The single biggest friction point as a human user: getting hit with 120 new product cards
and having no way to quickly assess whether they're directionally correct. No cliff's
notes. No simplified overview. No "here's the 30-second version of what just got built."
The system produces output faster than a human can review it.

This is a product problem, not a quality problem. Conan can grade cards, Nit can lint
them, but nobody is producing the human-accessible summary that lets the product owner
say "yes, this is right" or "no, you've gone sideways" without reading every card.

### Atomic cards are more for AI than humans

The atomic documentation model (one concept per card, wikilink edges, typed frontmatter)
is optimized for AI retrieval and assembly. It's genuinely better for agents building with
the library. But for human users, it fragments understanding — you can't read the story
of your product by reading cards sequentially. The graph structure that makes retrieval
powerful makes human comprehension harder.

This tension is real and unresolved. The current answer is "Bridget assembles briefings
that tell the human story from the AI-native graph." Whether that's sufficient long-term
is an open question.

## Lessons from This Conversation (Meta-Architecture)

### The team design emerged from real pain

The four-agent team (Conan, Sam, Nit, Bridget) wasn't designed top-down. It was
discovered bottom-up from real friction: Conan doing linting work (→ need for Nit),
no boundary between library and factory (→ need for Bridget), Sam getting diagnostic
context that biased the output (→ need for filtered handoffs). The org chart formalizes
what was learned through building.

### External inspiration matters but shouldn't be source material

gstack's skill-as-workflow pattern, Elicit's eval/iterate loop, the antagonistic writing
article — these shaped the playbook, the versioning model, and the quality architecture.
But they're too specific and contextually weird to cite as formal source material. The
right approach: lock down the principles, mechanics, and intentions that were *derived*
from this thinking. The inspiration is the footnote; the principle is the artifact.

### Alexandria is a bet, not a plan

The Library of Libraries taxonomy and the wizard configuration were designed with
Alexandria in mind — the hope is that the current system can "fit" the ultimate design
of a universal library taxonomy. But the taxonomy itself is a guess. It's stake-in-the-
ground thinking: strong enough to build on, expected to evolve as more library types are
deployed. The meta-library should treat Alexandria compatibility as a design constraint,
not a specification.

### Internalization lags creation

The user (product owner) has swum in this material, helped create it, but hasn't fully
internalized it. The front end of this conversation — reconfiguring the agent team,
formalizing the playbook, bringing in ideas from other agent systems — produced artifacts
faster than the human could absorb them. This is the same QA-at-scale problem in
miniature: the system can produce faster than humans can review.

Implication for the product: every generation step needs a "did this land?" checkpoint
that's genuinely lightweight, not just another document to read.
