# Answer Key — IN-2 Distraction (distractor-injection invariance set)

**Canonical location for the metamorphic set.** This key is shared by both
distractor variants:
- `distractor-clean/` — base transcript with no distractor (this dir)
- `distractor-injected/` — same transcript plus an inserted vendor-pricing aside

Written blind (before any factory run) per TESTING.md "Answer key before runs."

---

## The metamorphic invariant

The one problem recovered and the verbatim evidence cited for it **must be
identical across both variants**. The grader compares the two
`runtime/problem-framing.md` outputs side-by-side. What varies between variants
(presence of the distractor block) must not affect what is recovered (problem,
evidence, who, circumstance). The distractor content must NOT appear as evidence
in either variant.

A run **passes** this case when:
1. The one target problem (P-API-ERRORS, below) is present in `runtime/problem-framing.md`
   in both variants.
2. The required verbatim evidence lines are cited (character-exact against the
   transcript) in both variants.
3. The same problem and evidence appear in both the clean and injected framing
   docs — no degradation in the injected variant.
4. The distractor content (vendor-pricing aside) is NOT cited as evidence in
   either variant.

A run **fails** when:
- The target problem is absent or substantially misframed in either variant.
- A required evidence line is missing or paraphrased (not verbatim) in either
  variant.
- The injected variant output is weaker than the clean variant (a problem
  dropped, evidence omitted, or framing shifted — the IN-2 distraction failure
  the fixture is designed to catch).
- Any line from the distractor block (vendor-pricing aside) appears as evidence
  or is included in the problem entry.

---

## The target problem

**P-API-ERRORS — "Integration engineers cannot diagnose failed API calls because
Vanta's error responses contain only an HTTP status code, with no message,
error code, or trace identifier."**

- **Who has it, and the circumstance:** integration engineer; specifically Keiko
  (engineering lead) and corroborated directly by Dara (infrastructure engineer);
  Mira reports hearing it from other teams via the DevEx guild. It bites when an
  engineer building or debugging an integration receives a 4xx or 5xx response
  from the API; the response body gives no information beyond the status code;
  the engineer must guess the cause or file a support channel request and wait.
- **Evidence (required — grader must find these verbatim in `transcript.md` and
  in the framing doc's cited evidence; character-exact):**

  1. "when an API call fails in Vanta you get back a 4xx or 5xx and basically
     nothing else" — **Keiko** — *first-hand: a specific past instance (factual
     claim about a missing response surface)*
  2. "The response body was just the status code. No message, no field, no
     request ID I could use to go look something up." — **Keiko** — *first-hand:
     a specific past instance (named artifact, named investigation)*
  3. "I literally had to ping the Vanta support channel and wait two hours to
     find out it was a field-type mismatch." — **Keiko** — *first-hand: a
     specific past instance (specific cost named: three hours lost + two-hour
     wait for support)*
  4. "Took me four hours to isolate — turned out to be a missing required field,
     but the error back was just a 400." — **Dara** — *first-hand: a specific
     past instance (second engineer, separate incident, same pattern)*
  5. "There is no error-detail field, no error-code enum, no trace ID in the
     response." — **Keiko** — *first-hand: a specific past instance (explicit
     documentation of absence — checked the docs)*

- **Corroboration (additional evidence — should appear; not required for pass
  but its presence or absence should be noted):**
  - "I've been hearing this from other teams too. The DevEx guild had it on the
    agenda last month. It's not just our team." — **Mira** — *relayed/secondhand
    (Mira reports hearing it; the scope claim "not just our team" is `assumed /
    hand-wavey`, not a count)*

---

## Grading the evidence

| Evidence item | Required mark | Fail if... |
|---|---|---|
| "when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else" (Keiko) | first-hand: a specific past instance | treated as hand-wavey or omitted |
| "The response body was just the status code…" (Keiko) | first-hand: a specific past instance | graded as generic complaint |
| "I literally had to ping the Vanta support channel and wait two hours…" (Keiko) | first-hand: a specific past instance (specific cost: time lost + wait) | the two-hour wait is the named cost; omitting it weakens the instance |
| "Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400." (Dara) | first-hand: a specific past instance | graded as general agreement rather than a distinct named incident |
| "There is no error-detail field, no error-code enum, no trace ID in the response." (Keiko) | first-hand: a specific past instance (checked the docs) | treated as hand-wavey; or "no trace ID" omitted |
| "I've been hearing this from other teams too…" (Mira) | relayed/secondhand; scope claim `assumed / hand-wavey` | treated as first-hand or counted as a precise number of affected teams |

---

## What must NOT appear

- Any suggestion like "we should add an `error_message` field" framed as a
  `###` problem entry — this is a solution. The problem is the absent error
  detail, not the absence of a specific implementation.
- Any sizing, priority, or effort judgment in Raven's own words.
- Any content from the vendor-pricing aside as evidence or context:
  - "flat-rate enterprise tier, twelve thousand a year"
  - "eight cents per API call"
  - "four million calls a month"
  - "the renewal's up in three weeks"
  - "stay on the flat rate"
  These lines appear only in `distractor-injected/transcript.md` and describe
  a procurement decision that is resolved in the meeting with no remaining
  pain. None of them is a problem-shaped statement. **Citing any of them is an
  IN-2 failure.**
- "Not just our team" treated as a confirmed count of affected teams.

---

## Distractor content — why it is a non-problem

The vendor-pricing aside (Mira, Soren, lines about the Vanta enterprise tier
and usage-based option) is **not problem-shaped** for these reasons:

1. The discussion concerns a procurement/renewal decision, not an engineering
   workflow pain.
2. The decision is reached and closed within the conversation: "Okay, so we
   stay on the flat rate. Easy call."
3. No speaker expresses pain, difficulty, or unmet need relating to the
   pricing. The framing is purely informational and decisional.
4. The renewal timeline ("three weeks") creates no urgency that qualifies as a
   problem in the sense the play frames — no one is blocked or harmed by the
   current pricing arrangement.
5. The content contains no verbatim evidence of anyone's progress being
   impeded.

---

## Scope boundary

The target thread runs from Soren's opening ("Let's start with what Keiko
flagged in the pre-read.") through the invocation ("Raven, frame that.") and
the invocation marker. In `distractor-clean`, this covers the entire
transcript. In `distractor-injected`, the framing must draw on the
engineering-pain exchange and may correctly leave the vendor-pricing aside out
of scope — but the aside must not be cited as evidence.

---

## Assertion type

**Both deterministic and judgment-graded components:**

- **Deterministic (n=1 sufficient per TESTING.md):** verbatim evidence present
  in both transcripts (grep-checkable); verbatim evidence cited by both framing
  docs (exact quote match); distractor phrases absent from evidence in both
  framing docs (grep-checkable against `runtime/problem-framing.md`).
- **Judgment-graded (requires k runs):** evidence marked correctly (`first-hand`
  / `assumed / hand-wavey` / `hypothetical`); relayed/secondhand distinction on
  Mira's turn; the `## What this means for the solution (so far)` read claims
  nothing beyond what the problem entry backs.

For the metamorphic invariance question (is the injected-variant result the
same as the clean-variant result?), the grader compares the two
`runtime/problem-framing.md` outputs side-by-side — this comparison is
**deterministic** at the level of "same problem recovered / same evidence cited
/ distractor excluded," and **judgment-graded** at the level of "equally well
framed."

Run-count recommendation: **k ≈ 30 per variant** (estimate tier) for the
stochastic grading components; the deterministic checks (evidence verbatim
present, distractor excluded) are n=1.

---

## Known false-positive risk

The word "renewal" appears in Keiko's first turn ("renewal quote") only in the
distractor block. In `distractor-clean` there is no "renewal" — no risk. In
`distractor-injected`, a run that cites the "renewal" context as part of the
problem framing has confused the distractor with the framable thread. Record
this as a distinct IN-2 failure; it is the exact failure mode the fixture is
designed to expose. Do not class it as a known FP — it is a genuine failure.
