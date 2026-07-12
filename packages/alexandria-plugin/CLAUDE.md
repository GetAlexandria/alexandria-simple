# Alexandria Plugin Guidance

This package contains the Alexandria plugin payload. Alexandria is organized
around plays: the plugin owns the guided play behavior, and the other packages
serve that play contract.

## Product Surfaces

Alexandria consists of the following surfaces:

- Playbook: play definitions and guided workflows (i.e., SKILL.md, agent files, etc)
- Context graph: library artifacts and card outputs
- CLI: deterministic code for play execution
- Ledger: structured log of all events
- Triggers: programmatic conditions which trigger a play
- Docs: documentation for Alexandria's various pieces
- Viewer: a web app which visualizes everything else
- Evals: eval suite for the plays to guarantee they work well
- Plugin packaging: bundling up the plugin for release with various harness support

## Source Of Truth

- This plugin owns the playbook.
- The docs package owns durable playbook prose.
- CLI support implements deterministic parts of the play and may be exposed as tools for the agent running the play.
- Viewer support exposes play state, docs, ledger history, and outputs.
- Evals test the guided and agent-mediated play behavior.

## State And History

- Persistent project config lives at
  `./.alexandria/alexandria-config.json`.
- The config points to the Alexandria workspace, which defaults to
  `./docs/alexandria`.
- Play state belongs inside `alexandria-config.json`.
- Append-only play history belongs in the configured Alexandria workspace,
  provisionally at `docs/alexandria/ledger/events.jsonl`.
- Do not create per-feature config JSON files unless that pattern is explicitly
  re-approved.

## Release And Versioning

Alexandria replaced the old plugin line in version `0.12.0`.

Keep this package's `package.json` and `.claude-plugin/plugin.json` aligned when
the plugin version changes.

## Implementation Workflow

- Validate plugin structure with:

  ```bash
  claude plugin validate ./packages/alexandria-plugin
  ```

- Run markdown lint for changed skill or prose files.
- Do not add CLI, viewer, docs, or eval implementation here unless the package
  boundary is explicitly changed.
