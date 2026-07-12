<!-- Dry-run 5 (+5b confirmation) · 2026-06-11 · first runs under the §9 brief
amendments (problem BRIEF rename, "The picture" layer, delta-governs voice,
ceiling-not-target, colleague-voice boundary, cold-reader comprehension gate).
Runner: Sonnet agents executing prompt.md verbatim on meeting-snippet-01 +
saddle, no prior brief. Artifacts: run-05-artifact.md, run-05b-artifact.md.
RESULT: comprehension gate introduced and PASSED on both runs (verdict
"comprehensible with friction; the friction is vocabulary, not logic") —
the readability failure that triggered §9 is fixed. Open items below. -->

# Run 5 / 5b — golden fixture under the §9 amendments

## What was being proven

Run 4's artifact passed every mechanical check and still failed the Director
as a reader (coined-compound title, telegraphic 75-word paragraph, form-not-
map structure). §9 ratified four amendments; these runs test them on the
simple fixture before a complex fixture is built.

## Results — the four amendments

1. **Brief, not map (incl. "The picture").** Both runs produced a plain-
   sentence picture a cold reader restated correctly without any inputs.
   Both titles are colleague-voice ("Maya's pitch about losing source
   material before it reaches the library") — no coined compounds.
2. **Comprehension gate (new, agent-run, no human).** Cold-reader agent got
   the artifact alone, restated (a) what's going on (b) who hurts & when
   (c) what's open (d) what the author thinks — accurate on all four, both
   runs. Verdict both times: COMPREHENSIBLE WITH FRICTION, friction =
   product vocabulary only (Lantern, "banked," "conversion session,"
   "atomize") — terms the real audience (team + downstream plays) knows.
   **Calibration note for next runs:** brief the cold reader as a *new team
   member* (product terms allowed; the document must explain its own
   structure and reasoning) so domain vocabulary stops dominating the
   friction list. Possible Director option: a one-line rubric legend in the
   output format ("checks:" and evidence grades confused the maximally-cold
   reader).
3. **Delta governs / ceiling not target.** The spoken paragraphs are
   night-and-day vs run 4: plain speech, no semicolon stacking, no
   re-explaining the room's own words ("sources die in tabs before the
   conversion session starts, and Dev witnessed it"). Mechanical word
   count (software, at the seam — `wc`): run 5 ≈ 76, run 5b ≈ 78 against
   the 75 ceiling. Consistent with the §8 ruling: the model lands near the
   budget but cannot count; the seam check flags and trims (cutting the
   closing courtesy words suffices in both). The run-5 cold reader
   *mis-counted the paragraph as 93 words* — §8 reconfirmed from the other
   direction.
4. **Colleague-voice boundary.** Both spoken opens name the boundary in
   plain words; run 5b's ("the stretch from research to conversion
   session — two problems tangled in one pitch") is the better exemplar.

## Same-day patches (post run 5, validated in run 5b)

- **Conviction gloss** (step 3): run 5 graded Maya's secondhand director
  claim "conviction low," confusing the speaker's certainty with trust in
  the claim. Patch: "conviction is the speaker's certainty, not your trust
  in the claim." Run 5b graded it `opinion (conviction high)` correctly.
- **No bare pointers aloud** (Voice → Sound like a person): run 5 said "the
  brief shows the test" — referent-free for a listener (cold-reader catch).
  Patch: a spoken pointer says what the listener will find. Run 5b: "The
  brief has a test for the second — a short director interview." Fixed.
- **Fixture contract fix:** meeting-snippet-01 had NO invocation moment
  (both runs noted it; the input contract requires it marked). Added
  "**DIRECTOR:** Raven, frame that." + marker. Known remaining fixture
  debt: no preamble noise before the pitch, so `locate` is still untested
  (brief §2 consequence).

## Open items (for Director / next runs)

- **Proof check 3 variance — the bet quote.** "every director has this
  problem, literally all of them, I'd bet anything" must appear graded as
  high-conviction opinion. Run 5 kept it but filed it under Unclear while
  *claiming* it was in P2's evidence (it wasn't); run 5b dropped it
  entirely. The strongest-verbatim-form rule is in the prompt; the doers
  apply it unreliably. Candidate fix is a Gate call: none / prompt
  emphasis / a ground-style presence check.
- **Borderline sizing leak:** run 5b's "a *short* director interview"
  (map + spoken) brushes the no-effort-language hard limit. One word;
  recorded, not patched.
- **Re-run fixture debt:** prior-map-01.md predates the brief rename and
  picture layer; regenerate from a banked golden run before the next
  re-run demo (§9 sequencing note).

## Verdict

The §9 design does its job on the simple fixture: every reader-facing
failure from run 4 is gone, confirmed by an agent-run comprehension gate
with no human in the loop. Remaining misses are correctness-variance
(bet quote) and seam-enforced trims, not readability. Ready for Director
comb + the complex fixture.
