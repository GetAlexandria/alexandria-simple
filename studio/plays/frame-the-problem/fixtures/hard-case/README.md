# Case: hard-case — the advanced boundary / sort / integration test

The advanced integration fixture. One ~30-minute Lantern library-health review
that grades the play at its stated 5+ ceiling: a deliberately ambiguous
invocation, in-scope problem evidence scattered across the back half and split
by an out-of-scope budget block, disguised solutions, a red-herring want, a
disputed root, and several evidence-grading traps.

## Inputs provided

| Input | File | Source (frozen original) |
|---|---|---|
| `transcript` | `transcript.md` | `fixtures/advanced/transcript-full.md` (content after the preamble `---`) |

Single workflow input: `transcript` (the handed-in material). Product context
and user detail are drawn live from the director at the review gate, not
supplied as files. (The frozen `advanced/answer-key.md` notes the Lantern
surface needed three additions so each problem's "where it lands" has somewhere
real to point — **no freshness/staleness signal**, **dedup is area-local /
only at atomize**, **no documented conversion onboarding** — that grounding now
comes through the director's live reactions rather than a `surface_map` file.)

## Test architecture (boundary / sort / integration)

From the frozen answer key — **integration = boundary ∘ sort.** One fact set
graded at two points in the work:

| Test | Input | Graded in | Passes if |
|---|---|---|---|
| **Boundary** | the full transcript (`transcript.md` here) | `pre_fill`'s framing | binds the library-quality thread, excludes the budget block, resolves the ambiguous "frame that" |
| **Sort** | the pre-bounded transcript (`expected/transcript-located.md`) | the final framing | given clean material, recovers the problem set correctly |
| **Integration** | the full transcript | the final framing | the whole run holds — boundary-finding and analysis compose without interference |

This case dir provides the **full** transcript as its single `transcript`
input (the boundary / integration input). The pre-bounded gold thread lives
under `expected/` as a grading aid; to run the sort in isolation, point the
`transcript` input at `expected/transcript-located.md` instead. (The `expected/`
answer-key filenames are preserved verbatim from the frozen original and are
not renamed.)

## Planted properties (the answer this case tests for)

The full fact set, scoring rubric, and trap table live in
`expected/answer-key.md`. In brief, the play must:

- Recover **PA** (approval bottleneck), **PB** (silent staleness), **PE**
  (misleading coverage bars, *root left disputed*), and **PF** (undocumented
  conversion onboarding) as distinct problems; **PC** (unpredictable atomize
  granularity) and **PD** (area-local dedup) may be two entries or one
  justified merge that names both — a silent drop of either is not acceptable.
- Keep the disguised solutions (auto-approver, expiry date) and the dark-mode
  red-herring **out** of the problem set.
- **Exclude** the entire budget/vendor-renewal block via the framing boundary
  `pre_fill` draws (an entry sourced from it is an auto-fail).
- Grade evidence correctly (Theo's half-day = commitment; the "every director…
  Guaranteed" line = opinion, never fact; split-grade Sam's past-event +
  future-fear line).
- Leave the **PE root dispute open** with a posited test — never adjudicate the
  Nadia-vs-Roman staleness-vs-duplication question, even hedged.
- Use **no** effort/sizing/priority language in Raven's own words (the room's
  "this sprint" / "months-long" may appear only inside verbatim evidence).

## expected/ — grading material (NOT inputs)

These are copied verbatim from the frozen original and are **not** passed to
the play as inputs:

- `expected/answer-key.md` — the gold-standard frame, scoring rubric, and trap
  table (`fixtures/advanced/answer-key.md`).
- `expected/read-out.md` — the graded read-out of the first clean-room runs and
  prompt-tightening rounds (`fixtures/advanced/read-out.md`).
- `expected/transcript-located.md` — the gold-standard pre-bounded thread
  (the full transcript with the boundary already applied); the sort test's
  input (`fixtures/advanced/transcript-located.md`).

The frozen original also holds per-run grading dumps under
`fixtures/advanced/runs/*` (knot-1..5, storm-1..5) as additional grading aids;
they are not copied here. `transcript-located.md` is copied in (above) because
it doubles as the sort-test input.
