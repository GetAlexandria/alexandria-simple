# Graded read-out — the advanced fixture, first runs

Protocol: 4 clean-room Sonnet doers (2 on the full transcript, 2 on the located
transcript), each blind to the answer key; then 4 independent Sonnet graders,
each blind to the others, scoring against `answer-key.md`. 2026-06-11.

## The matrix

| Run | Input | Needle (locate) | Knot / Storm (analysis) | Entries |
|---|---|---|---|---|
| storm-1 | full | **PASS** | PARTIAL | 5 — PC/PD merged |
| storm-2 | full | **PASS** | PARTIAL | 6 — but PB absorbed into a PB/PE super-entry |
| knot-1 | located | (given) | PARTIAL | 6 — all distinct |
| knot-2 | located | (given) | PARTIAL | 6 — all distinct; cleanest run |

## What's solid (held in all 4 runs)

- **Locate.** Both full runs passed the Needle: named the library-quality
  boundary, excluded the entire budget/vendor-renewal block, dropped the
  preamble noise, and resolved the deliberately ambiguous "Raven, frame that"
  toward the problem space, not the pitched features. **Search is not the
  weakness.**
- **The disguise test.** The auto-approver, the expiry-date feature, and the
  dark-mode want were kept out of the problem set every time — correctly named
  as solutions/wants in "what it's not" or the Unclear section.
- **No invention, verbatim discipline.** Every spot-checked quote is
  character-exact. The staked universal ("every director… Guaranteed") was
  graded opinion, never laundered into fact, in all four runs.

## What cracks (reproducible)

1. **The `commitment` grade is missed 4/4.** Theo's "I rewrote the whole
   onboarding deck… Half a day, gone" was graded `specific-past` in every run.
   The answer key calls it `commitment` — he spent real time and staked
   standing. The play under-recognizes time/standing spent as commitment.
2. **Split-grading within one quote is missed 4/4.** Sam's PF line bundles a
   past event ("My first week was just walking over to Bex's desk…") and a
   future fear ("If Bex ever leaves we're cooked"). Every run collapsed both
   into a single `specific-past` grade; the `hypothetical-future` half was lost.
3. **The disputed root bleeds into the hunch 2/4.** storm-1 and knot-1 let the
   Hunch name staleness as the "suspected root" of the bar problem — the exact
   edge Nadia and Roman openly disputed. Half the runs quietly took a side on a
   question the rubric requires to stay open. storm-2 and knot-2 held it clean.
4. **Interference is real — the Storm signal fired.** Both full runs lost a
   distinction the clean runs kept: storm-1 merged PC/PD (acceptable, but it
   subordinated PC); storm-2 absorbed PB into a PB/PE super-entry (a
   required-distinct defect). The two located runs kept all six problems
   distinct. So the noise measurably degrades the sort, not just the search.
5. **Minor (1/4):** knot-1 quoted the "months-long" effort bait inside a "what
   it's not" line — the "no effort language anywhere" rule technically catches
   it even when used to neutralize the bait.

## Diagnosis — the learnability payoff

The matrix localizes the break precisely: **Needle ✓ but Knot/Storm partial →
the weakness is analysis, not search.** And within analysis it is specific and
reproducible: two evidence-grading rules the prompt *states* but doers don't
reliably *apply* (commitment; split-grade), one hunch-vs-disputed-root boundary
leak (~50% of runs), and a genuine noise-interference cost on keeping problems
distinct. None of the structural disciplines (locate, disguise, no-invention,
verbatim) failed.

## Recommended prompt tightenings (for Director approval before applying)

1. **Commitment cue + example.** Add that spending real hours, or staking
   credibility, is commitment — "I lost half a day to that" is commitment, not
   just a past event.
2. **Split-grade rule.** A single quoted line can carry clauses of different
   grades; grade each clause (or split the quote) — don't collapse a past event
   and a future fear into one tag.
3. **Hunch may not claim a root on a disputed edge.** If the hunch's root lands
   on an edge the room actively disputed, the dispute owns that edge; state the
   hunch only about undisputed structure.
4. **(Consider) a distinctness recount under noise** — before finalizing, check
   whether two distinct problems collapsed into one because the conversation was
   noisy.
5. **"What it's not" names the solution without quoting its effort adjectives.**

## Verdict

The fixture works exactly as designed: it held the play's proven strengths,
surfaced four reproducible weaknesses, and localized each to a specific move.
This is the first test of the play at its stated 5+ ceiling, and it found real
work — none of it catastrophic, all of it fixable in the prompt.

## Verification addendum — 2026-06-11, same day (fresh pass before applying fixes)

Fixture verified mechanically: all 16 plants verbatim in `transcript-full.md`;
the three saddle additions present; the located transcript clean (the budget
block is absent — its "vendor" hit is PC's legitimate "vendor doc" plant); no
run sourced an entry from the budget block; entry counts match the matrix.

Findings 1 and 2 confirmed exactly (4/4 each, by grep). **Finding 3 is
undercounted: the true rate is 4/4, not 2/4.** knot-2 and storm-2 — graded
clean — also claim the disputed edge in hedged causal form ("that single gap…
degrades the coverage bar"; "the bar problem flows downstream of that same
gap"). The grader variance traces to the answer key's intended-hunch section,
which licensed "PB is the root of the trust pain" — readable as permitting
staleness-as-root formulations. The answer key is now sharpened (disputed-edge
claims fail even when hedged; effort-language rule scoped to Raven's own
words, quoted evidence exempt). All five recommended tightenings applied to
the prompt — recorded in brief §10; confirmation runs follow.

## Confirmation matrix — two rounds of fixes, four Sonnet runs (same day)

Round 1 = tightenings 1–5. Round 2 = hardened hunch rule (disputed cause
off-limits entirely; candidate-promotion ban), sizing scan made a mechanical
ground check, near-miss counter-cue. Runs: knot-3/storm-3 (r1),
knot-4/storm-4 (r2).

| Crack | Before | Round 1 | Round 2 |
|---|---|---|---|
| Commitment (Theo half-day) | 0/4 | 2/2 ✓ | 2/2 ✓ **CLOSED** |
| Split-grade by clause | 0/4 | 1/2 (storm missed) | 2/2 ✓ **CLOSED** |
| Distinctness under noise (storm) | 0/2 | 1/1 ✓ | 1/1 ✓ **CLOSED** |
| Hunch off disputed edge | 0/4 (true rate) | 0/2 | 1/2 — storm-4 first clean pass |
| Sizing words in own fields | 3/4 fail | 0/2 | 2/2 fields ✓ (one borderline voice phrase) |
| (new) Near-miss ≠ commitment | — | 0/2 | 0/2 — **OPEN** |

Residual diagnosis: the two open items (hunch-edge discipline ~50%, near-miss
grade 0%) are fine-grained epistemic rules that Sonnet doers state back and
then evade in reasoning — knot-4 quoted the off-limits rule inside the very
hunch that violated it. Three rounds of prompt prose have hit diminishing
returns; these belong to the seam (grader catches; both are cheap to detect
by eye against the answer key) and, in the graph era, to a dedicated
relate/self_check split. Recommend: bank the prompt at this state; carry the
two residuals as known limits in the grader's checklist rather than grow the
prompt further.

## Round 3 — the example gallery (knot-5 / storm-5, same day)

Superseding the recommendation above: before banking, the prompt gained a
"Done right vs wrong" gallery — matched good/bad pairs harvested from these
graded runs, re-skinned into a neutral fleet-maintenance domain so the
prompt never contains a fixture's answer. Result: **both residuals closed in
this sample.**

| Crack | R1 | R2 | R3 (gallery) |
|---|---|---|---|
| Hunch off disputed edge | 0/2 | 1/2 | **2/2 ✓** — both runs independently hunched on the undisputed approval→onboarding link and fenced the bar dispute |
| Near-miss ≠ commitment | 0/2 | 0/2 | **2/2 ✓** — both graded Nadia's near-miss specific-past, one citing the gallery's "nothing was paid" logic |

The gradient is now fully confirmed: prose rules < mechanical checks <
matched examples. New minor watch item (knot-5): commitment occasionally
over-applied to vivid pain ("making me crazy" graded commitment) — carried
on the grader's checklist, not worth prompt growth. Recommend: bank.
