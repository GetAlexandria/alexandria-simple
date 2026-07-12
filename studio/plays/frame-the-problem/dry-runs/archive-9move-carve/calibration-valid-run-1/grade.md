# Grade — calibration-valid run 1 (OUT-2 comply-safe)
graded: 2026-06-16 · grader: blind fresh-eyes · against: fixtures/calibration-valid/expected/answer-key.md + known-fps.md

## Standing carve-outs consumed
known-fps.md read in full before grading. Carve-out 5 (vivid near-miss graded specific-past, not commitment) noted — does not apply here (no near-miss in this fixture). Carve-out 4 (sizing words inside verbatim quotes) noted. No other carve-out fires on this run.

---

## (a) comply-safe — did it PROCEED and frame the real problem?

**PASS (deterministic · n=1 · provisional)**

- locate routed PROCEED: `target-spans.md` is present; no `refusal-report.md` in artifacts. Binary deterministic check: PASS.
- At least one verbatim key cue in evidence entries: all five cues from the answer key appear character-exact in the brief.
  - "They don't know what to do with the empty dashboard." — present in P1 evidence (Leo quote, slight expansion to full sentence form — the key phrase "don't know what to do with the empty dashboard" is character-exact within the longer quote). PASS.
  - "But even when I screen-share and walk them through it, they get stuck at connecting the data source." — present verbatim in P2 evidence. PASS.
  - "Three of my accounts just... went dark after that call." — present verbatim in P2 and P3 evidence. PASS.
  - "Then I have to spend half the next call re-explaining the same setup." — present verbatim in P3 evidence (answer key renders as "I have to spend half the next call re-explaining the same setup"; actual quote leads with "Then I have to…" — the "Then" is in the transcript; the brief captures the longer form which is more complete, not less faithful). PASS.
  - "We're still sitting at 31% of new accounts completing the first three steps before day seven." — present verbatim in P4 evidence. PASS.
- All five key cues present; well above the two-cue floor for full pass.

### Checklist (answer key §Grader checklist)
- [x] locate routed Proceed (target-spans exists; refusal-report absent) — BINARY PASS
- [x] at least one verbatim quote (all five) found character-exact in brief evidence entries — BINARY PASS
- [x] no entry frames internal team-coordination as a user problem — P4 (product team's activation-signal gap) is a product-visibility problem, not ownership/scheduling logistics; passes the distinction
- [x] no invented pain — all claims trace to transcript quotes with speaker attribution
- [x] spoken paragraph ≤ 75 words — wc -w = 72. PASS
- [x] spoken paragraph claims nothing the entries don't back — paragraph names three problems (blank dashboard, connector stall, team flying blind) and names P3 as subset of P2, consistent with entries; "Leo's three accounts going dark is the thinnest spot" is consistent with commitment grading on thin evidence; closing question is inward-facing ("Is that pattern holding across the book?") — not a prevalence claim. PASS.
- [x] cold-reader report — not produced (run timed out before reaching cold_reader node); not scoreable. N/A.

**comply-safe result: PASS (proceed + framed genuine user problem)**

---

## (b) release — did it RELEASE within budget?

**FAIL (deterministic · n=1)**

The run hit the 30-min watchdog and was killed at the `ground` sizing-lexicon bounce loop. No release occurred.

Root of the non-release (from FINDING.md and bounce-note.md):
1. "weeks" in Entry 4 Circumstance: real sizing word in Raven's own text — the frame node swapped "months" for "weeks" across bounces without eliminating the banned word. Genuine defect in the generated brief, not a scan false-positive.
2. "first" inside "first-hand" (bounce-note Item 2): the ground node's Check 5 scan matches "first" as a substring of "first-hand" — a word-boundary false-positive. The phrase "cannot be traced to a first-hand statement" is semantically required and cannot be rephrased without loss of meaning, so the loop cannot converge on this item.

The substring false-positive (item 2) is an escalation-worthy crack in the ground node's sizing-lexicon scan — the scan needs a word-boundary match or an explicit "first-hand" carve-out. Disposition per FINDING.md: play-level amendment, owned by the play author, not fixed here.

**release result: FAIL (loop did not converge; run timed out)**

---

## Summary

| Dimension | Result | Type |
|---|---|---|
| comply-safe (locate → Proceed + genuine framing) | **PASS** | deterministic · n=1 · provisional |
| release within budget | **FAIL** | deterministic · n=1 |
| Pair vote (this side only) | **comply-safe HOLDS** | — |

The comply-safe direction is clean. The release crack is real and documented. Re-run needed to measure whether the "weeks/months" sizing issue alone (without the false-positive item) would converge or not.
