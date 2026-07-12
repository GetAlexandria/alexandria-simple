# Research brief — Architecture-Aware Build Plan (step 0)

Drafted 2026-06-11 by the orchestrator. Frame below is orchestrator-stated
under the Director's standing instruction of the same day ("keep laying
down ground — run this process on the other two must-have rungs");
**Director ratification of the frame is owed at review** before the brief
conversation proceeds. Two mandates per the rung-2 pattern (ground the
output; pre-answer the elicitation) plus the Director-added third:
**surface compound plays in disguise.**

**The frame (to ratify):** rung 4 consumes the scope cut (rung 3) plus the
codebase reality (surface map / Survey the Existing System) and sequences
the work into dependency-honest, demoable milestones, riskiest parts
first — the hand-off Fabro executes. Success looks like: an engineer
agrees the order is buildable; every milestone ends demoable; load-bearing
code is touched knowingly, never discovered mid-build. A failed run looks
like: a greenfield plan laid on brownfield code, big-bang integration at
the end, horizontal layers that demo nothing, or dependencies surfacing as
surprises.

## Segments (Sonnet researchers)

1. **Form & method canon** — what build/implementation plans are in expert
   practice: technical plan docs, RFC implementation sections, milestone
   plans, Shape Up scopes ("map the project into scopes"), epic/story
   breakdowns; how the build plan relates to (and differs from) the
   technical spec; what the emitted artifact looks like.
2. **The golden path** — sequencing principles: walking skeleton first,
   vertical slices, risk-first ordering, dependency ordering,
   end-to-end-first integration; planning against a REAL codebase
   (reconnaissance, load-bearing code, migration ordering); who owns what
   (eng lead vs PM); required inputs and missing-input conventions.
3. **Failure modes & root causes** — big-bang integration, horizontal
   layering ("all models, then all views"), the 90-percent-done syndrome,
   plans that ignore codebase reality, dependency surprises, no demoable
   milestones, plan-as-contract rigidity.
4. **Judging quality + worked examples** — rubrics a non-developer can
   eyeball on a build plan (each milestone demoable, risks front-loaded,
   sequence respects dependencies, traces to the scope cut); published
   examples (Shape Up scope maps and hill charts, public RFC
   implementation plans); weak-vs-strong contrasts.

All segments: rung-2 claim discipline (CLAIM / QUOTE verbatim / SOURCE /
CONFIDENCE; primaries fetched; unverified flagged) and the
compound-candidates mandate. Verification pass before synthesis. Raw
claims → `extracted-claims.md`; cited canon + pre-answered elicitation
manifest → `grounding.md`.
