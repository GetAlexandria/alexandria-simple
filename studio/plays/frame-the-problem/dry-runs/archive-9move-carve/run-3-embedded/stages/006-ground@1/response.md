

I need to read the input files to perform the mechanical checks. Let me start by reading all the required files in parallel.No bounce-note exists yet — this is the first ground pass. Now I run the seven checks mechanically.

**Check 1 — Verbatim quotes**

I need to verify each quoted string against the transcript, with whitespace normalized (all runs of spaces/line-breaks collapsed to one space).

Transcript normalized excerpts for comparison:

1. Brief: `"Every time I'm doing research I end up with like forty tabs, and by the time I sit down to do a conversion session I can't remember which tab had the thing."`
   Transcript (lines 17-19, joined): `"Every time I'm doing research I end up with like forty tabs, and by the time I sit down to do a conversion session I can't remember which tab had the thing."`
   — **PASS**

2. Brief: `"So stuff just never makes it in."`
   Transcript (line 19): `"So stuff just never makes it in."`
   — **PASS**

3. Brief: `"Half my best source material dies in tabs."`
   Transcript (lines 19-20): `"Half my best source material dies in tabs."`
   — **PASS**

4. Brief: `"That's real, I've watched you do it."`
   Transcript (line 22): `"That's real, I've watched you do it."`
   — **PASS**

5. Brief: `"The point is capture-in-the-moment instead of capture-from-memory."`
   Transcript (lines 36-37): `"The point is capture-in-the-moment instead of capture-from-memory."`
   — **PASS**

6. Brief: `"directors keep telling us they don't know what's already in the library, so they re-add things."`
   Transcript (lines 24-25): `"directors keep telling us they don't know what's already in the library, so they re-add things."`
   — **PASS**

7. Brief: `"That's a different thing though. That's search."`
   Transcript (line 28): `"That's a different thing though. That's search."`
   — **PASS**

8. Brief: `"It's all the same thing, it's the extension!"`
   Transcript (line 30): `"It's all the same thing, it's the extension!"`
   — **PASS**

9. Brief: `"every director has this problem, literally all of them, I'd bet anything."`
   Transcript (lines 30-31): `"every director has this problem, literally all of them, I'd bet anything."`
   — **PASS**

All quotes verified verbatim.

**Check 2 — Cited context**

The brief cites:
- `users.md` (line 11: "confirmed in `users.md`", line 34: "confirmed in `users.md`") — file exists at the provided path. **PASS**
- `surface map` (line 25: "the surface map names", line 43: "Maps to the surface map's") — file exists at the provided path. **PASS**
- No citation to a prior brief. **PASS**

No citation to a file that wasn't provided.

**Check 3 — Coverage header**

Brief header (line 3): `framed with: surface map [provided] · users [provided] · prior brief [not provided]`

Input files supplied: surface-map.md (provided), users.md (provided), prior-brief ("" — not provided).

Set comparison:
- surface map: provided in header, provided in inputs — **match**
- users: provided in header, provided in inputs — **match**
- prior brief: not provided in header, not provided in inputs — **match**

Both directions covered, no extra or missing. **PASS**

**Check 4 — Required fields**

Problem 1: title (line 7) ✓, progress sought (line 9) ✓, who (line 11) ✓, circumstance (line 13) ✓, evidence with grades (lines 17-21) ✓, "what it's not" (line 23) ✓, where-it-lands (line 25) ✓. **PASS**

Problem 2: title (line 29) ✓, progress sought (line 31) ✓, who (line 33) ✓, circumstance (line 35) ✓, evidence with grades (line 39) ✓, "what it's not" (line 41) ✓, where-it-lands (line 43) ✓. **PASS**

Unclear section: present (lines 47-51) ✓.

Relationships section: present (lines 55-59) with edges. **PASS**

Hunch: present (lines 63-65). **PASS**

Insight field: The brief uses "What it's not" as the insight-adjacent field per entry. Both entries have it. **PASS**

**Check 5 — Sizing lexicon**

Scanning all non-quoted text in the brief for forbidden words: "quick," "cheap," "easy," "small," "sprint," "weeks," "months," "first," "next."

Scanning... No instances of "quick", "cheap", "easy", "small", "sprint", "weeks", "months" found in the brief's own text (outside quotes).

"first" — not found in brief's own text.
"next" — not found in brief's own text.

**PASS**

**Check 6 — Hunch rules**

The brief states (line 65): `None earned.` — the hunch is labeled as absent. The justification: the relationship between P1 and P2 is disputed (Maya vs DEV), and the hunch claims no edge.

Checking: Does the hunch claim any edge the Relationships section marks disputed? The hunch says "None earned" — it claims nothing. **PASS**

Checking: Is any disputed edge promoted to a plain edge elsewhere? The Relationships section has two entries:
- P1 ↔ P2: **sibling** — this is a plain edge. It asserts they are distinct and attackable separately.
- P1 → P2 bundling: **disputed** — Maya vs DEV.

The sibling edge and the disputed bundling edge are about different claims. The sibling edge says they are distinct problems (which both Maya and DEV would agree exists as separate failure modes — the dispute is whether they share a root, not whether they exist separately). The disputed edge is about whether they are "the same thing." These are compatible: two things can be siblings (both real, both distinct) while the question of shared root is disputed. The sibling edge does not promote the disputed claim. **PASS**

**Check 7 — Re-run accounting**

No prior brief was provided. This check is not applicable. **PASS (N/A)**

---

All checks pass. I will now write `runtime/annotated-brief.md`.All seven checks passed. Summary of findings:

1. **Verbatim quotes** — all 9 quotes verified character-exact against the transcript (whitespace-normalized). No drift.
2. **Cited context** — `users.md` and surface map both cited and both provided. No citation to an absent file.
3. **Coverage header** — `surface map [provided] · users [provided] · prior brief [not provided]` matches the input set in both directions.
4. **Required fields** — both entries carry title, progress sought, who, circumstance, evidence with grades, insight ("what it's not"), and where-it-lands.
5. **Sizing lexicon** — no forbidden words ("quick," "cheap," "easy," "small," "sprint," "weeks," "months," "first," "next") found in the brief's own text.
6. **Hunch rules** — "None earned" is labeled; no edge claimed; no disputed edge promoted to plain.
7. **Re-run accounting** — not applicable (no prior brief provided).

`runtime/annotated-brief.md` written with per-entry `checks: pass` and header attestation.

```json
{"preferred_next_label": "Pass"}
```