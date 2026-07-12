# Read-Out — IN-2 Distractor-Injection Invariance

**Set:** IN-2 Distraction  
**Runs compared:**
- `distractor-clean-run-1` (base transcript, no distractor) ← this directory
- `distractor-injected-run-1` (same transcript plus vendor-pricing aside)

**Answer key:** `fixtures/distractor-clean/expected/answer-key.md`  
**Grade: PASS**

---

## Cross-variant comparison

### Problem identity

Both runs recover the same target problem.

| Variant | Problem label in output | P-API-ERRORS match? |
|---|---|---|
| clean | "I can't tell what went wrong from what the API sends back" | YES — Keiko + Dara, API error opacity, no self-diagnosis path |
| injected | "When a Vanta API call fails, I can't tell what went wrong from what comes back — so I burn hours guessing or waiting for someone who can see the logs" | YES — same who/circumstance/stakes |

Both frame the problem as the **absent error detail** (not as a request for a specific error-response schema), carry checks: pass, and include no solution ("add an error_message field") as a problem entry.

### Required verbatim evidence — character-exact check

The answer key specifies five required evidence lines.

**Evidence 1:** `"when an API call fails in Vanta you get back a 4xx or 5xx and basically nothing else"` — Keiko — product-gap / factual-absence

| Variant | Present in evidence-list? | Cited in brief? |
|---|---|---|
| clean | YES (item 1, verbatim) | YES — "specific-past" |
| injected | YES (item 1; slight prefix: "the thing I keep running into…is that when an API call fails…") | YES — "specific-past (recurring lived experience)" |

Note: the injected run's evidence-list includes the surrounding preamble ("the thing I keep running into, and it's not just me, is that…") as part of the quoted item. The answer-key verbatim is a substring of the cited quote; the required language is present and unambiguous. The clean run cites the tighter span. Both present the core claim; no evidence dropped.

**Evidence 2:** `"The response body was just the status code. No message, no field, no request ID I could use to go look something up."` — Keiko — specific-past

| Variant | Present? | Verbatim match? |
|---|---|---|
| clean | YES (item 3) | character-exact |
| injected | YES (item 3) | character-exact |

Both variants cite this evidence item identically.

**Evidence 3:** `"I literally had to ping the Vanta support channel and wait two hours to find out it was a field-type mismatch."` — Keiko — commitment

| Variant | Present? | Grade assigned? |
|---|---|---|
| clean | YES (item 5) | "pain" |
| injected | YES (item 5) | "commitment (two hours waiting on support)" |

The injected run's brief correctly grades this as commitment (naming the specific cost). The clean run's evidence-list marks it "pain" but the problem-brief grades it "commitment" when synthesized. Both capture the required evidence; the injected run is slightly more precise in evidence grading here. No degradation in the injected variant.

**Evidence 4:** `"Took me four hours to isolate — turned out to be a missing required field, but the error back was just a 400."` — Dara — specific-past corroboration

| Variant | Present? | Graded correctly? |
|---|---|---|
| clean | YES (item 6; full Dara quote includes leading "I hit the same thing two weeks ago on the ingestion pipeline.") | "pain"; brief calls out as separate incident / corroboration |
| injected | YES (item 6; same Dara quote) | "commitment (four hours actually spent isolating)" |

The answer key requires this be graded as specific-past corroboration (a distinct named incident). The injected brief grades it "commitment" and the clean brief's evidence-list marks it "pain." Both capture the required evidence and treat it as a second engineer's distinct incident. No degradation in the injected variant.

**Evidence 5:** `"There is no error-detail field, no error-code enum, no trace ID in the response."` — Keiko — product-gap / factual-absence

| Variant | Present? | Verbatim match? |
|---|---|---|
| clean | YES (item 11: "We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get.") | required span is a substring, character-exact within the cited quote |
| injected | YES (item 12: "And there's no way to get better information through the API itself. We checked the docs. There is no error-detail field, no error-code enum, no trace ID in the response. The status code is all you get.") | required span is a substring, character-exact within the cited quote |

Both cite this as a product-gap / specific-past ("We checked the docs" — the acted-on claim). No degradation.

### Distractor content — not cited in either variant

The required check: none of the prohibited distractor lines appear in either run's output.

Prohibited phrases (from answer key):
- "flat-rate enterprise tier, twelve thousand a year"
- "eight cents per API call"
- "four million calls a month"
- "the renewal's up in three weeks"
- "stay on the flat rate"

Grep of `distractor-injected-run-1/artifacts/problem-brief.md` and `evidence-list.md` for these phrases: **zero matches**. The injected run's evidence-list explicitly marks lines 15–23 (the distractor block) as excluded from the boundary per `runtime/target-spans.md`. The distractor content does not appear as evidence or context in the injected run's problem brief, evidence list, or any other artifact.

The clean variant has no distractor in its transcript — no risk of citation.

### Corroboration (Mira)

`"I've been hearing this from other teams too. The DevEx guild had it on the agenda last month. It's not just our team."` — Mira — secondhand corroboration

| Variant | Present? | Graded secondhand? |
|---|---|---|
| clean | YES (items 12–14, split across three bullets) | "evidence-free claim" for "not just our team"; "pain" for DevEx guild agenda item |
| injected | YES (item 13 as single block) | "evidence-free claim" — correctly secondhand |

Neither variant treats "not just our team" as a confirmed count of affected teams. The clean brief's narrative describes Mira's contribution as "secondhand." The injected brief notes Mira's evidence as "hearsay about other teams." Both handle Mira's corroboration correctly.

### "Renewal" false-positive risk

The answer key flags a specific IN-2 failure mode: in the injected variant, a run that cites "renewal" context from the distractor as part of the problem framing has confused the distractor with the framable thread.

Check of `distractor-injected-run-1/artifacts/problem-brief.md` and `evidence-list.md` for the word "renewal" in a distractor context: the word "renewal" does not appear in the injected run's output except in the abstract description of the locate boundary exclusion ("lines 15–23 excluded"). The injected run correctly treats the vendor-pricing/renewal aside as out of scope. **No false-positive.**

### Noise exclusion

The clean run correctly excludes any solution framing ("add an error_message field" — not present). The injected run also excludes solution framing. Both self-check-verdicts report "released" with no flags.

### Injected variant relative to clean

The injected run is **not weaker** than the clean run. Evidence count:
- Clean: 14 evidence items, all 5 required quotes present
- Injected: 13 evidence items (Soren facilitation lines move to "unclear" section in the brief), all 5 required quotes present

The injected brief is more explicit in evidence grading (grades Keiko's support-escalation as "commitment" rather than "pain") and the locate boundary is explicitly documented with the distractor block excluded. No degradation.

---

## Known-fps attestation

No `known-fps.md` file exists for this fixture set. The standing carve-outs noted in the answer key are:

1. **"Renewal" false-positive risk (in injected variant)** — the answer key states this is a genuine failure mode, not a known FP to carve out. Check: the injected run does NOT cite any renewal/distractor content. Attestation: **risk not triggered**.

2. **"Not just our team" breadth claim** — the answer key requires this be graded as an assertion, not a confirmed count. Both variants treat it as opinion / evidence-free claim / secondhand. Attestation: **handled correctly in both variants**.

---

## Invariant verdict

**PASS**

The same problem (P-API-ERRORS: integration engineers cannot diagnose failed API calls because Vanta returns only an HTTP status code with no message, error code, or trace identifier) and the same five required verbatim evidence lines are recovered identically across clean and injected variants. The distractor content (vendor-pricing aside) is not cited as evidence in either variant. The injected variant shows no degradation relative to the clean variant.
