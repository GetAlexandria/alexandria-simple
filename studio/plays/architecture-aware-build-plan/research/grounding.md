# Grounding — the build-planning canon (architecture-aware)

The cited source of truth for Architecture-Aware Build Plan. Provenance:
four Sonnet researchers + one verification pass, 2026-06-11 (raw trail:
`extracted-claims.md`; brief: `research-brief.md`). Synthesized by the
orchestrator. Verification corrections honored: two reconstructed claims
excluded (a fake implementation-plan definition; an invented "three prior
states" rule), two popular framings corrected to their real wording
(Singer's nine-scope maximum; the Google non-goals gloss), and one
much-cited statistic demoted to vendor anecdote (the 20–30% brownfield
overrun).

## 1. What this artifact is

The build plan is the execution-facing artifact downstream of definition
and scope: which work, in which order, against the real system. In RFC
culture it appears as the Implementation / "Work" / "Testing & rollout"
section (HashiCorp's template calls writing it "rubber duck debugging…
you can catch a lot of issues or unknown unknowns prior to writing any
real code" [hashicorp.com, primary]; Stack Overflow's spec format defines
milestones as "dated checkpoints… [with] metrics to indicate the passing
of the milestone" [stackoverflow.blog, primary]; Sourcegraph's template
carries a "Definition of success" section; Hudl writes a standalone
Implementation Plan before any medium-large project [Pragmatic Engineer,
primary]). In Shape Up it is the **scope map**: the project broken into
"integrated slices of the project that can be finished independently of
each other," discovered, not pre-planned — "Scope mapping isn't planning.
You need to walk the territory before you can draw the map"
[basecamp.com/shapeup ch.12, primary]. Singer's practical ceiling: break
work into "at maximum nine separate scopes, different things that we can
actually build and demo independent of the rest" [ryansinger.co case
study, primary — note: the circulating "if it doesn't fit in nine boxes
it isn't shaped well" diagnostic is a community embellishment, not his
words]. Oxide's RFD lifecycle adds the done-condition: a plan-bearing
document goes "committed" only once implemented [rfd.shared.oxide
.computer/rfd/0001, primary].

## 2. The method's core rules

1. **Walk the territory before drawing the map.** Scopes emerge from
   ~week one of real work; "you don't know what the work and
   interdependencies actually are in advance" [Shape Up ch.12]. Discovered
   tasks ≠ imagined tasks — imagined task lists systematically miss the
   work that later reads as scope creep [Dickow, primary].
2. **Get one piece done — vertically, early.** "Make something tangible
   and demoable early — in the first week or so… integrating vertically
   on one small piece of the project instead of chipping away at the
   horizontal layers" [Shape Up ch.11, primary]. First slice: Core, Small,
   Novel. Start in the middle; stub the rest. The lineage: Cockburn's
   walking skeleton ("a tiny implementation of the system that performs a
   small end-to-end function"), Freeman & Pryce's build-deploy-test
   formulation, Hunt & Thomas's tracer bullets ("lean but complete, and
   forms part of the skeleton of the final system") [all
   secondary-confirmed against multiple independent citations; books
   paywalled].
3. **Riskiest first — the inverted pyramid.** Push "the scariest work
   uphill first"; "work feels easy at the start" means the work was
   sequenced wrong [Shape Up ch.13 + Curious Lab]. Rubick: sequence risky
   milestones first to preserve optionality [rubick.com, primary].
4. **Respect the brownfield.** "Agile is excellent with the functionals,
   poor with nonfunctionals, and very poor with constraints" [Hopkins &
   Jenkins, CIO 2008, primary]. Brownfield systems carry "behavioral
   expectations between components that were never documented" [Augment
   Code, primary]; Feathers: "a seam is a place to alter program behavior,
   without changing the code," and "99% of the time… a dependency
   problem" [via understandlegacycode.com]. Perrin's name for the failure:
   "I call it local correctness, global incompatibility" — clean code that
   violates an unknown assumption [ai.plainenglish.io, primary]. The
   counter-pattern family: Fowler's Strangler Fig, Branch by Abstraction,
   Parallel Change (expand-migrate-contract) [martinfowler.com, all
   primary].
5. **Validate before irreversible steps.** Stripe's four-step migration
   (dual write → migrate reads → migrate writes → remove old) exists
   precisely so reads are *verified* (Scientist experiments) before the
   irreversible write switch [stripe.com/blog/online-migrations, primary];
   Box and Pinterest separate async from sync dual-writes to isolate
   failure modes [Pragmatic Engineer, primary]. Feature flags decouple
   deploy from release; "a feature is not finished when it is released;
   it is finished when the flag protecting it is removed" [getunleash.io,
   primary].
6. **The plan is a bet with a circuit breaker, not a contract.** "If a
   project runs over, by default it doesn't get an extension" [Shape Up
   ch.1, primary]; extension requires must-haves only AND all-downhill.
   "Any uphill work at the end of the cycle points to an oversight in the
   shaping" — return to shaping, don't extend [ch.14]. The cognitive
   underlay: the planning fallacy and Hofstadter's Law ("It always takes
   longer than you expect, even when you take into account Hofstadter's
   Law") are structural, not awareness-correctable.

## 3. The golden path (synthesis)

1. **Codebase recon first** — read docs/commits/tests, name load-bearing
   areas ("load-bearing artifacts are code, comments, tests, or
   instructions whose removal breaks something important in non-obvious
   ways"; 5-minute rule: if unclear, treat as load-bearing) and seams.
   Singer's case study shows recon redirecting design before commitment
   (the "legacy thing… not very friendly for a quick change" page).
2. **Spike the blocking unknowns** — time-boxed, with pass/fail criteria
   set before the spike runs.
3. **Stand the walking skeleton** — thinnest end-to-end slice, all
   integration points hooked, auto-build/deploy/test.
4. **Map scopes** — integrated vertical slices, named by the value they
   deliver; type them (layer cake / iceberg / chowder, chowder capped at
   3–5 items); reject role-bucket names ("front-end," "bugs").
5. **Number the sequence of attack** — riskiest/most-unknown first
   ("what should we be seeing working first, second, and third").
6. **Define milestones that demo** — Rubick's SHUV (small 1–3 weeks,
   high-quality, understandable, valuable); "releasable in some way";
   his observed ~97% estimation accuracy at 1–3-week grain (his own
   practice data, not a study).
7. **Name the load-bearing touches per scope** — in advance, never
   discovered mid-build.
8. **Design validation gates** before any irreversible step (migration
   ordering as its own sub-plan where data moves).
9. **State the renegotiation path** — must-ship vs cut-if-late (~),
   scope-hammer trigger, circuit-breaker condition.
10. **Publish readable** — scope map + hill-chart-style state (uphill =
    unknowns remain; downhill = execution; "a dot that doesn't move is
    effectively a raised hand").

## 4. Root causes of failure

1. **Premature closure of unknowns** — sequencing committed before the
   problem's shape is known; teams "do the uphill work with their head
   instead of their hands." Counter: walking skeleton, hill chart,
   vertical slices.
2. **Brownfield constraints structurally invisible at plan time** —
   the greenfield plan on brownfield code. Counter: recon + seam audit
   before estimation (Feathers; Augment; Hopkins & Jenkins). (The
   oft-cited 20–30% overrun figure is vendor marketing — verbatim at its
   source but methodology-free; use the mechanism, not the number.)
3. **Optimism baked into estimation culture** — planning fallacy,
   90-percent-done syndrome ("to-do lists actually grow as the team makes
   progress"). Counter: appetite-not-estimate; 0/100 done-conditions;
   uphill/downhill over percent-complete.
4. **Plan-as-contract** — no renegotiation path, so teams ship broken or
   blow deadlines without a reset mechanism. Counter: circuit breaker +
   scope hammer + baseline comparison.
5. **Serial layer decomposition** — "all models, then all views" demos
   nothing for months ("Lots of things are done but nothing is _really_
   done"); Jeffries: "it seems really dumb to wait three weeks to get a
   feature done." Counter: vertical slices as the atomic planning unit;
   demoable cadence every 1–2 weeks.

## 5. Judging quality — the eyeball rubric

(Segment-4 synthesis, primary-sourced.) 1 Every milestone ends demoable.
2 Riskiest work front-loaded (easy-at-start = mis-sequenced). 3 Scopes
vertically integrated, never role buckets. 4 Every work item traces to
the scope cut / pitch. 5 Load-bearing areas named in advance per scope.
6 Dependency ordering explicit (what unblocks what, not just a calendar).
7 Renegotiation path stated (must-ship vs ~). 8 No generic scope names.
9 No scope too big to finish demonstrably within days-to-weeks grain.
10 Validation gates before irreversible steps.

## 6. Worked examples on file

Shape Up's Message Drafts scope map (progressive carve-out) and Notify
un-stick (one stuck scope was three independent things); Singer's
end-to-end case study (numbered attack order; ugly-wiring → works →
polish; legacy-page redirect); Stripe's four-step online migration with
Scientist verification; Box (6-phase) and Pinterest (7-phase, added
reconciliation) migrations; Rubick's milestones-not-projects; Spotify's
migrations-as-products (stuck without ownership incentives). Counter-
example shape: the Gantt of horizontal layers with one big integration
phase at the end.

## 7. Pre-answered elicitation manifest

- **§1 Goal** — emit a sequenced scope map: vertical slices named by
  value, attack order risk-first, demo artifact per milestone,
  load-bearing touches declared, validation gates, renegotiation path.
  Done = rubric §5. Failure is distinct: missing recon → scopes touching
  unknown territory are flagged as recon debt, never silently estimated.
- **§2 Trigger** — fires on a ratified scope cut (rung 3) plus codebase
  reality in hand. For us: the surface map / Survey the Existing System
  output is the recon precondition, exactly as rung 2's problem brief
  was its precondition — same compound pattern.
- **§3 Required knowledge** — the scope cut (with appetite); the surface
  map with load-bearing flags (2c's artifact); constraints log (2f);
  team/capacity context (declared TBD in our demo). Missing surface map →
  the canon splits (block vs degrade); our chain law says proceed
  degraded with per-scope recon-debt flags — Director confirmation
  queued.
- **§4 Golden path** — §3's ten moves; in the single-agent era moves 1–2
  consume the saddle rather than running spikes (spikes route to 2b).
- **§5 What could go wrong** — §4's five root causes; play-specific top
  risk: **the greenfield plan on brownfield code** — Raven sequencing
  confidently over a surface map that didn't flag fragility. Second:
  generated effort estimates sneaking in as milestone dates (the sizing
  law applies; the plan orders work, the appetite bounds it — dates
  belong to humans/engineering).
- **§7 Proof spec** — rubric §5 eyeball-ready. Natural fixtures: rung 3's
  emitted scope cut + the saddle surface map (chain handoff); a fragile-
  codebase fixture where the surface map flags load-bearing areas the
  plan must respect (bait: an easy-looking slice that touches one); a
  missing-surface-map degradation case.
- **§8 Upgrade notes** — compound candidates below; migration-ordering
  sub-plan as a specialist sub-play; hill-chart state as a recurring
  status play (graph era).

## 8. Compound candidates — and a clean mapping result

Deduped across reports: codebase recon/archaeology · seam identification ·
walking-skeleton construction · scope mapping · dependency/wave
sequencing · hill-chart status review · milestone definition ·
architecture-constraints injection · circuit-breaker/scope-hammer session
· renegotiation-path declaration · validation-gate design · migration
sequencing · architectural spike.

**Mapping verdict: rung 4 exposes NO new inventory gaps.** Its compounds
land on plays this session already grounded or that exist: recon + seam
audit → **Survey the Existing System (2c)**; spike → **Feasibility Check
(2b)**; constraints injection → **Capture Technical Constraints (2f)**;
hill-chart review / status cadence → **Track the Timeline / Run Status
Updates** (delivery, exist); validation gates → **Set QA Checkpoints**
(delivery, exists); scope-hammer + renegotiation → shared moves with rung
3; walking skeleton, scope mapping, sequencing, milestone definition →
THIS play's own moves (graph-era sub-play candidates). The input-plays
section built for rung 2 turns out to serve rung 4 directly — evidence
the compound architecture is converging rather than sprawling.

## 9. Where this play meets the chain

Consumes rung 3's ratified scope cut + the saddle (2c surface map, 2f
constraints); emits the sequenced, demoable, renegotiable plan — the
hand-off Fabro executes, and the chain's last artifact before execution.
The SRS-style handshake the Director flagged at rung 2 lives here: the
plan's per-scope contracts (inputs, validation gates, load-bearing
touches) are the technical-how layer's receiving surface.
