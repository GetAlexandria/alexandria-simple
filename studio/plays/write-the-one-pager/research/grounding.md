# Grounding — the product-definition canon (PRD / one-pager)

The cited source of truth for Write the One-Pager / PRD. Provenance: web
research by five Sonnet agents against `research-brief.md`, plus a
verification pass on the load-bearing claims, 2026-06-11. Claims checked
against primary sources where fetchable; caveats flagged inline. Raw trail:
`extracted-claims.md`. This is the first grounding doc written *before* the
design (the ground-before-design rule, README) — and the first to carry the
second mandate: §8 pre-answers the brief elicitation with expert answers.

## 1. What this artifact is — and what to call it

A **PRD (product requirements document)** states what a product or feature
must do from the user's perspective, not how it will be implemented
[productplan.com/glossary; Cagan via SVPG]. It sits in a classic document
chain: MRD (market opportunity) → BRD (business case) → **PRD (the what)**
→ SRS/FRD (the technical how — IEEE 29148 territory) [altexsoft.com;
aqua-cloud.io; jamasoftware.com]. The **one-pager** is its lighter, earlier
sibling: a single page that wins alignment and the investment decision
before detail is earned — "a product one-pager emphasizes the 'why,' while
a PRD details the 'how' and 'what'" [productplan.com/learn/product-one-pager].

**Naming verdict:** "solution requirements document" has no standing
currency as a document form in any community — SRD nearly always expands to
*software* requirements document; BABOK's "solution requirements" is a
requirements *category*, not a document (BABOK is member-gated; claim is
snippet-level). PM practitioners say PRD, product spec, one-pager, product
brief — regardless of whether the thing defined is a feature, product, or
service. Cagan calls the label question an "acronym jungle" and says the
substance matters, not the name [svpg.com, secondary-confirmed]. Director
note (2026-06-11): scope is software-only for now, so the output should be
designed to shake hands with the SRS-style technical layer downstream — in
our chain, rungs 3–4 play that role.

## 2. The forms, and when each fits

- **One-pager / product brief** — problem, why-now, goals/non-goals,
  success measures, open questions on one page. Fits features and the
  alignment moment; "works for features under ~2 weeks of effort"
  [ideaplan.io, snippet]. Intercom's Intermission is the extreme form:
  "An Intermission must always fit on a printed A4 page. If it does not,
  you haven't a clear enough view of the problem yet" [the template
  itself — primary-confirmed]; it *bans* solution content.
- **Full PRD** — adds requirements, acceptance criteria, risks,
  dependencies; earned by new-product launches and cross-team complexity.
  Length discipline: ~6–8 pages max; longer "no one actually reads it all"
  [carlinyuen.medium.com; engineering-leader perspective, csw11235].
- **Two-stage form** — a problem-space Brief gated before a solution-space
  Proposal: Kevin Yien (Square): Draft → Problem Review → Solution Review →
  Launch Review; Asana (Bavaro): Brief (problem statements, goals,
  non-goals, hypothesis) then Proposal; Figma (Yamashita): Problem
  Alignment → Solution Alignment → Launch Readiness [coda.io/@yuhki,
  primary; slab.com mirror, primary].
- **Amazon PR-FAQ** — a one-page mock press release + external and
  internal FAQs, written before anything is built, to vet ideas before
  committing "precious software development resources" [workingbackwards
  .com; Bryar/Carr]. Discipline: "truth-seeking vs. selling."
- **Basecamp Shape Up pitch** — Problem (one specific story) · Appetite
  (time budget *stated*, not estimated) · Solution (fat-marker sketches) ·
  Rabbit Holes · No-Gos. "It's critical to always present both a problem
  and a solution together" [basecamp.com/shapeup, primary, free book].

The live philosophical split: **problem-first vs problem+solution.**
Intercom bans the solution from the brief; Basecamp requires the pair;
Figma/Asana/Yien gate the solution behind problem sign-off. (For our chain
this is mostly settled by structure: rung 1 already emits the validated
problem, so rung 2 *is* the definition step.)

## 3. The method's one rule, across every school

Same sequencing law rung 1 found, one layer up: **the definition document
is written after the problem-and-discovery work, never instead of it.**
Cagan: "in nearly every case I see, the PRD is written instead of the
product discovery work, rather than after" — and, at full volume, "you may
as well just give up on innovation and hire Accenture" [svpg.com/
discovery-vs-documentation, 2021-08-25; secondary-confirmed verbatim, site
blocks fetch]. Cagan's Opportunity Assessment puts ten questions before any
spec (problem, target, size, alternatives, differentiator, why-now, GTM,
metrics, critical factors, recommendation) [product-frameworks.com], and
four risks to surface in discovery first: value, usability, feasibility,
business viability [svpg.com/four-big-risks, snippet].

**Missing-input convention — declare, don't block:** practitioners put TBD
placeholders and explicit assumption/open-question sections rather than
halting or backfilling ["It's fine to put TBD as a placeholder," Atlassian
guide, snippet; "PRDs are discovery documents," focusedchaos.co]. This is
the industry's independent confirmation of our degraded-and-labeled rule.

## 4. The golden path (synthesis across schools)

1. **Confirm the problem is validated and worth it** — opportunity
   assessment / four risks; customer evidence in hand [SVPG;
   product-frameworks.com].
2. **Anchor the customer** — exactly who, with evidence: "How do we know
   this is a real problem and worth solving?" [Lenny's template via
   Atlassian, primary].
3. **Problem statement before any solution text** — "I firmly believe
   that nailing the problem statement is the single most important step in
   solving any problem" [Lenny, primary]; Asana's form: "I am [who]. I am
   trying to [outcome]. But [barrier]…" [slab mirror].
4. **Draft solo** — one author; Amazon goes further: no author name on the
   doc, ideas over credentials [theprfaq.com].
5. **State goals as outcomes, non-goals as contested exclusions, metrics
   typed** (see §6).
6. **Order the document for the reader** — Nan Yu (Linear): "Start with
   the highest level and get more granular. Start with the widest
   audience, and get narrower. Start with the stuff that's least likely to
   change" [x.com/thenanyu, primary].
7. **Review loop: silent read → structured discussion → revise** — 3–5
   reviewers, 15–20 min silent annotation, section-by-section debate, 2–4
   cycles; most Amazon PR/FAQs get rejected or significantly reworked, by
   design [workingbackwards.com; productmanagementresources.com].
8. **Gate problem alignment before solution alignment** [Figma; Yien].
9. **Keep it living** — dated changes; re-read the problem statement at
   every design review [perforce.com; Lenny via Atlassian].

## 5. Root causes of failure

1. **Document as substitute for discovery.** The deepest one (Cagan, §3).
   Jeff Patton names the mechanism: "Shared documents aren't shared
   understanding" [User Story Mapping]; discovery that changes no decision
   is theater [Torres, via summary — snippet].
2. **Solution-first framing.** The pitched solution becomes the anchor;
   CB Insights (primary): 43% of 431 VC-backed shutdowns since 2023 cite
   poor product-market fit (older edition: 42% "no market need").
3. **Unmeasurable goals create false alignment.** "'It should be fast'
   invites arguments; 'p95 < 500 ms' ends them" [uladshauchenka.com].
   PMI 2014: 47% of unsuccessful projects fail on inaccurate requirements
   management; PMI 2018: 52% of projects report scope creep [two separate
   PMI reports — secondary-confirmed; pmi.org blocks fetch]. Standish/Chaos
   via Ambler: 45% of built functionality never used, 19% rarely
   [agilemodeling.com/essays/examiningbruf.htm, primary].
4. **Handoff loss at the seams.** Upstream: insights evaporate between
   discovery and document. Downstream: "If the first time your developers
   see an idea is at sprint planning, you have failed" [Cagan, Inspired];
   unshaped work pushes research to the wrong level [Cutler]; "Wireframes
   are too concrete… words are too abstract" [Singer, Shape Up, primary].
5. **No explicit non-goals → scope creep and design-by-committee.** Every
   stakeholder's wish is implicitly in scope; committee products become
   "collections of features rather than solutions" [itamarnovick.com].

Form critique worth holding: the spec-as-contract loop is "a turbo-charged
feature factory" [Cagan, snippet], and a written doc carries "a certain
gravity" that suppresses challenge [Cagan on X, snippet]. The counter is
not no-document — it's a document that traces to evidence and invites the
challenge (truth-seeking vs. selling).

## 6. Judging quality — the rubric the proof spec can borrow

Checkable by a cold reader on the printed artifact:

1. **Cold-read test:** an uninvolved reader can answer what it is, who
   it's for, and how we'll know it worked [ainna.ai]. (The circulating
   Cagan "5 team members" version of this is an unconfirmed paraphrase —
   use the test, don't quote it.)
2. **Goals are outcomes, not outputs:** "an outcome is a change in human
   behavior that drives business results" [Seiden, Intercom interview,
   primary]; beware the build trap [Perri]. Weak→strong: "improve
   checkout" → "reduce checkout abandonment 23% → 18%."
3. **Metrics are typed and decision-worthy:** one primary metric;
   guardrails that must not degrade [vwo.com; mixpanel.com]; rates over
   absolutes; vanity test — "would you make a business decision with it?"
   [leananalyticsbook.com, primary].
4. **Non-goals name contested terrain** — specific debated exclusions
   with rationale, not "we won't boil the ocean" [First Round / Mehta;
   productteacher.com]. "Every choice we make is a choice that we save
   our users from making" [Mehta, First Round, primary].
5. **Problem traces to evidence** — the Airbnb worked critique: a
   structurally complete 10-section PRD scored 2/10 — metrics "comically
   bad," "no proof of work" [news.aakashg.com, primary]. **Template
   completeness ≠ quality.**
6. **Acceptance criteria testable, no adjectives** [uladshauchenka.com;
   carlinyuen.medium.com].
7. **No disguised assumptions** — Amazon writing standards: eliminate
   weasel words; "don't disguise assumptions and hypothesis as facts"
   [theprfaq.com].
8. **Strategy linkage, not wishlist** [prodpad.com; perri].
9. **Length discipline** — one page for the brief form; ~6–8 pages PRD
   ceiling; narrative beats bullets (Amazon: bullet points let authors
   skip the logical connections) [seomba newsletter; sachinrekhi.com].
10. **Decision-enablement** — an engineer could estimate, a designer could
    start, a stakeholder could explain it back; the out-of-scope section
    surprises no one [ainna.ai]; great PMs write iteratively so teams are
    rarely blocked [Doshi, primary].

**Counterweight (Figma, primary):** "State all your goals, even those
immeasurable. Sometimes, the insistence on having only perfectly
measurable goals and KPIs prevents you from clearly explaining what you're
trying to achieve." Measurability is a discipline, not a censor.

## 7. Worked examples on file

Best-grounded primaries: Basecamp Shape Up pitch (entire book free
online); Figma PRD in Coda (authored, with rationale); Asana brief (Slab
mirror); Aha! template; Lenny's template (via Atlassian). Documented
before/after rewrite [productdo.io]: "Problem: in Q3 we need to replace
the old email notification system" (a solution wearing a problem costume)
→ "In Q3 we need to improve message delivery conversion: ~10%/day don't
reach passengers; 24% of those call support (85% peak load); 2% cancel;
16 litigated missed-flight cases last quarter" (quantified, consequences
chained). Caution for the future example gallery: most circulating "real
company PRDs" are reconstructions or AI-generated illustrations — only the
author-published ones above are safe exemplar stock.

Section frequency across 8+ templates: universal — problem statement,
goals/success measures; near-universal — non-goals, context, risks; ~half —
personas, timeline, open questions, appetite; contested — solution content
at the brief stage (§2 split).

## 8. The pre-answered elicitation manifest

Expert answers staged against the brief template's sections. The Director
still rules; these are the researched defaults to rule on.

- **§1 Goal** — emit a definition artifact that wins alignment and enables
  the next decision: problem (inherited, traced), what we're building and
  why now, goals as outcomes, non-goals naming contested exclusions,
  typed success metrics, declared assumptions/open questions. Done =
  passes the cold-read test (§6.1). Failure is a *distinct outcome*: where
  the problem brief can't support a claim, flag — never invent (the
  Airbnb 2/10 is what laundered confidence looks like).
- **§2 Trigger** — fires only on a validated problem; for us: a banked
  rung-1 problem brief (the chain enforces what the canon begs for, §3).
- **§3 Required knowledge** — the problem brief (with evidence grades);
  business context / why-now; competitive alternatives; constraints.
  Missing input → declare TBD and proceed degraded (industry convention =
  our rule, §3).
- **§4 Golden path** — the nine moves in §4, collapsed to our single-agent
  era: anchor → problem restate (traced, never re-derived) → definition →
  goals/non-goals → metrics → assumptions → reader-ordered render (Nan Yu
  rule) → self-check against §6.
- **§5 What could go wrong** — the five root causes in §5, each with its
  named counter; the play-specific top risk is #2 wearing rung-1's
  clothes: re-pitching the solution with the problem brief as decoration.
- **§6 Draft prompt language** — raw material: "truth-seeking vs.
  selling"; "a solution wearing a problem costume"; outcome-not-output;
  "the out-of-scope section surprises no one."
- **§7 Proof spec** — the ten-check rubric (§6) is eyeball-ready; the
  before/after pair (§7) seeds fixtures; the cold-read gate from rung 1
  transfers directly.
- **§8 Upgrade notes** — candidates: the review-loop (silent read →
  discussion) as a future compound/graph-era play; appetite (Shape Up) as
  a Director-owned field; PR-FAQ as a separate stretch play; Opportunity
  Assessment routes to rung 2b (Feasibility Check).

## 9. Where the rest of the canon routes

- Opportunity Assessment (10 questions) → rung 2b Feasibility Check.
- Given/When/Then acceptance criteria, ISO 25010 NFR checklists → rung 3b
  Write Acceptance Criteria.
- Narrative review meeting / silent-read protocol → the compound play's
  rehearsal, or a Raven-runs-a-review stretch play.
- OMTM / metrics typing in depth → a future metrics play; only the
  rubric-level discipline lives here.
- SRS / IEEE 29148 handshake → rungs 3–4 contract design (Director note,
  §1).

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per the audit's no-rewrite rule: the sections above stand as
the record of what was found; this section reweights them. Provenance:
Director ruling, 2026-06-12, source-canon audit
([`../../AUDIT-2026-06-12-source-canon.md`](../../AUDIT-2026-06-12-source-canon.md)).
The play passed the audit — "fit as-is; watch the §8 Amazon ceremony."*

- **Confirmed load-bearing: Cagan/SVPG and the tech-company template
  family** — Figma (Yamashita), Asana (Bavaro), Square (Yien), Linear
  (Nan Yu), Lenny's template. These are founder-facing and practitioner
  sources under the new canon rule (README, "Founder-facing canon
  first"), and they already own this play's skeleton: the one-page form,
  problem-before-solution, reader ordering, outcome goals, the
  immeasurable-goals counterweight. No rebalance needed.
- **Amazon Working Backwards: kept, split in two.** The cheap,
  startup-compatible borrowings stay load-bearing — draft solo, no
  author name on the doc, truth-seeking vs. selling, no disguised
  assumptions (§4 move 4, §6 checks 7/9). The **review-loop ceremony**
  (§4 move 7: 3–5 reviewers, silent-read annotation, section-by-section
  debate, 2–4 cycles) is **enterprise-tagged**: it presumes meeting
  hours a five-person team doesn't have. It stays a deferred §8
  candidate and is never promoted unmodified — any revival passes the
  startup-floor check (README, "The startup floor").
- **IEEE 29148 / BABOK / PMI / Standish material is defensive-or-
  decorative only.** The §1 document-chain map (MRD→BRD→PRD→SRS) is
  territory-orientation, cited only to route away from it; the §5
  PMI/Standish failure statistics are warnings, not method. None of
  this supplies skeleton, per ruling R1 — method-body and certification
  sources may back a single verified mechanism at most.
- **Mom Test evidence grades arrive with the input (ruling R4).** This
  play inherits rung 1's Fitzpatrick-graded evidence through the problem
  brief — the standing evidence bar. The grounding above carries no
  direct Fitzpatrick sourcing and doesn't need any: the bar is enforced
  upstream, and this play's trace discipline (every problem claim cites
  a brief entry, grade intact) is what carries it forward.
