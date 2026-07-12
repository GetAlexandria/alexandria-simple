# Graded read-out — the carve's golden-path campaign (runs 1–2)

Graders: two fresh-eyes agents, blind to each other, 2026-06-12 — one
grading run 2's released artifacts against the frozen §7 proof spec
(+§9/§10 amendments, known-fps.md consumed), one comparing run 2
against the banked monolith baseline on the same fixture. Quotes
verified mechanically (whitespace-normalized `grep -F`, 13/13 found);
words counted by `wc -w`.

**Factory provenance:** runs 1–2 executed on the builder Docker/Codex
factory *before* the 2026-06-12 operator ruling (plays run on the
embedded factory, claude-acp). Their grades stand as evidence about the
*workflow's design*; model-dependent results re-prove on the embedded
factory (the registration smoke is the first such run).

## Verdicts

| Run | Verdict | Notes |
|---|---|---|
| 1 — golden path | **ABORTED** (the line-wrap crack) | wiring all proved; see `run-1/RECORD.md` — false quote-drift loop, fix landed in §4 ground semantics |
| 2 — golden path | **FAIL on §7.3 alone; 11/12 checks PASS** | the strictest possible read; detail below |

## Run 2 against the proof spec

PASS: §7.1 (two problems, Dev-vs-Maya dispute open with the test
posited), §7.2 (13/13 quotes verbatim under normalized semantics;
who/circumstance everywhere; header truthful), §7.4 (no
extension-in-disguise), §7.5 (spoken: **64 words** — opens on the
boundary, one question, no overclaim), §7.6 (zero sizing words in
Raven's own text; Jules's "tiny version" bait untaken), §10.1–.5 (incl.
both standing carve-outs attested: no commitment-inflation observed,
no hunch-on-disputed-cause observed), §9.2 (cold reader: restatement
verified correct line-by-line; "comprehensible").

FAIL — **§7.3**: the bet quote ("Anyway, every director has this
problem, literally all of them, I'd bet anything") is present, in its
strongest verbatim form, explicitly NOT laundered (P2's what-it's-not
refuses the scope claim) — but filed in Unclear as "evidence-free scope
claim" without the `[opinion (conviction high)]` grade §7.3 literally
demands. The grader surfaced a real spec tension for the Director: §5's
failure row ("captured *as* an evidence-free claim — a finding, never
laundered into fact") is satisfied verbatim; §7.3 demands more. Note
the seam: the frame node DID grade it `opinion (high conviction)` —
the grade was lost at the render compression, a seam-polish bug with a
clear owner.

## Run 2 against the frozen baseline (banked run 5b, same fixture)

Per-dimension: parity on problems found and distinctness; **workflow
better** on conviction-claim durability (banked 5b *silently dropped*
the bet quote; the workflow's extract pinned it and it survived),
clause-grading (5b collapsed grades into one tag), dispute impartiality
(the most impartial run on record — even 5b's picture quietly sided
with Dev), the spoken paragraph (64 words under a ceiling **no
monolith run ever met** — the budget never converged in six attempts,
76–82, one false self-count), and checking machinery (in-run
self_check + cold reader, nothing self-reported). **Baseline better**
on entry field richness (circumstance texture, the labeled insight),
evidence hygiene (run 2 admitted solution-talk and dispute-talk into
P2's evidence), dispute-test simplicity, and prose surface (run 2's
title is garbled; one dense picture sentence).

**The comparison grader's summary, verbatim:** "If the question is
granularity, the evidence here says 9 nodes is not too many — the
losses are seam-polish bugs with obvious owners, while the gains
(honest counting, no silent drops, fresh-eyes gates) are exactly the
things a monolith was structurally unable to provide."

## Campaign honesty

This was the golden path only. Still owed before the §7 campaign is
complete: the refusal demo (snippet-02), the empty-map demo
(snippet-03), the re-run demo (regenerate the prior-brief fixture
first — frozen §8 debt), and the advanced fixture. All run via
`ax2 run frame-the-problem --input ...` on the embedded factory now.

## Cracks and seam findings (the curriculum)

1. The line-wrap crack (run 1) — fixed in §4 ground semantics.
2. The render seam sands off upstream detail: the frame node's
   conviction grade and relate's two-candidate-edge record did not
   survive into the released artifact. Owner: render's prompt
   (carry-the-annotated-brief discipline), not the graph shape.
3. P2 evidence hygiene: solution-talk/dispute-talk admitted as
   evidence. Owner: frame's prompt (evidence vs relationships seam).
4. Cold-reader preamble leakage: not observed to distort (restatement
   was correct), residual stays watched.
5. ground@3 hit a sandbox write refusal and recovered via escalated
   write — watch on the embedded factory.
