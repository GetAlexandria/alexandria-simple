# Alexandria Principles

Design principles governing how context libraries are built, maintained, and served.
These are the bets and rules of thumb that justify the plays, the team structure, and
the architectural decisions. They belong in the rationale layer of the meta-library.

Each principle follows the pattern: **the rule**, then **why it matters**, then **what
breaks when you violate it**.

---

## Construction Principles

### Front-load value, not completeness

The first 5 cards should produce a usable briefing, not "wait until the library is graded
before Bridget can do anything." Every construction play should leave the library in a
state where Bridget can serve the factory — even if the coverage is thin.

**Why:** The cold start problem kills knowledge systems. You've configured the initialize flow,
assessed the source, and now you're staring at 40 empty cards. The dropout rate at that
moment is brutal. If the library can't do anything useful until it's "done," most libraries
will never get done. Early value sustains the effort to build the rest.

**What breaks:** Libraries that are 80% built but 0% useful. The human loses motivation
because the investment hasn't paid off yet. The factory works without context for weeks
while the library is under construction, and by the time it's ready the factory has
developed habits that don't use it.

---

### Build upstream before downstream

Standards first, then Product Theses and Principles, then product-layer cards. Downstream
cards reference upstream cards. A product-layer card with a well-intentioned WHY link to a
stub Product Thesis is worse than a card with no WHY link — it signals coverage that
doesn't exist.

**Why:** Downstream cards inherit upstream quality. A stub Product Thesis infects every
card that links to it. Building in order means every reference can be followed and verified
as Sam writes. Building out of order means references point at things that don't exist yet,
creating structural debt that compounds with every card.

**What breaks:** Hollow WHY chains. Cards that appear connected but the connections lead
nowhere. Conan grades these as structural deficiencies, which means the entire improvement
loop has to re-do work that should have been done right the first time.

---

### One concept per card

A card that answers multiple complete questions should be split. Signals: 700+ words,
multiple subsections that could stand alone, different tasks need different portions.

**Why:** Atomicity makes the graph navigable. A monolithic card that covers three concepts
forces every assembly that touches any one of those concepts to retrieve all three. That
wastes card budget and dilutes attention. Atomic cards also grade more cleanly — a card
about one concept is either good or bad on each dimension, not "good on WHAT for concept A
but weak on WHY for concept B."

**What breaks:** Over-included briefings. Inaccurate grades (the card scores B overall but
one concept within it is an F). Difficult maintenance — fixing one concept in a multi-concept
card risks breaking the others.

---

## Quality Principles

### The critic and the builder must be structurally separated

Conan evaluates. Sam builds. The `ax lint` CLI verifies mechanically. Bridget
assembles. Each agent has exactly one mandate; mechanical verification is handled by
tooling. No overlap. No dual mandates.

**Why:** When the same agent grades and fixes, it unconsciously softens its own findings.
When the same agent assembles context and judges quality, it biases toward the cards it
already knows. Structural separation ensures that evaluation is honest, construction is
focused, and verification is independent. This is the antagonistic quality pattern — the
editor cannot write, the writer cannot grade, and the linter cannot do either.

**What breaks:** Grade inflation. Cards that "pass" because the grader is also the fixer
and doesn't want to create more work. Briefings that over-represent cards the assembler
happened to encounter during a prior quality pass. The whole quality system becomes
performative rather than functional.

---

### Filter the handoff, don't wall it

Sam receives domain context ("what good looks like"), specific tasks, and acceptance
criteria. Sam does NOT receive Conan's grades, cascade analyses, or diagnostic framing.
Sam writes to the source material, not to Conan's opinion. But the handoff is rich with
context about why the domain works the way it does.

**Why:** An information wall produces technically correct but contextually hollow cards.
Sam needs to understand why a conformance link matters, not just that one is required.
But evaluative judgments bias the output — if Sam knows Conan gave a C+, Sam writes to
hit B+ rather than writing what's true.

**What breaks:** Too little context: Sam writes generic link phrases that don't convey the
relationship. Too much evaluation: Sam writes to Conan's framing rather than to the source
material, producing cards that please the critic but don't serve the factory.

---

### Structural quality before functional quality

Correct types, sections, links, and conformance first. Content substance second. A
structurally correct card with hollow WHY passes structural checks but fails functional
assessment. Fix structure, then fix substance.

**Why:** Structural defects are cheap to find (`ax lint` catches them mechanically) and
expensive to ignore (they cascade into graph integrity issues, broken assemblies, and
misleading coverage metrics). Content defects require judgment to find and are localized in impact.
Running Conan's grading on structurally defective cards wastes expensive judgment cycles
on problems that should have been caught mechanically.

**What breaks:** Conan spends grading time reporting broken links instead of evaluating
whether WHY sections are substantive. Sam's fix cycle addresses mechanical issues mixed
in with content issues, making it hard to know when structural quality has been achieved.

---

### The linter is adversarial by design

The `ax lint` CLI doesn't collaborate. It doesn't negotiate. It checks everyone's
output against mechanical, deterministic standards and reports what it finds. A broken
link is a broken link. A grade that doesn't match the evidence is flagged. Lint answers
to the evidence, not to the team.

**Why:** Every agent on the team has incentives that can bias their output. Conan might
unconsciously inflate grades during a crunch. Sam might ship a card with a naked wikilink
because the surgery plan was ambiguous. Bridget might skip a mandatory category because
the traversal ran long. The lint tool has no incentives, no judgment, no mercy. That's
the point — an independent mechanical check that nobody can argue with.

**What breaks:** Quality becomes a matter of opinion rather than evidence. Grades drift
from reality because nobody cross-checks them. Structural defects accumulate silently
because everyone assumes someone else caught them.

---

## Service Principles

### Serve incomplete libraries honestly

Bridget must assemble from an incomplete library and be honest about what's missing.
"No card exists for [topic]. Builder should proceed with caution on [dimension]." An
honest gap manifest is more useful than refusing to serve.

**Why:** Real usage is interrupt-driven. A founder builds 10 cards, needs a briefing for
a board deck tomorrow, goes back to building. If Bridget refuses to serve until the library
passes quality, the library never becomes part of the workflow. If Bridget serves but hides
the gaps, the builder makes confident decisions on missing context. The middle path — serve
with explicit gaps — provides value while preserving honesty.

**What breaks:** Either the factory works without context entirely (Bridget refuses to
serve), or the factory works with false confidence (Bridget serves but doesn't flag gaps).
Both are worse than partial context with transparency.

---

### Factory demand drives library priority

When Bridget discovers gaps during assembly, those gaps tell Sam what to build next. The
next card Sam writes should be what Bridget couldn't find, not just the next item on the
inventory.

**Why:** Speculative inventory-driven building produces cards in the order they were
planned, which may not be the order they're needed. The factory knows what it needs right
now because it just tried to get it and failed. That demand signal is higher-quality
prioritization than any pre-planned build order.

**What breaks:** Libraries that are 100% complete on Zone A (which no one is building in)
and 0% complete on Zone B (where the whole team is working). The investment goes where the
plan says, not where the need is.

---

### Attention is a resource with a shape

Briefings follow U-shaped attention ordering: strongest at the beginning and end, weakest
in the middle. Primary cards and task frame go first. Relationship maps and supporting
summaries go in the middle. WHY chains, constraints, and anti-patterns go at the end.

**Why:** This is not aesthetic — it's engineering for how LLM attention works. The most
important content (what to build, what constraints apply) needs to land at the highest-
attention positions. Content that provides context but doesn't drive decisions can go in
the trough. This applies to card budgets too: over-inclusion dilutes attention. A briefing
with 20 cards buries the 3 that matter.

**What breaks:** Builders miss critical constraints because they were buried in the middle
of a 15-card briefing. Anti-patterns that should have prevented a mistake are lost in a
wall of supporting context.

---

## Maintenance Principles

### The feedback loop between service and construction is the most valuable signal

When Bridget assembles a briefing and logs a gap, when a builder searches and finds
nothing, when a retrospective shows the briefing missed something critical — those are the
highest-quality signals for what the library should build next.

**Why:** Provenance data and feedback queue entries are validated against real usage. A gap
reported during assembly is a gap that actually mattered for a real task. A card flagged as
weak during retrospective is a card that actually failed to serve. These signals are more
reliable than any pre-planned priority because they come from the factory's actual needs.

**What breaks:** The feedback queue is write-only. Provenance logs accumulate but nobody
reads them. The library improves based on Conan's quality assessments (which measure
internal quality) rather than Bridget's usage evidence (which measures external utility).
Internal quality and external utility are correlated but not the same thing.

---

### Trace upstream before fixing downstream

A product-layer card weak on WHY might be a card-level issue or it might be that the
linked Product Thesis is a stub. Fixing the card without fixing the upstream stub means
every other card linking to that Product Thesis has the same root-cause issue.

**Why:** Blast radius. An upstream fix resolves issues in every downstream card that
references it. A downstream fix resolves one card. The maintenance budget should go where
the leverage is. Cascade analysis distinguishes between symptoms and root causes.

**What breaks:** Whack-a-mole maintenance. Fix card A's WHY, then fix card B's WHY, then
card C — all three linked to the same stub Product Thesis. Three times the work for the
same root cause.

---

### Plays must handle conflict, not just sequencing

Sam is mid-build. Lint finds a structural issue in a card Sam already wrote. Conan
initiates an improvement loop on that card. Meanwhile Bridget needs that card for an
assembly. Who wins?

**Why:** Real orchestration involves concurrent activity, not just sequential steps.
Multiple plays can be in flight simultaneously. Without conflict resolution rules, agents
block each other or produce conflicting edits to the same card.

**What breaks:** Deadlocks (Sam waits for Conan who waits for lint who waits for Sam).
Conflicting edits (Sam fixes a card while Conan is grading the old version). Stale
assemblies (Bridget serves a card that Sam is in the middle of rewriting).

**Resolution rules:** Read-only operations (assembly, grading) never block. Write
operations (card creation, fixes) take precedence over reads when concurrent. Active
surgery plans lock affected cards — Bridget assembles from the pre-surgery version and
flags it in the gap manifest. Lint never blocks anything — lint findings queue for the
next appropriate step.

---

## Evolution Principles

### Measure before promoting

When a play is revised, stage the new version. Run comparative assemblies or builds with
old vs. new. Measure whether the change actually improved outcomes. Only promote to
canonical after evidence supports it.

**Why:** The eval/iterate pattern. Intuition about what will improve the system is often
wrong. A change that feels right might make grading faster but reduce grade accuracy. A
retrieval profile change that reduces card count might also drop a mandatory category. The
only way to know is to measure.

**What breaks:** Ratcheting degradation. Each "improvement" makes one thing better and two
things slightly worse. Without measurement, the slightly-worse things accumulate until
someone notices the system is fundamentally degraded and can't identify when it happened.

---

### The system must learn from its deployments

1,000 libraries deploying the same initialize flow, the same agents, the same plays will generate
enormous learning about what works. That learning must flow back into the system — updated
templates, revised plays, tuned retrieval profiles, new card types, better rubrics.

**Why:** The meta-library exists to capture this learning. Without it, every library
independently discovers the same problems and independently invents the same workarounds.
Cross-library pattern detection (Play M.3) turns N independent experiences into systemic
improvements.

**What breaks:** Every library is an island. User #500 hits the same initialize misconfiguration
that user #47 hit 3 months ago. The template system never improves. The plays never evolve.
The system works exactly as well on day 1,000 as it did on day 1.

---

### The playbook documents itself through versioning

If every play has a version, a changelog, and benchmark results, the playbook is
self-documenting. You never have to write "how does grading work" separately — the Grade
play's changelog IS the history of how grading works and why it changed.

**Why:** Documentation that's separate from the thing it describes always drifts. Play
changelogs can't drift because they ARE the play's history. Meta-library cards about plays
can be generated from play metadata rather than hand-written, which means they stay
accurate automatically.

**What breaks:** Documentation says one thing, the play does another. The meta-library
describes a grading process that was revised two versions ago. Nobody notices because the
documentation and the procedure are maintained separately.

---

*This document is source material for the meta-library's rationale layer. Each principle
will become a Principle card. The Product Thesis for Alexandria project — why
context libraries exist and what bet we're making — is documented separately.*
