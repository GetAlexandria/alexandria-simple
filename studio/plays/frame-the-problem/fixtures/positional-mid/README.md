# Case: positional-mid — IN-1 Buried Signal (variant: target in the middle)

## Metamorphic set description

This directory is part of a **three-case metamorphic set** testing risk IN-1
(Buried Signal) from RISKS.md. The three cases are:

- `positional-start/` — target thread appears at the START of the transcript
- `positional-mid/` — target thread appears in the MIDDLE of the transcript (this dir)
- `positional-end/` — target thread appears at the END of the transcript

**The metamorphic invariant the grader checks:** the located thread boundary
and the recovered problem entry (P-RENEWAL) are **the same across all three
positions** — same problem, same who, same circumstance, same verbatim evidence
cited — with no degradation when the thread is in the middle (the risk
position per Liu *Lost in the Middle*).

The three cases form ONE test of positional invariance, not three independent
tests. Grade them as a set: compare the three run outputs side-by-side and ask
whether the mid-position result is as good as the start and end results.

**The canonical answer key for the entire set is in this directory:**
`expected/answer-key.md`

---

## Behavior under test

Risk IN-1 from RISKS.md (grounded; Liu *Lost in the Middle*): the answer-bearing
content sits mid-context and is silently under-used due to U-shaped position
bias. The prior hard-case fixture scatters evidence across the back half of a
long transcript but does not hold position constant — it cannot isolate whether
a miss is positional or analytical. This fixture closes that gap: the target
thread is identical across all three variants; only its position varies. A miss
in the mid variant that does not appear in start or end is a positional-bias
failure.

In THIS variant the target thread appears in the **middle** of the transcript.
This is the risk position: mid-context content is most likely to be silently
under-used.

---

## Scenario

A product team at Meridian (a B2B account-management and scheduling tool) holds
a brief product-meeting check-in. Clara, an account manager, raises a pain
around renewal tracking. The rest of the meeting includes scheduling logistics
and a loosely-floated feature idea. The invocation ("Raven, frame that.") lands
immediately after Clara's thread.

---

## Planted target thread

The answer-bearing exchange is the block from Clara's opening turn through the
invocation. It appears in the MIDDLE of this transcript, between the scheduling
chatter and the mobile-app discussion.

**Key verbatim lines (character-exact; must be grep-findable in transcript.md):**

1. `I went through my book last week and realized I had three accounts up for renewal in the next thirty days that I had no idea about. I only found out because I happened to open the account record for a completely different reason.`
2. `There is nothing in Meridian that tells you "hey, this one's expiring."`
3. `If I hadn't clicked in that day those accounts would have hit the end of their term with zero outreach from us. One of them was sixty thousand ARR. That's not a tracking failure, that's a product gap.`
4. `I have reminders set in my personal calendar because Meridian has nothing. Half the team is doing the same. So we're papering over a product hole with personal calendar hacks.`

---

## Filler content (non-target)

The filler consists of two blocks, split AROUND the target thread in this
variant:

- **Before the target thread** — Scheduling chatter (Omar, Prakash): bulk-edit
  design review timing, Monday sync confirmation, Q2 planning retro request.
  Pure logistics.
- **After the invocation** — Mobile-app feature suggestion (Hina, Omar,
  Prakash): a running thought about a native mobile app. Thin and non-actionable.

---

## Equivalence guarantees held constant

Across all three positional variants (start, mid, end):

- The target thread wording is **byte-identical**.
- The two filler blocks are **byte-identical** in content; only their position
  relative to the target thread changes.
- All three transcripts use the same four speakers (Clara, Prakash, Omar, Hina)
  and the same invocation ("Raven, frame that.") plus invocation marker.
- All three cases pass the play a single `transcript` input and nothing else.
- Total length is comparable (within ~5% by line count).

---

## Inputs provided

| Input | File | Notes |
|---|---|---|
| `transcript` | `transcript.md` | Target thread in the MIDDLE; filler surrounds it |

Single workflow input: `transcript`.

---

## Expected correct outcome

The play recovers problem P-RENEWAL, cites the four required verbatim evidence
lines, grades evidence correctly, and does not frame the filler content as a
problem. The result must be equal in quality to the start and end variants.

The canonical pass condition is in `expected/answer-key.md`.
