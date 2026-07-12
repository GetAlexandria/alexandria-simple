# Key Decisions: Wizard Design

Source material for knowledge area 5.1. Synthesized from design conversations,
GitHub issue #753 (sociotechnica-org/lifebuild), and wizard engine artifacts, 2026-03-23.

## Decision 12: Benchmark to product attributes, not AI capability

**Decided:** The wizard's three axes (AI Mode, Domain Novelty, Product Complexity) describe
the product and team, not the AI tools being used.

**Alternative rejected:** Benchmarking to AI capability — e.g., "what model are you using?"
or "does your AI have access to a codebase?"

**Why product attributes:**

- **Stability.** AI capability changes every six months. A wizard calibrated to "GPT-4 level"
  or "can use tools" would need re-tuning with every model release. Product attributes —
  how much decision authority AI has, how novel the domain is, how interconnected the
  features are — change on a timescale of months to years, not weeks.

- **The right question.** The wizard needs to know what *context is missing from the
  builder's head*, not what the builder's tools can do. A Factory-mode team using a weak
  model needs MORE documentation, not less. The risk scales with autonomy and product
  complexity, not with model capability.

- **Inference gap framing.** The questions are framed as inference gaps: what can an AI
  builder figure out from code and conventions alone, versus what must be explicitly
  documented? This framing survives model improvements — better models close some inference
  gaps, but novelty and complexity create gaps that no amount of model capability can close
  without domain knowledge.

**What would change this decision:** If AI capability stabilized (a plateau where models
stop improving rapidly), benchmarking to capability could be added as a fourth axis. But
even then, product attributes would remain the primary axes because they determine what
knowledge is needed, while AI capability only determines how much the builder can infer
on its own.

## Decision 13: Three axes, not two or five

**Decided:** Three inputs: AI Mode (decision authority), Domain Novelty, Product Complexity.

**Alternative rejected:** Two axes — just mode + "how much documentation do you need?"
(a single complexity/novelty blend).

**Alternative rejected:** Five axes — adding team size and product maturity as separate
inputs.

**Why three:**

- **Independence.** Each axis moves different knowledge areas. AI Mode determines the pool
  ceiling (which areas are relevant at all). Novelty drives identity and experience areas
  (emotional goals, anti-patterns, competitive analysis). Complexity drives structural
  areas (system design, entities, architecture, journey maps). These are genuinely
  orthogonal — a high-novelty, low-complexity product (a simple app in a new category)
  has completely different needs than a low-novelty, high-complexity one (a traditional
  enterprise app with interconnected systems).

- **Combinatorial coverage.** 4 modes × 3 novelty × 3 complexity = 36 configurations.
  This is small enough to verify exhaustively (every configuration was hand-checked across
  multiple QA passes) but large enough to produce meaningfully different recommendations.
  Adding a fourth axis would create 108+ configs — too many to verify by hand, and the
  marginal differentiation wouldn't justify the complexity.

- **User can answer them.** The disambiguation prompts for each question were specifically
  designed so that a founder can answer in under 60 seconds without consulting anyone.
  "Think about the last 10 product decisions" — concrete, answerable, doesn't require
  research. More axes would increase wizard friction for diminishing returns.

**Confidence varies by axis.** Factory and Short-Order Cook feel solid — Factory is nascent
but well-defined, Short-Order Cook is extremely prevalent and well-understood. Pair
Programmer is where the shades of gray live. The extent to which developers collaborate
with AI, and the methods they use, vary significantly within this category. Real usage
patterns could surprise us in the middle of the spectrum. The team is angling to work with
Factory-mode teams, but Pair Programmer will be where the most users land initially — and
where the wizard's calibration will be tested hardest.

**What would change this decision:** Real usage data. Nothing will shape the wizard more
than actual feedback from humans trying to build with it — and the eval/iterate quality
testing process. Evidence that two products with the same (mode, novelty, complexity) but
different team sizes consistently need different knowledge areas could add a fourth axis.
But the more likely change is re-calibrating the boundaries *within* the AI Mode axis,
particularly around what separates Pair Programmer from its neighbors.

## Decision 14: Twenty-two knowledge areas

**Decided:** Twenty-two areas organized into five domains (Vision & Strategy, Architecture &
Nouns, Experience & Feel, Visual & Interaction, Decision History).

**Origin:** The catalog was built from an AI research project surveying product documentation
types across numerous fields — not just software. The 22 areas represent a synthesis of
what product knowledge exists across industries, distilled into containers that are useful
for the wizard's configuration purpose.

**Why 22:**

- **Coverage without bloat.** The research identified many more granular documentation types.
  Twenty-two was the point where splitting further didn't change the wizard's output — the
  sensitivity profiles would be identical for the split halves, so they'd always land in
  the same tier.

- **Helpful containers, not ground truth.** The boundaries between areas have shades of
  gray. "Product Entities" (2.3) overlaps with "System Design" (2.4); "User Journey Maps"
  (3.1) overlaps with "Engagement Loops" (3.3). The 22 areas are containers optimized for
  the wizard's decision — "do you need this?" — not a taxonomy claiming these are the
  22 irreducible atoms of product knowledge.

- **Verifiable.** Every area has a distinct sensitivity profile (how it responds to novelty
  and complexity) and a distinct pool entry point (which AI mode makes it relevant). If
  two areas had identical profiles, they should be merged. If one area needed to be split
  because its halves respond differently to the axes, it should be split. Twenty-two is
  the equilibrium.

**Epistemic honesty:** The 22 areas are research-driven, but they're a product of one
specific research process. A different study, different methodology, or different survey
of fields would likely land on a different set of containers. This piece will never be
totally complete or perfect. The team fully expects to learn and improve here as real
libraries are built and the containers are tested against actual usage.

**What would change this decision:** Real usage. The most likely changes are merges (two
areas that always land in the same tier and that users find confusing to separate) or
splits (one area where the halves consistently need different treatment). New types of
product knowledge — particularly AI-specific knowledge like prompt engineering patterns,
model behavior documentation, or agent coordination patterns — might also force expansion
as the field matures.

## Decision 15: Four tiers, not a continuous score

**Decided:** Areas are assigned to one of four tiers: Foundation, Core, Amplifier,
Deprioritized.

**Alternative rejected:** A continuous priority score (1-100) for each area.

**Alternative rejected:** Binary (needed / not needed).

**Why four tiers:**

- **Actionable.** The tiers map directly to a seeding sequence: Foundation first, then Core,
  then Amplifier. A continuous score creates a linear ordering but doesn't tell you where
  to draw the "do this now" vs. "do this later" line. Tiers create natural breakpoints.

- **Foundation is special.** Foundation is not just "highest priority" — it's a prerequisite.
  Other areas depend on Foundation for coherence. You can't grade the library without
  Product Vision (1.1). You can't write cards with consistent vocabulary without Noun
  Vocabulary (2.2). The Foundation tier encodes a dependency relationship, not just a
  priority ranking.

- **Deprioritized is not absent.** Areas in the pool but assigned to Deprioritized are
  still relevant — they're just low urgency for this specific configuration. A binary
  system would either exclude them (losing them entirely) or include them (creating a
  false equivalence with Core areas).

- **Verifiable at scale.** Thirty-six configurations × 22 areas = 792 tier assignments.
  Every assignment was checked by hand. A continuous score would require defining and
  verifying 792 numeric values with subtle ordering constraints. Four discrete tiers
  make verification tractable.

**What would change this decision:** If the seeding sequence needs finer granularity —
e.g., within Core, there are consistently 3 sub-phases that matter — tiers could grow
to 5-6. But the current four have held across all 36 configurations without needing
subdivision.

## Decision 16: Non-compensatory gate (mode selects pool ceiling)

**Decided:** AI Mode determines which areas enter the pool at all. Only areas in the pool
are considered for tier assignment. Novelty and complexity operate within the pool, never
outside it.

**Pool sizes:** No/Low AI: 10 → Short-Order Cook: 13 → Pair Programmer: 18 → Factory: 22.

**Alternative rejected:** Compensatory model — high novelty or high complexity could promote
areas into the pool regardless of mode.

**Why non-compensatory:**

- **Mode as ceiling, not floor.** If your AI builders don't have decision authority (No/Low
  AI mode), documenting Accessibility Standards (4.4) for AI consumption doesn't matter —
  the product person handles accessibility decisions. No amount of complexity changes that.
  The mode determines the *ceiling* of what AI needs to know, and novelty/complexity
  determine *within that ceiling* what's most urgent.

- **Pool entry has a qualitative reason.** Each area enters the pool at a specific mode
  because that's where AI begins making relevant decisions autonomously. Product Entities
  (2.3) enters at Short-Order Cook because that's when AI starts building features that
  instantiate entities. Engagement Loops (3.3) enters at Pair Programmer because that's
  when AI starts proposing feature designs that affect retention. These entry points are
  qualitative judgments, not quantitative thresholds.

- **Prevents runaway expansion.** A compensatory model would let a High Novelty / High
  Complexity project at No/Low AI pull in 18+ areas — creating a documentation burden
  for a team where humans make every product decision. The gate ensures the pool stays
  appropriate to the team's actual AI usage.

**How the pool sizes were derived:** The pool membership (10→13→18→22) and the specific
areas that enter at each level were hashed out through simulated focus groups with several
Opus agents. The team conducted structured sessions where AI agents evaluated what
documentation was and wasn't helpful for making specific types of product decisions, based
on their "experiences" building across different autonomy levels. The pool boundaries are
stake-in-the-ground choices informed by this research — strong enough to ship, but
explicitly expected to be reshaped by real usage and feedback.

**What would change this decision:** Real usage data, particularly from humans building
with the wizard. Evidence that low-mode teams with high novelty/complexity need areas
outside their pool — specifically for AI consumption, not for human alignment — would
expand the pool boundary for that mode. The eval/iterate quality testing process is the
designed mechanism for this evolution.

## Decision 17: max() combination rule

**Decided:** When an area is sensitive to both novelty and complexity, the final tier is
the maximum (highest) of the two implied tiers.

**Formula:** `tier = max(novelty_tier, complexity_tier, floor)`

**Alternative rejected:** Average or weighted combination of the two axes.

**Alternative rejected:** Area-specific combination rules for each pair.

**Why max():**

- **Conservative by design.** If complexity says Core but novelty says Amplifier, the area
  is Core. max() means "if EITHER axis says this is important, it's important." This is
  the right default for a documentation system — the cost of documenting something you
  didn't strictly need is low; the cost of not documenting something you did need is high.

- **Works for 95%+ of cells.** Across all 36 configurations, max() produces the correct
  tier assignment for all but 3 cells. Those 3 anomalies have explicit override rules.
  An alternative combination function might eliminate 1-2 anomalies but would introduce
  new ones elsewhere and lose the simplicity that makes the engine verifiable.

- **Composable.** Because the combination rule is the same for every area, the engine is
  simple: look up two profiles, take the max, apply the floor. Area-specific combination
  rules would require 22 different combiner functions and make the engine opaque.

**What would change this decision:** If the number of anomalies grew beyond 5-6 (currently
3), the max() rule might be too coarse. At that point, a second combination rule (perhaps
min() for a specific class of areas) could be added as a named alternative, keeping the
engine composable while handling more edge cases.

## Decision 18: Three anomaly override rules, not a clean algebra

**Decided:** Three areas have behavior that can't be decomposed into independent novelty
and complexity profiles. Each has an explicit override rule.

**The three anomalies:**

1. **Progression/Mastery (3.4) — interaction effect.** Novelty and complexity interact:
   High/High → Core, but Moderate/Low → Deprioritized. This can't be expressed as
   max(novelty_tier, complexity_tier) because the combination matters, not just the
   maximum. Uses a 3×3 lookup table.

2. **Journey Maps (3.1) at Pair Programmer — novelty-gated floor.** The standard C+strong
   profile applies, but the floor is Amplifier unless novelty is Low. This is because at
   Pair Programmer mode, journey maps become important for AI-proposed feature designs —
   but only when the product is novel enough that AI can't infer the journey from
   conventions.

3. **Design System (4.1) at No/Low AI — mode-specific complexity sensitivity.** At No/Low
   AI, Design System is Core at high complexity but Amplifier otherwise. At every other
   mode, Design System has a fixed tier (Foundation at Short-Order Cook, Core at Pair
   Programmer and Factory). The complexity sensitivity only activates at the lowest mode.

**Alternative rejected:** Force these into the standard profile system (sacrificing accuracy).

**Alternative rejected:** Make the entire engine override-based (sacrificing simplicity).

**Why explicit overrides:**

- **Honest engineering.** The three anomalies are real — they represent genuine interaction
  effects in how product knowledge matters. Forcing them into the standard profile system
  would produce wrong answers for specific configurations. Documenting them as explicit
  overrides makes the engine honest about where the clean algebra breaks down.

- **Bounded complexity.** Three override rules on top of a clean engine is better than 22
  area-specific combination functions. The overrides are the exception, not the rule. Each
  is documented with a rationale and a specific trigger condition.

- **Candidates for elimination.** As the engine evolves, anomalies might be absorbed into
  a richer profile taxonomy. Progression's interaction effect might be handled by a new
  "interaction" profile type. Keeping anomalies explicit makes them visible targets for
  future simplification.

**What would change this decision:** If the catalog grows beyond 22 areas and more
anomalies emerge, the override system might need to become a first-class feature of the
engine (a named "interaction profile" type) rather than one-off rules.

## Decision 19: Sensitivity profiles as a taxonomy

**Decided:** Areas respond to novelty and complexity through named profiles (N+strong,
N+mild, N-standard, N-delayed, C+strong, C+moderate, C+mild) rather than per-area
custom mappings.

**Alternative rejected:** Each area has its own independent mapping from (novelty level →
tier).

**Why a taxonomy:**

- **Shared reasoning.** When two areas share the N+strong profile, it means they respond
  to novelty for the same structural reason — they're identity knowledge that becomes
  critical when the product is pioneering and less urgent when the category is established.
  The profile name encodes the *reason*, not just the mapping.

- **Verification by analogy.** If Emotional Goals (3.2) and Anti-Patterns (3.5) both have
  N+strong profiles, and you verify that Emotional Goals should be Core at High novelty,
  you've also increased confidence that Anti-Patterns should be Core at High novelty —
  because they share the same structural relationship to novelty.

- **Engine simplicity.** Seven named profiles × 22 areas is a small lookup table. 22
  custom mappings × 2 axes × 3 levels = 132 independent values to specify and verify.
  The taxonomy reduces the specification surface by an order of magnitude.

- **Inverse profiles capture real behavior.** Competitive Analysis (1.4) has an N-standard
  (inversely novelty-sensitive) profile — it's MORE important at Low novelty because
  established categories have more competitors to analyze. This counterintuitive behavior
  is captured naturally by the taxonomy rather than being a surprising per-area special case.

**What would change this decision:** If the catalog grew and new areas didn't fit existing
profiles, the taxonomy would need expansion. The current seven profiles were derived from
the 22 areas — they're empirical, not theoretical. A larger catalog might reveal new
profile shapes.

## Decision 20: Questions framed as inference gaps

**Decided:** The wizard questions are framed around what AI can figure out on its own vs.
what must be explicitly documented.

**Examples:**
- AI Mode: "How much product decision authority do your AI builders have?"
- Novelty: "If you described your product in one sentence, would someone from your industry
  correctly guess what using it feels like?"
- Complexity: "When you make a product decision about one feature, how many other features
  does it typically affect?"

**Alternative rejected:** Technical capability questions ("what model do you use?", "do
your agents have tool access?").

**Alternative rejected:** Documentation inventory questions ("how much documentation do you
have?", "is it up to date?").

**Why inference gaps:**

- **They diagnose the problem, not the symptom.** The wizard's job is to determine what
  knowledge is needed, not what knowledge exists. A team might have extensive documentation
  but still need different areas prioritized based on how their AI uses that documentation.
  Inference gap questions get at the structural need.

- **Disambiguation prompts make them concrete.** Each question includes disambiguation
  prompts that translate the abstract question into a specific test. "Think about the last
  10 product decisions that were made" — this grounds the answer in recent experience
  rather than aspirational self-assessment.

- **Product complexity ≠ technical complexity.** The complexity question explicitly notes:
  "This is about PRODUCT complexity, not technical complexity. Your tech stack, framework
  choices, and deployment architecture don't factor in." This distinction is critical —
  a technically complex product with simple product logic needs less documentation than a
  technically simple product with interconnected product systems.

**What would change this decision:** If the wizard moves to a self-serve tool where users
answer without guidance, the questions might need to become more multiple-choice (less
interpretation required). The current framing works well in a guided wizard context but
assumes the user will read the disambiguation prompts.

## Decision 21: Gap analysis scores, not just tier assignments

**Decided:** The wizard doesn't just recommend knowledge areas — it compares recommendations
against existing knowledge and produces scored, sequenced gaps.

**Formula:** `priority_score = tier_weight × gap_severity × freshness_penalty`

**Why gap analysis:**

- **Most teams aren't starting from zero.** The wizard's first output (tier assignments)
  answers "what do you need?" The gap analysis answers "what do you need that you don't
  have?" — which is the actionable question. A team with extensive product vision
  documentation but no decisions log needs a different seeding sequence than a team
  starting fresh.

- **Freshness matters.** A present-but-stale area is worse than an absent area in some
  ways — it creates false confidence. The freshness penalty (stale=0.4 severity on present
  items) ensures that stale documentation surfaces in the gap sequence rather than being
  treated as "done."

- **Phased seeding.** The gap analysis produces a phased sequence: Foundation gaps first,
  then Core, then Amplifier. Within each phase, gaps are ordered by priority score. This
  gives the team a concrete "do this, then this, then this" plan rather than a flat list
  of 22 areas.

- **Solicitation prompts.** Each gap comes with a tailored solicitation prompt — a question
  designed to elicit the missing knowledge. The prompts have mode-sensitive variants
  (Factory mode prompts emphasize autonomous agent risk; No/Low AI prompts emphasize
  team alignment risk). This closes the loop: wizard identifies gap → prompt extracts
  knowledge → source material feeds card building.

**What would change this decision:** If the wizard becomes a one-time setup tool (run once,
never revisit), gap analysis is less important. But the design assumes libraries are
maintained — gaps close, knowledge becomes stale, new gaps emerge. The gap analysis is
designed to be re-run periodically as the library evolves.
