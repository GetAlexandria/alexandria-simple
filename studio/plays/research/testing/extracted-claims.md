# Extracted claims — testing & hardening canon (salvage, 2026-06-15)

Status: **verified.** The deep-research run decomposed the question into 5
angles, fetched 23 sources, extracted 109 claims, and adversarially verified the
top 25 (3 independent votes each, 2/3 refutes required to kill). **25/25
confirmed, 0 killed**, synthesized to 8 findings. All survivors rest on primary,
mostly peer-reviewed sources; no blog- or marketing-sourced claim survived
verification. Confirmed material is written up in `grounding.md`; this file is
the raw claim ledger plus the **pending / not-yet-verified** salvage that names
the next research pass.

**Update (Tier-B pass, 2026-06-15).** A second deep-research run targeted the
chain/compound-system frontier (§5): 5 angles, 18 sources fetched, 85 claims,
top 25 adversarially verified (3 votes each) — **23 confirmed, 2 killed**.
**All five chain columns moved from internal-hypothesis to externally
grounded** (written up in `grounding.md` §5). CheckList also cleared (3-0) and
graduated from framing to canon. The verified Tier-B ledger, the 2 killed
claims, and the narrowed pending list are appended below.

Full raw output: session tasks `w26cfqnr4` (Tier-A) · `wwi0m62c6` (Tier-B).

## Verified claims (3-0, by source)

### Liu et al. — Lost in the Middle (TACL 2024) — arxiv 2307.03172
- Long-context accuracy is U-shaped by position: best at the start/end of the
  context, significantly degraded in the middle.
- The degradation persists in models explicitly built/marketed for long
  contexts; "extended-context models often have identical performance to their
  non-extended counterparts."
- Measured on multi-document QA + key-value retrieval (4K/16K/32K); corroborated
  on GPT-4o / Claude 3 / Gemini-1.5 (2024–25 follow-ups).
- Caveat: single needle-in-haystack is a different task; don't over-generalize.

### Shi et al. — Easily Distracted by Irrelevant Context (ICML 2023) — arxiv 2302.00093
- The mere presence of irrelevant context dramatically decreases problem-solving
  accuracy.
- Magnitude: ≤18% of baseline-solvable problems stay solved across all
  irrelevant-info types; <30% of base problems consistently solved after
  distractors.
- GSM-IC is the controlled benchmark built to measure it; GSM-DC (2025,
  arXiv:2505.18761) confirms persistence in current frontier models.
- Caveat: effect is specific to genuinely irrelevant distractors; no drop on
  clean variations.

### Lin, Hilton & Evans — TruthfulQA (ACL 2022) — arxiv 2109.07958 · aclanthology 2022.acl-long.229
- 817 questions, 38 categories, crafted around human misconceptions ("imitative
  falsehoods" learned from training text).
- Best model truthful on 58% of questions vs 94% human.
- 2021-era base models: larger = less truthful (inverse scaling). **Time-sensitive:**
  modern post-trained models often invert this; carry as "mitigated by
  post-training."

### Zhou et al. — IFEval (2023) — arxiv 2311.07911
- Human eval is expensive/slow/non-reproducible; LLM-as-judge is biased/limited
  by the evaluator model.
- Design principle: objective, reproducible, programmatically verifiable
  instruction compliance — ~25 verifiable instruction types, ~500 prompts.
- Format/schema adherence is a direct subset (detectable_format:json_format,
  number_bullet_lists, number_highlighted_sections), not an analogy.
- Integrated into EleutherAI lm-eval-harness + HF OpenLLM Leaderboard.

### Röttger et al. — XSTest (NAACL 2024) — arxiv 2308.01263 · aclanthology 2024.naacl-long.301
- Over-refusal ("exaggerated safety") is a distinct, systematic failure mode,
  separate from under-refusal.
- Cause: lexical overfitting on safety keywords ("killing → refusal").
- 450-prompt contrast set: 250 safe (ten types) + 200 unsafe minimal-pair
  contrasts. (arXiv v1 said 200 safe; cite NAACL's 250 / 450 total.)
- LLaMA-2 fully refused ~40% of safe prompts vs GPT-4 ~6%. Concept echoed by
  OR-Bench (ICML 2025), CASE-Bench, UK AISI Inspect Evals.

### OWASP — Top 10 for LLM Applications 2025 — genai.owasp.org/llm-top-10
- LLM01 Prompt Injection (#1): user prompts alter the LLM's intended behavior.
- LLM05 Improper Output Handling: insufficient validation/sanitization before
  output passes downstream.
- LLM06 Excessive Agency: too much functionality/permission/autonomy — **the one
  verified agent-specific column.**
- LLM09 Misinformation: credible-but-false output; hallucination a major cause.
- Caveat: versioned; IDs/definitions shift between editions.

### Greshake et al. — Indirect Prompt Injection (AISec 2023) — arxiv 2302.12173
- Attackers compromise LLM apps remotely by planting prompts in data the model
  retrieves — no direct interface needed.
- Processing retrieved prompts can be functionally equivalent to arbitrary code
  execution; can control whether/how downstream APIs fire.
- Six-category threat taxonomy: info-gathering, fraud, intrusion,
  malware/worming, manipulated content, availability.
- Worming (a step's output becomes another's instruction) is the chain-relevant
  facet — still recognized in OWASP 2025 (XPIA).

### Microsoft AI Red Team + OpenAI — red-team method — arxiv 2501.07238 · openai external red-teaming PDF
- MS (100+ products): "You don't have to compute gradients to break an AI
  system" — low-effort prompt/system-level attacks dominate.
- MS: "LLMs amplify existing security risks and introduce new ones" — inherited
  (system-level) vs novel (model-level) split.
- OpenAI: red-team taxonomy on two non-exclusive axes — method (Manual /
  Automated / Mixed) and who (Internal / External), applied across stages.
- These are the coverage-reasoning frame, not a single risk.

## Verified claims — Tier-B chain / compound-system (3-0 unless noted)

### BAIR — The Shift to Compound AI Systems (2024) — bair.berkeley.edu/blog/2024/02/18/compound-ai-systems
- Unit of analysis: a compound AI system is "a system that tackles AI tasks
  using multiple interacting components, including multiple calls to models,
  retrievers, or external tools." This frames the whole chain phase. (3-0)

### Chen et al. — Are More LLM Calls All You Need? (NeurIPS 2024) — arxiv 2403.02419
- Under majority-vote aggregation (Vote, Filter-Vote), performance is
  **non-monotonic** in the number of LLM calls — first rises, then falls. (3-0,
  six concordant claims merged)
- Mechanism: diversity of query difficulty within a task — more calls help
  "easy" queries, hurt "hard" ones; a mixed task peaks then declines.
- **Scope caveat:** proven for voting architectures, not literal sequential
  step-to-step propagation. The multiplicative *pⁿ* chain math is NOT grounded
  by this source.

### Sierra — τ-bench (2024) — arxiv 2406.12045
- SOTA function-calling agents (gpt-4o) succeed on **<50%** of tasks and are
  highly inconsistent (**pass^8 <25%** in retail). (3-0, three claims merged)
- Introduces **pass^k** to measure reliability across multiple trials; under
  independence pass^k ≈ p^k → exponential reliability decay in k.
- **Caveats:** pass^k is trial-level (whole-task rerun) consistency, not
  per-step compounding; <50% is gpt-4o-specific (mid-2024), time-sensitive.

### Cemri et al. — MAST "Why Do Multi-Agent LLM Systems Fail?" (2025) — arxiv 2503.13657
- Empirical taxonomy of **14 failure modes** in 3 categories — system design,
  inter-agent misalignment, task verification — from 150 traces (κ = 0.88),
  scaled by LLM-judge across 1600+ traces / 7 MAS frameworks. (3-0)
- Inter-step / handoff: FM-1.4 *Loss of conversation history*, FM-2.4
  *Information withholding*, FM-2.5 *Ignored other agent's input*. (3-0)
- Routing / decomposition / planning: FM-1.1 *Disobey task spec*, FM-1.2
  *Disobey role spec*, FM-1.3 *Step repetition*, FM-1.5 *Unaware of termination*,
  FM-2.3 *Task derailment*, FM-2.6 *Reasoning-action mismatch*. (3-0)
- Verification seam: FM-3.1 *Premature termination*, FM-3.2 *No/incomplete
  verification* (lets errors "propagate undetected"), FM-3.3 *Incorrect
  verification* — appear frequently even in successful runs. (3-0)
- **Scope caveat:** MAST is multi-agent; inter-agent (FM-2.x) modes transfer to
  single-agent chains only conceptually.

### Laban et al. — LLMs Get Lost In Multi-Turn Conversation (2025) — arxiv 2505.06120
- Top open/closed LLMs perform significantly worse multi-turn than single-turn:
  **avg 39% drop** across six generation tasks (200,000+ simulated sharded
  conversations, 15 models). (3-0, three claims merged)
- Decomposes into "a minor loss in aptitude and a significant increase in
  unreliability."
- Causal mechanism: models "make assumptions in early turns and prematurely
  attempt to generate final solutions, on which they overly rely" — an early
  step corrupting later turns.

### Kandogan et al. — Blueprint Architecture (2024) — arxiv 2406.00584
- Names the routing/decomposition seam: "Task and data planners, respectively,
  break down, map, and optimize tasks and data to available agents." (3-0)
- Names the handoff seam: "stream serving as the key orchestration concept to
  coordinate data and instructions among agents and other components."
- **Source caveat:** workshop/position architecture paper — not peer-reviewed,
  conceptual not evidentiary. Grounds the *naming* of seams, not failure rates;
  pair with MAST for evidence.

### Anthropic — Building Effective Agents (2024) — anthropic.com/research/building-effective-agents
- Recommends programmatic **"gate"** checks on intermediate chain steps "to
  ensure that the process is still on track." (3-0)
- Tool-use as agent-computer-interface (ACI) design: relative-filepath mistakes
  vanished when the tool was changed to require absolute paths. (2-1 — official
  practitioner guidance, not peer-reviewed; "vanish" framing slightly strong)
- Agent error-compounding mitigated by "extensive testing in sandboxed
  environments, along with the appropriate guardrails." (2-1 on the
  "step-isolation" gloss)

### Ribeiro et al. — CheckList (ACL 2020) — aclanthology 2020.acl-main.442
- **Graduated from framing to verified canon (3-0).** Three behavioral fixture
  types modeled on software testing: **MFT** ("inspired by unit tests"), **INV**
  (label-preserving perturbation, output must not change), **DIR** (perturbation,
  label must change in a specified direction), arranged as a capability × test-
  type matrix. Transfer to chain-step seams is sound (analyst extrapolation).

## Killed in the Tier-B pass (did NOT clear verification)

- *Compound systems contain non-differentiable components and therefore cannot
  be optimized end-to-end* — **0-3**, not supported by the BAIR source. (Was a
  candidate rationale for seam-localized testing; do not cite.)
- *Debugging compound LLM agents is hard specifically because of variable
  reflection-step / API-call counts (control-flow)* — **1-2**, not supported by
  the BAIR source.

## Pending / not yet verified — the next research pass

These sources were fetched (or named in the brief) but their claims did **not**
clear verification in this run — partly budget (6 claims dropped), partly the
frontier-thinness of the chain literature. Do not cite as canon until a second
pass verifies them.

### Chain / compound-system (the frontier — RESOLVED in the Tier-B pass)
The Berkeley/τ-bench/MAST sources and all five columns are now verified — see
the Tier-B ledger above and `grounding.md` §5. What stays open is narrower:
- **Sequential per-step *pⁿ* error-propagation math** — grounded only as
  voting-aggregation non-monotonicity + trial-level pass^k decay. No verified
  source measures error propagation step-to-step within a single trajectory.
  Carry the multiplicative-decay framing as internal — not externally grounded.
- **MAST inter-agent mode → reproducible single-chain fixture** — the modes are
  named; no verified source ties one (e.g. FM-2.4 information withholding) to a
  reproducible eval fixture a single-agent play could run directly.

### Eval frameworks & mental models (named as fixture-pattern framing only)
- Hamel Husain, *evals* + *evals FAQ* — hamel.dev/blog/posts/evals,
  /evals-faq (blog; "evals as unit tests" practice)
- arxiv 2504.18827, 2312.06056, 2406.06864 (eval-framework papers; unverified)
- promptfoo red-team docs — promptfoo.dev/docs/red-team (secondary)
- Anthropic, *Challenges in red-teaming AI systems* —
  anthropic.com/news/challenges-in-red-teaming-ai-systems (fetched; unverified)
- **Named in brief, not surfaced:** HELM; metamorphic testing; classic
  software-testing analogies (equivalence partitioning, boundary-value,
  mutation testing).

## Run stats
**Tier-A:** angles 5 · sources fetched 23 · claims extracted 109 · verified 25 ·
confirmed 25 · killed 0 · synthesized findings 8 · budget-dropped claims 6 ·
agent calls 105
**Tier-B (chain/compound-system, 2026-06-15):** angles 5 · sources fetched 18 ·
claims extracted 85 · verified 25 · confirmed 23 · killed 2 · synthesized
findings 11 · url-dupes 10 · budget-dropped 1 · agent calls 100
