> **Inherited record — QUARANTINED graph-era convention; re-verify before any use.** Copied verbatim from `conductor-playground-fabro-experiment@62ddfad:alexandria-port/conventions/README.md` on 2026-06-12 (Studio migration). Provenance header added; content untouched.

# The Play Factory Standard

The rules for the artifacts inside a Play (a Fabro `workflow`): Move prompts, skills, nodes, and the
`.fabro` graph that realizes it. One Standard, one set of measures, so prompts do not vary by author.

Grounded in how Fabro runs a prompt (docs under `docs/public/` in the Fabro repo), not in any prior
card system. Core rule: a Move prompt is only the task left after Fabro supplies role, environment,
goal, tools, and prior-stage summaries — see `authoring.md`.

Scope: `alexandria-port/` only. Nothing here promotes to Alexandria Standard cards.

## Files
| File | Use |
|---|---|
| `authoring.md` | write a Move prompt; frontmatter schema |
| `grading.md` | six-dimension rubric; ≥ A- gate |
| `skills.md` | write a skill (Agent Skills format — a different artifact) |
| `lint.md` | deterministic checks: frontmatter, label↔edge, validate/dry-run |
| `migration-strategy.md` | when a Move becomes software vs stays a skill |
| `worked-example.md` | the rubric + lint run on real prompts |

## Levels and gates
One check per level.

| Level | Unit | Gate |
|---|---|---|
| Prompt | a `@prompts/*.md` Move prompt | `grading.md` rubric (SK) — ≥ A- |
| Node | the DOT binding (shape/backend/attrs/edges) | `lint.md` (deterministic), incl. label↔edge |
| Workflow | the `.fabro` graph | `fabro validate` + dry-run + structural lint |

- Workflow checks are deterministic. Do not build an agentic grader for what `fabro validate` proves.
- SW nodes (`script="ax …"`) are graded by tests, not the rubric.

## Decisions
1. Gate = mean ≥ 3.50 (A-).
2. One check per level; software nodes graded by tests.
3. Home = `alexandria-port/` only.
4. Software where deterministic, skill where blurry (`migration-strategy.md`).
5. Product vocabulary throughout: Move, Play (workflow), Skill/Software, Human-Role, doer, Plane, Area, Card, Type.

## Bootstrap
When these are trusted, wrap them in a Play that authors and grades Move prompts, then regenerate a
target Play's prompts. Seed by hand first; do not wrap a moving Standard in a loop.
