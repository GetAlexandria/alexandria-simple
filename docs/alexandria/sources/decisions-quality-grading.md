# Key Decisions: Quality & Grading

Source material for knowledge area 5.1. Synthesized from design conversations, 2026-03-23.

**Origin:** Unlike most system components (team architecture, wizard, plays), the quality
and grading system was built bottom-up. The starting point was best practices for atomic
documentation. The team ran the library, found problems and gaps, logged them, and tried
to come up with programmatic ways to ensure they got plugged. Rules and quality criteria
emerged from observing what went wrong, not from designing what should go right. The
grading rubric, five dimensions, cascade analysis, and Nit's sweep levels are all products
of this discovery process.

## Decision 28: Five dimensions as a quality lens

**Decided:** Every card is evaluated across five dimensions: WHAT, WHERE, WHY, WHEN, HOW.

**Origin:** Started with standard atomic documentation practice (one concept per card, clear
definition). Over time the team noticed that cards could be structurally complete but
contextually hollow — they said what something was but not why it existed, where it fit
in the system, when it was relevant, or how it worked. The five dimensions emerged as the
minimum set of lenses needed to distinguish a card that *describes* from a card that
*teaches*.

**Why five:**

- **WHY is the hardest and most valuable.** The single most common quality gap discovered
  in early library runs was hollow WHY sections. Cards would define a concept precisely
  but never explain the reasoning behind it. WHY sections are where institutional knowledge
  lives — the part that gets lost at the watercooler. This discovery led to the principle:
  "grade WHY harder, trace WHY deeper, fix WHY first."

- **WHERE captures graph position.** WHERE isn't physical location — it's where this
  concept fits in the knowledge graph. What does it connect to? What depends on it? This
  dimension only matters in a graph-structured library (not in flat docs), and it emerged
  when the team noticed that isolated cards — correct but unlinked — were invisible to
  retrieval.

- **WHEN captures temporal context.** Products evolve. A decision that made sense in v1
  might be wrong in v3. WHEN captures lifecycle position, freshness, and temporal
  relevance. This dimension emerged from discovering stale cards that were technically
  accurate about a past state but misleading about the current one.

**What would change this decision:** Evidence that a dimension is consistently empty or
redundant across many libraries (not just one). If HOW is always either obvious from
WHAT or too detailed for a card, it might merge into WHAT. If a sixth dimension emerges
(WHO was considered and rejected — authorship is tracked in git, not in the card), it
would be added. The bar is: does this dimension catch quality problems that the other
four miss?

## Decision 29: Grade computation from rubric, not impression

**Decided:** Grades are computed from dimension scores against a rubric, not from Conan's
overall impression of card quality.

**Origin:** Early grading was impressionistic — Conan read a card and assigned a letter
grade. The team noticed that the same card could get different grades depending on what
Conan had just read (anchoring) and that grades were hard to act on ("C+" doesn't tell
you what to fix). Moving to dimension-based rubric scoring made grades reproducible and
diagnostic.

**Why rubric:**

- **Actionable feedback.** A grade of C+ means nothing. A grade of C+ because WHY is
  hollow and WHERE has broken links tells you exactly what to fix. Rubric-based grading
  turns assessment into a repair plan.

- **Reproducibility.** Rubric scores reduce (but don't eliminate) variance between grading
  runs. Two runs of Conan on the same card should produce similar dimension scores even
  if the overall letter grade fluctuates. The rubric anchors judgment.

- **Nit can verify.** Rubric-based grades produce claims that Nit can check: "WHY scored
  2/5 because no rationale is provided." Nit can verify whether rationale is actually
  absent. Impressionistic grades produce claims that only another judgment agent can
  evaluate.

**What would change this decision:** If model judgment becomes reliable enough that
impressionistic grading is reproducible and actionable (the model explains its reasoning
in a way that maps to fixable issues without being prompted by a rubric), the rubric
adds overhead without adding value. Currently, the rubric is a crutch that compensates
for inconsistent model judgment — a useful crutch.

## Decision 30: Cascade analysis — tracing impact through the graph

**Decided:** When a card has quality issues, Conan traces the impact downstream through
the knowledge graph to identify which other cards are affected.

**Origin:** The team discovered that fixing a single card often left downstream cards
stale — a Strategy card gets updated but the Component cards that reference it still
reflect the old strategy. Cascade analysis emerged from this "fix one, break three"
pattern.

**Why cascades:**

- **Blast radius visibility.** Atomic documentation shows the splash zone — everything
  linked to the changed card needs revisiting. Cascade analysis makes this visible
  programmatically rather than relying on humans to trace dependencies.

- **Upstream-first repair.** The principle "trace upstream before fixing downstream"
  emerged from cascade analysis. If a Component card is graded poorly, the cause might
  be a hollow Strategy card upstream. Fixing the Component without fixing the Strategy
  is treating symptoms.

**What would change this decision:** If the library moves to a database with typed
relationships and triggers (Decision 3 trajectory), cascade analysis could become
automatic — a change to a Strategy card automatically flags downstream Component cards
for review. At that point, Conan's manual cascade analysis becomes redundant with the
system's built-in change propagation.

## Decision 31: Sampling for judgment, exhaustive for mechanics

**Decided:** Conan's health check samples 20% of product-layer cards. Nit checks every
card, every link, every path.

**Origin:** Discovered that having Conan grade every card was expensive (time, tokens,
context window) and diminishing — card #47 in a batch gets less attention than card #1.
Meanwhile, mechanical checks (broken links, missing frontmatter, naming violations) were
cheap but Conan kept missing them because they weren't the focus of judgment-based grading.
Splitting sampling rates by check type emerged naturally.

**Why split:**

- **Judgment is expensive, mechanics are cheap.** Conan's assessment requires loading
  rubrics, reading source material, evaluating dimension quality — it's a heavyweight
  operation. Nit's structural checks are pattern matching. Running the expensive operation
  on every card wastes resources; skipping the cheap operation on any card misses easy wins.

- **Different error profiles.** Judgment errors (wrong grade) are probabilistic and
  improve with more context. Mechanical errors (broken link) are deterministic — you
  either check or you don't. Sampling works for the former because you're estimating
  a distribution. Sampling doesn't work for the latter because you're looking for
  specific defects.

**What would change this decision:** If judgment-based grading becomes cheap enough to
run exhaustively (faster models, lower token costs), Conan could grade every card. But
the adversarial independence argument (Decision 7) still holds — Nit should run mechanical
checks regardless, because the structural separation between critic and linter prevents
the quality-softening that happens when one agent does both.

## Decision 32: Bottom-up discovery as a design principle

**Decided:** The quality system should continue to evolve bottom-up — from observed
problems to programmatic solutions — rather than being designed top-down from quality
theory.

**Why:**

- **The track record.** Every quality mechanism that stuck (five dimensions, cascade
  analysis, Nit's sweep levels, the sampling split) was discovered by running the library
  and noticing what went wrong. Top-down quality design would have produced a different
  system — probably one optimized for documentation best practices rather than for the
  specific failure modes of AI-maintained knowledge graphs.

- **Context libraries are new.** There is no established quality theory for AI-maintained
  product knowledge graphs. Best practices for documentation, wikis, and knowledge bases
  are starting points, but the failure modes are different. Cards don't just go stale —
  they go hollow (structurally present, contextually empty). Links don't just break —
  they mislead (pointing to a concept that has drifted). Grades don't just vary — they
  self-soften (the grader unconsciously lowers the bar after fixing issues). These are
  novel failure modes that required bottom-up discovery.

- **The eval/iterate mechanism.** The versioned play system is designed to continue this
  bottom-up discovery at scale: observe a quality problem, hypothesize a check or rule,
  version it into a play, benchmark it, promote if it catches real issues.

**What would change this decision:** A mature quality theory for knowledge graphs that
predicts failure modes the team hasn't encountered yet. If someone publishes "here are the
12 failure modes of AI-maintained knowledge systems" and the list includes modes the
bottom-up process hasn't discovered, that theory would become a top-down complement to
the existing bottom-up approach.
