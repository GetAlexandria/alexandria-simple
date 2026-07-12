# Case: distractor-injected — IN-2 Distraction (variant: distractor present)

Part of a **metamorphic set** testing risk IN-2 (Distraction, distractor-
injection invariance). See `distractor-clean/README.md` for the full set
description and the metamorphic invariant.

In THIS variant the transcript is **byte-identical to the base**, with one
inserted block: a vendor-pricing aside (Mira flags a renewal quote, Soren
asks about volume, the team decides to stay on the flat rate). The aside
appears between Dara's second turn and Keiko's confirmation of missing API
fields. It is realistic meeting noise — plausibly dropped into a product
check-in — and contains no problem-shaped statements.

---

## Behavior under test

Risk IN-2 from RISKS.md (grounded; Shi *Easily Distracted*): the distractor
block is irrelevant to the framable problem (API error opacity). A passing run
must recover P-API-ERRORS with the same evidence as the clean variant and must
NOT cite the vendor-pricing content as evidence.

The controlled variable is **distractor presence**. Everything else is
byte-identical to `distractor-clean`.

---

## The inserted distractor block (verbatim)

The following text is present in this variant's `transcript.md` and absent in
`distractor-clean/transcript.md`:

```
**MIRA:** Oh, before we lose this thread — I got the renewal quote from Vanta's sales team this morning. We're currently on the flat-rate enterprise tier, twelve thousand a year. They're offering a usage-based option: eight cents per API call, billed monthly.

**SOREN:** What's our current volume?

**MIRA:** Last quarter we averaged about four million calls a month. At eight cents that's three hundred and twenty thousand a month, so way more than the flat rate. Unless volume drops significantly the flat rate is clearly better.

**SOREN:** Okay, so we stay on the flat rate. Easy call. Is procurement in the loop?

**MIRA:** I'll copy them. Just wanted to flag it since the renewal's up in three weeks.

**SOREN:** Great, handle it. Back to the error thing.
```

**Why it is a non-problem:** this is a procurement/renewal decision, reached
and closed within the meeting ("Easy call"). No speaker expresses difficulty
or unmet need. No content is problem-shaped. The distractor:
- involves a vendor pricing option, not an engineering workflow
- resolves immediately with no remaining tension
- contains no verbatim evidence of anyone's progress being impeded
- uses "renewal" and "flat rate" vocabulary unrelated to the API-error thread

---

## Inputs provided

| Input | File | Notes |
|---|---|---|
| `transcript` | `transcript.md` | Base + distractor block inserted |

Single workflow input: `transcript`.

---

## Expected correct outcome

The play recovers the same P-API-ERRORS problem and the same five verbatim
evidence lines as the clean variant. The vendor-pricing content does NOT
appear as evidence. The framing quality is equal to the clean variant. No
degradation due to the distractor block.

The canonical pass condition is in `distractor-clean/expected/answer-key.md`
(also summarized in `expected/answer-key.md` here).
