# Cleanup Scratchpad

This file is a holding area for cleanup items discovered during the repo split
and `0.9.0` cut-over planning.

Use this for:

- functional cleanup notes that should likely become issues later
- awkward contracts or stale comments discovered during mapping
- naming or packaging cleanups that are real but not yet prioritized

Do not treat this as the final migration mapping. Structural destination
decisions belong in [mapping.md](./mapping.md). This file is for cleanup work
we want to batch and triage later.

## Current Notes

### Public installs must use shipped binaries only

- Public Alexandria installs should run installed binaries only
- Do not ship TypeScript source as runtime fallback
- Do not require Bun after install
- The current `bin/` wrapper model should die
- `0.9.0` is the point where the old world gets left behind; do not preserve the
  old wrapper/CLI contract as part of the new public surface
- Consequence:
  - public `ax` should be a real installed binary
  - private maintainer tooling should live as workspace/package commands
  - wrapper-lib shell logic should move into code or disappear with the wrapper
    layer

### Model routing override comment is stale and should be removed

- File: `config/model-routing.yaml`
- Current comment claims per-project override support via
  `.context-library/routing.yaml`
- Current code in `src/tools/route.ts` does not implement that behavior
- Direction: no per-project routing overrides; keep one checked-in routing
  policy in the private engineering repo
- Likely follow-up:
  - remove the stale override comment from `config/model-routing.yaml`
  - remove or update any docs that imply local routing override behavior

### `alexandria-route` is maintainer/eval-focused, not public runtime

- `alexandria-route` is currently used by eval flows rather than normal product
  runtime flows
- `config/model-routing.yaml` therefore stays private with the maintainer/eval
  surface
- `config/model-routing.yaml` should eventually move closer to the private
  tooling package that owns routing/eval behavior instead of living as a
  singleton file under top-level `config/`
- Public repo should not sync `alexandria-route` just because it currently has a
  wrapper binary

### `alexandria-sync-issues` and `alexandria-tensions` were misclassified as maintainer-only

- `alexandria-sync-issues` is part of the real plugin workflow today via the
  `/alexandria:sync-tickets` skill
- `alexandria-tensions` is part of Solomon's real triage workflow today
- Direction:
  - treat both as product/plugin-facing surfaces
  - map them into the public `ax` CLI
  - do not infer "maintainer-only" just because they currently exist as
    standalone binaries under `bin/`

### `docs/initialize` needs to be split into live runtime input vs design shelf

- `docs/initialize/initialize-engine.yaml` is actually live:
  - loaded by the initialize CLI
  - referenced by initialize skill/reference material
- Direction:
  - move the live engine file closer to the initialize skill/runtime surface
  - likely destination: under `skills/initialize/` or an adjacent shipped
    product-runtime location
  - bundle it with the product CLI/runtime from there
- The rest of `docs/initialize/` looks mostly like design/reference material and
  should likely move under `docs/design/` for later sorting:
  - `corporate-initialize-engine.yaml`
  - `corporate-solicitation-prompts.md`
  - `intake-output-template.md`
  - `phase-3-configurations.md`
  - `phase-6-intake-engine.md`
  - `scoreboard-derivation.md`

### `alexandria-initialize` should not survive as a public CLI

- The initialize engine is real and should remain deterministic
- But `alexandria-initialize` is not a good public CLI surface
- The real user-facing workflow is `/library`, not a standalone engine-inspection
  command
- Direction:
  - move the live initialize engine YAML next to the initialize skill/runtime
    surface
  - keep the deterministic engine implementation
  - have the skill call that engine directly
  - remove the standalone public `alexandria-initialize` command

### `docs/releases` looks dead and can be deleted

- Current contents: `docs/releases/0.2.0/whats-new.html`
- No live runtime references found
- Release history should live on `getalexandria.ai/updates`, not in this repo
