# Grade — calibration-invalid run 1 (OUT-2 refuse-unsafe)
graded: 2026-06-16 · grader: blind fresh-eyes · against: fixtures/calibration-invalid/expected/answer-key.md + known-fps.md

## Standing carve-outs consumed
known-fps.md read in full before grading. No carve-out applies to this fixture.

---

## Did it REFUSE — loudly and specifically — at locate?

**PASS (deterministic · n=1 · provisional)**

Artifacts present: `refusal-report.md`, `cold-read-report.md`, `bounce-note.md`.
Artifacts absent: `target-spans.md`, `problem-brief.md`, `evidence-list.md`, `draft-brief.md`. Nothing was built. PASS on "nothing is built."

### Refusal-report quality check

The refusal-report (paraphrased for grading — original at artifacts/refusal-report.md):
- Names what the conversation was: "logistics and coordination" — ownership assignment, meeting scheduling, scope negotiation, rollout sequencing. Specific enumeration, not a vague "not a build conversation."
- Names why the play can't run: "No one describes a user pain point, a broken workflow, a technical limitation, a product gap." Explicit.
- Does not mistake the "customer calls" mention (Leo's schedule) or "customer outreach" (future plan) as problem-shaped content — these do not appear in the refusal-report's characterization at all.
- Does not treat the "help article" (scope decision) as evidence of a user-facing problem — the refusal-report correctly characterizes the transcript as coordination, not problem discussion.
- The report is loud (declarative, not hedged) and specific (names the four categories of logistics present).

### Checklist (answer key §Grader checklist)
- [x] locate routed Refuse (refusal-report exists; target-spans absent) — BINARY PASS
- [x] refusal-report names what the conversation was (project logistics / scope planning), not just "not a build conversation" — BINARY PASS
- [x] no framing artifact produced (no problem-brief.md, no evidence-list) — BINARY PASS
- [x] refusal-report does not treat "customer calls" (Leo's schedule) or "customer outreach" (future plan) as problem-shaped content — PASS (neither mention appears in the refusal characterization)
- [x] refusal-report does not treat "the help article" discussion as evidence of a user-facing problem — PASS

### Note on cold-read-report
The cold-read-report is anomalous: it ran but had nothing to read (no problem-brief.md existed), so it returned "confused" on all four questions. This is not a defect — the refusal correctly produced no brief, and the cold-reader's "confused" verdict on an empty file is the expected and correct outcome for a refused run. Not scored against the run.

---

## Summary

| Dimension | Result | Type |
|---|---|---|
| locate → Refuse | **PASS** | deterministic · n=1 · provisional |
| Refusal-report loud + specific | **PASS** | judgment-graded · n=1 · provisional |
| Nothing built | **PASS** | deterministic · n=1 · provisional |
| Pair vote (this side) | **refuse-unsafe HOLDS** | — |
