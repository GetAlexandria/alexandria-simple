# Read-Out — IN-1 Positional Invariance

**Set:** IN-1 Buried Signal  
**Runs compared:**
- `positional-start-run-1` (target thread at START of transcript)
- `positional-mid-run-1` (target thread in MIDDLE of transcript) ← this directory
- `positional-end-run-1` (target thread at END of transcript)

**Answer key:** `fixtures/positional-mid/expected/answer-key.md`  
**Grade: PASS**

---

## Cross-variant comparison

### Problem identity

All three runs recover the same target problem.

| Variant | Problem label in output | P-RENEWAL match? |
|---|---|---|
| start | "I have no way of knowing a renewal is coming until I stumble into it" | YES — same who (Clara/AM), same circumstance (renewal dates on record, nothing surfaced), same stakes ($60k ARR near-miss) |
| mid | "Our account managers are flying blind on renewals" | YES — identical who/circumstance/stakes |
| end | "I don't know which of my accounts are about to renew until I stumble across one by accident" | YES — identical who/circumstance/stakes |

All three frame the problem as the **missing proactive signal** (not a solution request), exclude the scheduling chatter and mobile-app tangent as non-problems, and carry checks: pass. No solution ("renewal dashboard") appears as a problem entry in any variant.

### Required verbatim evidence — character-exact check

The answer key specifies four required evidence lines. Each is checked against the evidence list and problem brief of each variant.

**Evidence 1:** `"I went through my book last week and realized I had three accounts up for renewal in the next thirty days that I had no idea about. I only found out because I happened to open the account record for a completely different reason."` — Clara — specific-past

| Variant | Present in evidence-list? | Cited in brief? | Grade assigned |
|---|---|---|---|
| start | YES (items 2+3, split across two bullets) | YES — "specific-past" | specific-past |
| mid | YES (items 2+3, split across two bullets) | YES — "specific-past" | specific-past |
| end | YES (items 2+3, split across two bullets) | YES — "specific-past" | specific-past |

Note: all three variants split this into two separate quotes matching the transcript split. The answer key lists them as one compound line; the split-citation recovers the same content and grades it correctly. No degradation.

**Evidence 2:** `"There is nothing in Meridian that tells you 'hey, this one's expiring.'"` — Clara — product-gap / factual-absence

| Variant | Present in evidence-list? | Cited in brief? | Grade assigned |
|---|---|---|---|
| start | YES (item 4) | YES | "opinion (conviction high)" |
| mid | YES (item 4) | YES | "opinion (conviction high)" |
| end | YES (item 4) | YES | "opinion (conviction high)" |

Note: all three variants grade this as "opinion (conviction high)" rather than "product-gap / factual-absence." The answer key requires the latter. This is a judgment-grade partial miss — the line describes a factual product absence, not a speaker's feeling — but the error is **identical across all three variants** so it does not affect the positional invariance verdict. It is recorded as a uniform evidence-grade miss (see below).

**Evidence 3:** `"If I hadn't clicked in that day those accounts would have hit the end of their term with zero outreach from us. One of them was sixty thousand ARR."` — Clara — commitment (cost named)

| Variant | Present in evidence-list? | Cited in brief? | Grade assigned |
|---|---|---|---|
| start | YES (items 7+8, split) | YES — "$60k ARR" called out in brief narrative | "pain" / "specific-past"; $60k ARR item gets "specific-past" |
| mid | YES (items 6+7, split: "By accident. If I hadn't clicked…" + "One of them was sixty thousand ARR.") | YES | "pain" / "specific-past" |
| end | YES (items 7+8, split) | YES | "pain" / "specific-past" / "hypothetical-future (conviction high)" |

Note: the answer key requires this evidence be graded "commitment" because the $60k ARR names the cost. Start and mid both use "specific-past" or "pain" for the ARR item; end splits the hypothetical-future and the ARR separately. The "commitment" grade distinction is missed across all three variants uniformly — not a positional differential. Recorded as a uniform judgment-grade partial miss.

**Evidence 4:** `"I have reminders set in my personal calendar because Meridian has nothing. Half the team is doing the same. So we're papering over a product hole with personal calendar hacks."` — Clara — workaround / specific-past; "half the team" must be opinion, not fact

| Variant | Present? | "Half the team" handling |
|---|---|---|
| start | YES (items 11+12+13); "I have reminders…" cited as commitment in brief | "Half the team" marked "evidence-free claim" — CORRECT |
| mid | YES (items 10+11+12); full clause cited as commitment in brief | "Half the team" marked "evidence-free claim" — CORRECT; brief explicitly hedges ("unconfirmed beyond her own case") |
| end | YES (items 11+12+13) | "Half the team" marked "evidence-free claim" — CORRECT; brief hedges ("secondhand reports and has not been independently verified") |

All three handle the "half the team" clause correctly per the answer key: it is not laundered as confirmed fact in any variant.

**Corroboration:** `"Yeah, that's a real thing. I've heard it from a few other AMs too. Not just you."` — Prakash — secondhand

| Variant | Present? | Graded secondhand? |
|---|---|---|
| start | YES (item 10, "pain") | "specific-past" in brief — treated as secondhand in brief text ("corroborated by Prakash as affecting 'a few other AMs too'") |
| mid | YES (item 9, "pain"); brief: "specific-past (secondhand)" | Correctly flagged secondhand |
| end | YES (item 10, "evidence-free claim") | "hearsay" / "conviction moderate" — correctly secondhand |

All three flag Prakash's corroboration as secondhand, not direct evidence. No variant treats "not just you" as a confirmed count.

### Noise exclusion

All three variants correctly exclude:
- Scheduling chatter (bulk-edit review timing, Monday sync, Q2 planning retro) — not cited as evidence in any variant
- Native-mobile-app discussion — not cited as evidence in any variant
- "We should build a renewal-alert dashboard" — does not appear as a problem entry in any variant

The `self-check-verdict.md` for all three variants reports "released" with no flags on distinctness under noise.

### Mid-variant relative to start and end

The mid-run brief is **not weaker** than the start or end runs. By count:
- Start: 13 evidence items extracted, same 4 required quotes present
- Mid: 12 evidence items extracted, same 4 required quotes present
- End: 13 evidence items extracted, same 4 required quotes present

The mid-run problem entry carries identical who/circumstance/progress-sought language. The "picture" paragraph in the mid brief is the most precise of the three — it explicitly notes that "the claim [half the team] is unconfirmed beyond her own case," which is the most careful handling of the known false-positive risk. The end brief also hedges correctly; the start brief is slightly less explicit on this point. No positional degradation.

---

## Known-fps attestation

No `known-fps.md` file exists for this fixture set. The standing carve-outs noted in the answer key are:

1. **"Half the team is doing the same" false-positive risk** — the answer key notes that correctly citing the Clara turn but incorrectly grading "half the team" as fact would be a partial miss, but only a positional-invariance failure if it appears *differently* across positions. In this run: all three variants mark "Half the team" as "evidence-free claim" — uniform handling, not a differential. Attestation: **consistent across all three variants, no differential failure**.

2. **Evidence-grade partial misses (uniform)** — both "There is nothing in Meridian" (graded "opinion" instead of "product-gap / factual-absence") and the $60k ARR clause (graded "specific-past" instead of "commitment") are consistent across all three variants. These are judgment-grade issues that would require k-run evaluation; they are not positional failures. Attestation: **uniform, not a positional-invariance failure**.

---

## Invariant verdict

**PASS**

The same problem (P-RENEWAL: account managers have no proactive signal from Meridian when a renewal is approaching) and the same four required verbatim evidence lines are recovered identically across start, mid, and end. The mid variant shows no degradation relative to start or end. Noise is excluded in all three variants. The two uniform evidence-grade partial misses (product-gap vs. opinion; commitment vs. specific-past) appear identically in all three positions and do not constitute a positional-invariance failure.
