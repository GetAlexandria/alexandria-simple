# Case: positional-start — IN-1 Buried Signal (variant: target at start)

Part of a **metamorphic set** testing risk IN-1 (Buried Signal, positional
invariance). See `positional-mid/README.md` for the full set description and
the metamorphic invariant.

In THIS variant the target thread appears at the **start** of the transcript.
The filler chatter (scheduling logistics and a mobile-app feature suggestion)
follows the target thread.

---

## Behavior under test

Risk IN-1 from RISKS.md (grounded; Liu *Lost in the Middle*): the answer-bearing
content sits mid-context and is silently under-used due to U-shaped position
bias. This fixture exposes that risk by holding the answer constant and moving it
to three positions. This variant is the **control** (start position — typically
favored by recency and primacy effects).

---

## Planted target thread

The answer-bearing exchange is the block from Clara's opening turn through the
invocation. It appears in lines 1–15 of this transcript (before any filler).

**Key verbatim lines (character-exact; must be grep-findable in transcript.md):**

1. `I went through my book last week and realized I had three accounts up for renewal in the next thirty days that I had no idea about. I only found out because I happened to open the account record for a completely different reason.`
2. `There is nothing in Meridian that tells you "hey, this one's expiring."`
3. `If I hadn't clicked in that day those accounts would have hit the end of their term with zero outreach from us. One of them was sixty thousand ARR. That's not a tracking failure, that's a product gap.`
4. `I have reminders set in my personal calendar because Meridian has nothing. Half the team is doing the same. So we're papering over a product hole with personal calendar hacks.`

---

## Filler content (non-target)

The filler consists of two blocks, both appearing AFTER the target thread
and invocation in this variant:

- **Scheduling chatter** (Omar, Prakash): bulk-edit design review timing, Monday
  sync confirmation, Q2 planning retro request. Pure logistics; no product
  problem content.
- **Mobile-app feature suggestion** (Hina, Omar, Prakash): a running thought
  about a native mobile app for rough mobile-web experience. Deliberately left
  thin and non-actionable ("more of a running thought than a proposal") to test
  that it is not framed as a problem.

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
| `transcript` | `transcript.md` | Target thread at the START; filler follows |

Single workflow input: `transcript`.

---

## Expected correct outcome

The play recovers problem P-RENEWAL (account managers miss renewals because
Meridian provides no proactive renewal signal), cites the four required verbatim
evidence lines, grades evidence correctly (commitment on the ARR item; opinion
on "half the team"), and does not frame the filler content as a problem. The
mobile-app suggestion is either absent from the output or explicitly noted as a
thin feature request, not a framed problem.

The canonical pass condition is in `expected/answer-key.md` (which points to
the canonical key at `positional-mid/expected/answer-key.md`).
