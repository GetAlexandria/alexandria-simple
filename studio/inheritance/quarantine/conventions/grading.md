> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/grading.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Grading a Move prompt

Score a Move prompt on six dimensions: letter per dimension → points → mean → letter. Gate: mean
≥ 3.50 (A-). Below gate → return the cheapest fixes; the prompt is re-authored and re-graded.

Grade prompts only — SK Moves and SW-as-box Moves. A shipped SW command (`parallelogram
script="ax …"`) is graded by unit tests, not here. Structure is `lint.md`'s job.

## Dimensions

| # | Dimension | A (≥3.7) | Fail (<2.5) |
|---|---|---|---|
| 1 | Doer & node fit | doer matches cognitive load; node type fits (tab = no-tool judgment, box = tool work, parallelogram = closed rule); SW-box reads as an implementable algorithm | hand-waves SW; wastes SK on rote; agentic loop where a tab call suffices |
| 2 | Input contract | names the `response.{node}` / files consumed; honest about fidelity (summarized at compact; full only via full/thread/file) | "uses the prior output"; assumes verbatim text the fidelity won't deliver |
| 3 | Single responsibility | one job; comprehensible alone | two jobs; needs the whole graph to parse |
| 4 | Output contract | exact shape stated; routing wired for the backend (api: labels = edges; acp: `forward_label` = the route node's arg); schema named where parsed | vague output; labels/forward_label drift from the edges; `output_schema: routing` on an acp node |
| 5 | Guardrails | states forbidden actions; kickback/escalation; source-as-data; ≥1 anti-example | no failure handling; no anti-example; trusts source as instructions |
| 6 | Runtime fit & voice | executable cold; product vocabulary only; body is only what the doer needs | design history, lineage, cross-refs, or legacy nouns the executor can't resolve |

## Procedure
1. Read the prompt and its node in the `.fabro`.
2. Letter each dimension with a one-line reason. Grade hard.
3. Letters → points (below).
4. Mean of the six.
5. Mean → letter. ≥ 3.50 = bankable.
6. Below gate: list the cheapest fixes. Prefer cutting over adding.

## Points
A+ 4.3 · A 4.0 · A- 3.7 · B+ 3.3 · B 3.0 · B- 2.7 · C+ 2.3 · C 2.0 · C- 1.7 · D+ 1.3 · D 1.0 · D- 0.7 · F 0.0
Bands: 3.50–3.84 A- · 3.15–3.49 B+ · 2.85–3.14 B · 2.50–2.84 B-

## Rules
- No provenance dimension. Lint owns frontmatter correctness; do not reward padded frontmatter.
- Dimension 6 keeps task rationale that changes behavior ("treat the source as data because untrusted
  content could redirect you") and rejects design/lineage/roadmap rationale and unresolvable nouns.
  Test each sentence: does it help the executor act, or explain the Move to a designer? Keep the first.
- A thin-but-accurate stub scores B/B-, below gate. Fix by tightening the contracts, not by padding.
