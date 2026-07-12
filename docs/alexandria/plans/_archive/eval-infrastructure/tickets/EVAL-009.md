---
id: EVAL-009
title: "Seed fixtures with sample cards for Release 2"
outcome: Context library fixtures ready for implementation planning evals
tier: must
enabler: false
blocked-by: [EVAL-008]
blocks: []
cards: []
---

## Motivation

Release 2 (implementation planning) needs context libraries with actual cards — not
just wizard config, but product knowledge that Conan can assemble into a context
briefing. The wizard eval runs produce wizard output but no cards. This ticket seeds
each fixture with enough cards to support realistic planning conversations.

## Description

For each of the three wizard eval outputs, create a small set of context library cards
that represent a partially-built library. These become the test fixtures for Release 2.

**Fixture A: "TaskFlow" (from Factory × High × High eval)**

A simple task management product. Seed ~8-10 cards:
- Product Vision (1.1) — what TaskFlow is
- Product Strategy (1.2) — bets on real-time collaboration + AI assistance
- User Personas (1.3) — project managers, team leads
- Noun Vocabulary (2.2) — tasks, boards, sprints, assignments
- Product Entities (2.3) — Task, Board, Sprint, User, Team
- User Journey Maps (3.1) — daily standup flow, task creation flow
- Emotional Goals (3.2) — "calm productivity, not frantic urgency"
- Design System (4.1) — basic component list
- Roadmap (5.3) — Q2 plans

**Fixture B: "Blank Slate" (from No/Low AI × Low × Low eval)**

No cards — just the wizard config. Tests implementation planning with minimal context.

**Fixture C: "MediConnect" (from Pair Programmer × High × Moderate eval)**

A healthcare coordination platform. Seed ~12-15 cards:
- Product Vision (1.1) — what MediConnect is
- User Personas (1.3) — clinicians, patients, administrators
- Noun Vocabulary (2.2) — appointments, referrals, care plans, providers
- Product Entities (2.3) — Patient, Provider, Appointment, Referral, CarePlan
- Information Architecture (2.1) — dashboard, patient view, scheduling
- User Journey Maps (3.1) — patient booking flow, referral handoff
- Anti-Patterns (3.5) — "We are NOT an EHR"
- Engagement Loops (3.3) — appointment reminders, follow-up nudges
- Design System (4.1) — accessibility-focused components
- Key Decisions (5.1) — HIPAA compliance approach, data residency
- Roadmap (5.3) — Q2 telemedicine integration

**Card format:** Follow the existing context library card format (WHAT/WHERE/WHY/WHEN/HOW
sections with wikilinks). Cards should be realistic enough that Conan could produce a
meaningful context briefing from them.

**Fixture directory structure:**

```
tests/fixtures/
  taskflow/
    docs/alexandria/
      wizard-config.json      # from eval run
      wizard-output.md        # from eval run
      assessment.md           # from eval run
      cards/
        Product Vision - TaskFlow.md
        Product Entities - Task.md
        ...
  blank-slate/
    docs/alexandria/
      wizard-config.json
      wizard-output.md
      assessment.md
  mediconnect/
    docs/alexandria/
      wizard-config.json
      wizard-output.md
      assessment.md
      cards/
        Product Vision - MediConnect.md
        User Personas - Clinician.md
        ...
```

## Acceptance Criteria

- [ ] Three fixture directories created under `tests/fixtures/`
- [ ] Each fixture contains wizard eval output (copied from eval runs)
- [ ] TaskFlow has 8-10 realistic cards
- [ ] Blank Slate has wizard config only, no cards
- [ ] MediConnect has 12-15 realistic cards including regulatory context
- [ ] Cards follow the standard format (WHAT/WHERE/WHY/WHEN/HOW)
- [ ] Cards use wikilinks to reference each other
- [ ] A basic smoke test: Conan can read the fixture and produce a context briefing

## Implementation Notes

- Cards don't need to be perfect — they need to be realistic enough that the
  implementation planning skill has something meaningful to work with
- MediConnect should include some regulatory/compliance cards to exercise the
  risk and assumption identification during planning
- The blank-slate fixture is deliberately empty to test graceful degradation
- These fixtures will be reused across many future eval cases, so invest in
  making them coherent (cards should reference each other, not be isolated)
