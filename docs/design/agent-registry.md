# Agent Registry

Alexandria has three agent-related surfaces. Keep them distinct when adding an agent.

## AX Agent Model

AX's built-in runtime agent roster is product data in
`packages/ax/src/domain/agents.ts`. Project config is an override layer, not the
canonical roster.

To add a first-class agent:

1. Add the agent to `BUILT_IN_AGENTS` in `packages/ax/src/domain/agents.ts`.
2. Add any new built-in knowledge bank area ids to `KNOWLEDGE_BANK_AREA_IDS` in
   `packages/ax/src/domain/plays.ts`.
3. Add any `KNOWLEDGE_BANK_AREAS` entries owned by that agent.
4. Point any new built-in plays in `PLAY_MANIFEST` at the agent with
   `defaultAgentId`.

The event schema accepts any non-empty `agentId`; the project-state projection derives
the visible agent list from built-ins plus config overrides/custom agents. Knowledge
bank area ids and built-in play ids still come from the registry constants in
`plays.ts`. Do not add one-off `"raven"` checks for new generic behavior.

Project config may customize agents with:

- `agents.overrides.<agent-id>` to override a built-in agent's display/status/resources.
- `agents.custom[]` to add project-local agents.

`agents.roster` is legacy compatibility for projects initialized while the product
roster briefly lived in config. New project configs should not write it.

## Plugin Resources

Agent-owned runtime resources live in the Alexandria plugin payload:

- `packages/alexandria-plugin/skills/<skill-name>/SKILL.md` for skills.
- `packages/alexandria-plugin/skills/<skill-name>/references/...` for skill-specific reference material.
- `packages/alexandria-plugin/skills/<skill-name>/agents/openai.yaml` for Codex skill UI metadata.
- `packages/alexandria-plugin/workflows/<play-id>/workflow.fabro` for Fabro workflows.
- `packages/alexandria-plugin/agents/<agent-id>.md` for optional host runtime prompts.
- `packages/alexandria-plugin/agents/openai.yaml` for package-level agent interface metadata.

Keep the AX `Agent.resources` paths repo-relative to the plugin root, for example
`skills/raven-vision-drafting/SKILL.md`.

## Host Runtime Prompts

Raven and Damien both ship as host runtime prompts (`agents/raven.md`,
`agents/damien.md`) with `claudeAgentPromptPath` and `codexAgentPromptPath` set on
their `BUILT_IN_AGENTS` entries. The old `agents/raven.md` was removed in the `0.12.0`
release when the shipped payload moved to skills, event-log monitors, and Fabro
workflows; it returned as a named agent alongside `agents/raven-resources/`.

If an agent needs host-native subagent behavior, add a prompt file under
`packages/alexandria-plugin/agents/`. Claude Code consumes Markdown agent prompts from
that directory as plugin-scoped subagents, for example `alexandria:damien` and
`alexandria:raven`.

Codex currently consumes Alexandria's Codex-facing behavior through plugin skills under
`packages/alexandria-plugin/skills/`. Per-skill UI metadata lives at
`skills/<skill-name>/agents/openai.yaml`. The `Agent.resources.codexAgentPromptPath`
field is Alexandria runtime metadata until a Codex-native runtime agent adapter exists;
do not assume Codex will load `agents/<agent-id>.md` as a prompt.

## Viewer

The Playbook view uses AX runtime state: `state.agents`, `state.knowledgeBankAreas`,
and play `defaultAgentId`.

The visible bottom rail in the mounted viewer is `RavenBench`, rendered from
`LibraryBrowserShell`. It receives `state.agents` from `LibraryBrowserApp` and renders
available agents as live roster coins with shared actions. The `Knowledge Bank` action
links to `/raven/knowledge-bank`; the `Agent` action links to the placeholder
`/agents/<agent-id>` page.

`packages/viewer/src/app/agents/agent-bench.fixtures.ts` is a separate static fixture surface
for the older `ViewerShell`/Storybook agent bench.
