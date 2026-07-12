# Agent File Format

Canonical top-level structure for Alexandria's active agent definitions in `agents/*.md`.

## Purpose

Agent files are both runtime prompt surfaces and maintainer-facing specs. They should be
easy to compare across the active roster without flattening the instructions that make each
agent distinct. This format standardizes the shared skeleton and gives unique instructions a
single consistent home.

## Required Shape

Every active agent file should use this order:

| Order | Section | Purpose | Required |
|------|---------|---------|----------|
| 0 | YAML frontmatter | Claude Code registration metadata (`name`, `description`, `tools`, `model`) | Yes |
| 1 | Identity / boundary paragraphs | Who the agent is, what it does, and what it does not do | Yes |
| 2 | `## Job Dispatch` | Which jobs the agent can run and where their procedures live | Yes |
| 3 | `## Reference Skills` | Skill files or helper references loaded on demand | Yes |
| 4 | `## Workflow` | The main operating flow for the agent's work | Yes |
| 5 | `## What You Know` | Shared library orientation and filesystem assumptions | Yes |
| 6 | `## Division of Labor` | Capability boundaries across the team and tooling | Yes |
| 7 | `## Rules` | Non-negotiable constraints and behavioral rules | Yes |
| 8 | `## Output Rules` | Response format, file-writing rules, sentinels, or machine-readable contracts | Yes |
| 9 | `## Agent-Specific Notes` | Unique heuristics or concepts that should not become bespoke top-level sections | Yes |
| 10 | `## Voice` | Tone and communication style; may end with a terminal reminder for end-of-response contracts | Yes |

## Authoring Rules

- Keep the frontmatter and identity block above the sectioned body.
- Use the shared top-level section names exactly so the five active agents are easy to diff.
- Put agent-specific concepts such as a mental model, settledness test, or read/produce
  surface under `## Agent-Specific Notes` instead of inventing a new top-level heading.
- Even when an agent has little unique guidance, keep `## Agent-Specific Notes` and say so
  briefly rather than omitting the required section.
- `## Division of Labor` should name the full active roster and any owned tool or human
  gate that materially shapes the agent's boundary.
- If an agent has an end-of-response contract whose placement matters, restate that
  reminder as the last subsection of `## Voice` instead of adding a bespoke top-level
  section.
- Internal structure may vary by agent. `## Job Dispatch` can use a table, a list, or
  job-specific subsections as long as the top-level heading is consistent.
- Preserve hard behavioral contracts when refactoring. Moving text is fine; weakening
  output requirements, job boundaries, or sentinel rules is not.
- Prefer moving existing content over inventing new prose. Add new text only when a shared
  section would otherwise be empty or misleading.

## Skeleton

```markdown
---
name: example
description: >
  ...
tools: ...
model: ...
---

You are ...

## Job Dispatch

...

## Reference Skills

...

## Workflow

...

## What You Know

...

## Division of Labor

...

## Rules

...

## Output Rules

...

## Agent-Specific Notes

...

## Voice

...
```
