# Playmaker's Studio Honeydo — Four-Way Split

**Source:** the blind back-of-house scan at `docs/alexandria/plans/rebuilding-the-library/test-scan-03-studio/` (2026-06-20). Recomposed from `STUDIO-EVENTS.md` (Hot Spots), `STAGE-2-BRIEF.md` (director-only questions), and `READ-LIKE-WHAT.md` (agent self-assessment) into the four-way honeydo split (source-gaps / info-gaps / inconsistencies / uncertainties), clustered by Studio's seven contexts plus cross-cutting.

## Index at a glance

| Type | Count | Studio contexts touched |
|---|---|---|
| **Source-gaps** (couldn't reach) | 5 | runtime, workflow, board, inheritance |
| **Info-gaps** (sources exist but don't say) | 9 | brief, workflow, board, production-line, cross-cutting |
| **Inconsistencies** (sources disagree) | 7 | board, workflow, runtime, grading, production-line |
| **Uncertainties** (agent judgment calls) | 12 | brief, workflow, board, runtime, production-line, cross-cutting |
| **TOTAL** | **33** | |

**`[BIG]` items (load-bearing — director cares):** IN1, IN2, IN3. Three real product coupling issues. Best to lead with these unless the architect routes elsewhere.

---

## Type 1 — Source-gaps (couldn't reach)

*Information the scan didn't capture because a source was unreachable, not because nothing exists. Often resolvable by re-running with more access.*

### SG1 — examples/ directory unopened
**Context:** production-line · **Evidence:** STUDIO-EVENTS H9
The studio `examples/` directory is mentioned in README.md "Layout" and referenced by `2f` ("plays/examples/"), but the agent didn't open it. Docs don't describe canonical example shape. *Raven move:* "Want me to read it now, or describe what should be there?" — director answers what they meant by canonical example.

### SG2 — PLAY_MANIFEST generation mechanism
**Context:** runtime · **Evidence:** STAGE-2-BRIEF Q14
`PLAY_MANIFEST` lives in `packages/ax-next/src/domain/plays.ts`. The scan was blinded from `packages/`. Hand-edited at Register, or auto-generated? *Raven move:* low-cost director answer (architect knows).

### SG3 — Studio Board UI live behavior
**Context:** board · **Evidence:** READ-LIKE-WHAT (Studio Board polysemy)
Saw `board-state.json` shape but not the live kanban behavior (drag, confirm, ready dots). *Raven move:* "Can you walk me through what happens when you drag a play between columns?" — opens director's product-talking energy.

### SG4 — Conformance gates location
**Context:** workflow · **Evidence:** STAGE-2-BRIEF Q15
Cited: `placeholderConformance.test.ts`, risk-map drift gate, bank conformance gate, `check-workflow-edges.py`, `check-moves.ts`. Where do these CI gates live in the model? Sit at the seam between studio's `workflow.fabro` and the plugin copy. *Raven move:* batch with SG2 — both about scan-blinded code areas.

### SG5 — Inheritance quarantine current state
**Context:** inheritance · **Evidence:** STAGE-2-BRIEF Q16; STUDIO-EVENTS H10
Are *all* quarantined items dispositioned, or some still genuinely quarantined? Didn't open the dir to verify. *Raven move:* low-stakes — could be batched as "I'll go look" without conversation, or asked of architect.

---

## Type 2 — Info-gaps (sources don't say)

*Information that should be specified but isn't documented anywhere in the source set. Only the director can answer.*

### IG1 — The eight Job categories
**Context:** cross-cutting · **Evidence:** STAGE-2-BRIEF Q1
TEMPLATE-brief.md says "one of the eight job categories" but never lists them. Five seen in registry.js: **Insight · Definition · Delivery · Strategy · Library**. What are the other three? *Raven move:* concrete, easy director answer.

### IG2 — Tier semantics
**Context:** cross-cutting · **Evidence:** STAGE-2-BRIEF Q2
Brief carries `tier:` (coordinator / manager / senior) but docs never explain. Agency level? Calling permissions? Model-size hint? Chain-of-command? *Raven move:* may need definition discussion; can lead to clearer modeling later.

### IG3 — `surface:` field semantics
**Context:** production-line · **Evidence:** STAGE-2-BRIEF Q12
Seen values: `banked`, `registered`, `full sketch`, `grounding only`, `reverse-derived…`. Distinct from `status:` and `stage:` — a third axis for review-surface state? *Raven move:* batch with IG4 — both are registry.js field-meaning questions.

### IG4 — `ws: 1` field meaning
**Context:** production-line · **Evidence:** STAGE-2-BRIEF Q13
Every registry row carries `ws: 1`. Workshop count? Boolean? *Raven move:* batch with IG3 — instant director answer likely.

### IG5 — Provenance Tag formal definition
**Context:** workflow · **Evidence:** STAGE-2-BRIEF Q11
Three classes seen: **Grounded · Orchestrator call · DIRECTOR DECISION (RULED)**. Full set? Enum or convention? *Raven move:* matters for the eventual data model; worth a focused conversation.

### IG6 — "Big edit" definition
**Context:** workflow · **Evidence:** STAGE-2-BRIEF Q4
BIG-EDIT.md: "a change large enough to invalidate renderings, tests, or audit," with the test "would a cold reader of the old story.md be misled?" That test is itself author judgment. Mechanical trigger desired (e.g., "any §4 amendment"), or is judgment intentional? *Raven move:* probably judgment-intentional — confirm.

### IG7 — Studio's positive value-prop
**Context:** production-line · **Evidence:** READ-LIKE-WHAT ("docs are weak on the *why*")
Docs describe *how* Studio works extensively but never *why anyone would want a Studio*. Autopsy provides negative case ("what bad looks like") but no positive case. *Raven move:* **this is the spin-out conversation in miniature.** Hand the architect the mic and let them talk.

### IG8 — Improvements vs Brief §8 boundary
**Context:** brief · **Evidence:** STAGE-2-BRIEF Q6
frame-the-problem has both `improvements.md` AND brief §8. TEMPLATE says §8 is "Upgrade notes"; improvements.md tracks decisions. Intent: §8 = authored-at-design-time growth notes; improvements.md = living backlog after launch? *Raven move:* easy validation question.

### IG9 — Spin-out target
**Context:** cross-cutting · **Evidence:** STAGE-2-BRIEF Q10, Q20
External user? Director role retained as customer persona, or generalized? Alexandria + Fabro + Vision deeply embedded — reshape what's the Projection Rulebook vs configurable target? *Raven move:* **the existential product question.** Park if not ready; pull on if ready.

---

## Type 3 — Inconsistencies (sources disagree)

*Where two source documents — or doc and code — assert conflicting things. The director rules which is the live word.*

### `[BIG]` IN1 — Two parallel ladders
**Context:** board · **Evidence:** STUDIO-EVENTS H1, STAGE-2-BRIEF Q3
- **README ladder (Board column):** `empty → sourced → designed → built → proven → live`
- **registry.js status ladder:** `slot → designed → hardened → derived → proven → registered`
Documented as "deliberately distinct" but `hardened` and `derived` don't map cleanly onto any stage. *Raven move:* lead with this. Walk through where they diverge. Ask: "is the registry ladder slated to retire, or stay perpendicular as 'Board column' vs 'proving rung'?"

### `[BIG]` IN2 — Three "bank" verbs
**Context:** workflow + grading + runtime · **Evidence:** STUDIO-EVENTS H2, STAGE-2-BRIEF Q9
- **`bank.sh`** — studio → plugin file copy
- **Gate 2** — Director's "I confirm this is proven" confirm
- **`raven.vision.banked`** — play's output landing in the library at runtime
Same word, three operations. RUNTIME §6 explicitly calls this out ("This is **not** the package bank"). *Raven move:* present all three side-by-side. Ask: "intentional naming, or do you want new vocabulary?"

### `[BIG]` IN3 — Two human-gate models coexisting
**Context:** runtime · **Evidence:** STUDIO-EVENTS H3, STAGE-2-BRIEF Q8
PROJECTION.md §7 documents the blocking hexagon gate AND warns it deadlocks under detached / Raven-mediated runs. The "correct" pattern is the Raven Vision unit/wake model (RUNTIME §3). Both coexist in the rulebook. *Raven move:* the question is "is the deadlocking shape being retired or kept for `--interactive`?" — recent PR #308 corrected this; what's the current ruling?

### IN4 — "Mechanical" doer is honestly an agent
**Context:** workflow · **Evidence:** STUDIO-EVENTS H4
Doer column (brief.md §4): judgment / mechanical / human. README says "everything is an agent" prototype rule — even mechanical checks run as `tab` prompt nodes. The doer column is "what we wish was here + a peg," not "what kind of node Fabro will run." *Raven move:* confirm the framing. Low-stakes.

### IN5 — Two registries both called "registry"
**Context:** production-line + runtime · **Evidence:** STUDIO-EVENTS H12
`registry.js` (studio identity table) vs `PLAY_MANIFEST` in `packages/ax-next/src/domain/plays.ts` (runtime's). Banking = the act of syncing them. Spin-out forces splitting these. *Raven move:* batch with IG9 (spin-out) — same conversation.

### IN6 — Statistical bar documented, not yet wired
**Context:** grading · **Evidence:** STUDIO-EVENTS H6
TESTING.md (2026-06-15) lays out k=30/100/300 sampling discipline. frame-the-problem actual `risk-map.md` is at N=1 smoke. Bar real, runs owed. *Raven move:* honest acknowledgment. Track as "owed before Proven."

### IN7 — `__AX_` vs `__AX2_` placeholder graveyard
**Context:** production-line · **Evidence:** STUDIO-EVENTS H11
`__AX_` current; `__AX2_` dead. Substitutor "never matches" the dead one — silent unrendered shipping. Multiple docs repeat the rule (the repetition itself = the trap recently bit). *Raven move:* easy ruling — kill the dead spelling everywhere, add a lint? Mechanical follow-up.

---

## Type 4 — Uncertainties (agent judgment calls)

*Places the agent guessed. Director rules whether the guess holds, splits, or rejects.*

### UN1 — Decompose into three passes vs one mega-move?
**Context:** workflow (carving) · **Evidence:** READ-LIKE-WHAT (production-line carving)
The agent split the scan into 3 passes (ES → DDD → C4) for observability. Could be one mega-move. *Raven move:* validate or override.

### UN2 — "Production-line" context too big?
**Context:** production-line · **Evidence:** READ-LIKE-WHAT
11 cards. Holds Studio-itself, the loop, big-edit, handoff, closeout, surfaces. Might split into "process" + "session management" + "surfaces." *Raven move:* worth a focused look — possible re-carve.

### UN3 — Agent cards: runtime or off-line?
**Context:** runtime + production-line · **Evidence:** READ-LIKE-WHAT
Filed 5 agents under `runtime/agents/`. But Hardener and Author and Checker run *off-line* (writing time); Doer and Grader run at execution time. Hardener probably doesn't belong in runtime. *Raven move:* propose moving Hardener / Author / Checker out — director rules.

### UN4 — Tools as their own context?
**Context:** production-line · **Evidence:** READ-LIKE-WHAT
`derive-views.sh`, `bank.sh`, `check-workflow-edges.py`, `check-moves.ts`, `generate-story.py` — filed as components per operation. Toolchain context? Agent's intuition: no, they belong with their operations. *Raven move:* confirm or override.

### UN5 — Director: Aggregate or Value?
**Context:** cross-cutting · **Evidence:** READ-LIKE-WHAT
Filed as Value (a role, no lifecycle). But Director's *rulings* are aggregates — does that promote Director? *Raven move:* connects to the recent design-plan thread (User as Product-plane noun). Worth a focused conversation.

### UN6 — "Capability" the right name for verbs?
**Context:** cross-cutting · **Evidence:** READ-LIKE-WHAT
Used Capability for verbs (Gate 1, Gate 2, Derive, Bank, Register, Three-Strikes-Then-Freeze). "Service" or "Operation" more conventional? *Raven move:* taxonomy question — Brick 0 F1 connects here.

### UN7 — Brief and Workflow: one context or two?
**Context:** brief + workflow · **Evidence:** READ-LIKE-WHAT
Kept separate because language changes at Gate 1. Strict DDD might want one context with two phases. *Raven move:* a real choice — explain trade-off, let director rule.

### UN8 — Studio Board polysemy split — right shape?
**Context:** board · **Evidence:** READ-LIKE-WHAT
Carved as Surface + Read Model, cross-referenced. Could be a single richer noun. *Raven move:* the framework-precedent (DDD polysemy split) is the rationale; check that the director sees it the same way.

### UN9 — Reverse-derived plays — own context or footnote?
**Context:** production-line · **Evidence:** READ-LIKE-WHAT
3 atomic-card plays "are NOT Raven plays" and don't run the ladder. Filed under production-line as a parallel class. Could be its own bounded context. *Raven move:* batch with IG9 — spin-out implications.

### UN10 — Three-context overlap on workflow package
**Context:** brief + workflow + runtime · **Evidence:** READ-LIKE-WHAT
Brief writes its source, workflow IS it, runtime executes it. Three different vocabularies on the same artifact. Context bleed or DDD tightly-coupled-contexts case? Agent thinks the latter. *Raven move:* validate the framing.

### UN11 — Should there be a Plan aggregate?
**Context:** workflow · **Evidence:** READ-LIKE-WHAT
atomic-card-planning emits a "build plan" — a real aggregate in that play's domain. Studio doesn't have a Plan aggregate per se (each play has a brief). *Raven move:* would the architect expect a Plan card? — low stakes.

### UN12 — No User / external user aggregate
**Context:** cross-cutting · **Evidence:** READ-LIKE-WHAT
Docs imagine Director + orchestrator + hypothetical end-user-of-a-banked-play, but never as modeled identities. If Studio spins out, User is *very* unanswered. *Raven move:* connects directly to the design-plan User-modeling thread. Worth pulling on.

---

## Notes for Raven's mediation

- **The 3 `[BIG]` items (IN1/IN2/IN3) are the engagement opener.** Architect cares because they're real product coupling. Lead unless the architect routes elsewhere.
- **IG7 (Studio's value-prop) and IG9 (spin-out target) are the existential conversations** — high engagement potential, but only if architect is ready. Park if not.
- **The Tier B/C items (UN5/UN6/UN7/UN8) connect to Brick 0 F1 (the type enum ruling)** — if architect rules F1 first, several of these dissolve.
- **Many of the IG and SG items are batch-resolvable** — 30 seconds each. Save for end of session as "quick rapid-fire" if time permits.
- **The atomic-card / reverse-derived line** (UN9 + part of IG9 + part of IN5) is a recurring thread — all connect to the same Studio-vs-plugin separation. Could be one focused conversation rather than three.
- **No more than ~5 items per turn.** Per the skill: triage, sequence, pace.
