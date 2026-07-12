# Capability Schema Reference

Skills declare capability requirements in frontmatter. The routing config maps these to models.

## Dimensions

| Dimension | What it measures | High example | Low example |
|-----------|-----------------|--------------|-------------|
| `adherence` | Following complex formatting/behavioral constraints against model priors | Solomon tension brief: present evidence WITHOUT classifying | Simple lint checks |
| `reasoning` | Multi-step reasoning, synthesis, or judgment under ambiguity | Raven product thinking, implementation planning | Context-briefing graph traversal |
| `precision` | Output must be structurally exact (JSONL, specific templates, arithmetic) | Solomon JSONL entries, Conan grade computation | Raven conversation |
| `volume` | Amount of output or context window pressure | Sam card creation (many cards), Conan inventory | Single-claim triage |

## Levels

Each dimension is scored `low`, `medium`, or `high`:

- **low** — The task makes minimal demands on this dimension. A fast, cheap model handles it.
- **medium** — The task needs competent handling. The default model tier is appropriate.
- **high** — The task pushes model limits on this dimension. Needs the most capable model.

## Frontmatter Format

```yaml
---
requires:
  adherence: medium
  reasoning: high
  precision: low
  volume: low
---
```

All four dimensions must be specified. Use `low` as the default when a dimension is irrelevant.

## Dimension Classes

Dimensions are split into two classes:

- **Primary** (`adherence`, `reasoning`) — measure intelligence and judgment. These drive
  model tier selection. A skill needing high adherence requires a model that can follow
  complex constraints against its priors.
- **Secondary** (`precision`, `volume`) — measure structural/throughput needs. These do NOT
  escalate the model tier on their own. A skill needing high precision but low reasoning
  (e.g., mechanical lint sweeps) runs on a cheap model.

## Routing Resolution

1. Read the skill's `requires:` block
2. Find the highest level across **primary dimensions** (adherence, reasoning)
3. Map to model via `config/model-routing.yaml` (`primary_high` → opus, etc.)
4. Apply per-skill overrides if present
5. Apply `cost_mode` adjustments

Example: `adherence: high, reasoning: medium, precision: low, volume: low`
→ primary max is `high` → opus.

Example: `adherence: low, reasoning: low, precision: high, volume: medium`
→ primary max is `low` → haiku (precision is secondary, doesn't escalate).

## Dimensions NOT Included

| Dimension | Why excluded |
|-----------|-------------|
| Context window | Handled by Claude Code's auto-upgrade behavior |
| Tool use | All current Claude models handle tool use well |
| Creativity | Not relevant — our agents follow procedures |
| Code generation | Our agents write prose and structured data, not code |
| Speed / cost | User preferences, not skill requirements — belong in routing config |
