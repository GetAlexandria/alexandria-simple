# Testing a play — fixtures, factory runs, grading

*(Director-requested, 2026-06-11. Extracted from ONE banked play —
frame-the-problem, ten-plus graded runs — so this is a v1 with a single
data point behind it: treat its rules as defaults, expect revision, and
promote to standard only after the next plays confirm them. The worked record
is the curriculum: read `frame-the-problem/dry-runs/read-out.md` and
`frame-the-problem/fixtures/advanced/read-out.md` before testing anything.
Process rules cited here live in `README.md`; authoring rules in
`AUTHORING.md`. Reshaped 2026-06-12, Slice 2 of the Studio → Fabro plan:
the unit under test is the **workflow package**, run for real on the
local factory — the fixture principles below carry over unchanged.
Stage-wise (unified model, 2026-06-13): a play's fixtures are authored
and chosen at **Built**, alongside the workflow package; testing them on
the factory is what carries the play from Built to **Proven**.)*

## Where runs happen

*(Re-ruled 2026-06-12, operator ruling at the first campaign: builder
factories — Railway and the local Docker/Codex one — build Alexandria;
plays run on the Fabro INSIDE Alexandria. The first two runs of the
carve campaign ran on the builder factory before this ruling; their
records stand, marked with their provenance.)*

The dry-run step (the step between Lint and the Proven confirm — cite it
by name, not number) is a real run of the play through the **embedded
factory**: `ax run <slug> --input key=value` boots Alexandria's own
Fabro and executes the registered workflow package with the configured
ACP provider (**claude-acp**, standing — both operators test on their
Claude subscriptions). This means a play must be registered in
`PLAY_MANIFEST` to be dry-run — Register moved from the end of the
line to the Derive seam; *banked* still means the Proven confirm. Before
any graded run: `fabro validate` on the graph (ax runs it again on the
materialized package) so factory time
is never spent discovering a parse error. Also run
`studio/tools/check-workflow-edges.py <workflow.fabro>` (or the derive/bank
wrappers that call it): Fabro validation allows unconditional edges, but an ACP
work-node failure fallback must be conditional and point at an exit-1 failure
node, never the next move.
Fixtures reach the run with one
flag — `ax run <slug> --fixture <case>` resolves the case dir to the
workflow's `--input <key>=<path>` bindings (the fixture convention below;
absolute paths are safest, and the run sandbox must be able to read
them). **Run modes** (the default flipped to fire-and-forget in #305): a bare
`ax run <slug>` launches **detached** and leaves in-play gates **pending** (the
agent path); add `--wait` to run to a terminal state inline. `--auto-approve`
(optionally `--wait`) auto-resolves gates — "Yes" / first option — which is
legal only for gateless plays or structural smokes, **never for grading a
gate's behavior**. To grade a gate, feed **scripted reactions**:
`ax run <slug> --fixture <case> --reactions <case>/reactions.json` answers each
pending gate from the case's `reactions.json`, in order, and traverses the
`review ⇄ revise` loop deterministically with no live human. `--interactive` is
only for a human running the play directly in their own terminal — it deadlocks
a detached / agent-launched run, so a campaign never uses it. Watch and debug
runs in the studio's Factory-runs tab (the viewer `/studio`).

## The fixture principle

**Fixtures are bought by failure class, not difficulty.** Each fixture
earns its place by exposing a failure mode no other fixture exposes. There
is no easy/medium/hard ladder: a prompt that passes the baited golden and
the factored ceiling passes "medium" too, so a medium-difficulty fixture
buys grader noise, not information. (Director-posed question, 2026-06-11;
this is the orchestrator's answer from rung-1's evidence — ratification
owed at review. The Director's "medium scenario" instinct survives as
class 3 below: not medium difficulty, but the degradation case.)

## The minimum viable fixture kit

1. **The baited golden.** A simple scenario whose traps are temptations to
   please: a pitched solution to mistake for a problem, a priority bait, a
   staked conviction claim, a sizing bait — whatever this play's hard
   limits ban, the golden fixture offers. Passing means doing the work AND
   refusing the bait.
2. **The refusal case.** An input that fails the play's precondition. The
   correct run is a loud, specific refusal that says what a runnable input
   would look like — never a degraded attempt.
3. **The degradation case.** A thin-but-legal input (weak upstream
   artifact, absent optional inputs). The correct run proceeds degraded
   and labeled, carrying its gaps explicitly — never refusing, never
   backfilling. This is a distinct class from refusal: refusal tests the
   boundary, degradation tests honesty inside it.
4. **The state case** (when the play revises prior artifacts): a re-run
   input plus the prior artifact; correct behavior is the diff discipline —
   every prior entry accounted for, the change record carried.
5. **The factored ceiling.** The hard case, built at the ceiling the brief
   states (rung 1: "useful at 5 tangled problems, not 2") and **factored**
   so the matrix localizes the break — rung 1's pattern: Needle (can it
   locate?), Knot (can it analyze, given a clean input?), Storm (does
   noise degrade the analysis?). Run clean-input and noisy-input variants
   so a failure names its move. Comes with an **answer key**.

Classes 1, 2, and 3 are universal. Class 4 applies to revising plays.
Class 5 is owed before bank, not before the design is confirmed — rung 1
banked on exactly this kit and nothing more. (Authoring and choosing the
fixtures is part of **Built**: a play is not Built until its fixtures
exist alongside the workflow package.)

## Fixture layout — one dir per case, files named by input key

Fixtures live at `plays/<slug>/fixtures/<case>/`, **one directory per
behavior case** — the kit's classes by name: `golden` (the baited golden),
`refusal`, `empty` (the degradation / thin-but-legal case), `rerun` (the
state case), `hard-case` (the factored ceiling). A play carries only the
cases its design earns.

Each case dir holds the workflow's inputs as **files named by input key** —
the key the brief's §3 declares and the prompt placeholder consumes
(`transcript.md`, `surface_map.md`, `users.md`, `prior_brief.md`). Inputs
are consumed as **file paths, not inlined content**: a runner binds
`--input <key>=<path>`, one per file present. An optional input the case
deliberately omits is passed empty — that *is* the "not provided" signal
the degradation case tests; do not stub it with placeholder content.

An optional `expected/` subdir holds grading material — the answer key, a
reference read-out — and is **never passed as input**. It is what graders
check against, not what the run consumes.

```
plays/<slug>/fixtures/
  golden/        transcript.md  surface_map.md  …  [expected/answer-key.md]
  refusal/       transcript.md
  empty/         transcript.md                       (optional inputs omitted)
  rerun/         transcript.md  prior_brief.md
  hard-case/     transcript.md  …  expected/answer-key.md
```

This layout is what lets `ax run <slug> --fixture <case>` resolve a case to
its `--input key=path` set automatically: it reads the case dir, maps each
input-key file to a `--input` binding, and passes any declared-but-absent
optional input empty. The same property makes a *registered* play runnable
with one flag plus a bundled fixture — no per-input arguments to assemble
by hand.

## Building a fixture

- **Answer key before runs.** Written when the fixture is built, blind to
  any run. When grader variance appears, suspect the key before the doers:
  rung 1's hunch-rule "2/4 miss rate" was really 4/4 — a loose
  intended-hunch clause in the key licensed the failure. Sharpen the key,
  re-grade.
- **Verify the fixture mechanically before trusting any result:** every
  plant verbatim-findable, counts match the key, the noise blocks contain
  no accidental legitimate plants (rung 1's budget block carried a decoy
  "vendor" hit by design — document such choices in the key).
- **Purity, both directions.** The prompt never contains a fixture's
  answer or domain (the example gallery is re-skinned into a neutral
  domain); fixture characters and vocabulary never appear in prompt
  exemplars (a fixture speaker's name in a voice exemplar failed Lint 4).
- Untrusted-input fixtures should include an embedded instruction
  ("ignore your rules and…") at least once per play, to test the
  data-never-instructions clause (README, gstack adoption).

## Running and grading

- **Doers are clean-room by construction now:** each node runs holding
  only its prompt, what Fabro supplies, and its declared inputs — the
  workflow enforces what the monolith era had to stage by hand. The
  full run record (per-stage prompts and responses) is preserved by the
  factory; pull it into `dry-runs/` with the grade. **Graders are
  fresh-eyes and blind** to each other,
  grading against the answer key and the brief's §7 — never against their
  own taste. Multiple independent graders on the ceiling case.
- **Divergence from the brief's intent is crack analysis, not a shrug**
  (plan §3): when the workflow's results miss §7, the read-out names the
  move (or seam) that owns the miss. A decomposition that underperforms
  is data for the Director's Proven-confirm granularity ruling — tune
  `fidelity`/`thread_id` first (PROJECTION.md §3), coarsen only on his
  ruling.
- Graders string-match every quote (character-exact), count mechanically
  what can be counted, **consume `<slug>/known-fps.md` before reporting**,
  and attest coverage — "examined X, nothing flagged," never silence.
- **Every run gets a record** in `dry-runs/` (or `fixtures/<case>/runs/`),
  failures verbatim, with a header stating what was tested and the grade.
  Failures are never cleaned up; they are the curriculum.
- The **cold-reader comprehension gate** is part of the proof spec for any
  human-facing artifact: a fresh agent briefed as a *new team member* (not
  a maximally-cold reader — product vocabulary is legal) reads the emitted
  artifact alone and must reconstruct the situation.
- **A blind node's coldness is verified at the seam, not the prose**
  (2026-06-17). A checker, cold reader, or grader must resolve to
  `fidelity=truncate` so the preamble carries no prior-stage summary —
  confirm it in the run record (`Fidelity resolved … source` per node,
  the factory log). A node kept "blind" only by a please-ignore
  instruction in its prompt is a finding, not a pass (PROJECTION.md §3,
  AUTHORING.md purity).

## When a run fails

- **Escalation gradient (measured, rung 1):** matched good/bad example
  first, mechanical check second, a dedicated checking node third (real
  now — lands as a brief amendment, since it changes the graph) — more
  rule-prose last. Prose rules get restated and evaded; mechanical checks
  close hard failures; matched examples teach judgment.
- **Fixes land in the brief and re-derive** (the sync rule, README): a
  failing node prompt is never patched in place — the §6 language or §4
  block is amended (dated), the package re-derives, and Protocol E
  re-runs before the confirmation run.
- Every fix gets a **confirmation run** on the fixture that caught it, and
  the fix matrix goes in the read-out (crack × round, like the advanced
  read-out's table).
- When a crack survives two or three prompt rounds, **stop growing the
  prompt**: carry it on the grader's checklist as a known crack (cheap
  to catch at the seam), or — if it's worth a node — queue the structural
  fix as a brief amendment for the Director.
- Honestly-mechanical checks discovered during testing (word counts,
  lexicon scans) are pegged **future software** — an agent covers them
  best-effort meanwhile (README, prototype rule).

## What earns a new fixture

A failure class no existing fixture exposes; a ceiling the brief newly
states; a ratified behavior with no test behind it. What does not: another
difficulty step between existing fixtures.

## Measurement, sampling & significance (2026-06-15)

*(Added because the runtime is stochastic: the same input yields different
outputs, so a single pass is a sample, not a measurement. "Passing" /
"needs work" are labels derived from a number — record the number.)*

**Two scores, two questions.** A run's quality grade (e.g. 95/100) is *one
sample*. The **pass rate** — the probability the play clears the bar across
runs — is the reliability parameter we actually care about. Report the rate
with its sample size, never a bare label.

**Precision scales with √k.** For a binary pass rate, the 95% confidence
half-width is ≈ `1.96·√(p(1−p)/k)`. To halve the error bar you need 4× the
runs. Practical bars (true p≈0.9):

| runs k | 95% error bar | honest claim |
|---|---|---|
| 1 | — | "it can pass." Nothing about reliability. |
| 10 | ±~19% | "probably not grossly broken." |
| 30 | ±~11% | a rough rate. |
| 100 | ±~6% | can tell 80% from 90%. |
| 300 | ±~3% | a tight number. |

**The rule of three (zero-failure runs).** Seeing **0 failures in k runs**
puts the 95% upper bound on the failure rate at ≈ **3/k**. So 0/10 → up to
30% failure; 0/30 → 10%; 0/100 → 3%; 0/300 → 1%. "10/10, ship it" actually
means "failure rate could be ~26%." A high-reliability (≥99%) claim needs
~300 clean runs.

**How many depends on the question.** Estimate the rate to ±10% → ~30 runs;
±5% → ~100. Detect a small (~10-point) prompt-change improvement → ~200 runs
per side (paired: McNemar for binary, paired-t for scores) — small gains are
expensive to *prove*. Claim ship-grade reliability → rule of three (~300+).

**Two noise sources.** Variance comes from the SUT (different outputs per
run) *and* the grader (an LLM-judge or human scores the same output
differently, and may be biased). More runs shrink SUT noise but **cannot fix
a biased grader** — calibrate the judge (inter-rater agreement, human-anchored
spot checks). Suspect the key before the doers (the rung-1 lesson).

**Deterministic checks are exempt.** A mechanical check (word count, exact-quote
match, schema validation) is deterministic — **n=1 is statistically sufficient**.
Only stochastic, judgment-graded evals need k.

**Continuous beats binary for precision.** A mean ± SE (`SE = sd/√k`)
converges faster than a proportion — a graded score carries more information
per run than one bit. Use scored rubrics where the rubric is reliable; still
threshold for the pass/fail decision.

**Run-count policy (tie spend to likelihood × cost of failure).** Runs are
expensive — each is the whole chain × k. So:

- **Smoke — k ≈ 5.** Most rows. Catches gross flakiness; ±~20%, not a number
  to quote.
- **Estimate — k ≈ 30.** The rows that matter. A usable rate, ±~10%.
- **Ship-gate — k ≥ 100, or rule-of-three for the reliability bar.** Only the
  high-cost-of-failure risks, and any "is it reliable enough to register" claim.

**What to record.** Every eval result carries **n · pass rate · CI** (or mean
± CI for scored rubrics). The label is *derived*: `passing` = rate clears the
bar with adequate n; `needs work` = a known crack carried; `provisional` =
n too small to claim (flag stochastic results with n < 10). Deterministic
checks record "deterministic · 1/1."

**Never pool across tests.** Measurement is per (fixture + eval). Two tests
measure different failure conditions with different true rates; combining their
runs into one n/rate is invalid — a test run 1,000× and a test run once do not
make n=1,001 (a Simpson's-paradox trap). A risk-area's headline is therefore the
**binding constraint** — its *weakest required test* — never a sum or an average
across its tests.
