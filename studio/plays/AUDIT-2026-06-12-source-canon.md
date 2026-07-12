# Source-Canon Audit — startup fit

*Commissioned by the Director, 2026-06-12. Conducted by four parallel auditors
over all fifteen plays' `research/grounding.md`, `research/extracted-claims.md`,
and `research/research-brief.md`, with briefs skimmed for process leakage.
Rulings at the bottom were made by the Director the same day and are scribed
into README.md, TEMPLATE-brief.md, registry.js, board-state.json, and
PARKING-LOT.md. This file is the provenance anchor — amendments in play
directories cite it as "source-canon audit, 2026-06-12."*

## Why

Raven serves startups. Startups benefit from better process and often skip
hard questions — but they don't suffer fools gladly, and deep, time-consuming
process doesn't fly. The play canon was drawn heavily from sources whose
paying audience is large organizations. The Director asked: where did that
DNA leak in, and is the golden path itself shaped for a Fortune-1000
environment? The target persona for Raven: the employee who knows their
stuff and manages up — not the MBA who overprocesses, underworks, and gets
fired.

## Headline finding

There is almost no literal McKinsey/BCG/HBR-strategy content in the canon.
The real pattern is sharper:

> **Wherever a play's golden-path skeleton was synthesized from a method
> body, certification, or vendor (BABOK, DSDM, SAFe, UK GDS, ISO, CI-tool
> vendors, Strategyzer ceremony, doc-governance blogs), multi-artifact
> ritual followed. Wherever it was synthesized from founder-facing sources
> (Fitzpatrick, Singer/Shape Up, Ries, Cagan, Torres, YC-adjacent,
> tech-company engineering blogs), the play stayed one conversation /
> one page.**

A recurring inversion: startup-native sources were harvested for
*failure-mode warnings* while enterprise sources supplied the *method* —
prioritize-the-backlog cites Cutler/Perri/Torres arguing against its own
DSDM/SAFe machinery. The fix is usually to invert that, since the right
sources are already cited in the same file.

**The Mom Test is load-bearing in exactly 2 of 15 plays** (frame-the-problem,
run-internal-feature-discovery) and absent from the other 13 — including
several where it is the natural authority (evidence bar in
riskiest-assumption-test, willingness-to-pay in size-the-opportunity, the
constraint-vs-opinion gate in capture-technical-constraints, and
elicit-business-context — an interview play with zero Fitzpatrick).

**The research verification discipline is excellent everywhere.** Fabricated
quotes and inflated statistics were caught and demoted, never laundered, in
every play. The quality problem is *whose skeleton got adopted*, not rigor.

## Per-play verdicts

| Play | Dominant feeders | Enterprise leakage | Verdict |
|---|---|---|---|
| frame-the-problem (1) | Fitzpatrick + Torres | none — canon explicitly routed away | **Baseline; banked; untouched** |
| run-internal-feature-discovery (0) | Fitzpatrick + Torres + Wilcox | none; explicit anti-process rules | **Startup-fit as-is — the archetype** |
| write-the-one-pager (2) | Cagan + Amazon + Figma/Asana/Linear/Lenny | review-loop ceremony correctly deferred to §8 | **Fit as-is; watch the §8 Amazon ceremony** |
| scope-an-mvp (3) | Shape Up + Ries + Patton + Cohen | **yes** — DSDM 60% rule, six-question change-control tripwire, ratification machinery, GDS risk scoring in the brief | **Simplify + rebalance; Mom Test at the hypothesis gate** |
| architecture-aware-build-plan (4) | Shape Up + Fowler/Feathers/Cockburn | one mechanism-only quote | **Fit as-is** |
| elicit-business-context (2a) | BABOK Moves 1–3; Shape Up/Torres/Amazon Moves 4–8 | **worst** — org-process-asset review, 7-domain stakeholder map, serial 1:1s that decline group conversations | **Pulled; best moves absorbed into rungs 1–2** |
| feasibility-check (2b) | Cagan + XP spike canon | low; ITONICS "20–40 assumptions" outlier | **Fit; minor trims** |
| survey-the-existing-system (2c) | Feathers + Tornhill + Brown/C4 + Sourcegraph | **yes** — 5-part artifact with per-section owner/last-verified/update-trigger governance; AKF/Quandary due-diligence overlay | **Keep on path; simplify to the startup floor** |
| market-competitor-scan (2d) | CI-vendor industry + Fuld + Pragmatic Institute | **yes** — standing CI *function*, 4-tier monitoring cadence, battlecards for nonexistent sales teams | **Pulled; on-demand repertoire after rebalance (Dunford + Mom-Test-sourced alternatives)** |
| size-the-opportunity (2e) | VC bottoms-up (Pear, Underscore, PitchDoctor) + Cagan | moderate — 11 moves, ODI survey apparatus | **Pulled; on-demand repertoire; already the right canon, trim to ~6 moves on revival** |
| capture-technical-constraints (2f) | Ambler + Modern Analyst + Nygard | contained — AWS/Microsoft/ISO ceremony scoped to §8 | **Fit as-is; rebalance the §8 upgrade path** |
| write-acceptance-criteria (3b) | Torres + Cohn + Wynne + Wake + Adzic | low; sources anti-ceremony | **Fit; traceability map stays flag-only** |
| frame-a-bet (c1) | Shape Up + Ries vs. O'Reilly-HDD/Centercode | Calibration Ledger, "hypothesis required for roadmap" mandate, stats apparatus | **Pulled; spine absorbed by rungs 2–3** |
| prioritize-the-backlog (c2) | DSDM/SAFe own the path; Cutler/Perri/Torres own the warnings | **heaviest** — Business Sponsor BLOCK rules, DACI pre-move, decision-log apparatus, PI-planning references | **Pulled; the most Fortune-1000 play in the library** |
| riskiest-assumption-test (c3) | Strategyzer + GDS apparatus over startup-native thesis | GDS scoring workshop, ≥30-participant sample rule | **Pulled; test-card core absorbed by 2b/rung 3** |

## Meta-audit — the golden path itself

The six-input pattern feeding rung 2 (2a–2f) reproduced the enterprise
document supply chain (the MRD→BRD→PRD→SRS pipeline rung 2's own grounding
cites only to reject). The corporate assumption: a PRD aggregates artifacts
produced by other departments. The startup reality: most of those inputs are
answered in one conversation with the founder. Shape Up — already the
most-cited source in the library — models exactly that: raw idea → one
shaped pitch that absorbs context, appetite, constraints, and rabbit holes →
bet → build.

Roster after the ruling (R3 below): core 1→2→3→4; inputs 2b, 2c, 2f;
stretch 0, 3b. Pulled: 2a, 2d, 2e, c1, c2, c3 — see PARKING-LOT.md for each
play's why-parked and earned-back conditions.

## Rulings (Director, 2026-06-12)

- **R1 — Founder-facing canon first.** Step-0 researchers sample
  founder-facing and practitioner sources as skeleton candidates
  (Fitzpatrick, Singer/Shape Up, Ries, Cagan/SVPG, Torres, YC-adjacent,
  tech-company engineering writing). Method-body, certification, and vendor
  sources (BABOK, DSDM, SAFe, GDS, ISO, PMI, CI/innovation vendors) may be
  quoted for a single verified mechanism, never the golden-path skeleton.
  Agency-blog and content-farm material is excluded from load-bearing
  claims. Scribed into README.md.
- **R2 — The startup floor.** At the grounding→brief seam, every design
  answers: *what is the minimum artifact a five-person team would
  tolerate?* The golden path ships at that floor; the enterprise-maximal
  version of each craft goes to §8 Upgrade notes — that is the growth plan,
  not the default. Scribed into README.md and TEMPLATE-brief.md.
- **R3 — Golden path roster trimmed.** Six plays pulled from the board and
  the golden-path page (2a, 2d, 2e, c1, c2, c3); identity entries retained
  in registry.js as `parked`, with why-parked and earned-back recorded in
  PARKING-LOT.md. Absorptions: 2a's why-now/appetite/top-three-risks
  questions → rungs 1–2 elicitation; c1's hypothesis + kill condition and
  c3's riskiest-assumption question → rung 3's hypothesis gate (and 2b).
- **R4 — Mom Test as the standing evidence bar.** Wherever a play grades
  customer evidence, commitment and specific-past evidence rank above
  stated intent, cited to Fitzpatrick. Rung 1 already encodes this; plays
  that inherit its problem brief inherit the bar.

## What was deliberately NOT changed

- frame-the-problem: banked at Gate 2; untouched.
- run-internal-feature-discovery and architecture-aware-build-plan: passed
  the audit clean; untouched beyond registry description notes.
- No grounding history was rewritten. Reweightings are dated amendment
  sections appended to each affected `research/grounding.md`; original
  sections stand as the record of what was found.
