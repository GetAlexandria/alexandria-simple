# Stage-2 brief — what the docs couldn't answer

*(Blind scan, 2026-06-20. These are the questions a docs-only reader cannot
resolve from `studio/plays/` — they require either a Director ruling, a
walk-through with the architect, or access to source code that the blind
scan deliberately skipped. Ordered by how badly each blocks the data model.)*

## Tier A — naming and taxonomy that the docs presume but never define

### Q1. What are the eight Job categories?
TEMPLATE-brief.md says "one of the eight job categories" — but never lists
them. The five seen in `registry.js` rows are **Insight · Definition ·
Delivery · Strategy · Library**. What are the other three? Is "Library" a
category at all or just the catch-all for atomic-card plays?

### Q2. What does Tier (coordinator / manager / senior) mean?
Brief template carries `tier:` but never explains semantics. Is it about
how much agency the play has, who can call it, what model size it deserves,
its place in the chain-of-command? Reverse-derived plays just use `—`.

### Q3. Stage vs Status — should they reconcile?
[[Value - Stage]] (board column, 6-step) and [[Value - Status]] (registry
ladder, 6-rung) are documented as "deliberately distinct" but the rungs
overlap inconsistently — `hardened` and `derived` from the status ladder
don't map cleanly to a single stage. Are these two ladders actually
intended as parallel forever? Or is one of them slated to retire?

## Tier B — process boundaries that docs leave ambiguous

### Q4. When *exactly* is a "big edit"?
BIG-EDIT.md says "a change large enough to invalidate a play's renderings,
tests, or audit," with the test "would a cold reader of the old story.md
be misled?" That test is itself author judgment. Is there a more
mechanical trigger we want (e.g., "any §4 amendment")? Or is judgment-by-
authoring intentional?

### Q5. What is a Tier — when does a play *need* a moves overlay?
[[Component - Moves Overlay]] is optional. Both frame-the-problem and the
atomic-card family have one. Is there a class of play that intentionally
doesn't? When is "the terse derived form" enough?

### Q6. Improvements vs Brief §8 — what goes where?
frame-the-problem has BOTH an `improvements.md` AND a §8 in the brief.
TEMPLATE-brief.md says §8 is "Upgrade notes." improvements.md's header
says it's a backlog tracking open decisions. Is the intent that §8 is
authored-at-design-time growth notes and improvements.md is the living
backlog after launch? Docs don't explicitly say.

### Q7. Reverse-derived plays — do they enter the loop retroactively?
The three atomic-card plays "are NOT Raven plays" and "not gated through
the studio ladder." Are they supposed to *eventually* run the ladder?
Stay parallel-class forever? Get a separate process? Their `status:
derived` doesn't map onto either ladder for things that haven't been
hardened or gated.

## Tier C — runtime questions the docs hedge

### Q8. The blocking human-gate model — is it being retired?
PROJECTION.md §7 says blocking hexagon human gates **deadlock** under
detached runs and the correct pattern is the Raven Vision unit/wake model.
But §7 still documents the deadlocking shape's mechanics. Is the hexagon
node going away, or is it retained for the `--interactive` case forever?
Hot Spot H3 in STUDIO-EVENTS.md.

### Q9. Three things called "bank" — is this OK or should it converge?
- `bank.sh` = studio → plugin file copy
- Gate 2 = the Director's "I confirm this is proven" confirm
- `raven.vision.banked` = the play's output landing in the library at run time

Same word, three operations. The docs *explicitly* call this out
("This is **not** the package bank"). Is the naming intentional, or
should new vocabulary land somewhere?

### Q10. What's the spin-out target?
The scan brief says Studio is "being considered for spin-out as its own
product." This is **not in the studio docs at all** — the only audience the
docs imagine is "the Director, the orchestrator, and the next session's
agent." If Studio becomes a product:
- Who is the *external* user?
- Is the Director role retained as a customer persona, or generalized?
- Does Alexandria remain the only runtime, or do Studio plays target
  something else?

## Tier D — values + verbs the docs name but never spec

### Q11. What's a "Provenance Tag" formally?
Three classes seen — **Grounded** / **Orchestrator call** / **DIRECTOR
DECISION** (sometimes **RULED**). Is this the full set? Are there others
("Sonnet-verified," "field-review")? Is this an enum somewhere or just a
convention?

### Q12. What does the `surface:` field in registry.js mean?
Seen values: `banked`, `registered`, `full sketch`, `grounding only`,
`reverse-derived from a shipped Fabro build`. It's clearly distinct from
both `status:` and `stage:` — possibly a third axis describing what the
**review surface** of the card is. Docs don't enumerate it.

### Q13. What is `ws: 1` in registry rows?
Every play row has `ws: 1`. Workshop count? Workshop-page-exists boolean?
Some other count that's always 1 in practice? Docs don't say.

## Tier E — implementation we deliberately didn't read but need to know about

### Q14. Where does PLAY_MANIFEST come from?
Cited as `packages/ax-next/src/domain/plays.ts`. Is that file currently
hand-edited at Register, or auto-generated from filesystem scan? If
hand-edited, by whom — the orchestrator? CI?

### Q15. Where do the conformance gates live?
Multiple docs name them — placeholder conformance test (`placeholderConformance.test.ts`),
risk-map drift gate, bank conformance gate, `check-workflow-edges.py`,
`check-moves.ts`. These are CI gates and matter for our model. What
context do they belong to? My provisional read is they sit at the
seam between [[Aggregate - Workflow Package]] (studio copy) and the
plugin copy — but the docs don't unify them.

### Q16. What's the relationship between `studio/inheritance/quarantine/`
and the *current* quarantine items?
The README says "the per-file dispositions" are recorded in PROJECTION.md
§10. Are *all* originally-quarantined items dispositioned, or are some
still genuinely quarantined (not yet ruled)? Hot Spot H10 — the docs say
"stays-quarantined" exists as a disposition, but I didn't open the
quarantine dir to verify.

## Tier F — things only the architect will know

### Q17. Is "Raven" a noun for the data model?
Raven appears constantly in the docs — "Raven plays," "Raven-mediated,"
"the Raven workstream," "Raven Vision power-up." Is Raven (a) the agent
that orchestrates plays for the director, (b) a brand name for the whole
play-writing program, (c) a specific persona inside Alexandria, or (d) all
three at different altitudes? The docs use it as if its meaning is obvious.

### Q18. Where do "skills" sit?
PROJECTION.md §10 notes that `quarantine/skills.md` Fabro claims "check
out" but "skills are not part of the move-graph projection — stays
quarantined." HANDOFF.md mentions "the `raven-vision-drafting` and
`raven-vision-elicitation` skills." Are skills part of the Studio's
data model? They're not in my carving — should they be?

### Q19. The relationship between Studio plays and Alexandria's library
TEMPLATE-brief.md §3 mentions "cards, areas, source documents." ATOMIC-
CARDS.md describes a card-generation pipeline. Reading blindly: a card-
generation pipeline + a play-writing studio + the same artist (the
Director) — these all point at a library-product context I didn't enter.
What's the *correct* place for "library" in the Studio's own model?
(I deliberately filed it as a Job category and a job, not a context, but
that may be wrong.)

### Q20. Is the "spin-out" target a fork or a slice?
Does Studio-as-product retain the rich back-reference to Alexandria's
runtime + Fabro + Vision (all of which are deeply embedded in the docs)?
Or is the goal to abstract those away — make Studio the play-writing
workbench for *any* workflow engine? The answer reshapes what counts as a
[[Component - Projection Rulebook]] and what becomes a *configurable*
projection target.
