# Hardening — Frame the Problem

Round 1: fresh-eyes Hardener (Sonnet agent, not party to the design session),
2026-06-10. Protocol: Solomon's three questions + state audit + proof-spec
reality check. Verdict: **sound to author after fixes.**

## Findings and dispositions

Dispositions marked ✅ are recommended by the session lead; the Director rules
at Gate 1.

### Blocking

**F4 — Fix-loop language is incoherent for a single-agent prompt.** §4's
"bounces to the owning move" describes a graph runtime; one LLM call has no
loops to bounce through. ✅ Fix: state the prompt-era meaning — *correct the
failing entry inline and re-check before proceeding; an entry that can't be
made to pass is emitted marked failing (degraded and labeled), never silently
dropped.* When the play graduates to a Fabro graph, bounces become real edges.

**F7 — `ground` is labeled software but one check requires judgment.**
"Header matches real coverage" needs comprehension of what `frame` actually
used vs declared — not a closed rule. A doer-honesty violation, the exact
failure class from the factory autopsy. ✅ Fix: split. `ground` (software)
keeps the closed half: header lists exactly the saddle files supplied as
inputs (set comparison). `self_check` (judgment) takes the comprehension
half: do the map's claims actually trace to the slices it says it used?

**F12 — Proof check 1 tests open-disagreement preservation; no move produces
it.** The Grader would fail the play for something its prompt never instructed.
✅ Fix: `extract` also highlights statements of disagreement as first-class
evidence; `relate` gains the edge type **disputed (by whom)** — a live
disagreement is recorded as a contested edge, never resolved from the chair.

### Sharpen

**F1 + F14 — "~20 seconds aloud" absent from §1's done-condition and not
falsifiable.** ✅ Fix: add a closed proxy to §1 and §7 — spoken paragraph
**≤ 75 words** (≈20–30s aloud; Director may retune after hearing one read).

**F5 — The delta rule (re-runs lead with what changed) needs the previous map
as an input nobody declared.** The riskiest unstated assumption found. ✅ Fix:
declare *prior map (if one exists for this conversation)* as a third
soft-required input in §3; delta behavior applies only when present; untested
in v1's proof spec (noted).

**F2 — The empty-map valid success (a Director-named case) has no required
proof.** ✅ Recommend promoting the stretch fixture to required — it's ~10
lines of fixture and it's the play's best demo behavior. Director's call.

**F8 — Ownership of hunch/relationship checks unclear between `ground` and
`self_check`.** ✅ Fix: "map" explicitly includes the relationship layer;
`ground` checks the hunch label *exists* (closed), `self_check` checks the
label is *honest* (judgment).

**F13 — §5 still says PROPOSED for the boundary-naming rule that §7 already
tests.** ✅ Fix: ratified — remove PROPOSED.

**F15 — Nothing checks that scope/effort language stayed out** (Jules's
"tiny version" line is bait into out-of-scope territory). ✅ Fix: add proof
check 6 — the map contains no effort, priority, or scoping judgments.

### Notes (recorded, not gating)

**F3** — proof check 5's "one specific question at the weakest point" is
Director-taste, not falsifiable; marked as an explicit Director-eyeball check.
**F6** — disguise-test operationalization is the Author's job, from grounding.
**F9** — Jules has no persona in users.md; the unattributed path covers it.
**F10** — saddle fixtures verified sufficient for both planted problems. Solid.
**F11** — `ground`'s write clarified: an annotated map (per-entry check
status), not a separate report.
