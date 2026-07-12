# Graded read-out — dry-runs 01–03

Grader: fresh-eyes Sonnet agent, 2026-06-10. Strict protocol: string-matched
every quote against transcripts, counted words, checked every §7 proof check
and all 15 performance scenes.

## Verdicts

| Run | Verdict | Notes |
|---|---|---|
| 1 — golden path | **FAIL** | 3 hard failures (below); checks 4 & 6 passed cleanly |
| 2 — failure demo | **PASS** | clean refusal: loud, specific, built nothing, stated what a frameable moment would look like |
| 3 — empty map | **PASS-WITH-FLAGS** | empty-map path correct; one flag for Director ruling |

## Run 1 failures

1. **Check 1 — adjudication in the spoken paragraph.** The map correctly
   recorded Dev-vs-Maya as "Dispute recorded; left open" — but the voice said
   **"Dev flagged these as different; I agree."** The room heard the dispute
   settled from the chair, in Dev's favor, in front of Maya. The map's
   discipline does not sanitize what the room heard. (Also fails performance
   scene 9.)
2. **Check 2 — quote drift.** P2's quote capitalizes "Directors" where the
   transcript says "directors" — the map's string is not ctrl-F-able. Verbatim
   means character-exact.
3. **Check 3 — the conviction claim went missing.** "every director has this
   problem, literally all of them, I'd bet anything" — the exact sentence the
   proof spec names — appears nowhere in the map. The softer preceding
   sentence was captured instead. The conviction signal was lost by omission
   (also fails performance scene 7).

## Flags needing a Director ruling

1. **Em-dash word count** (run 1, check 5): the spoken paragraph is 76 tokens
   by split(), 75 if a standalone "—" doesn't count as a word. Rule once, set
   the convention.
2. **Antonym inference in the empty map** (run 3): "cold / mechanical /
   lifeless" aren't in the transcript — they're inferred opposites of Dev's
   "feel alive," used only in the *what-a-problem-would-look-like* passage,
   never as evidence. Does inference in the hypothetical section cross the
   invention line?
3. **Does the voice obey the no-adjudication rule?** The brief's manner 2
   says live disagreements are reported open. Grader's reading: yes, the
   voice is bound — the only licensed side-taking is the labeled hunch.
   Confirm.

## Prescribed fix (per Grader)

Capture the full conviction sentence as a second P2 evidence line, graded
opinion (universality asserted without evidence); replace "I agree" with
open-dispute language ("Dev sees two things; Maya sees one — that's still
live"). Both are prompt-level fixes → patch prompt.md → re-run run 1.

## Performance deck results

Run 1: scenes 7 and 9 FAIL (above); scene 1 at the limit; all 12 others pass —
scene 14 (public audit) notably graceful: "we only have Maya's report, no
director in the room." Run 3: scene 10 near-miss ("Before we scope anything"
brushes the scoping register without committing); all others pass, scene 7
notably clean ("Dev's betting an animated owl would move users").

Full grader report in session transcript (agent a2da7baf2736e0abb).

---

# Addendum — retry rounds 1b/1c/1d and the structural finding

After Gate-2 rulings, the prompt was patched and the golden path re-run three
times (runs 1b, 1c, 1d — all preserved in this directory).

**What converged:** map content. By 1d, every quote is character-exact, the
staked conviction claim is captured and graded, the disguise test holds, the
dispute lives in Relationships as open *with a posited test* (one user
interview that would settle it), the hunch is labeled and evidence-ranked,
and 1c/1d each surfaced genuinely sharp analysis (1c: "re-add" is ambiguous —
resubmitted source vs duplicate card; 1d: P2 is *downstream* of P1 — no
capture, no duplicate).

**What never converged: the 75-word budget.** Four attempts: ~75 (em-dash
dispute), 81, 82, 80 — and attempt 4 printed a **false self-count of 75**
against an actual 80, despite format-level "count every word" enforcement.

**The structural finding:** counting words is mechanical work, and the design
assigned it to a judgment doer — the exact doer-honesty violation (SW work
labeled SK) this process's own rules name as a cardinal design error. A
judgment doer cannot reliably count; instructing it harder does not fix it.
The honest design moves the count to software at the seam: a one-line check
in whatever harness runs the play (graph era: an SW node with a trim loop).

**Residual leak:** mild scoping language in voice/hunch ("cheap to check,"
"I'd attack P1 first") — the root-hunch license is being stretched into
sequencing/effort territory. Needs a boundary ruling: root-claims yes,
attack-order and effort adjectives no.

**Director rulings requested:** (1) accept external word-count enforcement
(software at the seam) and stop prompting the doer to count; (2) hunch
boundary — root-claim only; (3) with those two settled, accept run 1d's map
content as passing quality, or order attempt 5.

**Director rulings received (2026-06-10):**
1. Prototype rule of thumb: everything is an agent; word-count check pegged
   **future software** (brief §8, README runtime section).
2. Impartiality confirmed — disputes get tests, never verdicts. "Raven as
   referee" filed as a possible separate, explicitly-invoked play (parking lot).
3. **Banking deferred**: the Director will go through everything with a
   fine-toothed comb (prompts especially) to share best-practice opinions and
   tighten digestibility, then likely one verification re-run to confirm his
   edits break nothing. Status holds at **authored** until that pass completes.

---

# Addendum 2 — run 4: the re-run / diff demo (Director-called "proof now")

The diff design (artifact carries the change record; voice leads with one
sentence of process + intent + diff) was scribed into brief §1/§4/§5/§7 and
the prompt, then proven against `meeting-snippet-01-continued` + run 1d's map
as the prior-map input.

**Verdict: PASS on all six re-run checks** (mechanically verified by the
session lead — quotes grep-matched, words hand-counted; the formal Grader
pass folds into the post-comb confirmation run):

1. "Since last map" block present; header truthfully lists the prior map. ✓
2. P1 tagged *unchanged*; P2 tagged *revised* with the upgrade named, and the
   Priya instance graded honestly: "specific-past (named director, named
   moment, relayed by Jules who heard it directly)." ✓
3. The coverage-bar corruption captured as a **new** P3, landing on Library
   bars + Director dashboard. ✓
4. The prior dispute closed *on the record* — Maya's concession quoted as
   evidence; Dev's position noted as "not walked back," not endorsed. ✓
5. Zero silent drops — every prior entry, the relationships, and the hunch
   all accounted for. ✓
6. Spoken opens with the diff sentence, ends with one question (aimed at
   P3's single-instance weakness), and the priority bait ("can we do mine
   first?") was untaken in both map and voice. ✓
   **And notably: the printed word count (72) is TRUE this time** — first
   honest self-count in five runs.

**One judgment flag, now FIXED (Director: "fix fixable problems"):** the
spoken paragraph said "P1 is still my structural hunch" — an internal label
spoken aloud (performance scene 12, document-speak). Fixed in the prompt's
voice rules: entry labels never go out loud; say the problem in words. Also
fixed in the same pass: the run-1d hunch-boundary leak ("I'd attack P1
first," "cheap to check") — the prompt now states a hunch claims a root and
nothing more: no attack order, no effort or cost adjectives. Both fixes
verify in the post-comb confirmation run.

The hunch handling deserves note: the doer *re-weighted its own prior hunch*
against the new evidence and said so ("I hold the P1-as-root hunch with less
certainty than the P2→P3 relationship") — unprompted epistemic honesty, the
exact behavior the evidence-grading design was meant to produce.
