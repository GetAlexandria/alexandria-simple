# Plan: Eval Signposts in Skill Files

## Context

When iterating on skills, developers need to know eval cases exist so they can update them alongside the skill change. Currently, skill files and eval cases are completely disconnected — you'd have to know to look in `tests/eval-cases/` on your own. This plan adds a signpost section to each skill's primary entry file pointing to its eval cases.

**Rule:** Signposts are added only when eval cases exist. No "coming soon" placeholders.

## Format

Add to the bottom of each skill's primary entry file:

```markdown
## Eval Coverage
<!-- Keep in sync: when changing this skill, update or add eval cases -->
- **Cases:** `tests/eval-cases/<skill>/<case-name>/`
- **Run:** `./tests/run-eval.sh <skill>/<case-name>`
```

For skills with multiple eval cases, list each case on its own line.

## Skill File → Eval Case Map

| Agent | Primary Skill File | Eval Case Directory | Status |
|-------|-------------------|-------------------|--------|
| Wizard | `skills/wizard/SKILL.md` | `tests/eval-cases/wizard/` | Evals exist — add signpost now |
| Impl Planning | `skills/implementation-planning/SKILL.md` | `tests/eval-cases/implementation-planning/` | Evals exist (impl branch) — add signpost when branch lands |
| Nit | `skills/nit/sweeps.md` | `tests/eval-cases/nit/` | Add signpost when EVAL-001 completes |
| Sam | `skills/sam/card-creation.md` | `tests/eval-cases/sam/` | Add signpost when EVAL-002 completes |
| Conan | `skills/conan/job-grade.md` | `tests/eval-cases/conan/grade/` | Add signpost when EVAL-003 completes |
| Conan | `skills/conan/job-inventory.md` | `tests/eval-cases/conan/inventory/` | Add signpost when EVAL-004 completes |
| Conan | `skills/conan/job-surgery.md` | `tests/eval-cases/conan/surgery/` | Add signpost when EVAL-005 completes |
| Bridget | `skills/context-briefing/SKILL.md` | `tests/eval-cases/bridget/` | Add signpost when EVAL-006 completes |
| Solomon | `skills/solomon/job-signal-triage.md` | `tests/eval-cases/solomon/` | Add signpost when EVAL-008 completes |
| Raven | `skills/raven/job-product-conversation.md` | `tests/eval-cases/raven/` | Add signpost when EVAL-009 completes |

## Immediate Action

The wizard skill already has eval cases. Add the signpost now.

## Ongoing Rule

Any agent completing an EVAL ticket adds the signpost to the corresponding skill file as the final step before marking the ticket done.
