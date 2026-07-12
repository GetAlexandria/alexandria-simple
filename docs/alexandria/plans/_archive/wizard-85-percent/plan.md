# Wizard 85% Plan: Making the Wizard Work for Non-Systems-Thinkers

Status: **Draft**

---

## Problem

The wizard asks three questions to configure an Alexandria. The engine behind those
questions is excellent — deterministic, well-documented, and produces smart recommendations.
But the user-facing layer assumes the person answering can reason about systemic properties
of their product: ripple effects, interconnection, knowledge completeness. Roughly 85% of
people don't naturally think this way, which means the wizard's inputs are unreliable for
most users.

The engine is sound. The interface needs to meet people where they are.

## Design Principles

1. **Observable over abstract.** Replace questions that require systemic reasoning with
   questions about things people can see and count.
2. **Prime before asking.** Show the risk narrative before collecting inputs, not after.
   This gives non-systems-thinkers a concrete failure to anchor on.
3. **Infer, don't ask.** Where possible, derive systemic properties from concrete proxy
   signals rather than asking users to self-assess.
4. **Show the "why" at decision time.** Surface `when_missing` impact text during gap
   analysis self-assessment, not just in the final output.
5. **Don't touch the engine.** The tier assignment algorithm, sensitivity profiles, and
   scoring math are correct and locked. All changes are in the interface layer (SKILL.md,
   wizard-engine.yaml question text, and phase-6-intake-engine.md solicitation flow).

---

## Changes

### Change 1: Move Risk Narrative Before Questions

**File:** `skills/wizard/SKILL.md` (Step 1)

**Current flow:**
1. Ask Q1 (AI Mode)
2. Ask Q2 (Domain Novelty)
3. Ask Q3 (Product Complexity)
4. Show risk narrative in output

**New flow:**
1. Ask Q1 (AI Mode)
2. Show the mode's risk narrative immediately — "Here's the specific risk at your mode..."
3. Ask Q2 (Domain Novelty)
4. Ask Q3 (Product Complexity)

**Why:** The risk narrative is the best systems-thinking primer in the whole wizard. "Silent
wrong defaults — hundreds of autonomous micro-decisions that cumulatively define the
experience" tells a non-systems-thinker *exactly* what failure looks like. Showing it before
Q2 and Q3 primes more thoughtful answers to questions about novelty and complexity, because
the user now has a concrete failure scenario to reason against.

**Why after Q1 and not before:** The risk narrative is mode-specific. You need the mode
answer first to select the right narrative. And Q1 (AI Mode) is the question least affected
by systems thinking — it's about team structure, which people can observe directly.

**Scope:** Reorder Steps 1-2 in SKILL.md. No engine changes. No YAML changes (narratives
already exist in `mode_narratives`).

---

### Change 2: Replace Q3 (Complexity) With Observable Proxy Signals

**Files:** `skills/wizard/SKILL.md` (Step 1), `docs/wizard/wizard-engine.yaml` (questions section)

**Current Q3:**
> "When you make a product decision about one feature, how many other features does it
> typically affect?"

This directly asks for systems reasoning — trace ripple effects across features. People who
don't think in systems will systematically underestimate this and answer "Low."

**New Q3 — a checklist of observable complexity signals:**

> "Which of these are true about your product? (Check all that apply)"
>
> - Features share data or state (e.g., a user's action in one area shows up in another)
> - The product has invisible mechanisms: scoring, recommendations, matching, progression
> - Permissions or roles change what people see or can do
> - There are workflows that span multiple screens or features
> - Changing one feature's rules has broken or surprised another feature before
> - The product has an internal economy, points, or resource system
>
> **Mapping:**
> - 0-1 checked → Low complexity
> - 2-3 checked → Moderate complexity
> - 4+ checked → High complexity

**Why this works for the 85%:** Each item is binary and observable. You either have a
recommendation engine or you don't. You either have permissions or you don't. No one needs
to trace ripple effects — the checklist does the systems thinking for them.

**Why the mapping works:** Each signal is a known source of cross-feature coupling. Products
with 4+ of these are structurally interconnected whether the team knows it or not. The
checklist is an operationalization of "how interconnected is your product" that doesn't
require the user to understand interconnection.

**Scope:** Update Q3 in SKILL.md (presentation and mapping logic). Update the `questions`
section in wizard-engine.yaml (new question text, options, guidance). Add a mapping rule to
SKILL.md that converts checklist count to Low/Moderate/High before passing to the engine.
Engine itself is unchanged — it still receives Low/Moderate/High.

---

### Change 3: Add Disambiguation Bumps to Q2 (Novelty)

**Files:** `skills/wizard/SKILL.md` (Step 1), `docs/wizard/wizard-engine.yaml` (questions section)

**Current Q2** is already pretty good — "would someone from your industry correctly guess
what using it feels like?" is grounded in external perception. But the disambiguation
prompts could be stronger for people who default to "we're unique" (everyone thinks their
product is novel) or "we're normal" (impostor syndrome about novelty).

**Add directional bumps:**

After the user answers, apply a sanity check:

> **If the user said Low:**
> "Quick check — when you onboard a new team member, how long before they stop saying
> 'oh, I assumed it would work like [familiar product]'? If that's more than a week,
> you might be Moderate."
>
> **If the user said High:**
> "Quick check — do you have any direct competitors, even bad ones? If yes, your
> domain has a category forming — you might be Moderate."

**Why:** These are gentle nudges toward the middle, which is where most miscalibrated
answers should land. They use observable signals (onboarding time, competitor existence)
rather than asking the user to re-evaluate their abstract self-assessment.

**Scope:** Add disambiguation bump logic to SKILL.md Step 1. Update guidance text in
wizard-engine.yaml. No engine changes.

---

### Change 4: Surface "When Missing" Text During Gap Analysis Self-Assessment

**File:** `skills/wizard/SKILL.md` (Step 5b)

**Current Step 5b** asks teams to self-assess knowledge completeness:

> For each area, what's your current state?
> - Absent / Partial / Robust

(Note: renamed from "Present" to "Robust" — "Present" sets too low a bar. If you have
*any* documentation, something is technically "present." "Robust" implies the area is
adequately covered, which is the actual threshold we care about.)

The problem: non-systems-thinkers will say "Robust" for areas where they have *some*
documentation but don't realize it's incomplete relative to what the area actually covers.
They don't know what they don't know.

**New Step 5b** — show the `when_missing` text alongside each area during declaration:

> | # | Area | What Goes Wrong Without It | Your Status |
> |---|------|---------------------------|-------------|
> | 1.1 | Product Vision | "Builders fill the vacuum with their own assumptions..." | ? |
> | 1.2 | Product Strategy | "Every feature feels equally important..." | ? |

**Why:** The `when_missing` text gives the user a concrete failure to check against. Instead
of asking "do you have Product Strategy documented?" (which invites "yeah, we have a doc
somewhere"), it asks implicitly: "does 'every feature feels equally important' happen to your
team? If so, your documentation isn't working." This turns an abstract completeness question
into a concrete symptom check.

**Scope:** Modify the presentation format in SKILL.md Step 5b. The `when_missing` text
already exists in wizard-engine.yaml — just surface it earlier. No engine or scoring changes.

---

### Change 5: Add "Does This Sound Familiar?" Confirmation After Configuration

**File:** `skills/wizard/SKILL.md` (Step 4)

**Current Step 4** presents the configuration summary and asks if the user wants gap analysis.

**Add a confirmation signal** between the summary and the gap analysis prompt:

> **Does this ring true?** Look at your Foundation areas. If you've seen the problems
> described in "Why It Matters" happen on your team, the configuration is well-calibrated.
> If those problems sound unfamiliar, your answers to the three questions may need
> adjusting — say "reconfigure" to go back.

**Why:** This gives the user an empirical check on the wizard's output. Non-systems-thinkers
may have answered Q3 incorrectly, but they *can* recognize symptoms when they see them. If
the Foundation areas describe problems they've never experienced, something is miscalibrated.
This is cheaper than getting it wrong and discovering it during gap analysis.

**Scope:** Add confirmation text and reconfigure flow to SKILL.md Step 4. No engine changes.

---

## What's NOT Changing

- **The engine algorithm** (tier assignment, sensitivity profiles, overrides, scoring)
- **The 22 knowledge areas** (catalog is locked)
- **Pool membership rules** (which areas appear at which mode)
- **Configuration tables** (all 36 locked configurations)
- **Foundation assignments** (locked per mode)
- **Output format** (wizard-output.md, wizard-config.json, assessment.md)
- **Solicitation prompts** (phase-6 content)

This is a pure interface-layer refactor. The engine's systems thinking is preserved; the
user-facing layer is rebuilt to not require it.

---

## Implementation Order

1. **Change 1** (risk narrative before questions) — smallest diff, biggest priming effect
2. **Change 2** (Q3 checklist) — highest impact, most design work
3. **Change 4** (when_missing during gap analysis) — high impact, small diff
4. **Change 3** (Q2 disambiguation bumps) — moderate impact, small diff
5. **Change 5** (confirmation signal) — polish, small diff

Changes 1, 3, 4, and 5 are independent and could be implemented in parallel.
Change 2 requires the most care — the checklist items and mapping thresholds need
to produce results consistent with the existing 36 configuration tables.

---

## Testing

- **QA wizard test suite** (`tests/qa-wizard.sh`) — all existing tests must pass unchanged,
  since the engine isn't changing
- **Manual walkthrough** — run the wizard with the new interface against a known product
  and verify the three-question flow feels natural
- **Calibration check for Change 2** — take 3-5 real products where the team knows
  the "right" complexity answer and verify the checklist mapping produces it
- **Regression** — verify all 36 configuration tables still produce identical tier
  assignments (engine is untouched, but belt-and-suspenders)
