---
id: IMPL-011
title: "Ticket format options + config persistence"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-009]
blocks: []
cards: []
---

## Motivation

Different teams prefer different ticket formats. The skill should ask once, remember
the preference, and confirm on subsequent runs — not force a choice every time.

## Description

Implement the configurable ticket format system:

**Four format options:**
- **Minimal** — title, description, acceptance criteria
- **Standard** — adds motivation, context, implementation notes
- **BDD** — adds Gherkin scenarios as acceptance criteria
- **Custom** — user provides a template file with `{{placeholders}}`

**First run behavior:**
If no `implementation_planning` section exists in `wizard-config.json`, the skill
presents the options and asks the user to choose. Saves the choice:

```json
{
  "implementation_planning": {
    "ticket_format": "standard",
    "custom_template": null,
    "output_dir": "docs/implementation-plans"
  }
}
```

**Subsequent run behavior:**
Reads the saved format and confirms: "Using **Standard** ticket format (from your
config). Want to change it?"

**Custom template:**
The user points to a markdown file with `{{placeholders}}`:
- `{{frontmatter}}`, `{{motivation}}`, `{{description}}`, `{{context}}`
- `{{acceptance_criteria}}`, `{{implementation_notes}}`, `{{dependencies}}`

The skill fills in the placeholders using the same information it would use for
any format.

## Acceptance Criteria

- [ ] All four format options produce well-formed tickets
- [ ] Format preference saved to `wizard-config.json`
- [ ] Subsequent runs read config and confirm with user
- [ ] User can override format per-run
- [ ] Custom template with placeholders works
- [ ] Missing custom template file produces a helpful error
- [ ] `output_dir` config respected (default: `docs/implementation-plans`)

## Implementation Notes

- The format affects ticket body only, not frontmatter (frontmatter is always the same)
- The skill already produces ticket content during decomposition (Step 5) — the format
  just determines how that content is arranged in the markdown body
- Test all four formats in the eval cases (or at least Standard + one other)
