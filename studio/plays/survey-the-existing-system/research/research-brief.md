# Research brief — Survey the Existing System (rung 2c)

Drafted 2026-06-11 by the orchestrator. Executed same day. This is a
**stretch rung 2c** play: in the Raven demo fiction it is the activity
that produces the saddle-surface system map that rungs 1–2 read from. It
is a compound input of Write the One-Pager / PRD: the one-pager for a
brownfield initiative cannot be written until someone has surveyed what
exists and produced a credible picture of the system, its dependencies,
its load-bearing components, and its risks.

This brief carries the same two mandates established for
`write-the-one-pager` research:

> Research not only the best practices for our output (its form, its
> attributes) but also explores the questions we ask in the elicitation
> we're about to do — filling out our interview manifest with expert
> answers and examples found online.

**A. Ground the output.** What the survey artifact *is* — its forms,
what it must contain, what differentiates a decision-useful survey from a
flat inventory.

**B. Pre-answer the elicitation.** Against the brief template's sections
1–8, stage researched defaults before the Director rules:
- §1 Goal — what a successful survey produces; the done-condition; what
  failure looks like.
- §2 Trigger — when this play fires; what must exist first.
- §3 Required knowledge — what inputs are needed and what to do when one
  is missing.
- §4 Golden path — the expert step-by-step method.
- §5 What could go wrong — documented failure modes and root causes.
- §7 Proof spec — how to judge one; the eyeball rubric.

## Segments run

Two parallel Sonnet research agents:

1. **Method report** — sources on characterization testing (Feathers),
   seam identification, C4 model documentation (Brown), arc42
   (Starke/Hruschka), brownfield discovery practice (Sourcegraph,
   OneUptime, DigitalMara, AndPlus), software archaeology (Wikipedia,
   Cunningham, Tornhill), dependency mapping, and technical due diligence.

2. **Quality / failure report** — sources on documentation decay and
   staleness, tribal knowledge and bus factor risk, hotspot analysis
   (Tornhill / CodeScene), load-bearing code identification, archaeology
   sequencing (Murphy Trueman, Mitch Rosenberg), abstraction-level
   mismatches (C4 misuses), ADR quality (Fowler, Hohpe), and root causes
   of survey failure.

## Claim discipline

Every claim carries its source (URL + attribution); verbatim quotes
preferred; [F] fetched-and-verified / [S] search-snippet-only / [P]
paywalled / [I] inference. Load-bearing [S] claims verified in a same-day
verification pass; verdicts in `extracted-claims.md`. Confirmed material
graduates to `grounding.md`, caveats inline.

## Open Director questions — carried to this play's brief conversation

(Surfaced by the step-0 synthesis, 2026-06-11. None block rung 2; each is a Gate-1-era ruling for THIS play.)

1. Artifact form: System Context + Container map + hotspot register + risk/debt list + discrepancy log — accept, or resize for the demo?
2. Codebase access: hard precondition, or degrade gracefully to an interview-only path when code is inaccessible?
3. Characterization tests (Feathers): open a new inventory slot now, or hold as an upgrade note?
