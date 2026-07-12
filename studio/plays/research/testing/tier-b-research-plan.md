# Tier-B research plan — chain / compound-system risk grounding

A handoff brief for a research agent. **Goal:** ground (or honestly fail to
ground) the chain/compound-system risk columns that `grounding.md` §5 marks as
the frontier, and graduate whatever clears verification into the testing-center
canon.

## Why this exists

The Tier-A pass (single-call: input/reasoning/output/adversarial) is done and
strongly grounded. Tier-B is the **frontier**: highly-orchestrated multi-prompt
"factories" are very new, so the public literature on their failure modes is
thin. Per the coverage-priority rule, Tier-A is covered first; Tier-B columns
are carried as **internal hypotheses** until grounded. This pass tries to move
them from internal hypothesis → externally grounded.

## The bar (read before searching)

- **A verified "the literature is thin here" is a valid, valuable result.** Do
  not manufacture or inflate citations to fill the frontier. We would rather
  know a column is ungrounded and carry it as our own canon than cite weakly.
- **Primary sources first** (papers, official framework docs, named
  practitioners). Mark blog/marketing tier explicitly.
- **Adversarial verification** (≥3 independent votes per claim, majority-refute
  kills) — same standard as the Tier-A run.
- **Integration:** confirmed claims append to `grounding.md` under **Phase 5 —
  Chain / compound-system risks** (each: name · definition · failure it names ·
  how to test · grounding quote + URL · caveat). Unverified-but-fetched goes to
  `extracted-claims.md` "pending." Anything that stays ungrounded after a real
  search is **kept** as a Tier-B internal-hypothesis column, labeled "internal —
  not externally grounded."
- For each grounded risk, supply a **fixture/eval pattern** (how a play would
  test for it), consistent with our "fixtures bought by failure class" rule and
  our factored-ceiling idea (localize the break to a step/seam — cf.
  Needle/Knot/Storm).

## The columns to ground (the open set, from grounding.md §5)

1. Per-step error compounding / reliability-compounding math
2. Inter-step interference (a step corrupting a later step's context)
3. Routing / decomposition / planning errors (wrong branch, bad split)
4. Tool-use errors (malformed calls, wrong tool, hallucinated args, ignored
   output)
5. Context / state-handoff loss across steps

## Research angles (5)

### Angle 1 — Reliability compounding & error cascades
- **Grounds columns:** 1, partially 2.
- **Sub-questions:** Is there theoretical/empirical grounding for multiplicative
  reliability decay across steps (per-step accuracy p → pⁿ over n steps)? When
  does adding LLM calls help vs hurt? What mitigations are evidenced
  (verification/checking steps, gating, self-consistency, voting)?
- **Seeds:** Berkeley BAIR "The Shift from Models to Compound AI Systems"
  (2024); "Are More LLM Calls All You Need?" (compound-system scaling);
  Anthropic "Building Effective Agents" (2024, workflow patterns + when-to-use);
  self-consistency (Wang et al. 2022).

### Angle 2 — Multi-agent / pipeline failure taxonomies
- **Grounds columns:** 2, 3, 5 (the cross-cutting taxonomy).
- **Sub-questions:** What named, observed failure categories exist for
  multi-step / multi-agent systems? Is there a published taxonomy we can adopt
  as columns?
- **Seeds:** **MAST — "Why Do Multi-Agent LLM Systems Fail?"** (Cemri et al.,
  2025, Berkeley; likely arXiv 2503.13657 — fetched but unverified in Tier-A);
  LangChain/LangSmith agent-failure writeups; "Lost in Conversation"
  multi-turn-degradation work (2025).

### Angle 3 — Tool-use & agent benchmarks (failure modes in practice)
- **Grounds columns:** 4, partially 3.
- **Sub-questions:** What tool-use failure modes do agent benchmarks actually
  measure (malformed/invalid calls, wrong tool selection, hallucinated
  arguments, not reading tool output, loops, premature stop)? What pass rates,
  and what breaks?
- **Seeds:** **τ-bench** (Sierra, arXiv 2406.12045 — fetched, unverified);
  AgentBench (Liu et al. 2023); GAIA (Mialon et al.); WebArena; ToolBench /
  API-Bank; ReAct (Yao et al.) and Reflexion as failure-and-mitigation context.

### Angle 4 — Routing, decomposition & planning
- **Grounds column:** 3.
- **Sub-questions:** Evidence on planner/decomposition error rates; when does a
  model pick the wrong branch or split a task badly? Router-eval methods?
- **Seeds:** Plan-and-Solve; least-to-most prompting; LLM-as-router eval; DSPy
  (Khattab et al.) for pipeline optimization/eval framing.

### Angle 5 — How to evaluate a chain (component vs end-to-end)
- **Grounds:** the *method* for all Tier-B columns (how to test, not a risk).
- **Sub-questions:** How do practitioners eval pipelines vs single calls —
  trace/span/step-level grading, component vs end-to-end, localizing a failure
  to a step/seam (our factored-ceiling idea)? Is "factored/component eval" a
  named practice?
- **Seeds:** LangSmith / Arize Phoenix / Braintrust agent-eval docs; OpenAI
  "evals for agents"; DSPy; Anthropic agent guidance.

## Optional rider — Tier-A framing sources still unverified

Cheap to sweep alongside; `grounding.md` currently leans on these as
fixture-pattern *framing* without their own verified citations. Verify if
budget allows: **CheckList** (Ribeiro et al., ACL 2020 — MFT / Invariance /
Directional-Expectation tests); **metamorphic testing**; classic
software-testing analogies (equivalence partitioning, boundary-value, mutation
testing); **HELM**; the **"evals as unit tests"** practitioners (Hamel Husain,
promptfoo, OpenAI Evals).

## Output shape

Same two artifacts as Tier-A, appended (do not overwrite):
- `grounding.md` → Phase 5 entries for whatever clears verification.
- `extracted-claims.md` → verified-claim ledger + updated pending list.
- A short note on which of the 5 columns remain **internal-hypothesis** after
  the pass (the still-open frontier).

## Paste-ready commission (deep-research harness)

> Ground the chain/compound-system failure modes for testing multi-step LLM
> prompt-chains / agentic workflows: (1) per-step error compounding, (2)
> inter-step interference, (3) routing/decomposition/planning errors, (4)
> tool-use errors, (5) context/state-handoff loss. For each: plain-language
> name, definition, the failure it names, how to test it (fixture/eval pattern
> that localizes the break to a step/seam), primary-source grounding with URL.
> Chase: Berkeley compound AI systems; MAST "Why Do Multi-Agent LLM Systems
> Fail?" (arXiv 2503.13657); τ-bench (2406.12045); AgentBench; GAIA; ReAct;
> Reflexion; DSPy; self-consistency; Anthropic "Building Effective Agents";
> LangSmith/Arize/Braintrust agent-eval guidance. Prefer primary sources; flag
> blog/marketing tier; a verified "literature is thin / no strong grounding" is
> an acceptable, valuable result — do NOT manufacture citations. Also sweep the
> Tier-A framing sources still unverified: CheckList (Ribeiro et al. ACL 2020),
> metamorphic testing, equivalence partitioning / boundary-value / mutation
> testing, HELM, the evals-as-unit-tests practitioners (Hamel Husain, promptfoo,
> OpenAI Evals). Output as grounding (cited canon) + extracted-claims (salvage).
