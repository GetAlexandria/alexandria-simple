# Known false positives — Frame the Problem

Patterns a fresh-eyes checker or grader reliably flags that are dispositioned
by design. **Consume this BEFORE reporting** (TESTING.md *Running and grading*;
AUTHORING-EVALS.md step e). Entries name exact patterns with provenance — the
ledger never excuses a novel instance. When in doubt, flag it and cite the
nearest entry so the disposition can be checked rather than assumed.

*(Ported 2026-06-16 from the baseline `../frame-the-problem-baseline/known-fps.md`
and re-tuned 2026-06-18 to the Riff play. The cold-read is no longer an in-run
node — it is a grading-time faithfulness check (TESTING.md), so entry 1 is
re-expressed against `pre_fill`'s framing. Two baseline entries were retired as
obsolete under the Riff contract: the `surface-map` slug-vs-prose convention (no
`surface_map` input exists) and the 75-word ceiling / `word_check` enforcer (the
spoken paragraph and its word budget were dropped — one deliverable, no second
rendering). Per-fixture entries are appended below as new fixtures land — see
"Per-fixture dispositions".)*

| # | Pattern a fresh checker/grader flags | Why it is not a defect | Provenance |
|---|---|---|---|
| 1 | `pre_fill`'s framing restates a fact in language close to an earlier-seen phrasing (the cold-read faithfulness check) | Accepted residual: the doer judges from the handed-in material, but Fabro's stage preamble summarizes context even at compact fidelity, so perfect coldness is approximated. Flag ONLY if the framing imports a fact the material itself does not support | grading-time cold-read check (TESTING.md); brief §4 `pre_fill` |
| 2 | Sizing words ("quick," "small," "tiny") inside evidence quotes | The ban binds Raven's own words only; the room's sizing words are legal inside verbatim quotes — and only there | baseline brief §10.5 |
| 3 | A vivid near-miss graded `specific-past` instead of `commitment` | Correct — nothing was paid; a near-miss stays `specific-past` however vivid. (The inverse — a near-miss graded `commitment` — IS a defect; see carve-outs) | baseline brief §10 round-2 counter-cue; prompt gallery |
| 4 | "Hunch: none earned," an empty framing, or an Unclear section read as missing content | All designed, valid outcomes — "none earned" is frequent and correct; the empty framing is a complete run | brief §1; brief §10 |
| 5 | Gallery speaker names and fleet-maintenance content (in the play's prompts) read as fixture contamination | The "Done right vs wrong" gallery is deliberately re-skinned into a neutral non-fixture domain (fleet-maintenance). Fixture-domain names appearing in the gallery ARE defects | baseline brief §8 gallery rules |
| 6 | The sizing-lexicon scan list (9 words) flagged as non-exhaustive | Known and accepted — validated by confirmation runs, backstopped by the grader's checklist | baseline Lint 4, C note |

**Standing carve-outs — never excluded by this ledger:** silent drops of any
kind; invented content; a sizing or sequencing word in Raven's own text; and
the two open residuals carried on the grader's checklist (the hunch claiming a
disputed cause — OUT-4; commitment-inflation on vivid-pain quotes — RE-5 /
OUT-3) — those are **always reported, every run**.

## Per-fixture dispositions

As each new measured fixture lands, any reliably-flagged-but-legitimate pattern
specific to it is recorded here with the fixture name and verbatim cue, so blind
graders dispose of it consistently. (Empty until the first new fixture is graded;
the authoring agents propose candidate entries, ratified at review.)

| fixture | pattern flagged | disposition | provenance |
|---|---|---|---|
| _(none yet)_ | | | |
