# Elicitation trace — Size the Opportunity (pre-filled from research, 2026-06-12)

**Experiment:** elicitation-review mode. Instead of a question-by-question brief
conversation, the orchestrator pre-fills the entire design brief from step-0
research, and the Director reviews the built artifact and what came out of the
elicitation at the same time. Nothing here is Director-ratified. The right way
to read this document: for each section, the research gave us this — the draft
adopted this — here is what is still open. Then the decision queue at the end
collects every call the Director needs to make.

---

## Section by section

### §1 Goal

**Template question:** What artifact or state does a successful run produce?
Who consumes it? What is the done-condition? What does a failed run look like?

**What the research answered:**

grounding.md §7 (§1 Goal) states the expert answer directly:

> "Produce a single, comparable estimate (or range) of the value of solving
> this opportunity, expressed in the team's agreed North Star units, with
> explicit assumptions documented. Done = the team can state: 'If we solve X
> for Y users who experience it Z times, the impact on [North Star] is
> approximately N, with high/medium/low confidence, under these assumptions.'
> Failed run = the output is a raw TAM number with no bottom-up model;
> alternatives are not named; different ideas are sized against different
> metrics making comparison impossible; or assumptions are undeclared."

grounding.md §1 establishes the downstream consumer: "In the context of Write
the One-Pager / PRD, this play supplies the why-now and value-vs-alternatives
section. The sizing artifact is an input, not a deliverable in its own right."

grounding.md §2 establishes the one inviolable rule for the done-condition:
"Every sizing must be expressed in the same North Star unit as every other sizing
being compared. If you assess one idea based on projected revenue and another on
projected enrollments, you'll have no way to compare the two." [Built In,
builtin.com]

**What the draft adopted:** The goal section adopts the research answer nearly
verbatim, with the Shopify done-condition statement as the concrete test and the
four failure modes from grounding.md §7 as the reportable failure definition.
The downstream consumer (Write the One-Pager / PRD) is named explicitly.

**What remains open or thin — UPDATED 2026-06-12:** The spoken rendering
question was flagged open at prefill. It is now resolved. Director ruling
2026-06-12: every rung-2 input play carries a spoken read-back alongside its
filed artifact; ceiling 100 words for this play. Brief §1 updated to reflect
the two-renderings shape. The one remaining upstream dependency — whether the
one-pager's "no generated sizing" law changes how the filed artifact is consumed
— is surfaced in §8 Upgrade notes and Decision 5 in the queue. That seam is
distinct: the spoken read-back is addressed to the room, not to the one-pager,
and the ruling does not touch it.

---

### §2 Trigger

**Template question:** What fires this play in the meeting — name-call, button,
schedule, or another play's output?

**What the research answered:**

grounding.md §1: "Sizing fires when a go/no-go decision or resource-allocation
choice between competing initiatives must be made." Giovanni Fernandez-Kincade
(Related Works, medium.com/related-works-inc): "Opportunity sizing isn't so much
about making a precise forecast... It's really about creating this separation so
it's easier to make decisions."

grounding.md §7 (§2 Trigger): "Must NOT fire before: the North Star metric is
agreed; the target customer segment is named; a problem statement (not a solution)
exists; at least one baseline data point is in hand."

grounding.md §8: The three compound inputs (Frame the Problem, Market/Competitor
Scan, Size the Opportunity) must all complete before rung 2 fires.

**What the draft adopted:** The prerequisite state is adopted verbatim from the
research. The parallel-compound-input pattern is stated. The exact invocation
mechanism (name-call in the meeting vs. orchestrator dispatch) is flagged as
a DIRECTOR DECISION, since this is an era-specific implementation choice the
research does not answer.

**What remains open or thin:** The research does not address invocation
mechanics (how the play gets named in the meeting). This is flagged open and in
the decision queue.

---

### §3 Required knowledge

**Template question:** What must the agent already know or have in hand? What
happens when each input is missing? Which inputs are untrusted?

**What the research answered:**

grounding.md §7 (§3 Required knowledge): Two input schools identified.
Bottom-up school requires: affected user count, frequency of pain, revenue/impact
per event, expected lift from comparable initiatives, current baseline metric.
Cagan/ODI school requires: problem statement, target market, competitive
alternatives, importance and satisfaction scores.

grounding.md §4 (root cause 2): Without a problem statement, the play sizes
the product rather than the job-to-be-done — a documented failure mode.

grounding.md §2: Without an agreed North Star metric, comparison is impossible —
"you'll have no way to compare the two." This is the method's one core rule.

grounding.md §3 (Move 5) and grounding.md (§4, extracted-claims.md §4):
"When a data point is missing: do NOT block — proceed directionally, declare
the gap explicitly, use ranges, and flag which assumption is load-bearing."
[Shopify Engineering; Related Works]

**What the draft adopted:** The research's two hard-required inputs (problem
statement and North Star metric) are distinguished from the degrade-politely
inputs. The ODI path is listed as optional/enriches-when-present. The
untrusted-input clause is applied to any material from outside the team (customer
transcripts, third-party reports) per the field-review rule.

**What remains open or thin:** The North Star dependency has a design decision
embedded in it — hard gate (refuse to run) versus soft gate (run and flag
critically). The research gives the method's core rule but does not settle the
gate classification. This is surfaced in the decision queue as open question 2.

---

### §4 Golden path — the moves

**Template question:** One line per move, smallest steps you can defend.
Declare the doer honestly: judgment / software / human.

**What the research answered:**

grounding.md §3 gives eleven ordered moves, each with attribution:

- Move 1: Anchor to North Star metric. [Built In; Shopify Engineering]
- Move 2: State problem and target segment precisely. [Torres; Cagan; Ulwick]
- Move 3: Map alternatives and the do-nothing baseline. [Cagan; ProductPlan]
- Move 4: Run bottom-up calculation. [Shopify Engineering; waveup.com; pitchdoctor.app]
- Move 5: Document every assumption with a range and confidence grade. [Shopify Engineering; Related Works]
- Move 6: Apply realistic SOM penetration. [pear.vc; thetopvoices.com]
- Move 7: Cross-validate with top-down estimate. [waveup.com; pear.vc]
- Move 8: Score importance vs. satisfaction gap (Ulwick ODI). [Ulwick; JP Carrascal, UXR @ Microsoft]
- Move 9: Synthesize single sizing statement. [Shopify Engineering]
- Move 10: Go/no-go recommendation. [Cagan; product-frameworks.com]
- Move 11: Post-launch calibration. [Shopify Engineering]

The research also supplies the doer classification foundation: bottom-up
calculation is stated as formula-based (software-eligible), but assumption
sourcing and segment scoping require comprehension (judgment).

**What the draft adopted:** The eleven canonical moves are collapsed into nine
play steps, with Move 11 (post-launch calibration) relegated to Upgrade notes
as not automatable in this era, and Move 10 (go/no-go) held as a DIRECTOR
DECISION on whether the play emits a recommendation or leaves that call for the
Director gate. A `self_check` step is added (not in the research's eleven) as
a mechanical quality gate following the playbook pattern from Frame the Problem.
Doer calls made by the orchestrator:

- `anchor_unit` — judgment (requires confirming team agreement, not just checking
  a field)
- `scope_segment` — judgment (behavioral vs. demographic distinction requires
  comprehension)
- `map_alternatives` — judgment (enumerating and evaluating alternatives requires
  comprehension)
- `bottom_up` — judgment (assumption sourcing and confidence grading require
  comprehension; the arithmetic itself is mechanical but inseparable from the
  judgment about what to use)
- `apply_som` — software (closed arithmetic once the penetration rate is given)
- `cross_validate` — judgment (interpreting convergence gap requires comprehension)
- `score_odi` — judgment (conditional on data presence; applying formula is
  mechanical but interpreting its meaning is not)
- `synthesize` — judgment (integrating all prior outputs into one statement)
- `self_check` — software (closed rules, each checkable without comprehension)

Orchestrator call — ratification owed (move-collapsing decisions; doer
classifications for each step; whether `anchor_unit` failing should be a hard
stop or a Director-challenge).

**What remains open or thin:** The go/no-go call (Move 10) is open. The exact
boundary between `bottom_up` judgment and the arithmetic software inside it
may deserve a sub-move split in a future hardening round. Two moves — `render`
(move 10) and `pause` (move 11) — were added to the golden path per Director
ruling 2026-06-12 (spoken read-back on every rung-2 input play). Doer
classifications follow the rung-1 pattern: both judgment.

---

### §5 What could go wrong

**Template question:** Failure hypotheses, each tagged with severity and
response.

**What the research answered:**

grounding.md §4 gives five documented root causes with named counters:

- Root cause 1: Narrative use vs. operational use (sizing to impress, not to plan).
  Counter: dual test — would this number survive a sales-quota conversation?
  [Zenit Data; Pear VC; PitchDoctor]
- Root cause 2: Confusing product with problem (sizing the product, not the job).
  Counter: define the market at the outcome level, not the product level.
  [Ulwick/Strategyn; Cordis case — "from 2% to over 20%"]
- Root cause 3: Omission of alternatives including do-nothing.
  Counter: Cagan's "alternatives" is a standalone mandatory question.
  [Cagan; ProductPlan]
- Root cause 4: Demographic rather than behavioral segmentation.
  Counter: segment on behavioral/attitudinal signals — who already pays for a
  workaround, who has the problem frequently.
  [Zenit Data; Torres; Scalepath]
- Root cause 5: Single-method anchoring without triangulation.
  Counter: require both bottom-up and top-down independently; divergence >30%
  signals a broken assumption.
  [Pear VC; Underscore VC; waveup.com]

grounding.md §7 (§5 What could go wrong) also names three play-specific top risks:
root cause 1 first (TAM number that passes inspection but can't survive a
sales-quota test), root cause 3 second (alternatives omitted entirely), root cause
4 third (demographic segmentation inflating the addressable count).

**What the draft adopted:** The five root causes plus additional mechanical
failure modes (revenue/transaction conflation, missing-input-laundering, North
Star missing) are translated into the hypothesis table. Playbook-wide defaults
(three-strikes-then-freeze; decision classification) are stated per template.

**What remains open or thin:** The grounding doc flags the do-nothing baseline
as a documented omission pattern but doesn't give a severity classification
specifically. The orchestrator rated it `errored` (output is incomplete in a
way that makes the comparison invalid). This is an orchestrator call — ratification
owed.

---

### §6 Draft prompt language

**Template question:** First-pass words for the judgment moves. Rough is fine —
intent, tone, and the calls only the Director can make.

**What the research answered:**

grounding.md §3 gives the grounded method in paraphraseable language throughout.
Key verbatim quotes usable as prompt anchors:

- "Opportunity sizing isn't so much about making a precise forecast... It's
  really about creating this separation so it's easier to make decisions."
  [Fernandez-Kincade, Related Works]
- "If you assess one idea based on projected revenue and another on projected
  enrollments, you'll have no way to compare the two." [Built In]
- "The process is the proof. How did you get there? That's what matters."
  [Richard Dulude, Underscore VC]
- "Be conservative in your initial estimates." [Shopify Engineering]
- Shopify format: "if we build X, we will acquire MM (+/- delta) new active
  users in T timeframe under DD assumptions."

grounding.md §5 provides the eight-check quality rubric in strong/weak example
form — strong prompt anchors.

**What the draft adopted:** Prompt language drafted from the research, organized
around four beats: (a) the unit rule, (b) the bottom-up build, (c) the alternatives
comparison, (d) the synthesis statement. The words are a starting point only.
The posture note (Manager tier in v1, matching Frame the Problem) is proposed as
an orchestrator call.

**What remains open or thin:** The go/no-go posture is held open (see decision
queue). Whether the prompt carries a strong "here is the recommendation" close
or a neutral synthesis-and-hand-off close depends on the Director's ruling on
open question 3. Render/pause prompt language was added in §6 per Director
ruling 2026-06-12; marked PROPOSED — exact words are Author's to polish.

---

### §7 Proof spec

**Template question:** What fixture? What does pass look like? What failure case
will be demonstrated?

**What the research answered:**

grounding.md §5 provides an eight-check eyeball rubric explicitly described as
"Director-readable" — each check is a yes/no question that a non-developer
Director can apply by reading the artifact.

grounding.md §6 provides two grounded worked examples ready to seed fixtures:
- PipeCo (strong): 120,000 plumbing companies × $7,200/year = $864M, all inputs
  traceable. [pitchdoctor.app — primary]
- Global healthcare TAM × 10% (weak): the classic planted failure form.
  [Underscore VC contrast; pitchdoctor.app]

grounding.md §7 (§7 Proof spec): "The planted failure case: a raw top-down TAM
number with a stated 10% capture rate and no bottom-up derivation, no
alternatives named, no do-nothing baseline. Correct behavior = flag each gap,
not invent numbers to fill them."

**What the draft adopted:** The eight-check rubric is adopted verbatim as the
pass-looks-like list. The planted failure case is adopted verbatim. The fixture
construction itself is left as a DIRECTOR DECISION (what domain to cast it in).

**What remains open or thin:** The research does not answer: (a) what domain to
cast the golden-path fixture in (PipeCo as-is, or re-skin to a software product
context?), (b) whether an "empty" case is needed (analogous to Frame the Problem's
empty-map demo) — that is, when all inputs are missing. The grounding doc does
not address an "empty" sizing case. Flagged open. Spoken eyeball checks (proof
spec items 9–13) were added per Director ruling 2026-06-12, adopted from rung
1's proven pattern.

---

### §8 Upgrade notes

**Template question:** Known growth edges at design time.

**What the research answered:**

grounding.md §7 (§8 Upgrade notes) gives three specific upgrade paths:
- Ulwick Opportunity Landscape (visual companion).
- Cagan's full ten-question Opportunity Assessment (expansion).
- Post-launch calibration (automatable in a future instrumented state).

**What the draft adopted:** All three are adopted from the research. The
orchestrator added a fourth (ODI scoring path data dependency) and flagged the
rung-2 sizing law seam as open, since the grounding doc does not address it.

**What remains open or thin:** The rung-2 sizing law seam is the most
consequential open item in this section. The play cannot answer it from the
grounding alone; it requires the Director's ruling.

---

## Decision queue

Every open question surfaced by the research, rendered as decision briefs.
None of the research-brief.md open questions are dropped or merged; all three
appear below. Two additional orchestrator-flagged opens are included.

---

### Decision 1 — Primary sizing path: external TAM/SAM/SOM vs. internal feature-level sizing

**Question stated plainly:** Is this play's spine the external market-sizing path
(TAM → SAM → SOM, suited for new-market or business-case contexts) or the
internal feature-level path (RICE / ODI / Shopify bottom-up, suited for
prioritizing among known-segment initiatives)? One must be the spine; the other
is a branch or a separate play.

**Stakes:** The difference shapes the entire move sequence, the required inputs,
and the output format. Designing against the wrong primary path means the play
is mis-fitted to how it gets used in the demo.

**Options:**

A. **External TAM/SAM/SOM as spine** — the play leads with market-size framing.
   Internal/feature-level scoring (RICE, ODI) is a branch invoked when the team
   has customer research data.
   - Pro: matches the business-case context the one-pager lives in; the language
     of TAM/SAM/SOM is the shared vocabulary in the demo.
   - Pro: the strong worked examples in the research (PipeCo, Underscore VC) are
     in this mode.
   - Con: in a software-team context, the team often doesn't have TAM data;
     the play degrades heavily on inputs it is built around.

B. **Internal feature-level (bottom-up behavioral) as spine** — the play leads
   with "who has it, how often, how much" using the Shopify/Torres frame.
   External TAM is the cross-validation step.
   - Pro: better fits the demo's context (a software team sizing a feature, not
     a startup pitching a fund).
   - Pro: the Shopify output format ("if we build X, we will acquire MM ± delta
     new active users in T") is already in the grounding and matches the one-pager's
     why-now language.
   - Pro: the play degrades more gracefully — behavioral inputs are more often
     available to a software team than analyst TAM reports.
   - Con: the TAM vocabulary is less prominent; stakeholders who expect market-size
     framing may find it unfamiliar.

C. **Both paths as peers, chosen at runtime based on context.** The play detects
   which mode applies (new market vs. internal initiative) and branches.
   - Pro: maximally flexible.
   - Con: two separate move sequences to design and prove; significantly more
     complex for v1.

★ **Recommendation: Option B** — internal feature-level (bottom-up behavioral)
as the spine, external TAM as the cross-validation step. The demo context is a
software team sizing a feature in a known product, not a startup building a
pitch deck. The Shopify format is already in the grounding, matches the one-pager
language, and degrades more gracefully when TAM data is absent. The draft brief
is currently written to this framing; if the Director chooses A or C, the golden
path moves and required knowledge need revision.

---

### Decision 2 — North Star dependency: hard gate (refuse) vs. soft gate (flag and run)

**Question stated plainly:** If no agreed North Star metric exists when the play
fires, does the play refuse to run (hard gate) or proceed with a prominently
flagged warning (soft gate)?

**Stakes:** The North Star is the method's one core rule (grounding.md §2) — the
unit that makes comparisons possible. Without it, the output cannot fulfill the
play's done-condition. But a hard gate stops the chain; a soft gate allows
degraded output to flow downstream.

**Options:**

A. **Hard gate — refuse to run without an agreed North Star.** The play reports
   what is missing, why it matters, and stops.
   - Pro: avoids producing a sizing that cannot be compared to anything — the core
     failure mode the method exists to prevent.
   - Pro: consistent with the method's framing: "If the team has not agreed on a
     North Star metric, the first move is to surface that gap rather than proceed."
     [grounding.md §2]
   - Con: blocks the chain over a single missing input; the team may have an
     informal North Star that was never formally agreed.
   - Con: may misfire on teams with implicit alignment.

B. **Soft gate — proceed, flag prominently, and degrade.** The play runs,
   declares the North Star as unknown, uses the best available proxy unit, and
   labels the entire output as non-comparable.
   - Pro: consistent with the playbook's "degraded and labeled beats blocked"
     rule.
   - Pro: a degraded output is more useful than nothing — the team can at least
     see the structure of the sizing and the inputs needed.
   - Con: a sizing with no North Star unit is not comparable to anything; the
     output cannot do its job for Write the One-Pager, which needs comparable
     sizing across options.
   - Con: the degraded output may be mistaken for a valid sizing.

★ **Recommendation: Hard gate (Option A).** The North Star is the one input
that cannot be directionally substituted — without it, the output is not just
degraded, it is structurally invalid for comparison purposes. The grounding doc
explicitly frames this as "the first move is to surface that gap rather than
proceed." This is the one case where the playbook's "degraded and labeled beats
blocked" default should yield to an explicit stop, because a labeled-but-non-
comparable sizing could mislead downstream rather than simply give a thinner
input. The play should name what is missing, why it matters for the one-pager,
and what question the Director needs to answer before re-invoking.

---

### Decision 3 — Recommendation posture: emit a go/no-go or leave the call for the Director

**Question stated plainly:** Does this play end with a go/no-go recommendation
("this opportunity is large enough / not large enough to pursue"), or does it
produce only the sizing inputs and reserve the call for the Director gate at
Write the One-Pager?

**Stakes:** If the play emits a recommendation, it takes a position that the
Director may then ratify or override — which is efficient but means the play
needs a defensible recommendation framework. If it does not, the one-pager
writer receives the inputs and makes the call there — which is safer but adds
a step.

**RULED 2026-06-12 — partial: spoken read-back.** The spoken rendering question
embedded in this decision (whether the play produces a spoken read-back at all)
is resolved: Director ruling 2026-06-12 establishes that every rung-2 input
play carries a spoken read-back. Ceiling 100 words for this play. The spoken
read-back is addressed to the room; it is the sizing's voice, never a second
opinion. This resolves the output-form question only. The go/no-go
recommendation posture question (whether the play emits a recommendation vs.
sizing inputs only) remains open below.

**Options:**

A. **Emit a labeled go/no-go recommendation.** Cagan's Opportunity Assessment
   ends at question ten: "Given the above, what's the recommendation? (go or
   no-go)." The play states a recommendation, labeled as the sizing analysis's
   conclusion, explicitly revisable.
   - Pro: complete output — the one-pager writer has a stated position to react to.
   - Pro: the Manager posture calls for a stated recommendation; withholding one
     is inconsistent with the job title's design call.
   - Con: a sizing-level recommendation may pre-empt the Director's judgment on
     factors this play can't see (strategic fit, competitive timing, resource
     constraints).
   - Con: adds complexity to the move sequence and proof spec.

B. **Produce sizing inputs only; leave the call for the Director gate.** The
   play synthesizes the sizing statement with declared confidence and hands it to
   Write the One-Pager. The one-pager play (or the Director reviewing it) makes
   the go/no-go call with fuller context.
   - Pro: clear division of labor — this play sizes; the Director calls.
   - Pro: reduces the risk of the play over-reaching its available information.
   - Con: leaves the one-pager writer without an analytical position to push on.
   - Con: slightly inconsistent with Manager posture (which owns calls within
     feature scope).

C. **Emit a labeled sizing verdict (large / medium / small relative to the
   team's threshold) without a binary go/no-go.** A directional signal ("this is
   a medium opportunity — above the team's threshold for investigation, below the
   threshold for immediate prioritization") that the Director uses as one input.
   - Pro: informative without pre-empting the call.
   - Con: requires a calibrated threshold the team may not have defined.
   - Con: adds a configuration dependency (what is the team's threshold?).

★ **Recommendation: Option B** — sizing inputs only, call reserved for the
Director gate. This play's job is to make the opportunity comparable, not to
close the question. The Director gate at Write the One-Pager is the right moment
for the go/no-go, when strategic fit, competitive timing, and resource context
are all on the table. A Manager posture can still produce a directional note
("the sizing suggests this is in the medium-opportunity range under current
assumptions") without a formal recommendation — the line between a directional
note and a binary recommendation can be drawn in the prompt language.

---

### Decision 4 — Fixture domain and construction (orchestrator-flagged)

**Question stated plainly:** What domain should the golden-path fixture be cast
in? Should it use the PipeCo (plumbing companies) example from the research
as-is, re-skin it to the Lantern product context (the demo product), or create
a new fixture?

**Stakes:** Test purity is critical (see Frame the Problem's lesson — the prompt
must not contain the fixture's answer). The fixture domain also sets the voice
for all future dry-run work.

**Options:**

A. **Use PipeCo as-is.** The numbers are already traced to primary sources and
   represent a well-grounded example.
   - Pro: fastest path to a fixture; all inputs are verified.
   - Con: domain (plumbing companies) is far from the demo product; creates a
     jarring context switch.

B. **Re-skin to Lantern / the demo product context.** Build a sizing fixture
   around a feature the Lantern team might actually size.
   - Pro: consistent with the demo narrative; fixture matches the product the
     Director knows.
   - Con: new numbers need to be grounded; risk of inventing unverifiable inputs.

C. **Re-skin to a neutral domain (not Lantern, not plumbing).** Following the
   Frame the Problem precedent (fleet-maintenance domain for examples).
   - Pro: test purity — the fixture is never the product the Director knows,
     so the agent can't shortcut using product knowledge.
   - Pro: consistent with the playbook's example-gallery maintenance rule.
   - Con: more work upfront.

★ **Recommendation: Option C** — re-skin to a neutral domain, following the
established playbook precedent. The prompt's example gallery should never use
the fixture's domain; a separate neutral domain (e.g., a SaaS HR tool or a
logistics platform) gives test purity. The PipeCo structure (all inputs traceable,
bottom-up formula explicit) is the template for construction.

---

### Decision 5 — Rung-2 sizing law seam (orchestrator-flagged)

**OPEN — not resolved by the spoken read-back ruling.** The Director ruling
2026-06-12 (spoken read-back on every rung-2 input play) addresses the room
delivery only. The spoken read-back is addressed to the room, not to the
one-pager. This decision concerns the filed sizing statement and whether it
flows directly into the one-pager or requires a Director review step. Those
are distinct questions; the spoken ruling does not touch this seam.

**Question stated plainly:** Rung 2's ratified law states: "no generated sizing
or sequencing in the one-pager; quoted human appetite is legal." Does this play's
sizing output count as "generated sizing" (and therefore require Director review
before entering the one-pager), or is it a quoted analysis input the one-pager
writer uses directly?

**Stakes:** If the sizing output is "generated sizing" under rung 2's law, the
one-pager writer may not use it directly. If it is a quoted input, it flows
naturally into the one-pager's why-now section. The play's chain position depends
on this ruling.

**Options:**

A. **Sizing output is a quoted analysis input — flows directly into the one-pager.**
   Raven's sizing analysis is analogous to the problem brief: a structured input
   that the one-pager writer draws on and quotes, not a generated claim the
   one-pager asserts as its own.
   - Pro: consistent with the compound-input design; the play was built to supply
     the one-pager's why-now section.
   - Con: the sizing numbers are generated (derived by the agent), not sourced
     from a human statement.

B. **Sizing output is "generated sizing" — requires Director review before
   entering the one-pager.** The one-pager cannot use the sizing directly; a
   Director gate reads it first and decides which elements to carry forward.
   - Pro: honors the spirit of the sizing law (no agent-generated claims about
     scale entering an artifact without Director eyes).
   - Con: adds a review step that may not have been intended when the compound-
     input chain was designed.
   - Con: slows the chain for a step the compound-input design assumed would be
     automatic.

★ **Recommendation: Option A** — the sizing output is a quoted analysis input,
not "generated sizing" under rung 2's law. The distinction the law draws is
between agent-invented sizing claims (which the one-pager must not generate
itself) and inputs from prior plays that the one-pager cites and builds from.
This play is a purpose-built input to rung 2, and its output is explicitly
labeled as a sizing analysis with declared assumptions and confidence grades —
closer to a quoted prior-art document than to an agent generating a sizing claim
in the one-pager's own text. But this is the orchestrator's reading of an
unanswered seam; it is a Director-challenge-class question and should not be
auto-decided.
