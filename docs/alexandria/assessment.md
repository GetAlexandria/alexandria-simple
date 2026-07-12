# Alexandria Assessment

**Configuration:** Factory × High Novelty × High Complexity
**Pool:** 22 knowledge areas | **Gaps:** 2 to create, 4 to update, 0 to refresh, 16 complete

## Your Library's Risk

> Silent wrong defaults — hundreds of autonomous micro-decisions that cumulatively define the experience.

Alexandria plugin is built almost entirely by AI agents (Conan, Sam, Nit, Bridget)
making autonomous decisions about knowledge graph structure, card quality, retrieval behavior,
and assembly output. At Factory mode, every gap is a place where these agents will make
confident-sounding but wrong micro-decisions about how to build or maintain libraries.

## Seeding Sequence

### Phase 2: Core Gaps

Primary value drivers for your configuration.

| Priority | Area | Status | Action | Impact |
|---|---|---|---|---|
| 1 | Engagement Loops (3.3) | Partial | Update | The product is used once but doesn't become a habit. The maintenance cycle is a loop (health check → diagnose → fix → review), assembly is a loop (task → brief → build → retrospect), but neither is framed as an engagement loop with trigger → action → reward → investment structure. Without this framing, we can't optimize for what brings users back. |
| 2 | Progression / Mastery (3.4) | Partial | Update | The experience feels the same at month 6 as day 1. The lifecycle stages (Genesis → Construction → Quality → Service → Maintenance → Evolution) are implicitly a progression, but there's no documentation of what changes for the user at each stage — what's hard at first that becomes easy, what new capabilities unlock, what the "power user" experience looks like vs. day 1. |
| 3 | Prototypes / Mockups (4.3) | Partial | Update | Builders guess at layout and visual design, producing inconsistent results. For a markdown-based product, "prototypes" means reference examples — what does a good card look like? What does a good briefing look like? What does a good grade report look like? The templates in `templates/` are a start, but they're structural templates, not exemplar output showing what quality looks like in practice. |
| 4 | Roadmap (5.3) | Partial | Update | Builders design features that conflict with planned work. `beadification-plan.md` and `alexandria.md` cover specific initiatives, but there's no unified roadmap showing what's next, what's deferred, what depends on what, and what's explicitly NOT being built yet. Without this, contributors may build toward the wrong future. |

### Phase 3: Amplifier Gaps

Makes Foundation and Core more effective.

| Priority | Area | Status | Action | Impact |
|---|---|---|---|---|
| 10 | Competitive Analysis (1.4) | Absent | Create | Builders create category-generic features instead of differentiated ones. This area multiplies the effectiveness of your Foundation and Core knowledge. With Competitive Analysis in place, agents understand why the context library approach is different from plain docs, wikis, ADRs, or gstack-style skill systems — and can articulate that difference when helping users. |
| 11 | Market Requirements (1.5) | Absent | Create | Decisions are based on beliefs rather than evidence. This area multiplies the effectiveness of your Foundation and Core knowledge. With Market Requirements in place, strategic decisions about what to build and how to prioritize are grounded in actual usage data rather than assumptions about what users need. Pre-launch, this starts with qualitative evidence from early adopters. |

### Phase 4: Already Covered

| Area | Status |
|---|---|
| Product Vision (1.1) | Present / Fresh |
| Product Strategy (1.2) | Present / Fresh |
| User Personas / JTBD (1.3) | Present / Fresh |
| Information Architecture (2.1) | Present / Fresh |
| Noun Vocabulary (2.2) | Present / Fresh |
| Product Entities (2.3) | Present / Fresh |
| System Design (2.4) | Present / Fresh |
| Full GDD / PRD (2.5) | Present / Fresh |
| User Journey Maps (3.1) | Present / Fresh |
| Emotional / Aesthetic Goals (3.2) | Present / Fresh |
| Anti-Patterns (3.5) | Present / Fresh |
| Design System (4.1) | Present / Fresh |
| Interaction Patterns (4.2) | Present / Fresh |
| Accessibility Standards (4.4) | Present / Fresh |
| Key Decisions Log (5.1) | Present / Fresh |
| Institutional Memory (5.2+5.4) | Present / Fresh |

## Solicitation Prompts

### Engagement Loops (3.3) — Update

> What brings users back to their context library? Describe the daily, weekly, and
> lifecycle rhythms. What triggers a return visit? What does the user get from coming
> back that they didn't have before?

**What good looks like:** Named loops with trigger → action → reward → investment
structure. "Daily: builder needs context (trigger) → Bridget assembles briefing (action)
→ builder makes better decisions (reward) → provenance data improves future assemblies
(investment)."

**Common pitfall:** Describing the agent runs as the engagement loop. The agents are
mechanisms, not loops. The loop is the full cycle from user need to improved outcome
to reinvestment in the library.

---

### Progression / Mastery (3.4) — Update

> How is day 1 different from month 6 for an Alexandria user? Does the system reveal
> complexity over time? What does a "power user" do that a beginner wouldn't think to do?
> What capabilities unlock as the library matures?

**What good looks like:** A progression model with stages and thresholds. "Genesis:
user runs the wizard and gets their first 5 cards. Value threshold: first useful briefing.
Maturity: user has a graded library and is tuning retrieval profiles. Mastery: user is
running cross-library pattern detection and contributing lessons back to the meta-library."

**Common pitfall:** Describing feature gating as progression. True progression is about
the user's mental model deepening — understanding WHY chains, seeing the graph as a
system, recognizing when a card is hollow vs. substantive.

---

### Prototypes / Mockups (4.3) — Update

> For a markdown-based product, "prototypes" means exemplars. What does a good card look
> like? What does a good briefing look like? What does a good grade report look like?
> Can you provide reference examples that show quality in practice, not just structural
> templates?

**What good looks like:** A gallery of real, high-quality output from the LifeBuild
implementation (anonymized if needed). "Here is a grade-A Component card. Here is what
a context briefing looks like for a medium-complexity task. Here is a health check report
that identified a real cascade issue."

**Common pitfall:** Having structural templates without content exemplars. The templates
show where to put things; the exemplars show what good things look like.

---

### Roadmap (5.3) — Update

> What's coming in the next 3 months? What's explicitly deferred? What depends on what?
> What's the release sequence? What features are planned but should NOT be built yet?
>
> *Factory mode:* Your AI agents will make implementation decisions that could conflict
> with planned work. What upcoming features should they design for, even if they're not
> being built yet?

**What good looks like:** A roadmap with dependencies and rationale. "Beadification
(MCP tool integration) depends on the meta-library having enough cards to serve as test
data. Alexandria (library of libraries) depends on at least 3 library deployments to
validate the taxonomy. Wizard modernization depends on the playbook being stable."

**Common pitfall:** A roadmap that only shows what's being built, without showing what's
explicitly NOT being built yet.

---

### Competitive Analysis (1.4) — Create

> Name the top 3-5 alternatives to Alexandria (including "just use docs" or "don't
> bother"). For each: what do they do well? What can't they do? Why would someone choose
> Alexandria over them?
>
> *Factory mode:* Your AI agents' training data includes thousands of documentation
> approaches. Without competitive analysis, they will build the category-generic version.
> What specific design decisions differentiate Alexandria from alternatives?

**What good looks like:** A competitive position that names what you're deliberately NOT
doing. "We are not a wiki — wikis are flat, untyped, and have no retrieval profiles. We
are not ADRs — ADRs capture decisions but not the product knowledge that contextualizes
them. We are not gstack — gstack is the factory, we're the library that feeds it."

**Common pitfall:** Only listing alternatives you're clearly better than. Include the
alternative that's genuinely simpler (plain markdown files with good naming) and explain
why the overhead of a context library is worth it.

---

### Market Requirements (1.5) — Create

> What evidence supports Alexandria's product strategy? Early adopter feedback,
> LifeBuild usage patterns, conversations with potential users, observed pain points in
> AI-assisted development. Where did the key insights come from?

**What good looks like:** Named evidence linked to specific strategic decisions. "The
LifeBuild implementation showed that WHY sections are the most commonly hollow dimension,
which led to the principle of 'grade WHY harder, trace WHY deeper, fix WHY first.'"

**Common pitfall:** Listing evidence that confirms the strategy without including evidence
that challenged it. The most useful market requirements include the surprising finding
that almost changed the plan.

---

*Assessment written: 2026-03-23. Updated: 2026-03-23. 6 solicitation prompts ready across
2 phases. Source material for the meta-library's gap-filling process.*
