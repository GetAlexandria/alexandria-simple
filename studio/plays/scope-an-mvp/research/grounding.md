# Grounding — the MVP-scoping canon

The cited source of truth for Scope an MVP. Provenance: four Sonnet
researchers + one verification pass, 2026-06-11 (raw trail:
`extracted-claims.md`; brief: `research-brief.md`). Synthesized by the
orchestrator. Verification corrections are honored throughout — two
circulating "quotes" were caught as reconstructions and are excluded
(a fake Shape Up warning against over-cutting; a misread PMI statistic).

## 1. What this activity is — and what it emits

Scoping an MVP is cutting a defined product or feature to the smallest
slice that delivers the outcome and earns the learning. The canon's anchor
is Ries: the MVP is "that version of a new product which allows a team to
collect the maximum amount of validated learning about customers with the
least effort" — and, pointedly, "MVP, despite the name, is not about
creating minimal products" [startuplessonslearned.com, primary]. The unit
of progress is validated learning, not feature delivery
[theleanstartup.com, primary].

The emitted artifact across schools is **a ratified scope cut**: Shape
Up's *pitch* (Problem · Appetite · Solution · Rabbit Holes · No-gos)
[basecamp.com/shapeup ch.6, primary]; Patton's *story map with a release
line* (backbone of activities, ribs of stories, a horizontal line whose
top rows are the walking skeleton — "the smallest possible system you
could build that would give you end to end functionality")
[jpattonassociates.com/the-new-backlog, primary]; DSDM's *Prioritised
Requirements List* under MoSCoW [agilebusiness.org, primary]. Common
denominators: an explicit in-list, an explicit and co-owned **won't
list**, and a stated learning goal.

## 2. The method's core rules

1. **Learning goal before feature list.** "Creating an MVP doesn't start
   with a list of features – it ends with them" [Product Management
   University]. Boundev's gate: "If you can't fill in the blank — 'We
   believe [this feature] will cause [this outcome] for [this persona]' —
   you're building a product, not running an experiment." Ries's two
   hypotheses (value, growth) come from the book (The Lean Startup;
   concept secondary-confirmed, the principles page doesn't carry it).
2. **Appetite before scope.** "Appetites start with a number and end with
   a design. Estimates start with a design and end with a number" [Shape
   Up ch.3, primary]. Fixed time, variable scope. Without an appetite,
   scope is structurally unbounded (the "grab-bag" failure — "redesign
   the Files section" is not a project).
3. **Cut scope, never quality.** "Cutting scope isn't lowering quality.
   Making choices makes the product better *at some things* instead of
   others" [Shape Up ch.14, primary]. Quality is fixed; scope is the
   variable. (The reverse — silently degrading quality to keep scope — is
   root cause #2 below.)
4. **Vertical, never horizontal.** A valid slice crosses all layers and
   ends in observable user value: "When you call the slice 'done,' the
   system is observably more valuable to a user" [Humanizing Work,
   primary]. The walking skeleton (Cockburn, via Patton; Freeman & Pryce
   formulation secondary-confirmed) is the thinnest end-to-end slice.
   Patton's deepest reframe: "The way you reduce scope. It's not by
   pulling out features, but by reducing the number of people you focus
   on and reducing the number of problems you're gonna solve" [Patton,
   agiledata.io podcast, primary].
5. **Compare down to baseline.** "Instead of comparing up against the
   ideal, compare down to baseline — the current reality for customers"
   [Shape Up ch.14, primary].
6. **Cuts are ratified, never silent.** The won't list is a published,
   co-owned plan artifact with parking-lot criteria; silent cuts reverse
   post-launch and burn trust [EVNE; Thinslices; multiple]. DSDM's
   discipline: must-haves ≤60% of effort, ~20% could-have contingency
   [agilebusiness.org, primary].

**The counter-school, held honestly:** Cohen's SLC — "MVPs are too M and
rarely V. Customers see that, and hate it"; v1 should be Simple, Lovable,
and **Complete** for its narrow scope [longform.asmartbear.com, primary].
The synthesis most practitioners land on: narrow the audience and problem
(Patton), keep the slice complete and lovable (Cohen), and let what you
ship test a named assumption (Ries). Blank's reframe kills the
build-first instinct: a genuine MVP is "the simplest thing that you can
show to customers to get the most learning at that point in time" — which
may be a video or a concierge, not code (Dropbox's demo video took the
beta waitlist "from 5,000 to 75,000 people overnight" — Drew Houston,
primary-confirmed; Zappos bought shoes retail per order).

## 3. The golden path (synthesis across schools)

1. Name the **learning goal**: the riskiest assumption as a falsifiable
   hypothesis (RAT: "A Riskiest Assumption Test is explicit. There is no
   need to build more than what's required to test your largest unknown"
   — Higham, 2016, secondary-confirmed). GDS's mechanical scoring:
   risk = impact × (10 − confidence), assumptions surfaced across eight
   domains [services.blog.gov.uk, primary].
2. Confirm the **appetite** (time budget, stated not estimated).
3. Map the **backbone** (user activities left-to-right) before any
   feature talk; confirm end-to-end coverage.
4. Generate candidates per backbone node — full set before any cutting.
5. **Triage** (MoSCoW or equivalent), stakeholders in the room; apply the
   forcing tests: the Product Death Test ("If we remove this feature, can
   the user still solve their core problem? If yes, it's not a
   Must-have"), the cut-in-half test, Shape Up's hammer questions ("Is
   this a must-have? Could we ship without this? Is this a new problem or
   a pre-existing one?").
6. **Draw the release line / write the no-gos** — the literal cut moment;
   nice-to-haves marked (~; "usually they never get built — the act of
   marking them as a nice-to-have is the scope hammering").
7. Verify the **walking skeleton**: the in-list still completes one
   end-to-end user journey, demoable.
8. Name **rabbit holes** (known unknowns) with dispositions.
9. Attach **success metrics** to the hypothesis; compare down to baseline.
10. **Ratify in writing**; publish the won't list; set the change-control
    tripwire (any post-ratification add answers the six questions —
    Department of Product checklist, primary — or trades out an
    equivalent item).

## 4. Root causes of failure

1. **No learning goal declared** → every cut is arbitrary; cargo-cult MVP
   and phase-1-of-everything ("Sliced Waterfall" — Pace; "An MVP is not
   learning" — Kromatic). Counter: hypothesis gate before scoping.
2. **Fixed scope, variable quality** → quality quietly degrades because
   cutting features needs a hard conversation and cutting quality doesn't.
   Counter: scope hammer + tilde + baseline comparison [Shape Up].
3. **Horizontal slicing** → nothing demoable, no learning until
   everything integrates, maximum cost of being wrong. Counter:
   vertical-slice INVEST test; walking skeleton.
4. **Silent cuts, no ratification record** → stakeholders re-add features,
   scope balloons back ("while we're here," "just add settings," "we'll
   need this later anyway" — EVNE). PMI (corrected): 52% of projects
   report scope creep, up from 43% five years prior. Counter: co-signed
   won't list + parking-lot criteria + change control.
5. **Customer extraction without customer value** (Cohen) → users punish
   the too-M MVP; trust capital for iteration is gone. Counter: SLC —
   complete for its narrow scope; Hoffman's embarrassment heuristic is a
   shipping-courage cue, not a quality license.
   And the meta-cause, named bluntly: "The MVP rarely fails because the
   team skipped a step in some seven-phase framework. It fails because
   nobody had the nerve to cut scope" [Full Scale].

## 5. Judging quality — the eyeball rubric

(Composite of the segment-4 ten-check synthesis; checkable by a cold
reader on the artifact.) 1 Hypothesis named, falsifiable. 2 Problem +
solution presented together. 3 No-gos/won't list explicit and specific.
4 Every in-scope item traces to the hypothesis or the core task. 5 Walking
skeleton present — one complete end-to-end flow. 6 Baseline comparison
made (down to today's reality, not up to the ideal). 7 Scope demoable in
one session. 8 Rabbit holes called out (uniform confidence = shallow
shaping). 9 Must-haves formally separated from nice-to-haves. 10 The
must-have list plausibly fits the stated appetite. Weak→strong pair:
"Build a social media app" → "Allow freelance designers to request quick
logo feedback from peers in under 24 hours" [BolderApps].

## 6. Worked examples on file

Basecamp Dot Grid Calendar ("which tenth?" — features cut: dragging,
multi-day spans, color coding; "we were comfortable with all these
trade-offs because of our understanding of the use case"); the permission-
rules hammer ("a warning on the archive action… a one-day change instead
of a six-week project"); Allegro's story-map release line (120 points cut
to 80 by "always go right, not down", three cut criteria quoted in the
claims file); Adobe's vertical-slice case (contractors performed manually
what software would later automate — slice chosen by market timing);
Dropbox video and Zappos concierge as build-nothing MVPs. Scope-shape
vocabulary worth borrowing: layer cakes / icebergs / chowder ("if it gets
longer than three to five items, something is fishy") and uphill/downhill
[Shape Up ch.12, primary].

## 7. Pre-answered elicitation manifest

- **§1 Goal** — emit a ratified scope cut: hypothesis, appetite,
  in-list as a walking skeleton, co-owned won't list with rationale,
  rabbit holes, success metrics. Done = rubric §5. Failure is distinct:
  no hypothesis → the run flags it (see §3 trigger), never invents one.
- **§2 Trigger** — fires on a definition artifact (rung 2's one-pager)
  when a build decision is imminent. Missing hypothesis/outcome in the
  one-pager: the canon says block; our chain says degrade-and-label —
  Director ruling needed (decision brief queued).
- **§3 Required knowledge** — the one-pager (goals, non-goals, metrics —
  the outcome filter); appetite (from the room or Elicit Business
  Context's field); candidate features (from the one-pager's solution
  direction); current-state baseline (saddle); stakeholder map for
  ratification. Missing appetite → ask (cannot scope without it — the
  one canon-sanctioned ask); missing baseline → declared TBD.
- **§4 Golden path** — §3's ten moves, collapsed for a single agent;
  the ratification move is a human gate by design.
- **§5 What could go wrong** — §4's five root causes; play-specific top
  risk: the silent cut (rung 1's zero-silent-drops law, third
  appearance); plus hammering into incompleteness — the SLC check
  (complete for its narrow scope) is the counterweight.
- **§7 Proof spec** — rubric §5 is eyeball-ready; natural fixtures:
  rung 2's emitted one-pager (chain handoff), a bloat-bait fixture
  (stakeholder pressure planted), a no-hypothesis one-pager (degradation
  path).
- **§8 Upgrade notes** — compound candidates below; depth-scaled sibling
  versions per the rung-2 ruling.

## 8. Compound candidates (the Director's queue)

Deduped across the four reports; mapped against the inventory:

- **Hypothesis/bet writing** → existing slot **Frame a Bet** (strategy,
  senior: "problem → hypothesis → success metric"). Second appearance as
  a compound input (also rung 2's goals section ancestor).
- **Appetite setting** → lands in **Elicit Business Context** (2a — its
  8-field capture includes appetite). Confirmed, not new.
- **MoSCoW triage** → existing slot **Prioritize the Backlog** (manager).
- **Story mapping · scope hammering · release-line drawing · rabbit-hole
  review · walking-skeleton verification** → moves of THIS play in the
  single-agent era; each a labeled sub-play candidate for the graph era
  (same pattern as rung 1's `relate`).
- **RAT experiment design** (test card: hypothesis, cheapest experiment,
  success/failure metric, decision rule) → **NO SLOT EXISTS** — the
  inventory has no experiment-design play. Candidate new slot; decision
  brief queued.
- **Scope-increase review** (the six-question change-control gate on a
  locked scope) → **NO SLOT EXISTS** as a play; arguably a standing gate
  rather than a play. Decision brief queued.
- **Smoke test / pre-build validation** (Ries) → routes with RAT
  experiment design if slotted.

## 9. Where this play meets the chain

Consumes rung 2's one-pager (outcome filter, candidate features,
non-goals as prior cuts); reads the saddle for baseline; emits the
ratified scope cut that rung 4 sequences. The won't-list discipline is
rung 2's coverage-map discipline one level down — entries leave the
build, never the record.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended amendment — the sections above stand unedited as the record of
what the research found. Director ruling, 2026-06-12, source-canon audit
(`../../AUDIT-2026-06-12-source-canon.md`). This is a reweighting; no
claim above is retracted.*

**Confirmed load-bearing.** Shape Up (Singer/Basecamp), Ries, Patton, and
Cohen are confirmed as this play's skeleton. They were already the
dominant feeders; the audit ratifies that weighting. Where a demoted
source covered a job, Shape Up's native mechanisms cover it instead:
appetite as the fixed budget, tilde/nice-to-have marking as the scope
hammer (§3 step 6 already carries the quote), and the circuit breaker.

**Demoted — enterprise-tagged, mechanism-reference-only.** Three sources
no longer feed the golden path. They may be named as a single verified
mechanism in §8-style upgrade notes only (audit ruling R1):

- DSDM / Agile Business Consortium — the must-haves-≤60%-of-effort rule
  and ~20% could-have contingency (§2 rule 6, §3 step 5).
- Department of Product — the six-question change-control checklist
  (§3 step 10).
- UK GDS — risk scoring, risk = impact × (10 − confidence) (§3 step 1).

**Excluded from load-bearing claims — agency-blog tier.** Boundev,
Thinslices, EVNE, Goji Labs, Bolder Apps, Full Scale, Cayenne Apps. Their
quotes above remain on the record but may not ground anything in the
brief; where a claim leaned on them (the silent-cut trust burn —
EVNE/Thinslices; the fill-in-the-blank gate — Boundev; the weak→strong
pair — BolderApps; the nerve-to-cut line — Full Scale), the brief now
states the call in its own voice or re-grounds it in a confirmed source.

**Added — grounding for the hypothesis gate.** The Mom Test (Fitzpatrick)
is added as the evidence bar at the hypothesis move: commitment and
specific-past evidence rank above stated intent (audit ruling R4 — the
standing playbook-wide bar). Higham's RAT question is promoted from
mechanism reference to the gate's qualitative form: which assumption, if
wrong, kills this soonest? This absorbs the core question of the
riskiest-assumption-test play (c3), parked the same day by audit ruling
R3 — the test-card apparatus stays parked with that play; the question
itself now lives at this play's hypothesis gate. GDS's mechanical scoring
is the enterprise version of the same job and moves to upgrade notes with
the rest of the demoted tier.
