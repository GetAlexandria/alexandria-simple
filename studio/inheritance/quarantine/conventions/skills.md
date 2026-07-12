> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/skills.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# Authoring a Fabro skill

A skill is a reusable prompt template, not a Move prompt. A Move prompt is bound to one node; a skill
is pulled into many tasks. Different artifact, different rules.

Fabro uses the Agent Skills format (docs: `agents/skills.mdx`; agentskills.io): a directory with a
`SKILL.md` (YAML frontmatter + Markdown).

## Discovery
Fabro searches these directories, later overriding earlier; one level of nesting (`*/SKILL.md`):

| Directory | Scope |
|---|---|
| `~/.fabro/skills/` | global |
| `{git_root}/.fabro/skills/` | project |
| `{git_root}/skills/` | project (alternate) |

## Invocation
- User: `/skill-name <text>` → Fabro expands the template and substitutes `<text>` into
  `{{user_input}}`.
- Doer: Fabro lists skills (name + description) in the system prompt and adds a `use_skill` tool;
  the doer loads a skill by name.

Both select on the `description`.

## Rules
1. `description` is a trigger, not a summary. Write "Use when <situation>." A vague description never
   fires.
2. The body is reusable. Parameterize the variable part with `{{user_input}}`; state the procedure
   generically. If it only works in one place, make it a Move prompt instead.
3. Same runtime discipline as a Move prompt (`authoring.md`): the doer already has role, environment,
   and tools, so write only the task. Product vocabulary; self-contained; no design history.

Grade a skill that carries instruction with `grading.md`, plus the trigger quality of its
`description`.

## Shape
```markdown
---
name: <kebab-case>
description: Use when <the precise triggering situation>.
---

<Reusable procedure. Use {{user_input}} where the caller's specifics go.>
```
