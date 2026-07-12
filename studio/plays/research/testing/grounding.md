# Grounding — the testing & hardening canon (risk taxonomy)

The cited source of truth for the testing center: the failure modes an eval
suite for a prompt or prompt-chain should cover, and how practitioners reason
about coverage. Provenance: deep-research run 2026-06-15 (fan-out web search →
23 sources fetched → 109 claims extracted → top 25 adversarially verified, 3
independent votes each; **25/25 confirmed, 0 killed**). Every claim below rests
on a primary, mostly peer-reviewed source with a unanimous 3-0 vote. Raw
extraction + the pending/unverified salvage: `extracted-claims.md`.

## How to read this — ties to our canon

Our governing rule is **"fixtures are bought by failure class, not
difficulty"** (`TESTING.md`): every fixture retires one specific way a play can
fail. This document is the external grounding for *what those failure classes
are* — the canonical risk columns. Use it as the coverage spine: for each play,
each risk is **covered** (a fixture exposes it and the play passes),
**partial** (exposed, mostly holds, a known crack carried on the grader's
checklist — `known-fps.md`), or a **gap** (no fixture yet — the empty space).

Risks are grouped by phase: **Input · Reasoning · Output · Adversarial ·
Chain/composition.** The first four are well-grounded below; the chain phase is
a deliberate, flagged frontier (§5).

**Coverage priority (the sequencing rule).** Cover **what is known to be
problematic first.** The phases below split cleanly into two tiers:

- **Tier A — externally grounded (cover first).** Input, Reasoning, Output, and
  Adversarial risks have primary-source evidence that they bite real systems
  today. A play is not seriously tested until its Tier-A columns are addressed.
- **Tier B — frontier (carry as our own canon).** Chain/compound-system risks
  (§5) are under-grounded in the public literature *because highly-orchestrated
  multi-prompt factories are very new* — the field hasn't caught up, and we may
  end up documenting these failure modes ahead of it. That is expected, not a
  deficiency. We author Tier-B columns as internal hypotheses (marked "internal
  — not externally grounded") and test for them, but we do not let frontier
  columns delay or outrank Tier-A coverage.

A note on what each entry tests *against*: the verified literature recurs on a
few fixture patterns — **Invariance** (hold the answer fixed, vary a detail
that shouldn't matter, assert the output is unchanged), **contrast set /
minimal pair** (flip the one thing that *should* change behavior), and
**programmatic constraint assertion** (check a hard rule, don't rate prose).
These map to behavioral-testing theory (Ribeiro et al.'s CheckList: Minimum
Functionality / Invariance / Directional-Expectation tests) — **verified 3-0 in
the Tier-B pass** (ACL 2020, [aclanthology.org/2020.acl-main.442](https://aclanthology.org/2020.acl-main.442/)),
so this vocabulary is now cited canon, not just framing: an MFT is "inspired by
unit tests in software engineering," an INV applies "label-preserving
perturbations … and expect the model prediction to remain the same," a DIR
expects "the label … to change in a certain way," arranged as a capability ×
test-type matrix.

---

## Phase 1 — Input risks (what comes in)

### Position bias / "lost in the middle"

- **Risk:** model accuracy on long inputs is **U-shaped** by position — highest
  when the needed information sits at the start or end, materially degraded in
  the middle — and this persists even in models built and marketed for long
  contexts.
- **Failure it names:** a play that stuffs retrieved evidence or instructions
  into the middle of a long prompt silently loses the model's ability to use
  them.
- **How to test:** *positional Invariance* fixtures — hold the question fixed,
  vary where the gold evidence sits (start / middle / end) across otherwise
  identical inputs; fail the column if accuracy dips when the answer-bearing
  chunk is in the middle.
- **Grounding:** Liu et al., *Lost in the Middle* (TACL 2024): "performance is
  often highest when relevant information occurs at the beginning or end of the
  input context, and significantly degrades when models must access relevant
  information in the middle of long contexts … even for explicitly long-context
  models." [arxiv.org/abs/2307.03172]
- **Caveat:** measured on multi-document QA / key-value retrieval. Single
  needle-in-a-haystack retrieval is a different task where some frontier models
  score near-perfect — don't over-generalize the position effect to all
  long-context work.

### Distractibility to irrelevant context

- **Risk:** the *mere presence* of irrelevant context in the input degrades
  problem-solving accuracy — and the drop is large, not marginal.
- **Failure it names:** a play given noisy, off-topic, or padded input produces
  wrong answers even on inputs it solves cleanly. (This is the research basis
  for our **Storm** factor — "too much, noise hits the analysis.")
- **How to test:** *distractor-injection Invariance* fixtures — take an input
  the play solves, add an irrelevant-but-plausible clause, assert the output is
  unchanged. Shi et al.'s GSM-IC is the template.
- **Grounding:** Shi et al., *Large Language Models Can Be Easily Distracted by
  Irrelevant Context* (ICML 2023): "model performance is dramatically decreased
  when irrelevant information is included." Of problems baseline-solvable, "no
  more than 18% … can be consistently solved for all types of irrelevant
  information." [arxiv.org/abs/2302.00093] Persistence confirmed 2025 (GSM-DC,
  arXiv:2505.18761) on GPT-4.1 / GPT-4o-mini / Grok-3 / LLaMA-3.3.
- **Caveat:** the dramatic effect is specific to genuinely irrelevant
  distractors; no drop on clean variations.

---

## Phase 2 — Reasoning risks (what it does)

### Imitative falsehood / hallucination (the truthfulness gap)

- **Risk:** models confidently emit plausible, widely-believed-but-false
  answers learned from the training distribution ("imitative falsehoods").
- **Failure it names:** a play asserts a common misconception as fact, or (for
  grounded/RAG plays) drifts off its provided source.
- **How to test:** *known-misconception* fixtures with a gold "truthful" answer
  and a gold "plausible-but-false" distractor; assert the play does not produce
  the falsehood. For grounded plays, pair with a faithfulness check against the
  provided source.
- **Grounding:** Lin, Hilton & Evans, *TruthfulQA* (ACL 2022): 817 questions,
  38 categories, crafted around things "some humans would answer falsely due to
  a false belief or misconception"; "The best model was truthful on 58% of
  questions, while human performance was 94%." [arxiv.org/abs/2109.07958 ·
  aclanthology.org/2022.acl-long.229]
- **Caveat (time-sensitive):** the original "larger models are *less*
  truthful" (inverse scaling) finding is specific to 2021-era base models;
  modern post-trained frontier models often invert it (most capable ≈ most
  truthful). Carry imitative falsehood as a live column, but treat inverse
  scaling as historically mitigated.

---

## Phase 3 — Output risks (what comes out)

### Instruction-following & format/schema adherence

- **Risk:** a play ignores explicit instructions or violates the required
  output schema/format — the contract a downstream chain step depends on.
- **Failure it names:** missing required fields, wrong shape, length-ceiling
  breach, forbidden content — a structural break, distinct from "the prose is
  weak."
- **How to test:** *programmatic constraint assertion* — check each hard rule
  (schema validity, required fields, length bounds, forbidden lexicon)
  mechanically; do not rate quality. This is the IFEval design principle and
  maps to our `ground` (mechanical-check) move.
- **Grounding:** Zhou et al., *IFEval* (Google, 2023): human eval is "expensive,
  slow, and not objectively reproducible," LLM-judge is "biased or limited by
  the … evaluator LLM" — so they define ~25 "verifiable instructions" checked
  programmatically (e.g. JSON-only output, keyword frequency, section/bullet
  counts, word minimums). [arxiv.org/abs/2311.07911] Format adherence is a
  direct subset, not an analogy.

### Refusal calibration — bidirectional

- **Risk:** refusal can fail in *both* directions. **Under-refusal**: complies
  with a genuinely harmful request. **Over-refusal** ("exaggerated safety"): a
  distinct, systematic failure where the play refuses a clearly safe request
  because it shares surface language with unsafe ones or merely mentions a
  sensitive topic.
- **Failure it names:** a play that blocks legitimate use (over-refusal) or
  fails the boundary (under-refusal). For us, this is the research basis for the
  **refusal** fixture — and a reminder it must test *both* members.
- **How to test:** *contrast-set / minimal-pair* fixtures that hold surface
  lexicon constant while flipping intent (e.g. "kill a Python process" vs "kill
  a person"); assert compliance on the safe member and refusal on the unsafe
  one — both directions in one column.
- **Grounding:** Röttger et al., *XSTest* (NAACL 2024): "even clearly safe
  prompts are refused if they use similar language to unsafe prompts or mention
  sensitive topics." A 450-prompt set — 250 safe (ten types) + 200 unsafe
  minimal-pair contrasts. Proximate cause: lexical overfitting ("killing →
  refusal"); LLaMA-2 fully refused ~40% of safe prompts vs GPT-4 ~6%.
  [arxiv.org/abs/2308.01263 · aclanthology.org/2024.naacl-long.301]

---

## Phase 4 — Adversarial risks (hostile input)

### The OWASP LLM Top 10 columns (2025)

- **Risk:** four authoritative, named risk classes for LLM-integrated systems
  that double as adversarial eval columns:
  - **LLM01 Prompt Injection** (the #1 risk) — user input alters the model's
    intended behavior.
  - **LLM05 Improper/Insecure Output Handling** — model output passed
    downstream without validation/sanitization.
  - **LLM06 Excessive Agency** — an LLM-based system granted too much
    functionality, permission, or autonomy (**the one verified
    agent-specific failure mode**).
  - **LLM09 Misinformation** — credible-but-false output; hallucination named
    as a major cause.
- **Failure it names:** each is a named exploitable class.
- **How to test:** injection red-team fixtures (input attempting to override
  system instructions); output-handling fixtures (assert the downstream sink
  treats model output as untrusted — escape/validate before exec/DB/HTML/shell);
  agency-bound fixtures (assert the play cannot exceed least-privilege scope);
  misinformation/faithfulness fixtures.
- **Grounding:** OWASP GenAI Security Project, *Top 10 for LLM Applications
  2025*. [genai.owasp.org/llm-top-10] Verbatim e.g. LLM01: "A Prompt Injection
  Vulnerability occurs when user prompts alter the LLM's behavior or output in
  unintended ways."
- **Caveat:** versioned (2025 edition current as of June 2026); IDs/definitions
  can shift between editions.

### Indirect prompt injection (data-as-instructions)

- **Risk:** attackers plant malicious prompts in external data the model later
  retrieves — **no direct access to the model needed.** Because LLM-integrated
  systems blur the data/instruction boundary, processing such content can be
  *functionally equivalent to arbitrary code execution* and can control
  whether/how downstream APIs are called.
- **Failure it names:** a play that consumes retrieved/tool/document content
  treats embedded text as instructions. **Most acute for chains** — one step's
  output becomes the next step's instruction (worming).
- **How to test:** *poisoned-retrieval* fixtures — embed adversarial
  instructions inside the document/tool-output/email/page the play ingests;
  assert it does not follow them. Add data-exfiltration and worming variants for
  chains. (Directly grounds the injection plant `TESTING.md` mandates — **our
  next play has none yet → an Open column**.)
- **Grounding:** Greshake et al., *Not what you've signed up for* (ACM AISec
  2023): adversaries can "remotely (without a direct interface) exploit
  LLM-integrated applications by … injecting prompts into data likely to be
  retrieved"; "processing retrieved prompts can act as arbitrary code
  execution." Six-category threat taxonomy (info-gathering, fraud, intrusion,
  malware/worming, manipulated content, availability).
  [arxiv.org/abs/2302.12173]

### Red-team coverage method (how to reason about adversarial coverage)

- **Not a single risk — the coverage-reasoning frame** for the adversarial
  phase, from two institutional primary sources.
- **Two coverage-defining lessons (Microsoft AI Red Team, 100+ products):**
  (a) *"You don't have to compute gradients to break an AI system"* — cheap,
  manually-crafted, system-level prompt attacks dominate real-world risk, so a
  suite must cover low-effort attacks and can't assume only gradient attacks
  matter; (b) *"LLMs amplify existing security risks and introduce new ones"* —
  risks split into **inherited (system-level)** vs **novel (model-level)**, a
  useful two-axis taxonomy. [arxiv.org/abs/2501.07238]
- **OpenAI red-team taxonomy** — two non-exclusive axes: by **method**
  (Manual / Automated / Mixed) and by **who** (Internal / External), applied at
  different stages.
  [cdn.openai.com/papers/openais-approach-to-external-red-teaming.pdf]
- **How to apply:** prioritize cheap, manual, system-level attack fixtures;
  track inherited vs novel risks separately; combine manual + automated
  generation across stages.

---

## Phase 5 — Chain / compound-system risks  ✅ GROUNDED (Tier-B pass, 2026-06-15)

**The frontier moved.** A dedicated Tier-B second pass (deep-research run
2026-06-15: 5 angles → 18 sources fetched → 85 claims → top 25 adversarially
verified, 3 votes each; **23/25 confirmed, 2 killed**) found primary-source
grounding for **all five** chain columns the first run had to carry as open.
This phase is no longer an evidence gap — it is cited canon, with two named
caveats (below) and one sub-claim that stays internal.

The unit of analysis is the **compound AI system**: "a system that tackles AI
tasks using multiple interacting components, including multiple calls to models,
retrievers, or external tools" (Zaharia, Khattab, Stoica et al., BAIR 2024 —
[bair.berkeley.edu/blog/2024/02/18/compound-ai-systems](https://bair.berkeley.edu/blog/2024/02/18/compound-ai-systems/)).
The cross-cutting failure taxonomy is **MAST** (Cemri et al. 2025): 14 unique
failure modes in 3 categories — system design, inter-agent misalignment, task
verification — built from 150 hand-annotated traces (inter-annotator κ = 0.88)
and scaled by an LLM-judge across 1600+ traces from 7 multi-agent frameworks.
[arxiv.org/abs/2503.13657]

**Two caveats carried across the whole phase.** (a) **MAST is scoped to
*multi-agent* systems** — its inter-agent failure modes (the FM-2.x set) transfer
to single-agent prompt-chains *conceptually*, as named break-points, not as
measured single-chain rates; do not over-attribute. (b) **The call-count scaling
result below is about *majority-voting aggregation*, not literal sequential
step-to-step propagation** — the proven mechanism is query-difficulty variance,
not a per-step error cascade. The clean multiplicative *p → pⁿ* sequential-chain
math therefore **remains internal — not externally grounded** (see the still-open
note at the end of this phase).

### Per-step / call-count error compounding

- **Risk:** adding LLM calls is **not monotonically better**, and reliability
  decays sharply as the number of calls that must all succeed grows. More
  orchestration can lower accuracy, not just cost.
- **Failure it names:** a play that adds a verify/vote/retry step (or more chain
  links) on the assumption "more calls ≥ fewer" and silently regresses on its
  hard cases; or a multi-step task that passes once and is assumed reliable.
- **How to test:** *difficulty-stratified call-count sweep* — sweep N ∈ {1,3,5,7…}
  for a Vote/self-consistency step over fixtures stratified easy vs hard; assert
  the accuracy-vs-N curve is **checked for a peak**, not assumed monotone, and
  regress on the hard subset. Pair with *pass^k consistency*: run the same
  multi-step task k times with semantically-equivalent input and report pass^k,
  not pass@1; a steep pass^1→pass^8 drop flags an unreliable seam. Add an
  Anthropic-style *programmatic "gate"* between steps to localize the break.
- **Grounding:** Chen, Davis, Hanin, Bailis, Stoica, Zaharia, Zou, *Are More LLM
  Calls All You Need?* (NeurIPS 2024): "the performance of both Vote and
  Filter-Vote can first increase but then decrease as a function of the number of
  LM calls … this non-monotonicity is due to the diversity of query difficulties
  within a task: more LM calls lead to higher performance on 'easy' queries, but
  lower performance on 'hard' queries." [arxiv.org/abs/2403.02419] · τ-bench
  (Sierra): "even state-of-the-art function calling agents (like gpt-4o) succeed
  on <50% of the tasks, and are quite inconsistent (pass^8 <25% in retail)";
  introduces pass^k "to evaluate the reliability of agent behavior over multiple
  trials." [arxiv.org/abs/2406.12045] · MAST FM-3.2 *No or incomplete
  verification* names the channel by which unchecked errors "propagate
  undetected." [arxiv.org/abs/2503.13657] · Anthropic *Building Effective
  Agents*: "add programmatic checks (see 'gate' in the diagram below) on any
  intermediate steps to ensure that the process is still on track."
  [anthropic.com/research/building-effective-agents]
- **Caveat:** the non-monotonicity result is rigorously about majority-voting
  aggregation; pass^k measures *trial-level* (whole-task rerun) consistency, not
  per-step compounding within one trajectory. The literal sequential *pⁿ* math is
  **internal — not externally grounded**.

### Inter-step interference (a step corrupting a later step's context)

- **Risk:** an earlier step pollutes, withholds, or overwrites the context a
  later step depends on — the upstream output is the downstream input, so a defect
  travels.
- **Failure it names:** a step drops a fact the next step needed, ignores prior
  step output, or an early premature commitment that later steps over-rely on.
- **How to test:** *fact-injection handoff* fixture — plant a fact at step A that
  step C must use; assert C's output reflects it (information-withholding test).
  Plus *sharded multi-turn* — shard one fully-specified instruction into atomic
  per-turn shards and compare multi-turn success vs the single-turn baseline; the
  per-turn trajectory localizes the turn where the model prematurely committed.
- **Grounding:** MAST FM-2.4 *Information withholding* — "Failure to share or
  communicate important data … that an agent possess and could impact
  decision-making of other agents"; FM-2.5 *Ignored other agent's input*; FM-1.4
  *Loss of conversation history* — "Unexpected context truncation … reverting to
  an antecedent conversational state." [arxiv.org/abs/2503.13657] · Laban,
  Hayashi, Zhou, Neville, *LLMs Get Lost In Multi-Turn Conversation* (200,000+
  simulated sharded conversations, 15 models): "LLMs often make assumptions in
  early turns and prematurely attempt to generate final solutions, on which they
  overly rely." [arxiv.org/abs/2505.06120]
- **Caveat:** MAST's FM-2.x modes are multi-agent; the transfer to single-agent
  chain seams is conceptual (named break-points), not a measured single-chain
  rate.

### Routing / decomposition / planning errors

- **Risk:** the planner picks the wrong branch, splits the task badly, repeats
  completed steps, derails from the objective, or its actions diverge from its
  stated reasoning.
- **Failure it names:** a play whose routing/decomposition step emits the wrong
  subtasks or sends them to the wrong handler — the break is at the *plan*, before
  any single step executes.
- **How to test:** *gold-decomposition* fixture — give a task whose correct
  decomposition/routing is known; assert the planner's emitted subtasks match the
  gold split, and check for step repetition (FM-1.3) and reasoning-vs-action
  divergence (FM-2.6) at the planning step.
- **Grounding:** MAST FM-1.1 *Disobey task specification*, FM-1.2 *Disobey role
  specification*, FM-1.3 *Step repetition* — "Unnecessary reiteration of
  previously completed steps"; FM-1.5 *Unaware of termination conditions*; FM-2.3
  *Task derailment* — "Deviation from the intended objective"; FM-2.6
  *Reasoning-action mismatch* — "Discrepancy between the logical reasoning process
  and the actual actions taken." [arxiv.org/abs/2503.13657] · The
  routing/decomposition *seam itself* is named by Kandogan et al. (Megagon Labs),
  *Blueprint Architecture*: "Task and data planners, respectively, break down,
  map, and optimize tasks and data to available agents." [arxiv.org/abs/2406.00584]
- **Caveat:** Blueprint is a workshop/position architecture paper (not
  peer-reviewed, conceptual not evidentiary) — use it to *name* the seam, MAST for
  the empirically-cataloged failures.

### Tool-use errors

- **Risk:** malformed/invalid tool calls, wrong tool selected, hallucinated
  arguments, or the model ignoring the tool's returned output — and ambiguous
  tool interfaces *cause* these errors.
- **Failure it names:** a play that calls a tool with a bad shape, picks the
  wrong tool, invents args, or fails to read what the tool returned.
- **How to test:** *tool-call contract* fixtures — assert each call is
  schema-valid, the chosen tool matches the gold tool, args are not hallucinated,
  and the step consumes the returned output; then *A/B the interface*
  (ambiguous vs poka-yoke'd args) and compare malformed-call rate to localize
  whether the break is the model or the agent-computer interface.
- **Grounding:** τ-bench supplies the measured rate (gpt-4o <50% task success,
  pass^8 <25% retail). [arxiv.org/abs/2406.12045] · Anthropic *Building Effective
  Agents* frames it as an agent-computer-interface (ACI) design problem: "we found
  that the model would make mistakes with tools using relative filepaths … we
  changed the tool to always require absolute filepaths — and we found that the
  model used this method flawlessly." [anthropic.com/research/building-effective-agents]
- **Caveat:** the τ-bench figure is gpt-4o-specific (mid-2024) and
  time-sensitive — re-baseline against current frontier models before treating
  <50% as load-bearing. The Anthropic ACI claim is official practitioner guidance,
  not peer-reviewed (verified 2-1, the "vanish" framing slightly strong).

### Context / state-handoff loss across steps

- **Risk:** state that must cross a step/turn boundary is truncated, reset, or
  degraded — and multi-turn delivery of the *same* information is markedly worse
  than single-turn.
- **Failure it names:** a play that performs well when handed everything at once
  but degrades when the same content arrives spread across steps/turns.
- **How to test:** *single-turn vs sharded-multi-turn* contrast — hold the total
  information fixed; deliver it fully-specified in one shot vs sharded one piece
  per turn; assert the multi-turn path does not regress past a threshold, and use
  the per-turn trajectory to localize the seam where state was lost.
- **Grounding:** Laban et al., *LLMs Get Lost In Multi-Turn Conversation*: "all
  the top open- and closed-weight LLMs we test exhibit significantly lower
  performance in multi-turn conversations than single-turn, with an average drop
  of 39% across six generation tasks"; the drop decomposes into "a minor loss in
  aptitude and a significant increase in unreliability."
  [arxiv.org/abs/2505.06120] · MAST FM-1.4 *Loss of conversation history* names
  the truncation/reset mechanism. [arxiv.org/abs/2503.13657]
- **Caveat:** measured on simulated sharded conversations; the effect is the
  research basis for treating handoff loss as a first-class column, distinct from
  single-call input risks (§1).

### Still-open after the Tier-B pass (the residual frontier)

The pass closed most of the gap, but carry these honestly:

- **Sequential per-step *pⁿ* reliability math** — grounded only as
  voting-aggregation non-monotonicity (helps easy / hurts hard) and trial-level
  pass^k decay. No primary source we verified measures error propagation
  *step-to-step within a single trajectory*. Keep the multiplicative-decay framing
  as **internal — not externally grounded**.
- **MAST inter-agent modes → reproducible single-chain fixture** — MAST *names*
  FM-2.4/2.5 etc.; no source we verified ties a specific inter-agent mode to a
  reproducible eval fixture a single-agent play could run directly. The fixture
  patterns above are our extrapolation from the named modes.
- **The "evals as unit tests" practitioner tier** (Hamel Husain, promptfoo,
  OpenAI Evals, LangSmith / Arize Phoenix / Braintrust) — named as targets,
  produced **no surviving verified claim** for a chain-seam-localizing fixture.
  A genuine thin-grounding result, not a manufactured citation; see
  `extracted-claims.md` pending.

---

## Caveats (carry these with the taxonomy)

1. **Time-sensitivity.** TruthfulQA inverse-scaling is a 2021-era artifact
   (historically mitigated). Lost-in-the-middle persists for multi-doc/key-value
   tasks but not all long-context tasks. OWASP IDs are versioned.
2. **Evidence-coverage gap — largely closed.** Strong on
   input/reasoning/output/adversarial; the chain/composition phase (§5) is now
   grounded by the Tier-B pass (MAST, "Are More LLM Calls", τ-bench, multi-turn
   degradation), with two named caveats and one residual sub-claim (sequential
   *pⁿ* math) still internal — see §5.
3. **Named in the brief but still not verified as primary citations** (research
   before citing as canon): HELM; metamorphic testing; classic software-testing
   analogies (equivalence partitioning, boundary-value, mutation testing); the
   "evals as unit tests" practitioner movement (Hamel Husain, promptfoo, OpenAI
   Evals, Anthropic eval guidance) — named in the Tier-B pass but producing no
   surviving verified chain-seam claim. **CheckList (Ribeiro et al., ACL 2020) is
   now verified** (3-0) and graduated to a primary citation. See
   `extracted-claims.md`.

## Sources (verified, primary)

- Liu et al., *Lost in the Middle*, TACL 2024 — arxiv.org/abs/2307.03172
- Shi et al., *Easily Distracted by Irrelevant Context*, ICML 2023 —
  arxiv.org/abs/2302.00093
- Lin et al., *TruthfulQA*, ACL 2022 — arxiv.org/abs/2109.07958 ·
  aclanthology.org/2022.acl-long.229
- Zhou et al., *IFEval*, 2023 — arxiv.org/abs/2311.07911
- Röttger et al., *XSTest*, NAACL 2024 — arxiv.org/abs/2308.01263 ·
  aclanthology.org/2024.naacl-long.301
- OWASP *Top 10 for LLM Applications 2025* — genai.owasp.org/llm-top-10
- Greshake et al., *Indirect Prompt Injection*, AISec 2023 —
  arxiv.org/abs/2302.12173
- Bullwinkel et al. (Microsoft AI Red Team), *Lessons From Red Teaming 100
  Generative AI Products*, 2025 — arxiv.org/abs/2501.07238
- OpenAI, *Approach to External Red Teaming*, 2024 —
  cdn.openai.com/papers/openais-approach-to-external-red-teaming.pdf

### Tier-B chain / compound-system (verified 2026-06-15)

- Zaharia, Khattab, Stoica et al., *The Shift from Models to Compound AI
  Systems*, BAIR 2024 — bair.berkeley.edu/blog/2024/02/18/compound-ai-systems/
- Chen et al., *Are More LLM Calls All You Need?*, NeurIPS 2024 —
  arxiv.org/abs/2403.02419
- Cemri et al., *Why Do Multi-Agent LLM Systems Fail?* (MAST), 2025 —
  arxiv.org/abs/2503.13657
- Yao et al. (Sierra), *τ-bench*, 2024 — arxiv.org/abs/2406.12045
- Laban et al., *LLMs Get Lost In Multi-Turn Conversation*, 2025 —
  arxiv.org/abs/2505.06120
- Kandogan et al. (Megagon Labs), *Blueprint Architecture* (names the
  routing/handoff seams; workshop/position, not peer-reviewed) —
  arxiv.org/abs/2406.00584
- Anthropic, *Building Effective Agents*, 2024 (primary practitioner guidance) —
  anthropic.com/research/building-effective-agents
- Ribeiro et al., *CheckList*, ACL 2020 — aclanthology.org/2020.acl-main.442
