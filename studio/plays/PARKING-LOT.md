# Parking Lot — playbook-wide

Big ideas raised mid-design that span the whole playbook or the product — out
of scope for the current golden path but too valuable to lose. Each entry: the
idea, why it was parked, what would earn it back.

**Looking for a specific play's growth plan?** That lives in the play's own
brief, §8 "Upgrade notes" (surfaced in its workshop sidebar as "Growth plan —
this play"). Rule of thumb: *this play, grown* → the play's §8; *the playbook
or product, changed* → here.

## Six plays pulled from the golden path (source-canon audit)

*Director ruling, 2026-06-12, on the
[source-canon audit](AUDIT-2026-06-12-source-canon.md). Raven serves
startups; the six-input pattern feeding rung 2 reproduced the enterprise
document supply chain, and several plays carried method-body skeletons
(BABOK, DSDM/SAFe, GDS, CI vendors). Identity entries remain in registry.js
as `parked`; the Board and the golden-path page no longer render them.
Research and sketches stay in their play directories, each grounding
carrying a dated reweighting amendment so revival starts from the corrected
canon, not the original sample.*

- **Elicit Business Context (2a)** — BABOK-shaped: organizational-process-asset
  review, a seven-domain stakeholder map, serial 1:1s that decline group
  conversations. At startup scale this is three questions inside the rung 1–2
  conversation — why now, what's the appetite, top three reasons this fails —
  and those are absorbed there (rung 2 brief, dated amendment). **Earned back
  when:** Raven serves an org where the seven domains are genuinely different
  people and the answers stop fitting in one conversation.
- **Market & Competitor Scan (2d)** — CI-vendor canon prescribed a standing
  corporate intelligence function (four-tier monitoring cadence, battlecards,
  win/loss program). A feature addition doesn't fire this play. **Earned back
  when:** a run actually needs it (a named decision waiting on competitive
  evidence) — revived as an on-demand play re-skeletoned on April Dunford's
  competitive-alternatives positioning and Mom-Test-sourced "what do users
  compare us to."
- **Size the Opportunity (2e)** — the canon is already right (VC bottoms-up:
  Pear, Underscore, PitchDoctor; anti-TAM-deck). Sizing serves framing a new
  bet, not scoping a feature. **Earned back when:** a new-bet moment needs it —
  revived on-demand with the 11 moves trimmed to ~6 and Mom Test cited at the
  willingness-to-pay check (commitment evidence over stated intent).
- **Frame a Bet (c1)** — hypothesis, one metric, and kill condition already
  live in rungs 2–3; what remained here was the enterprise layer (Calibration
  Ledger, "hypothesis required for roadmap consideration," A/B-stats
  apparatus). The Ledger idea survives separately under "Knowledge pools
  unlock speculation licenses" below. **Earned back when:** the rungs prove
  out and a standalone bet-framing moment exists that the one-pager doesn't
  cover.
- **Prioritize the Backlog (c2)** — the most Fortune-1000 play in the library:
  DSDM/SAFe skeleton with Business Sponsor BLOCK rules, DACI pre-moves, and a
  decision-log apparatus, while its own cited startup voices (Cutler, Perri,
  Torres) argue against the machinery. A startup running bets keeps no scored
  standing backlog. **Earned back when:** there is a real backlog owned by more
  people than fit at one table — revived re-skeletoned on Shape Up's betting
  table, with the failure-mode canon promoted to the spine.
- **Riskiest-Assumption Test (c3)** — the thesis is startup-native and the
  question survives: rung 3's hypothesis gate and 2b carry "which assumption,
  if wrong, kills this soonest?" The GDS scoring workshop (Impact × (10 −
  Confidence), team-consensus ritual) and Strategyzer's ≥30-participant rule
  were the enterprise layer. **Earned back when:** a bet's riskiest assumption
  needs a designed experiment beyond a feasibility spike — revived as Test
  Card + evidence ceiling with Fitzpatrick's commitment currency as the
  validity bar.

## Future-forward module ("theory of mind scratchpad")

*Raised by the Director, 2026-06-10, while designing Frame the Problem.*

Great product people carry a running projection of the future: open questions,
hunches about which problem is the root, what they'd test next, what they expect
to break. Our agents have no equivalent — each play runs and ends. The idea: a
per-agent **scratchpad surface** where plays deposit forward-looking material
(questions to chase, hunches with provenance, predictions to check later), and
which downstream plays — or the agent's Briefing — can read.

**Why parked:** the golden path is discrete plays whose artifacts carry the
thinking forward; the chain itself covers the demo. A scratchpad is a new
surface (likely Ledger-adjacent in the data model — observations/assessments as
events) and deserves its own design session, not a rider on rung 1.

**Trace of it that survives in-scope:** Frame the Problem's *flagged hunch* —
the spoken "if I had to pick…" — is a one-shot version of exactly this.

**Earned back when:** the core rungs are proven and we find a demo moment (or a
real workflow) where an agent visibly *remembering forward* changes the outcome.

## Agent view shows the running play

*Raised by the Director, 2026-06-10, while ratifying the empty-map outcome.*

When Raven reports "no problem found — here's what one would look like," the
room should be able to *see* that she's mid-play and which play it is. The
agent's view area should surface the play currently running (and plausibly its
progress / current move).

**Why parked:** this is an interface surface, not a play — and it maps directly
onto the data model's Open Question #3 (the agent-scoped live "control panel"
over Play Runs). It should be designed against that noun, not improvised here.

**Earned back when:** core rungs are proven and we're staging the demo's
camera-and-copilot overlay — this is exactly the "show the human inside the
machine" Engelbart move, so it may earn its way in as demo polish.

## The "restating the diff" standard

*Raised by the Director, 2026-06-10, while designing Frame the Problem's
re-run behavior.*

Active communication lives in the diff. In real work, going back to the
drawing board sounds like: **one sentence explaining the process, intent, and
diff — then the updated work product.** Every play that revises a prior
artifact (and most will) needs this same shape: artifact carries the
structured change record; voice leads with the one-sentence diff.

**Why parked:** one play has exercised it once. A standard extracted from a
single data point is a guess wearing a uniform. Frame the Problem's re-run
design (brief §1, prompt "When you've framed this before") is the prototype;
it's best judgment this time around, by design.

**Earned back when:** two or three more plays have revision behavior in
production shape — then extract the common standard into the process docs
(and likely into Raven's persona, beside the manners).

## Knowledge pools unlock speculation licenses

*Raised by the Director, 2026-06-11, while ratifying rung 2's sizing law.*

"Raven isn't qualified to scope things — she simply doesn't have the
organizational context and know-how. There are future knowledge pools we
could give her that unlock this, where it is more appropriate to
speculate… but for now, we're keeping her on the rails." The
generalization: Raven's hard bans (generated sizing, adjudication,
invention) are not personality — they are *missing qualifications*. Each
ban is a license waiting on a knowledge pool plus the play that maintains
that pool: a track record of estimates vs actuals could license effort
speculation; deep codebase familiarity could license feasibility hunches;
accumulated org context could license priority reads. The licensing
pattern already exists in miniature: rung 1's labeled hunch is a narrow
speculation license earned by the evidence-grading discipline around it.

**Why parked:** the demo runs on the rails; designing graduated licenses
needs the knowledge-pool surfaces to exist first (this connects to the
future-forward module above and the saddle-enrichment thesis).

**Earned back when:** a knowledge pool with real accumulation exists, and
a play demonstrably does better work with a license than without it.

**First surface, slotted:** "Keep the Calibration Ledger" (analytics,
coordinator) was added to the inventory same day (Director-approved,
2026-06-11) — it joins the predicted half (One-Pager goals/metrics, Frame
a Bet) to the actual half (Results Readout), accumulating the track record
this entry's licenses would draw on. Slot only; not in the golden path.

## The universal play shape: artifact + spoken introduction

*Raised by the Director, 2026-06-11, while ratifying rung 2's two
renderings.*

"In any circumstance we're looking at an agent creating an artifact and
talking about it in introducing it. The environment we're doing this in is
group chat — which is why the first play spent so many calories
constraining the spoken output." Rung 1 proved the pattern (one analysis,
two renderings, anti-drift rule, voice constraints); rung 2 inherits it by
ruling. If it holds across rungs 3–4, it's the universal shape of a Raven
play in group chat: every play emits the durable artifact *and* the
constrained spoken introduction, and the spoken-output discipline (delta
not recap, ceiling not target, no adjudication, no document-speak) is
persona/Package kit, not per-play invention — beside the four manners.

**Why parked:** two plays is a pattern, not yet a law; same logic as the
"restating the diff" standard above.

**Earned back when:** rungs 3–4 ratify the same shape — then extract into
the process docs and Raven's persona, in the same pass as the manners
promotion (rung 1 brief §8) and the diff standard.

## Raven as referee (a separate play, if ever)

*Raised by the Director, 2026-06-10, while ruling on dispute handling.*

Frame the Problem is impartial by law: disputes get recorded open, with a
posited test — never a verdict. But "if people want to make it awkward and
have her judge, that can be a separate thing": an explicitly-invoked
adjudication play, where the room *asks* for her ruling and knows it's coming.
Different consent, different play, different prompt.

**Earned back when:** someone actually asks for it in a meeting.

## Personality flavor beyond posture

*Raised by the Director, 2026-06-10, while defining Raven's stance.*

Posture (analyst / owner / vision, yoked to Job Title) ships now. A quirkier,
more human-feeling personality is deliberately deferred: "if we can get her
doing good work, then I think we can create a quirkier more human feeling
personality. but that's another earn it."

**Earned back when:** Raven is demonstrably doing good work — proven plays,
demo landed — and we design flavor as persona/Package material on top of the
proven posture blocks.

## The template's undefined vocabulary (queued 2026-06-12, cold-launch finding)

The brief template asks for `tier: <coordinator | manager | senior>` and
`job: <one of the eight job categories>`, but neither the tiers nor the
eight categories are defined anywhere in the playbook kit — a cold
Director cannot fill those fields from the documents alone. Queued as a
**Director question** (only he can author those definitions; surfaced by
the Slice 2 cold-launch test, Director-ruled to queue here rather than
have an agent draft them).

**Earned back when:** the Director writes or dictates the definitions;
they land in TEMPLATE-brief.md (or a pointed-to reference) with
provenance.

## Convert every brief + the Fable draft bank to seed risk-maps (queued 2026-06-15)

The brief template now seeds a per-play `risk-map.md` at design time
(TEMPLATE-brief.md §7), fusing the design front end to the Play Testing back end
(the Coverage tab; `research/testing/RISKS.md` spine). The existing briefs
predate this and need converting:

- **12 of 13 plays have no `risk-map.md`** — only `frame-the-problem` does,
  and that one was hand-reverse-engineered from canon, not authored from its
  brief. Each play needs one.
- **Their §7 proof specs use the old one-planted-failure model**, not the
  coverage map. Convert each to the modern §7.
- **The Fable-drafted brief bank** (sketched from research before the model was
  retired) lands the same way: run each draft through the modern §7 so it seeds a
  risk-map and flows through build → test **without hand reverse-engineering**.

**Why parked:** it's a batch migration, separable from any single play's golden
path. **Earned back when:** done per play as each is next touched, or as a
dedicated conversion pass. This is the thing that lets the Fable brief bank *land
at scale* — every draft flows straight through the pipeline instead of needing
the one-off reverse-engineering done for `frame-the-problem`.

**Progress (2026-06-16, PR #270 — conversion pass 1).** Risk-maps authored for the
golden-path 8 (write-the-one-pager · scope-an-mvp · architecture-aware-build-plan ·
feasibility-check · survey-the-existing-system · capture-technical-constraints ·
run-internal-feature-discovery · write-acceptance-criteria) **and the 3 parked plays**
(elicit-business-context 2a · market-competitor-scan 2d · size-the-opportunity 2e) —
11 of 12 (frame-the-problem already had one). Each maps onto the canonical spine
in post-#269 canonical-family ids; all parse clean through the #268 surface; and each
was content-reviewed against the live exemplar via a grading rubric (10/11 passing;
elicit-business-context reworked from needs-work). **Remaining:** the frozen
`frame-the-problem` monolith is being removed as a separate, coordinated step — it is
the in-flight #269's cited provenance baseline, so deleting it here would friendly-fire
that PR. The canonical-id naming pin + the `RISKS.md` register reconciliation ride with
#269. Matching the maps to the reconfigured play-page layout (if its risk-map format
changes) is a tracked downstream reformat project, separate from this content pass.
