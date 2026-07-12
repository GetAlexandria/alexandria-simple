# Case: distractor-clean — IN-2 Distraction (variant: no distractor / base)

## Metamorphic set description

This directory is part of a **two-case metamorphic set** testing risk IN-2
(Distraction) from RISKS.md. The two cases are:

- `distractor-clean/` — base transcript, no distractor (this dir)
- `distractor-injected/` — the same transcript, byte-identical, plus an
  inserted vendor-pricing aside

**Risk being tested:** IN-2 Distraction (grounded; Shi *Large Language Models
Can Be Easily Distracted by Irrelevant Context*). The risk: irrelevant, noisy,
or padded input degrades the output even on otherwise-solvable cases — dropping
a real problem, shifting the framing, or admitting irrelevant content as
evidence. The default fixture pattern from RISKS.md: distractor-injection
invariance — hold a clean, solvable case constant, vary only whether an
irrelevant distractor is present, assert output unchanged.

**The metamorphic invariant the grader checks:** the recovered problem entry
(P-API-ERRORS), its located thread boundary, and the cited verbatim evidence
are **the same across both variants** — same problem, same who, same
circumstance, same verbatim evidence cited — with no degradation when the
distractor is present. The distractor content (vendor-pricing aside) must NOT
appear as cited evidence in either variant.

The two cases form ONE test of distractor-injection invariance, not two
independent tests. Grade them as a set: compare the two run outputs side-by-
side and ask whether the injected variant is as good as the clean variant.

**The canonical answer key for the entire set is in this directory:**
`expected/answer-key.md`

---

## Behavior under test

Risk IN-2 from RISKS.md (grounded; Shi *Easily Distracted*): irrelevant or
padded input degrades the output even on otherwise-solvable cases. The prior
`hard-case` fixture includes an out-of-scope vendor-budget block that the play
must exclude — but that fixture tests exclusion at the framing boundary as part
of a complex multi-problem integration test. It does not isolate the IN-2
risk: the transcript is long and tangled, and a boundary failure cannot be
distinguished from an analytical failure.

This fixture closes that gap: a clean, short, solvable single-problem
transcript is held constant across both variants. In the clean variant the
play should have no difficulty. In the injected variant, the only change is
the inserted distractor. A degradation in the injected variant that does not
appear in the clean variant is a pure IN-2 distraction failure.

In THIS variant the transcript is the **base** (no distractor). This is the
control: the play should easily recover P-API-ERRORS with clean evidence.

---

## Scenario

A product team at Vanta (an internal developer platform offering a REST API
for data integration and automation) holds a brief product-planning check-in.
Keiko, an engineering lead, and Dara, an infrastructure engineer, each
describe the same debugging pain: when API calls fail, Vanta's error responses
return only an HTTP status code — no message, no error code, no trace
identifier. They have both lost hours diagnosing failures without actionable
error detail. Mira corroborates from a second-hand signal (DevEx guild
discussion). The invocation ("Raven, frame that.") lands after the
corroboration.

---

## Planted target thread

The answer-bearing exchange is the block from Soren's opening through the
invocation. In this variant it covers the entire transcript (no filler).

**Key verbatim lines (character-exact; must be grep-findable in
transcript.md):**

1. `when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else`
2. `The response body was just the status code. No message, no field, no request ID I could use to go look something up.`
3. `I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch.`
4. `Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400.`
5. `There is no error-detail field, no error-code enum, no trace ID in the response.`

---

## Distractor (absent in this variant)

In `distractor-injected/transcript.md`, a vendor-pricing aside is inserted
between Dara's second turn and Keiko's confirmation of missing API fields. The
aside covers:

- Mira flagging a renewal quote from Vanta's sales team (flat-rate enterprise
  tier vs. usage-based at $0.08/call)
- Soren asking about current volume (4M calls/month)
- Mira calculating the cost comparison (usage-based would cost ~$320k/month
  vs. $12k/year flat rate)
- Soren deciding to stay on the flat rate and asking Mira to loop in procurement
- Soren closing the tangent ("Great, handle it. Back to the error thing.")

**Why this is a non-problem:** the aside is a procurement/renewal decision that
is reached and closed within the conversation with no remaining pain or
unresolved tension. No speaker expresses difficulty, blockage, or unmet need
relating to the pricing arrangement. The content contains no problem-shaped
statements and no verbatim evidence of anyone's progress being impeded. It is
realistic meeting noise — plausible for a product-team check-in, not obviously
labeled as off-topic, but containing nothing a framing play should frame.

---

## Equivalence guarantees held constant

Across both variants:

- The target thread wording is **byte-identical**.
- Both cases pass the play a single `transcript` input and nothing else.
- Both transcripts use the same four speakers (Keiko, Soren, Dara, Mira) and
  the same invocation ("Raven, frame that.") plus invocation marker.
- The two transcripts differ ONLY by the inserted distractor block (and Soren's
  two-word transition "Back to the error thing." which follows it).

---

## Inputs provided

| Input | File | Notes |
|---|---|---|
| `transcript` | `transcript.md` | Base transcript, no distractor |

Single workflow input: `transcript`.

---

## Expected correct outcome

The play recovers problem P-API-ERRORS (integration engineers cannot diagnose
failed API calls because Vanta returns only an HTTP status code), cites the
five required verbatim evidence lines, grades evidence correctly (Keiko's
three-hour loss plus two-hour wait as commitment; Dara's four-hour incident as
specific-past corroboration; the "checked the docs" turn as product-gap
factual-absence; Mira's DevEx guild report as secondhand), and does not
propose a solution (e.g., "add an error_message field") as the problem entry.

The canonical pass condition is in `expected/answer-key.md`.
