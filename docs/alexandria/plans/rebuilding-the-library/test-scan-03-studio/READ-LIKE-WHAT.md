# READ-LIKE-WHAT — honest self-assessment

*(Written immediately after the scan, before reviewing. No answer key was
consulted. The whole point of this test is: with no answer key, does this
read coherently? What would surprise the architect? Where am I most and
least confident?)*

## The headline question — does it read coherently?

**Probably yes, with three reservations.** If you handed this scan to a
stranger who'd never seen Studio, they should be able to walk away with:

- Studio is a docs-first workbench for writing AI "plays" — small
  reusable workflows.
- A play is the unit. It moves through a 6-stage pipeline with 2 Director
  gates, written → derived → tested → registered.
- The author writes once (a brief with a §4 move graph); everything
  derives from that.
- There's a Director, an orchestrator, four specialist agents (Hardener,
  Author, Checker, Grader), plus the doer that actually runs at execute
  time.
- The product is governance-first: every artifact is human-readable, the
  Director never reads code.
- It outputs into a Fabro workflow engine inside Alexandria's runtime.

That's a real product story. A stranger would NOT understand:
- *Why* anyone would want to write plays this way (the autopsy backstory
  helps but isn't told as "the value prop").
- The relationship to Alexandria — they'd assume Studio is *of*
  Alexandria, not a candidate spin-out.
- Where library cards / atomic cards / sources of truth fit. Q19 in the
  Stage-2 brief.

## Things I'm confident about

- **The six-stage Board is the central thing.** It's described in every
  governance doc, has a JSON state file, has a kanban UI, has explicit
  Director-only confirms. Calling it a pillar feels right.
- **The brief→workflow projection is the technical heart.** The whole
  point of PROJECTION.md is "one source, many derived renderings." Splitting
  brief/workflow into two contexts captures the right boundary because the
  language genuinely changes (move graph → Fabro graph; consumes/emits → node
  prompt frontmatter; bounce → condition-labeled edge).
- **The runtime contract (RUNTIME.md) is its own context.** It's "ported
  from a shipped reference" and explicitly different from PROJECTION.md
  ("describes plays as Fabro graphs + prompts; this is the other
  contract"). It has its own language (events, wake, units, run modes,
  detached vs interactive) and its own state model (the run-state model
  fed by events).
- **Grading is its own context.** Risk maps, fixtures, lint, run records,
  run bars — all bound by the same vocabulary (canonical risk families,
  pass rates, CI, classes of failure). Separates cleanly from the workflow
  context.
- **Inheritance is small but real.** Two classes (autopsy / quarantine)
  with a promotion lifecycle. Even if it's mostly historical, it's a
  bounded part with its own rules.

## Things I'm uncertain about

- **Did I carve "production-line" correctly as a context?** It might be
  better called "meta" or "studio-management" — it holds Studio-itself,
  the loop, big-edit, handoff, closeout, surfaces. It might be too
  big-tent. An architect might split it into "process" + "session
  management" + "surfaces."
- **Where does "agent" belong?** I put the five named agents under
  `runtime/agents/` because they're identified by the *role they play in
  the run lifecycle*. But Hardener and Author and Checker run *off-line*
  (the Studio's writing time), not during a play's runtime execution.
  Doer and Grader DO run at execution time. **The Hardener probably
  doesn't belong in runtime.** But I didn't have a better home and didn't
  want to invent a "team" context.
- **Where does the "tool" stuff go?** `derive-views.sh`, `bank.sh`,
  `check-workflow-edges.py`, `check-moves.ts`, `generate-story.py` — I
  filed these as components (one of each), but they collectively form a
  toolchain. Should there be a `tools/` context? I think no — they each
  belong to the operation they implement.
- **The "atomic-card" family.** I gave them a passing mention in the
  registry card and in `ATOMIC-CARDS.md`'s implicit shape, but didn't
  create a separate context for them. Reverse-derived plays are a real
  parallel-class; might deserve more attention in the model.
- **The runtime-relevant context I touched but couldn't fully carve.**
  RUNTIME.md is *all* about Raven Vision as the shipped exemplar.
  Vision is described in detail but it's a worked example, not Studio's
  model. I treated the lifecycle (Run, Human Input Unit, Event, Wake)
  as Studio's abstraction over Vision's concrete instance. **That could
  be wrong** — Vision might be load-bearing in the model in a way I
  haven't captured.

## Things I think will surprise the architect

- **I put `Director` and `Orchestrator` as Values, not Aggregates.** They
  have identity in real life but they're not lifecycle objects in the
  Studio's data model — they're *roles*. (An aggregate has state
  transitions; the Director just IS.) But I could see an architect
  objecting that the Director's *rulings* are aggregates, in which case
  Director needs to be one too.
- **Three contexts touch the workflow package** (brief writes its source,
  workflow IS it, runtime executes it). This may look like context bleed.
  I think it's actually correct — the same artifact, with three different
  vocabularies layered on it: the Director thinks "the design," the Author
  thinks "the projected package," the Runtime thinks "the registered
  workflow." This *is* DDD's classic tightly-coupled-contexts case.
- **I made `production-line/Aggregate - The Loop` a separate aggregate**
  from `Aggregate - Playmaker's Studio`. That feels right (the Loop is a
  specific 9-step thing inside the Studio, not the Studio itself), but it
  could be misread as duplicate.
- **No "Plan" aggregate.** The atomic-card-planning play emits a "build
  plan," which is a real aggregate in *that* play's domain. But the
  Studio doesn't have a plan aggregate per se — each play has a brief,
  not a plan. An architect might expect a Plan card.
- **No "User" aggregate.** The docs imagine the Director and the
  orchestrator and a hypothetical end-user-of-a-banked-play, but never as
  modeled identities. If Studio spins out, "User" is *very* unanswered.

## Where I am least confident

- **The line between brief and workflow contexts.** I kept them separate
  because the language really does change at Gate 1 — but a strict DDD
  reading might want them as one context with two phases. Wrong call?
- **Whether "Capability" is the right name for the verbs.** Gate 1, Gate
  2, Derive, Bank, Register, Three Strikes Then Freeze — these aren't
  CRUD verbs, they're domain operations. Capability felt right
  (action-with-consequence). But "service" or "operation" might be more
  conventional.
- **The atomic-card plays as an entire family deliberately under-modeled.**
  I read the ATOMIC-CARDS.md overview and one brief, but didn't carve
  their three flows individually. Build Atomic Card, Atomic Card Creation,
  and Source-of-Truth Atomic Conversion are three real plays with real
  shapes; I left them at "see the registry." That's probably wrong if the
  scan was supposed to be a *Studio* model, because they're Studio cards.

## What surprised me writing this

- **How much of Studio's value-prop is implicit.** The governance docs
  describe *how* Studio works in tremendous detail but never say *why
  anyone would want a Studio*. The autopsy provides the negative case ("here's
  what bad looks like") but no positive case ("plays let teams ship reliable
  AI workflows fast"). For a product-positioning conversation, the docs are
  weak.
- **How heavy the inheritance archive feels for a small workstream.** The
  quarantine/promotion lifecycle is well-designed but currently holds
  almost nothing live. It's set up for migration moments — when something
  big has to come in carefully — but day-to-day it's idle.
- **The Hot Spots are mostly *real product Hot Spots*, not just doc
  gaps.** H1 (two ladders), H2 (three "banks"), H3 (two human-gate
  models), H10 (idle workflow), H12 (two "registries") — these are places
  where Studio's product has genuine coupling that would need conscious
  resolution in a spin-out. The Event Storming exposed them naturally.
- **The "founder-facing canon" rule + the "startup floor" rule are core to
  the *product positioning*.** They're not just design discipline — they're
  what makes Studio different from "enterprise workflow tooling." If
  Studio spins out, those rules are the marketing.

## Final read

The scan reads like a thoughtful first-week intern who took good notes and
asked the right questions but hasn't yet *used* Studio. A stranger
*could* understand what Studio is and does from this; they would still
want a one-page "why" before they bought it. The Stage-2 brief is the
real handoff — the 20 questions there are the gap between this scan and a
working product model.
