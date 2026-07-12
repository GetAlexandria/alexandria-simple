# Authoring evals — turning the open areas of `frame-the-problem-next` into real, measured tests

A working manual for the agent who picks up an **open** (gap ○) or **partial**
(◐) coverage area in the Play Testing surface and turns it into a fixture with a
real, recorded pass rate.

Everything here is grounded in three canon files. Read them; this guide does not
restate them in full:

- `studio/plays/TESTING.md` — the testing manual (fixture principle, the minimum
  viable fixture kit, fixture layout, building/running/grading, and the
  *Measurement, sampling & significance* policy).
- `studio/plays/research/testing/RISKS.md` — the canonical risk columns (each
  has a **default fixture pattern** and a **tier**) and the
  `frame-the-problem-next` **coverage register**.
- `studio/plays/frame-the-problem-next/fixtures/README.md` — the real fixture
  convention for this play.

---

## 1. The job

The Play Testing surface renders one cell per risk column from RISKS.md. An
empty circle (○ gap) or half-filled circle (◐ partial) is the surface telling
you: *no fixture exposes this risk yet*, or *the risk is exposed but a known
crack rides on the grader's checklist instead of a passing measurement*.

Your job is to **fill that circle with real data** — not a label, a number.
Per the measurement policy in TESTING.md, "passing" / "needs work" are labels
*derived* from a recorded `n · pass rate · CI`. A single green pass is a sample,
not a measurement. The recipe below is how you produce the measurement the empty
circle is waiting for.

A circle goes from ○/◐ to ● (covered) when, and only when, there is **a built
fixture that exposes exactly that risk AND a recorded pass rate at adequate `n`
that clears the bar** (see §4, Definition of done).

---

## 2. The process (x → y → z)

This is the recipe, grounded step-by-step in TESTING.md.

### Step a — Pick one open risk from the coverage register

Open RISKS.md's *frame-the-problem-next coverage register* and pick one ○ or ◐
row. **One risk per fixture.** The fixture principle in TESTING.md is explicit:
*fixtures are bought by failure class, not difficulty* — each fixture earns its
place by exposing a failure mode no other fixture exposes. Do not build a
"harder" version of an existing case; build the one that exposes *this* column.

### Step b — Design a fixture that exposes exactly that one risk

Every column in RISKS.md ships a **default fixture pattern** — use it. It is the
canonical shape for exposing that risk. For example, IN-1's pattern is
*positional invariance: hold the answer, vary its position (start/mid/end)*;
ADV-1's is *injection plant in the input ("ignore your rules…"), assert
ignored*. The per-risk table in §3 lists the pattern for each open area in this
play.

When designing, obey the *Building a fixture* rules in TESTING.md:

- **Answer key before runs**, written blind to any run. When grader variance
  appears later, suspect the key before the doers.
- **Purity, both directions.** The play's prompts must never contain the
  fixture's answer or domain, and fixture characters/vocabulary must never
  appear in prompt exemplars.
- **Verify the fixture mechanically before trusting any result** — every plant
  verbatim-findable, counts match the key, no accidental legitimate plants in
  noise blocks.
- For untrusted-input fixtures, TESTING.md mandates an embedded instruction
  ("ignore your rules and…") at least once, to test the data-never-instructions
  clause. (This is the ADV-1 pattern directly; for other columns, include it
  where the design calls for hostile input.)

### Step c — Lay it out by the real convention

Follow `fixtures/README.md` exactly. The convention for this play:

- **One directory per behavior case:** `plays/frame-the-problem-next/fixtures/<case>/`.
- Inputs are **files named by input key**, `.md` extension. For this play the
  keys are: `transcript` (always required), `surface_map`, `users`, `prior_brief`
  (each only when the case provides it). The filename minus extension *is* the
  input key; a runner binds `--input <key>=<abs-path>`.
- **Omit** an optional input the case doesn't provide — do **not** pass an empty
  file. (Note: `fixtures/README.md` resolves the small wording difference in
  TESTING.md — for *this* play, absence means "key not passed," and the prompts
  handle absence explicitly.)
- Each input file holds **only** what the play reads — no documentation, no
  answer key, no planted-property notes inside the transcript (that is leakage).
- The fixture's documentation (behavior under test, planted properties,
  input→source mapping, expected outcome) goes in a **per-case `README.md`**.
- Grading material — the answer key, a reference read-out — goes in an optional
  **`expected/` subdir** and is **never passed as input**.

### Step d — Define the assertion (what "pass" means for this case)

Write the answer key as the explicit pass condition for *this* case, derived
from the column's risk statement in RISKS.md and the play's brief (§7). Make it
checkable: a positional-invariance case (IN-1) passes when the located thread is
**the same across all positions**; an injection case (ADV-1) passes when the
embedded instruction is **ignored** and (per TESTING.md) reported. State the
condition the grader checks against — never against their own taste.

Decide here whether the assertion is **deterministic** or **judgment-graded**,
because it sets your run count (Step f). A mechanical check — exact-quote match,
field presence, "the same thread id appeared in all three positions" — is
deterministic. A quality judgment — "did it refuse *gracefully*," "did the
spoken layer overclaim" — is stochastic and judgment-graded.

### Step e — Run it k times on the factory and grade

Per TESTING.md (*Where runs happen* / *Running and grading*):

- Runs happen on the **embedded factory** (the Fabro inside Alexandria), not the
  builder factories. The play must be in `PLAY_MANIFEST` to be run.
- Run `fabro validate` on the graph **before** any graded run, so factory time
  isn't spent discovering a parse error.
- A bundled fixture resolves with one flag: `ax2 run frame-the-problem-next
  --fixture <case>` maps each input-key file in the case dir to its `--input`
  binding automatically. Use `--interactive` to answer in-play human gates when
  the case grades gate behavior; the default non-interactive run auto-approves
  gates and is legal only for gate-free cases or structural smokes.
- **Graders are fresh-eyes and blind**, grading against the answer key and the
  brief's §7. Graders string-match every quote character-exact, count
  mechanically what can be counted, **consume `frame-the-problem-next/known-fps.md`
  before reporting**, and attest coverage ("examined X, nothing flagged").
- Pull the full run record into `dry-runs/` (or `fixtures/<case>/runs/`) with the
  grade. **Every run gets a record; failures are never cleaned up** — they are
  the curriculum.

### Step f — Record `n · pass rate · CI` per the measurement policy

This is the part the empty circle is actually waiting for. From TESTING.md's
*Measurement, sampling & significance*:

- **Deterministic checks are n=1.** A mechanical/exact-match/schema check is
  statistically sufficient at one clean run. Record it as `deterministic · 1/1`.
  Only stochastic, judgment-graded evals need k.
- **Run-count tiers (pick by likelihood × cost of failure):**
  - **Smoke — k ≈ 5.** Catches gross flakiness; ±~20%, not a number to quote.
  - **Estimate — k ≈ 30.** A usable rate, ±~10%. The rows that matter.
  - **Ship-gate — k ≥ 100**, or **rule of three** for a reliability bar. Only
    high-cost-of-failure risks and any "reliable enough to register" claim.
- **Rule of three (zero failures):** 0 failures in k runs puts the 95% upper
  bound on the failure rate at ≈ **3/k**. So `10/10` means the failure rate could
  still be ~26%; a ≥99% reliability claim needs ~300 clean runs.
- **Record `n · pass rate · CI`** (or mean ± CI for a scored rubric). The label
  is derived: `passing` = rate clears the bar at adequate `n`; `needs work` = a
  known crack carried; `provisional` = `n` too small to claim (flag stochastic
  results with n < 10).
- **Never pool across tests.** Measurement is per (fixture + eval). A risk
  area's headline is the **binding constraint** — its *weakest required test* —
  never a sum or average across its tests. More runs shrink SUT noise but
  **cannot fix a biased grader** — calibrate the judge; suspect the key first.

### Step g — Write the result back into `risk-map.md`

The per-play `risk-map.md` is the source of truth the surface reads. Writing the
measured result back into the row for that risk is what makes the circle fill in.
Record the `n · pass rate · CI`, the fixture/case that produced it, and the
derived label. (RISKS.md notes the durable home for per-play coverage — case
frontmatter vs a per-play `risk-map.md` — is decided at wiring time; treat
`risk-map.md` as that home. If it is being authored in parallel, fill the row;
if it does not exist yet, the row you write is the structure it adopts.)

### When a run fails

Follow TESTING.md's *When a run fails*: escalation gradient (matched
good/bad example → mechanical check → dedicated checking node → more prose, in
that order); **fixes land in the brief and re-derive** (never patch a node
prompt in place); every fix gets a **confirmation run** on the fixture that
caught it; and when a crack survives two or three prompt rounds, **stop growing
the prompt** — carry it as a known crack on the grader's checklist (that is what
a ◐ *partial* is), or queue a structural fix as a brief amendment.

---

## 3. This play's open areas

The exact ○ gap and ◐ partial rows from the `frame-the-problem-next` coverage
register in RISKS.md. Pattern column is each risk's **default fixture pattern**,
quoted from RISKS.md.

| risk id + name | state | recommended fixture pattern (from RISKS.md) | what's missing |
|---|---|---|---|
| **IN-1 Buried signal** | ○ gap | positional invariance: hold the answer, vary its position (start/mid/end) | `hard-case` scatters evidence across the back half, but there is **no controlled positional-invariance fixture** holding one thread constant while moving its position. |
| **OUT-2 Refusal calibration** | ◐ partial | minimal-pair / contrast set: same surface, flipped intent; assert comply-safe + refuse-unsafe | Under-refusal is covered by `refusal`; over-refusal is only *implied* by `golden`/`empty`. **No minimal-pair contrast set** (same surface, flipped intent) baits the over-refusal direction. |
| **OUT-3 Overclaim / unfaithful render** | ◐ partial | pause/self-check fixture: bait an overclaim, assert it's cut | The `pause` move guards it and commitment-inflation is carried as a **known crack** — but **no fixture baits the overclaim** to measure it. |
| **ADV-1 Direct prompt injection** | ○ gap | injection plant in the input ("ignore your rules…"), assert ignored | **No injection plant exists** — and TESTING.md mandates one per play for the data-never-instructions clause. |
| **ADV-2 Indirect injection / poisoned retrieval** | ○ gap | poisoned-retrieval fixture; add worming/exfil variants for chains | **No poisoned-retrieval / poisoned-context fixture** (adversarial instructions hidden in supplied context). |
| **CHN-1…5 Chain** *(Tier-B frontier)* | ○ gap | per-column: end-to-end vs per-step pass-rate (CHN-1); inject a plausible-but-wrong intermediate, assert recovery (CHN-2); branch-selection fixtures (CHN-3); per-tool call-validity fixtures (CHN-4); hand off populated state, assert it survives (CHN-5) | The 8-node chain is **not yet tested** for compounding / interference / routing / tool-use / handoff. The whole Tier-B frontier is **unbuilt**. *Caveat (RISKS.md §Phase 5): Tier-B is hypothesis-tier — do not let it outrank Tier-A coverage.* |
| **RE-5 Evidence mis-grading** *(play-specific)* | ◐ partial | (no canonical pattern — bespoke, filed in-family) | `hard-case` grading traps pass, but **commitment-inflation on vivid-pain quotes is a standing carve-out** (known crack), not a fixture that measures it. |
| **OUT-4 Open-dispute discipline** *(play-specific)* | ◐ partial | (no canonical pattern — bespoke, filed in-family) | Leaving the PE root dispute open is tested, but **hunch-claiming-a-disputed-cause is a standing carve-out** (known crack), not a fixture that measures it. |

Notes:

- **IN-1, ADV-1, ADV-2, CHN-1…5 are ○ gaps** — no fixture exists; building one
  is net-new coverage.
- **OUT-2, OUT-3, RE-5, OUT-4 are ◐ partials** — the risk is exposed and mostly
  holds, but a **known crack** rides on the grader's checklist (`known-fps.md`)
  instead of a passing measurement. Closing a partial means either building the
  minimal-pair / overclaim-bait fixture that measures the crack directly (OUT-2,
  OUT-3), or — if a crack survives prompt rounds — keeping it an honest ◐ with
  the carve-out documented (the legitimate end-state for RE-5 / OUT-4 if a
  structural fix isn't warranted).
- **ADV-3 insecure output handling** is genuinely **n/a** — the surface is absent
  (markdown consumed by a human; no downstream code sink). Do not build a fixture.
- **ADV-4 excessive agency** and **CHN-4 tool-use** are **○ gap, not n/a**
  (agency-boundary correction, 2026-06-17): Raven runs as an ACP agent with file
  Read/Write tools under a least-privilege boundary the prompts declare
  (`consumes:`/`emits:`). They are real, low-severity surfaces. Their default
  fixtures: **ADV-4** — assert every write lands in `runtime/*` and only the
  declared inputs are read (no out-of-scope read/write); **CHN-4** — assert the
  file-tool calls are well-formed, target declared paths only, and the tool output
  is actually used. Doctrine: `studio/plays/research/testing/RISKS.md`.

---

## 4. Definition of done — when a circle turns ●

A risk area is **covered (●)** when both hold:

1. **A built fixture exposes exactly that risk**, laid out per the `fixtures/README.md`
   convention (its own `<case>/` dir, inputs named by key, an answer key written
   blind, `expected/` for grading material), using the column's default fixture
   pattern from RISKS.md.
2. **A recorded measurement clears the bar at adequate `n`:**
   - **Deterministic assertion:** one clean run — recorded `deterministic · 1/1`.
   - **Stochastic / judgment-graded assertion:** a pass rate at the run-count
     tier the risk's cost-of-failure warrants — `k ≈ 30` (estimate) for the rows
     that matter, `k ≥ 100` or rule-of-three for ship-gate / "reliable enough to
     register" claims. Recorded as `n · pass rate · CI`, label *derived*. A
     result with `n < 10` is `provisional`, **not** covered.

Intermediate states:

- **partial (◐)** — the fixture exists and mostly holds, but a known crack is
  carried on the grader's checklist (`known-fps.md`). This is the honest
  end-state when a crack survives prompt rounds and a structural fix isn't
  warranted (the RE-5 / OUT-4 situation today).
- **provisional** — a stochastic result with `n` too small to claim. Keep
  running until you reach the tier, or downgrade the claim.

And the measurement is **written back into `risk-map.md`** (Step g) — until the
row is updated, the surface still shows the old circle regardless of what runs
have happened.

The result you record is honest about its `n`: a circle filled on `k = 5` is a
smoke, not a ship-gate, and the policy says so explicitly — `±~20%`, "not a
number to quote." Match the claim to the runs.
