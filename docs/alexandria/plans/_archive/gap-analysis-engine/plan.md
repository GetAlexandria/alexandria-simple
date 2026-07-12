# Gap Analysis Engine — Project Plan

**Issue:** #5
**Goal:** Build the intake engine that collects a team's existing knowledge state, scores gaps
against wizard recommendations, and produces a prioritized seeding sequence.

**Depends on:** Wizard configuration engine (issue #3, done)
**Feeds into:** Solicitation & output layer (issue #7)

---

## Context

The wizard (skills/wizard/) currently asks three questions and produces tier assignments for
each knowledge area. But it doesn't know what the team already has. The gap analysis engine
closes that loop: it compares wizard recommendations against existing knowledge and tells
the team exactly what to seed, in what order, and why.

The full spec lives in `docs/wizard/phase-6-intake-engine.md`. The JSON contract is in
`docs/wizard/wizard-schema.json` (the `intake` and `gap_analysis` sections).

---

## Implementation

### Step 1: Extend the wizard skill with a gap analysis pass

Add a new section to `skills/wizard/SKILL.md` (or a separate intake skill) that runs after
the wizard configuration. The flow:

1. Load the wizard output (`wizard-config.json` from the target project)
2. For each area in the pool, ask the user: Status (Absent/Partial/Present) and Freshness
   (Fresh/Stale/Unknown)
3. Score each area using the gap scoring algorithm
4. Sequence the results
5. Write machine-readable output

**Decision: single skill or separate skill?**
Make this a separate step within the existing wizard skill. The wizard SKILL.md already has
Steps 1-4. Add a Step 5 ("Gap Analysis") that can run immediately after configuration or
be invoked later against an existing `wizard-config.json`. This keeps the wizard as one
cohesive skill while allowing the gap analysis to run independently.

### Step 2: Knowledge declaration interaction (Phase B)

The interactive collection. For each area in the pool (ordered by tier, foundation first):

- Present the area name, domain, and a one-line description
- Ask: "Do you have this documented? (Absent / Partial / Present)"
- If Partial or Present, ask: "How current is it? (Fresh / Stale / Unknown)"
- Optional: collect free-text notes

**Efficiency:** Areas can be batched by domain (Strategy, Structure, Experience, Implementation,
History) to reduce context switching. Allow the user to declare "all absent" or "all present"
for a domain as a shortcut.

**Default:** Undeclared areas → Absent / Unknown.

### Step 3: Gap scoring algorithm (Phase C)

Implement the scoring formula from the spec:

```
if status == present:
    priority_score = tier_weight × freshness_penalty
else:
    priority_score = tier_weight × gap_severity

tier_weight:     foundation=1.0, core=0.75, amplifier=0.5, deprioritized=0.25
gap_severity:    absent=1.0, partial=0.6
freshness_penalty (present only): stale=0.4, unknown=0.2, fresh=0.0
```

Special cases:
- Partial + Stale: treat as Partial (severity 0.6), ignore freshness

Action assignment:
- Absent → "create"
- Partial → "update"
- Present + Stale → "refresh"
- Present + Unknown → "refresh"
- Present + Fresh → "none"

### Step 4: Sequencing algorithm (Phase D)

Sort all scored areas:
1. Priority score descending
2. Tier rank ascending (foundation=0, core=1, amplifier=2, deprioritized=3)
3. Catalog order ascending (1.1 before 1.2, etc.)

Group into phases:
- Phase 1: Foundation gaps (action != none)
- Phase 2: Core gaps (action != none)
- Phase 3: Amplifier gaps (action != none)
- Phase 3b: Deprioritized gaps (action != none)
- Phase 4: Already covered (action == none)

### Step 5: Write output

Extend the existing `docs/alexandria/wizard-config.json` to adopt the full schema
shape from `wizard-schema.json`. The wizard currently writes `inputs`, `pool_size`,
`distribution`, and `areas` at the top level; the gap analysis adds `intake` (the knowledge
declarations) and `gap_analysis` (scores, sequence, summary) as sibling top-level properties
in the same file:

```json
{
  "inputs": { ... },
  "pool_size": 18,
  "distribution": { ... },
  "areas": [ ... ],
  "intake": {
    "existing_knowledge": [...]
  },
  "gap_analysis": {
    "gaps": [...],
    "sequence": [...],
    "summary": {
      "total_areas": N,
      "gaps_to_fill": N,
      "areas_to_refresh": N,
      "areas_complete": N
    }
  }
}
```

One file, one schema — no separate `gap-analysis.json`. This matches the `wizard-schema.json`
contract where `intake` and `gap_analysis` are top-level properties alongside `inputs`,
`pool_size`, `distribution`, and `areas`.

### Step 6: Present summary

Display a concise summary:
```
Gap analysis complete: [Mode] × [Novelty] × [Complexity]
Pool: [N] areas | [G] gaps, [R] to refresh, [C] complete

Foundation gaps (seed first):
- [list with scores]

Core gaps (seed after foundation):
- [list with scores]

[Warning if foundation gaps exist alongside present core areas]

Full results: docs/alexandria/wizard-config.json
```

---

## Edge Cases

From the spec — all must be handled and tested:

1. **Empty declaration** — all areas scored as Absent. Output = wizard recommendation as
   seeding sequence.
2. **Everything present and fresh** — clean bill of health message, suggest refresh schedule.
3. **Foundation gaps with present Core** — explicit warning about potential inconsistency.
4. **Declarations outside pool** — ignore gracefully.
5. **Partial + Stale** — treat as Partial (severity 0.6, not freshness path).

---

## QA Plan

### Scoring verification
Pick 5-6 representative area/status combinations and verify scores by hand:
- Absent Foundation → 1.0 × 1.0 = 1.0
- Partial Core → 0.75 × 0.6 = 0.45
- Stale Present Amplifier → 0.5 × 0.4 = 0.20
- Fresh Present anything → 0.0
- Absent Deprioritized → 0.25 × 1.0 = 0.25

### Sequencing verification
- Confirm Foundation gaps always sort before Core gaps at same score
- Confirm catalog order tiebreaker within same tier and score

### Edge case testing
- Run with empty declaration → verify all areas appear as Absent
- Run with all-present-fresh → verify clean bill of health
- Run with Foundation absent + Core present → verify warning
- Declare area outside pool → verify it's ignored

### Integration
- Run full wizard flow (3 questions → config → gap analysis) end-to-end
- Verify `wizard-config.json` gap_analysis section validates against `wizard-schema.json`
- Verify output is consumable by issue #7 (solicitation layer)

---

## Files to Create/Modify

- `skills/wizard/SKILL.md` — add gap analysis step (Step 5)
- `skills/wizard/engine.md` — add gap scoring + sequencing algorithm section
- `tests/qa-gap-analysis.sh` — QA test suite (matches qa-wizard.sh pattern)

---

## Status

- [x] Plan reviewed
- [x] Step 1: Skill structure decided — added as Step 5 in existing wizard skill
- [x] Step 2: Knowledge declaration interaction — domain-batched collection in SKILL.md
- [x] Step 3: Gap scoring algorithm — in engine.md
- [x] Step 4: Sequencing algorithm — in engine.md
- [x] Step 5: JSON output — extends wizard-config.json with intake + gap_analysis
- [x] Step 6: Summary presentation — in SKILL.md (gap + clean bill of health variants)
- [x] QA: scoring verification — in qa-gap-analysis.sh
- [x] QA: sequencing verification — in qa-gap-analysis.sh
- [x] QA: edge cases — in qa-gap-analysis.sh
- [ ] QA: integration test — run qa-gap-analysis.sh against live plugin
