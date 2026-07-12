# Answer Key — IN-1 Buried Signal (positional invariance set)

**Canonical location for the metamorphic set.** This key is shared by all three
positional variants:
- `positional-start/` — target thread at the start of the transcript
- `positional-mid/` — target thread in the middle of the transcript (this dir)
- `positional-end/` — target thread at the end of the transcript

Written blind (before any factory run) per TESTING.md "Answer key before runs."

---

## The metamorphic invariant

The one problem recovered and the verbatim evidence cited for it **must be
identical across all three variants**. The grader compares the three
`runtime/problem-framing.md` outputs side-by-side. What varies between variants
(transcript position) must not affect what is recovered (problem, evidence,
who, circumstance).

A run **passes** this case when:
1. The one target problem is present in `runtime/problem-framing.md`.
2. The required verbatim evidence lines are cited (character-exact against the
   transcript).
3. The same problem and evidence appear in the start, mid, and end variant
   framing docs — no degradation in the mid variant relative to start or end.

A run **fails** when:
- The target problem is absent or substantially misframed in any variant.
- A required evidence line is missing or paraphrased (not verbatim) in any
  variant.
- The mid-variant output is weaker than the start or end variant (the
  positional-bias failure the fixture is designed to catch).

---

## The target problem

**P-RENEWAL — "Account managers miss upcoming renewals because Meridian gives
no proactive signal that a renewal is approaching."**

- **Who has it, and the circumstance:** account manager (AM); specifically
  Clara, and corroborated by Prakash as affecting "a few other AMs too." An AM
  works a book of many accounts simultaneously and cannot check each account
  record individually on a recurring basis; renewal dates exist as a field in
  the product but nothing surfaces them proactively.
- **Evidence (required — grader must find these verbatim in the target
  transcript and in the framing doc's cited evidence; character-exact):**

  1. "I went through my book last week and realized I had three accounts up for
     renewal in the next thirty days that I had no idea about. I only found out
     because I happened to open the account record for a completely different
     reason." — **Clara** — *first-hand: a specific past instance (named week,
     named count, named discovery mechanism)*
  2. "There is nothing in Meridian that tells you 'hey, this one's expiring.'"
     — **Clara** — *first-hand: a specific past instance (factual claim about a
     missing surface, not hand-wavey)*
  3. "If I hadn't clicked in that day those accounts would have hit the end of
     their term with zero outreach from us. One of them was sixty thousand ARR."
     — **Clara** — *first-hand: a specific past instance (real stakes named:
     $60k ARR at risk; sunk counterfactual named)*
  4. "I have reminders set in my personal calendar because Meridian has nothing.
     Half the team is doing the same. So we're papering over a product hole
     with personal calendar hacks." — **Clara** — *first-hand: a specific past
     instance (active workaround behavior); but the "half the team" clause is a
     corroboration claim marked `assumed / hand-wavey`, must NOT be laundered as
     confirmed fact*

- **Corroboration (additional evidence — should appear; not required for pass
  but its presence or absence should be noted):**
  - "Yeah, that's a real thing. I've heard it from a few other AMs too. Not
    just you." — **Prakash** — *relayed/secondhand (Prakash reports hearing it;
    not first-hand of his own)*

---

## Grading the evidence

| Evidence item | Required mark | Fail if... |
|---|---|---|
| "I went through my book last week…" (Clara) | first-hand: a specific past instance | marked hand-wavey, or omitted |
| "There is nothing in Meridian…" (Clara) | first-hand: a specific past instance (factual absence) | marked hand-wavey |
| "If I hadn't clicked in that day… sixty thousand ARR" (Clara) | first-hand: a specific past instance (cost named) | the ARR figure / sunk counterfactual dropped, weakening the instance |
| "I have reminders set in my personal calendar…" (Clara) | first-hand: a specific past instance (active workaround) | the "half the team" clause must be marked `assumed / hand-wavey`, not fact |
| "Yeah, that's a real thing. I've heard it from a few other AMs" (Prakash) | relayed/secondhand | treated as first-hand or as confirmation of universality |

---

## What must NOT appear

- "We should build a renewal-alert dashboard" (or any variant) as a `###`
  problem entry — this is a solution. The problem is the missing signal, not the
  absence of a specific UI.
- Any sizing, priority, or effort judgment in Raven's own words.
- The scheduling chatter (bulk-edit review timing, Monday sync, Q2 planning
  retro) as evidence or context for the problem — this is pure logistics noise.
- The native-mobile-app discussion as a problem entry — it is a feature
  suggestion with thin backing ("just mildly annoying" per Prakash); not a
  framed problem in this transcript.
- "Half the team is doing the same" treated as established fact.

---

## Scope boundary

The target thread runs from Clara's opening turn ("Okay — I have to get this
out before we go anywhere else…") through the invocation ("Raven, frame that.")
and the invocation marker. Everything else in the transcript is noise. The
framing must draw on this thread and leave the chatter out, regardless of where
the thread appears in the three transcript variants.

---

## Assertion type

**Both deterministic and judgment-graded components:**

- **Deterministic (n=1 sufficient per TESTING.md):** verbatim evidence present
  in transcript (grep-checkable); verbatim evidence cited by the framing doc
  (exact quote match); the framing drawn from the target thread; filler chatter
  not cited as evidence.
- **Judgment-graded (requires k runs):** evidence marked correctly (especially
  keeping the ARR item a strong `first-hand: a specific past instance` and
  marking "half the team" `assumed / hand-wavey`); the `## What this means for
  the solution (so far)` read claims nothing beyond what the problem entry backs.

For the metamorphic invariance question (is the mid result the same as start
and end?), the grader compares `runtime/problem-framing.md` across the three
runs — this comparison is **deterministic** at the level of "same problem
recovered / same evidence cited," but **judgment-graded** at the level of
"equally well framed."

Run-count recommendation: **k ≈ 30 per variant** (estimate tier) for the
stochastic grading components; the deterministic checks are n=1.

---

## Known false-positive risk

The "half the team is doing the same" line sits inside the same Clara turn as
the genuine workaround evidence. A run that correctly includes this turn as
evidence but incorrectly marks the "half the team" clause as corroborated fact
(rather than `assumed / hand-wavey`) is a partial miss on evidence marking —
record it but do not fail the invariance test unless the error appears
differently across positions.
