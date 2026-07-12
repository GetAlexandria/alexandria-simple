# Grounding — the business-context elicitation canon

The cited source of truth for Elicit Business Context. Provenance: web
research by two Sonnet agents against `research-brief.md`, plus a
verification pass on the five load-bearing search-snippet-only claims,
2026-06-11. Primary sources fetched where possible; caveats flagged inline.
Raw trail: `extracted-claims.md`. This play is the canonical missing input
of Write the One-Pager / PRD (that play's grounding.md §8 lists
"business context / why-now" as a required input, marked TBD in the demo
chain).

## 1. What this artifact is

The output of this play is a **captured business context record**: a brief,
structured document that fixes the business side of a product decision
before design begins. It is not a requirements document, not a product
brief, and not a strategy memo. It is the structured output of one or more
stakeholder conversations, recording the answers to six questions: what
problem is the business trying to solve, why now, what is the appetite (time
and resource ceiling), what constraints exist across functional domains, what
assumptions are being made, and who has authority to approve the solution.

The artifact feeds directly into Write the One-Pager / PRD as the
"business context / why-now" input. Without it, the one-pager's §1 (goal),
§4 (golden path step 1: confirm problem validated and worth it), and
§6.7 (no disguised assumptions) cannot be populated from evidence.

The form is thin by design — 1–2 pages maximum. Productboard: briefs
exceeding that range "cross into PRD territory and lose their alignment
function" [productboard.com/glossary/product-brief/]. ParallelHQ confirms
that "teams often omit constraints, which later cause friction"
[parallelhq.com/blog/what-product-brief] — so the document's job is to
force those constraints onto the page before any design work begins.

## 2. The method's one rule

**Stakeholder input is a hypothesis, not a specification.** This is the
rule every school agrees on, stated with different vocabulary.

BABOK: trace every requirement back to business goals and objectives to
"validate whether a REQ should be included" [babokpage.wordpress.com]. BABOK
does not treat stakeholder answers as ground truth; it treats them as inputs
to a confirmation process.

Cagan: "Few things destroy morale or confidence in the product manager more
than finding out after a product has been built that the product manager did
not understand some essential aspect of the business" [INSPIRED via
grahammann.net]. The PM's job is not to take the stakeholder's answer as
fact but to understand the domain well enough to recognize a constraint when
they hear one.

Torres: "When you present your conclusions, you're not sharing the journey
you took to reach those conclusions. You're inviting an opinion battle — a
battle you have no chance of winning" [producttalk.org/stakeholder-
management/]. The counter is to surface the journey, not the verdict.

Dan Brown (EightShapes): the interviewer's essential mindset is skepticism —
"uncovering assumptions by validating organizational norms rather than
accepting them as self-evident" [medium.com/eightshapes-llc/the-delicate-
art-of-interviewing-stakeholders-d6496443cbec]. Stakeholder answers produce
raw materials for design; asking stakeholders for requirements directly is
a mistake because "that work belongs to the design team" [Brown, same].

## 3. The golden path

Eight moves, synthesized across BABOK, Cagan, Shape Up, Amazon Working
Backwards, and Torres.

**Move 1 — Review existing documentation before any stakeholder contact.**
BABOK lists document analysis as "one of the most effective ways of kick-
starting the requirements elicitation phase," reviewing existing business,
system, and project documentation to understand background and identify
requirements [iiba.org/knowledgehub/ snippet]. This prevents wasting
executive time on facts already written down. Required inputs for BABOK
interviews include Organizational Process Assets — meaning the documented
record must be reviewed first.

**Move 2 — Map stakeholders by domain before scheduling conversations.**
Identify which person holds which constraint: finance, legal, sales,
marketing, brand, BD, senior leadership. The Codurance framework recommends
covering Roles and Responsibilities before the Business Background section
in any stakeholder interview [codurance.com/publications/how-to-structure-
stakeholder-interviews-and-set-your-product-discovery-off-right]. NNGroup:
"the earlier in the process you can speak to stakeholders, the better"
[nngroup.com/articles/stakeholder-interviews/].

**Move 3 — Conduct one-on-one constraint interviews, not group sessions.**
NNGroup identifies "conducting interviews in group settings rather than
one-on-one" as a named failure mode that suppresses candor
[nngroup.com/articles/stakeholder-interviews/]. Cagan's prescribed framing:
"Spend one-on-one time with key stakeholders: sit down with them and listen.
Explain that the better you understand their constraints, the better our
solutions will be" [INSPIRED via grahammann.net]. Topic areas to cover
(NNGroup): success metrics, priorities, history/expertise/constraints, and
process preferences — not requirements directly.

**Move 4 — Set appetite before any design discussion.**
Ask the business side "How much time is this worth to us, strategically?"
before any scope discussion begins. Shape Up (Singer / Basecamp): "Estimates
start with a design and end with a number. Appetites start with a number and
end with a design" [basecamp.com/shapeup/1.2-chapter-03]. The appetite is
the output of the business context conversation, not a design output. "We
use the appetite as a creative constraint on the design process" [Singer,
same]. Starting from scope rather than appetite locks teams into agreed
scope even when it is not the best solution [boagworld.com/emails/project-
planning-based-on-appetite/].

**Move 5 — Force the why-now and assumption surface.**
Run the Amazon internal FAQ frame: What assumptions must be true for this
to succeed? What are the top three reasons this will not succeed? What is
the upfront investment, and how is that risk managed? What challenging
problems — business model, legal, engineering — need to be solved?
[workingbackwards.com/resources/working-backwards-pr-faq/]. Cagan's
Opportunity Assessment adds "Why now?" (market window) as a mandatory field
[itsadeliverything.com citing Cagan/SVPG]. Capture the competitive
differentiation claim and its basis.

**Move 6 — Handle solution-led stakeholders with the reversed-OST
technique.**
When stakeholders arrive with a solution already in mind (common), do not
accept the solution as the context. Use reversed-OST (Lab Zero /
MindTheProduct): ask "What customer is this for? What problem does it solve?
Where did that insight come from? What must be true for this to succeed?
Which assumption feels the most uncertain?" [mindtheproduct.com/reversing-
teresa-torres-opportunity-solution-tree-to-find-the-why-behind-solutions/,
primary-confirmed]. This surfaces the actual business context without
accepting the framing of the proposal.

**Move 7 — Record constraints and budget authority, not just budget amount.**
HolaBrief's client discovery template asks "Where is this budget coming
from?" and "Is the budget owner involved in the decision-making?" [holabrief.
com/questionnaire/client-discovery-template, primary]. Both are required.
Cagan's viability sub-risks provide the constraint checklist: financial,
business development, marketing, sales, legal [INSPIRED via grahammann.net].

**Move 8 — Confirm and flag open questions immediately after each session.**
Torres: ask "Has anything changed since we last agreed on this outcome" and
"Did we miss anything?" before moving to the next phase
[producttalk.org/stakeholder-management/]. The captured business context
document is a starting point for discovery, not a closed specification.
ParallelHQ: "Waiting until the last minute to consult engineering or
marketing leads to pushback. Invite them during the drafting stage"
[parallelhq.com/blog/what-product-brief].

**Block vs. proceed rule (when context is missing):**
Cagan: block. Proceeding without validated business viability context is
the primary root of wasted build cycles. BABOK: declare the gap explicitly;
treat the missing item as a risk requiring mitigation before elicitation
results can be confirmed. Shape Up: do not set an appetite until someone
with betting authority has answered "is this worth doing, and for how long?"

## 4. Root causes of failure

**Root cause 1 — Authority substitutes for evidence (HiPPO mechanism).**
In hierarchical organizations, seniority confers decision authority that
feels like epistemic authority. Teams stop distinguishing between "the
executive said X" and "X is true." Dovetail: "the downsides of decreased
team morale get amplified if more qualified individuals stop proposing new
ideas because they fear they won't be valued"
[dovetail.com/product-development/how-to-manage-the-hippo-effect-in-product-
management/]. Over time, customer-facing teams disengage from planning
entirely [UserVoice blog, search-snippet level].
Named counter-practice: share every step of discovery with stakeholders
so they travel the reasoning journey alongside the team, not just receive
conclusions (Torres). The product team owns the opportunity assessment;
authority figures are given the business-constraint delivery role, not the
solution-definition role (Cagan).

**Root cause 2 — Strategy delivered as aspiration, not as diagnosis.**
Organizations express strategic fit in slogans ("be best in class,"
"customer-first," "grow the platform") that cannot be tested, falsified, or
translated into trade-off decisions. Rumelt: this is "fluff — a form of
gibberish masquerading as strategic concepts or arguments"
[lennysnewsletter.com/p/good-strategy-bad-strategy-richard]. "Goals,
ambitions, visions, missions, values — none of these things are a strategy"
[Rumelt, same]. Intake artifacts that accept slogans as answers produce
unanchored product work.
Named counter-practice: require a diagnosis — what has changed in the world,
why the current state is inadequate — before any goal or solution language
is permitted. Gothelf's Lean UX Canvas Box 1 operationalizes this: "what is
the current state of the product, why it isn't meeting expectations, and if
we solve it, how will we know (what customer behavior or metric shift will
we see)?" [jeffgothelf.com/blog/leanuxcanvas-v2/].

**Root cause 3 — Appetite deferred until after scope is established.**
When stakeholders are asked "what do you want?" before "how much time are
you willing to spend?", scope is established without a constraint and any
later budget conversation becomes a conflict over cutting features already
emotionally committed. Shape Up: "Without a time limit, there's always a
better version" [basecamp.com/shapeup/1.2-chapter-03]. Miro: "Poor
communication with stakeholders may result in their changing expectations
and requirements throughout the project, causing scope to expand"
[miro.com/project-management/what-is-scope-creep/].
Named counter-practice: appetite-first framing — state the time-box or
budget ceiling before any scope discussion. Shape Up formalizes this as
appetites (fixed time, variable scope). Paul Boag extends it to client
projects: start with appetite, negotiate scope to fit
[boagworld.com/emails/project-planning-based-on-appetite/].

**Root cause 4 — Stakeholder input ingested as requirements.**
Teams trained to gather requirements treat stakeholder answers as
specifications. Stakeholders speak confidently about solutions; teams
transcribe rather than interrogate. The result is a product that serves the
HiPPO rather than the user. "Product managers are treated as order-takers —
merely prioritizing features from stakeholders" [workablestrategy.substack.
com/p/the-top-10-mistakes-misconceptions]. "Prioritizing features that
please leadership or the most opinionated stakeholders without validating
the manifestation of the user problem" is a named top-10 PM mistake [same].
Named counter-practice: assumption mapping. Torres: generate assumptions
together, let stakeholders see what their idea rests on. Brown (EightShapes):
skepticism as a deliberate interviewer stance. NNGroup: active probing
("Can you give me an example?") rather than transcription.

**Root cause 5 — Context capture is treated as a one-and-done artifact.**
Business context documents written at project start and treated as closed
specifications become stale as the world changes. Teams optimize toward the
original framing even when conditions have shifted. Productboard: warns
against "treating briefs as static documents rather than living artifacts"
[productboard.com/glossary/product-brief/]. Torres: continuous stakeholder
engagement with incremental sharing, not batch disclosure.
Named counter-practice: the brief explicitly includes an open-questions
section, treating itself as a starting point for discovery. Each
re-engagement begins with "Has anything changed since we last agreed on
this outcome?" (Torres).

## 5. Judging quality — the eyeball rubric

Ten checks a non-developer Director can run on a captured business context
artifact. Each check is binary: the artifact passes or fails.

**Check 1 — Single-sentence problem statement naming who and what, with no
solution language.**
Weak: "We need a dashboard for the marketing team." (solution embedded)
Strong: "Marketing managers at mid-market SaaS companies cannot see
cross-channel campaign ROI in one view, costing 10–15% of quarterly ad
spend in delayed reallocation." (from ParallelHQ product brief example)

**Check 2 — Why-now answered with a named condition, not a generic
aspiration.**
Weak: "This is strategically important to us." (Rumelt-class fluff,
untestable)
Strong: "Competitor X shipped this feature in Q1; three enterprise
prospects cited its absence in lost deals." (Cagan Opportunity Assessment
Q6 fulfilled)

**Check 3 — Appetite stated as a fixed number or range, not derived from a
wishlist.**
Weak: "Budget TBD; scope to be defined." (scope-first, sets up scope-creep
failure)
Strong: "Six-week cycle, standard two-person team; scope will flex to fit."
(Shape Up pattern)

**Check 4 — Success criteria stated as behavioral or metric outcomes, not
delivery milestones.**
Weak: "Launch the feature by Q3." (delivery milestone)
Strong: "25% increase in customer retention within 90 days of launch."
(Lean UX Canvas Box 2 format, Gothelf)

**Check 5 — Constraints and assumptions separated, each labeled.**
Weak: no constraint section at all (common omission per ParallelHQ and
Productboard)
Strong: "Constraints: must integrate with existing SSO; no new
infrastructure budget. Assumptions to validate: users will prefer self-serve
over assisted onboarding."

**Check 6 — Stakeholder statements attributed as opinions or hypotheses,
not as facts.**
Weak: "CEO confirmed customers want real-time notifications." (HiPPO input
laundered into fact)
Strong: "Exec sponsor believes customers want real-time notifications
[to be validated in discovery interviews]." (Torres / ProductTalk framing)

**Check 7 — Strategic alignment stated as a named OKR or priority, not a
slogan.**
Weak: "Aligns with our growth strategy." (non-testable Rumelt-class slogan)
Strong: "Supports FY26 OKR: reduce churn from 8% to 5% — this initiative
targets the primary reason in exit surveys."

**Check 8 — Decision authority identified: who approves, who can veto,
whether the budget owner is present.**
Weak: no authority field
Strong: "Budget owner: CFO (approved). Decision authority: VP Product.
Stakeholders with veto: Legal (compliance review required)."
(HolaBrief + DACI framework)

**Check 9 — Artifact is 1–2 pages, not a multi-page PRD or a 3-bullet
deck.**
Weak: 12+ sections with requirements, wireframe descriptions, and detailed
cost breakdown (Productboard: "crosses into PRD territory")
Strong: 1-page charter or brief with 8–10 labeled fields, each answered in
1–3 sentences (Productboard max 2 pages)

**Check 10 — At least one explicit open question or assumption test, showing
the artifact treats itself as a starting point.**
Weak: no open questions; document reads as a complete specification
Strong: "Open question: we do not yet know whether the target segment will
pay for this tier; discovery sprint planned for weeks 1–2."

## 6. Worked examples

**Strong: Amazon internal FAQ template** [workingbackwards.com, primary].
Forces explicit answers to: what assumptions must be true; what are the
top three reasons this will not succeed; what is the upfront investment and
how is that risk managed; what challenging problems need to be solved; what
third-party dependencies exist. Structure prevents sloganeering by requiring
specific answers to specific questions.

**Strong: Cagan Opportunity Assessment** [itsadeliverything.com citing SVPG].
Ten questions answered before any spec: what problem, who, size, alternatives,
differentiator, why now (market window), GTM approach, success metrics,
critical factors, go/no-go. The three most critical: exactly what problem,
for whom, how will we measure success.

**Strong: Lean UX Canvas Box 1 + Box 2 pair** (Gothelf) [jeffgothelf.com/
blog/leanuxcanvas-v2/]. Box 1: name what has changed in the world, why the
current state is inadequate, how success will be visible in customer behavior.
Box 2: state a behavioral change with a measurable metric. The pairing
forces both diagnosis (Box 1) and a verifiable outcome (Box 2) before any
solution work begins.

**Weak: sloganized strategy brief (Rumelt-pattern).** A brief stating
"This initiative aligns with our strategic pillar of customer-centricity
and will drive growth by improving the user experience" fails four of the
ten checks above simultaneously: no diagnosis, no why-now, no appetite, no
open questions. Rumelt: "fluff is a form of gibberish masquerading as
strategic concepts" [lennysnewsletter.com/p/good-strategy-bad-strategy-
richard]. The artifact is structurally present but epistemically empty.

**Weak: solution-first brief.** "We need to build a mobile onboarding flow"
is a solution wearing a problem costume (cf. productdo.io before/after
analysis from Write the One-Pager grounding). The reversed-OST technique
exists precisely for this case: trace the proposed solution back to the
customer it is for, the problem it solves, and where that insight came from
[mindtheproduct.com/reversing-teresa-torres-opportunity-solution-tree-to-
find-the-why-behind-solutions/].

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. Director still
rules; these are the researched defaults.

**§1 Goal** — emit a captured business context record: problem diagnosis,
why-now with named trigger, declared appetite, domain constraints (finance /
legal / sales / marketing / BD / brand), explicit assumptions labeled as
such, decision authority identified. Done = passes all ten eyeball checks
(§5 above). Failure is distinct: if the artifact fails checks 1, 2, or 3
(no diagnosis, no why-now, no appetite), it cannot feed Write the One-Pager
without downstream pollution.

**§2 Trigger** — fires when a new initiative, feature, or bet has been
named but before Write the One-Pager begins. Specifically: the chain
requires a validated problem brief (from Frame the Problem) and a captured
business context record (this play) before the one-pager can be written.
This play provides the second input. It also fires as a stand-alone play
when a stakeholder arrives with a solution already in hand and the business
context has not been made explicit.

**§3 Required knowledge** — (a) a stated business need or named initiative
(BABOK: required before any elicitation technique is applied); (b) a
stakeholder list with roles and decision rights; (c) existing documentation
reviewed (strategy docs, prior roadmaps, contracts, compliance obligations)
before stakeholder contact. Missing stakeholder list: ask the Director.
Missing documentation: attempt document analysis first; log what is absent.
Missing business need entirely: do not run this play; surface the gap.

**§4 Golden path** — the eight moves in §3 above. The key sequencing
constraints are: documentation before stakeholder contact (Move 1); 1:1
interviews before any group session (Move 3); appetite declared before scope
discussed (Move 4); solution-bearing stakeholders handled via reversed-OST
(Move 6).

**§5 What could go wrong** — the five root causes in §4 above, each with
its named counter-practice. Top risk for this play specifically: stakeholder
provides a solution framed as context (treated as Root cause 4 + the
reversed-OST response). Second risk: appetite is deferred with the
justification that "scope isn't scoped yet" — this locks in scope-first
sequencing and must be refused (Root cause 3).

**§6 Draft prompt language** — raw material: "stakeholder input is a
hypothesis, not a specification"; "explain that the better I understand your
constraints, the better our solutions will be" (Cagan); "has anything changed
since we last agreed on this outcome?" (Torres); "what are the top three
reasons this will not succeed?" (Amazon); "fluff — a form of gibberish
masquerading as strategic concepts" (Rumelt); "appetites start with a number
and end with a design" (Singer).

**§7 Proof spec** — the ten-check rubric (§5 above) is eyeball-ready for
the Director. Fixture: a stakeholder brief that passes checks 1–3 and
5–8 but fails checks 4, 9, and 10 (delivery milestone instead of outcome,
too long, no open questions). Correct behavior: flag the three failures,
do not invent what the outcomes or open questions should be.

**§8 Upgrade notes** — the stakeholder review gate (Cagan: "when you show
your prototype to a stakeholder and want to make sure they see and note
everything that might be a concern") could become a separate play: Validate
With Stakeholders. The laddering technique and 5-Whys comparative work
could support a future Unpack Assumptions play. The reversed-OST is
currently embedded as a conditional path in Move 6; in a compound-play era
it could be triggered as a sub-play when stakeholder input is solution-led.

## 8. Where this play meets rung 2

This play is a compound input of Write the One-Pager / PRD. The chain is:
Frame the Problem (rung 1) → **Elicit Business Context** (this play) →
Write the One-Pager / PRD (rung 2). The one-pager's grounding.md §8 lists
"business context / why-now" as a required input and marks it TBD in the
demo. This play's artifact fills that TBD slot.

In the demo, the artifact is declared TBD and the one-pager proceeds
degraded per the "declare, don't block" convention (Write the One-Pager
grounding.md §3). Once this play is hardened and in the chain, a missing
or empty business context record should cause the one-pager play to ask
the Director before proceeding, not proceed silently degraded.

The appetite and constraints captured here also govern the non-goals and
out-of-scope sections of the one-pager: what the business explicitly
declined to fund or chose not to pursue during this cycle. Those fields
cannot be populated correctly without the output of this play.

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(../../AUDIT-2026-06-12-source-canon.md). The sections above stand as the
record of what step 0 found; this amendment records which sources survived
the audit and which were demoted, so a revival starts from corrected canon.*

**Confirmed — the surviving material.** Shape Up's appetite-first framing,
the reversed-OST move, Amazon's "top three reasons this won't succeed,"
Rumelt's fluff test, and the Torres close all held up as startup-fit. They
are exactly the pieces that were absorbed into the rung 1–2 elicitation —
the three absorbed questions (why now / appetite / top three reasons this
fails) are now declared in write-the-one-pager's brief.

**Demoted to enterprise-tagged.** BABOK/IIBA — organizational process
assets, the nine-techniques framing, prepare-for-elicitation. This canon
supplied the play's skeleton, and that is where the damage was: it inflated
Moves 1–3 into a documentation review, a seven-domain stakeholder map, and
serial 1:1s that decline group conversations. At startup scale all seven
domains are usually one founder. BABOK material may survive as a single
verified mechanism citation (per audit ruling R1), never as the skeleton.

**Bibliography filler.** Smartsheet, DACI, and Miro citations added bulk,
not load-bearing claims.

**Revival direction.** Re-skeleton on Mom Test conversation rules applied to
internal stakeholders, with Ash Maurya's Lean Canvas as the artifact form.
