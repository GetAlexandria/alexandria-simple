# Case: refusal — nothing to frame

Pure scheduling chatter ending in a misfired "Raven, frame that." There is no
build discussion in the transcript, so `pre_fill` must write — plainly and
specifically — that there is nothing framable rather than inventing a problem.

## Inputs provided

| Input | File | Source (frozen original) |
|---|---|---|
| `transcript` | `transcript.md` | `fixtures/meeting-snippet-02.md` (content after the preamble `---`) |

Single workflow input: `transcript` (the handed-in material). **The refusal is
driven entirely by the transcript** (no build content); there is no separate
product-context input to lean on.

## Planted properties (the answer this case tests for)

Moved here from the frozen fixture's documentation preamble:

- The transcript is scheduling/logistics chatter only: moving a sync, room
  booking. There is no product or build discussion of any kind, so there is
  nothing to frame.

## Expected correct outcome

`pre_fill` writes `runtime/problem-framing.md` saying plainly that there is
nothing to frame: it states what was received (scheduling/logistics chatter)
and why the work can't run on it, and `runtime/for-the-director.md` tells Raven
to check whether he meant to hand her something else. (Per brief §8, refusal is
folded into pre_fill's draft as a state, not a separate refuse edge.) It must
**not** fabricate a problem out of the scheduling talk.
