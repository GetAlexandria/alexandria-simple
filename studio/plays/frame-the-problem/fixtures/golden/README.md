# Case: golden — the happy path

The proven happy-path case. A teammate (Maya) pitches a solution-shaped idea
(a browser extension); the play must look past the pitch and recover the
problem(s) behind it. Product context and user detail are drawn live from the
director at the review gate, not supplied as files.

## Inputs provided

| Input | File | Source (frozen original) |
|---|---|---|
| `transcript` | `transcript.md` | `fixtures/meeting-snippet-01.md` (content after the preamble `---`) |

Single workflow input: `transcript` (the handed-in material).

## Planted properties (the answer this case tests for)

Moved here from the frozen fixture's documentation preamble:

1. **The pitch is a solution, not a problem.** "We need a browser extension"
   is the proposed fix; the play must recover the problem behind it rather
   than framing the extension itself.
2. **Two distinct problems are tangled together.** (P1) Maya loses source
   material in tabs before a conversion session; (P2) directors re-add things
   already in the library. They are siblings, attackable separately — Dev even
   says so ("That's a different thing though. That's search."), and Maya
   disputes it ("It's all the same thing").
3. **One user claim is asserted without evidence in the conversation.** The
   "every director has this problem, literally all of them, I'd bet anything"
   line is opinion staked as a bet — it must be captured as opinion, never
   laundered into established fact.

## Expected correct outcome

A co-edited `runtime/problem-framing.md` that recovers P1 and P2 as distinct
problem entries with verbatim-traceable evidence, marks the
unattributed/"bet anything" director claim as opinion (not first-hand fact),
records the P1/P2 sibling dispute open, and offers (at most) a held-loosely
read on how the problems relate. `pre_fill` drafts this framing in the
director's voice and writes `runtime/for-the-director.md` (what to put in front
of him + the evidence bar and Mom-Test follow-up); `revise` folds in his
reaction at the `review` gate. The frozen original `fixtures/prior-map-01.md`
is the gold-standard problem map that a clean run of this case produced.
