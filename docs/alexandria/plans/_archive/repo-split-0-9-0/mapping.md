# Repo Split Mapping: Current Repo -> New Public + Private Repos

This mapping is the pre-migration view. It is intentionally conservative:

- no copy should happen until this mapping is reviewed
- `GetAlexandria/alexandria-internal` is the engineering source of truth
- `GetAlexandria/alexandria` gets only the public distribution/intake surface
- some paths are `sync to public`, meaning they are authored in the private repo
  and published into the public repo as part of release automation
- some paths are explicitly `cut`, meaning they should not move forward as-is

Execution rule for the public surface:

- public installs run installed binaries only
- public installs do not ship TypeScript source as a runtime fallback
- public installs do not require Bun after installation
- the current `bin/` wrapper model should die

## Top-Level Directories

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `.claude/` | cut | cut | Local host state, not product source |
| `.claude-plugin/` | keep | sync to public | Public plugin manifest surface |
| `.context/` | cut | cut | Local/session working state |
| `.eval-runs/` | cut | cut | Local/generated eval artifacts |
| `.github/` | keep, but split/rebuild | rebuild minimal public subset | Private repo needs release workflows; public repo should keep only issue templates and minimal public repo config |
| `.husky/` | keep | cut | Maintainer-only git hook machinery |
| `.tmp/` | cut | cut | Local temp state |
| `.var/` | cut | cut | Local/generated state |
| `agents/` | keep | sync to public | Product-facing shipped surface |
| `bin/` | cut after extracting any needed implementation detail into the new CLI surfaces | cut | Current wrapper layer should die; public repo should not depend on shell wrappers as the executable contract |
| `config/` | keep | cut for now | Current contents are maintainer/eval-only, not a public runtime surface |
| `contributor-skills/` | move into a private auto-discoverable `skills/` surface | cut | Maintainer-only workflows should become maintainer skills, not a separate discovery path |
| `docs/` | keep, but split surgically | small public subset only | Mixed directory, see breakdown below |
| `node_modules/` | cut | cut | Build artifact |
| `packages/` | keep | cut from final public structure unless an artifact pipeline requires staging | Public runtime should ship built artifacts, not package source trees |
| `scripts/` | split surgically; move enduring logic into owning packages, especially deploy/build logic | cut by default | Top-level scripts should shrink sharply; release/build logic belongs in testable packages rather than an ad hoc script shelf |
| `skills/` | keep | sync to public | Product-facing shipped surface |
| `src/` | keep | cut | Public runtime should not ship source |
| `templates/` | keep | sync to public | Product/runtime templates |
| `tests/` | keep, but redistribute into owning packages over time | cut | Deterministic tests, fixtures, and QA should live with the packages they exercise rather than remain top-level forever |

## `docs/` Breakdown

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `docs/adrs/` | keep | cut by default | Internal architecture/governance docs; publish selectively later if wanted |
| `docs/alexandria/implementation-plans/` | keep | cut | Private planning artifacts |
| `docs/alexandria/library/` | keep | cut | Alexandria's own internal library |
| `docs/alexandria/plans/` | keep | cut | Private planning system |
| `docs/alexandria/sources/` | keep | cut | Internal source material |
| `docs/alexandria/updates/` | keep | cut | Internal generated/update artifacts |
| `docs/design/` | keep | cut by default | Internal design docs |
| `docs/initialize/` | split and mostly relocate | cut by default | Mixed directory; only the actual live initialize engine should remain near shipped runtime surfaces |
| `docs/releases/` | delete | delete | Dead historical release artifact; release history belongs on `getalexandria.ai/updates` |

## `docs/initialize/` Breakdown

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `docs/initialize/initialize-engine.yaml` | move near product initialize skill/runtime | sync with product runtime artifact inputs as needed | Live input used by initialize CLI and initialize-related skill/reference material |
| `docs/initialize/corporate-initialize-engine.yaml` | move to `docs/design/` for later sorting | cut | Looks like reference/design material, not a live code path |
| `docs/initialize/corporate-solicitation-prompts.md` | move to `docs/design/` for later sorting | cut | Reference/design material |
| `docs/initialize/intake-output-template.md` | move to `docs/design/` for later sorting | cut | Reference/spec material rather than code-loaded runtime |
| `docs/initialize/phase-3-configurations.md` | move to `docs/design/` for later sorting | cut | Verification/reference shelf |
| `docs/initialize/phase-6-intake-engine.md` | move to `docs/design/` for later sorting | cut | Canonical prompt/spec shelf, not directly parsed by code |
| `docs/initialize/scoreboard-derivation.md` | move to `docs/design/` for later sorting | cut | Design/spec material, not current runtime input |

## `config/` Breakdown

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `config/model-routing.yaml` | keep, then relocate near its private owning package | cut | Currently consumed by `alexandria-route`, which is maintainer/eval-focused and should not sync to public; target direction is to move this closer to the private eval/routing tooling package rather than leave it as a singleton under top-level `config/` |

## CLI Split Direction

The destination model is not "copy existing binaries forward." The destination
model is:

- public/product CLI: `ax`
- private maintainer tooling: workspace/package commands, not a shipped CLI
- public execution is via installed binaries, not source-backed wrapper commands

The current `bin/` directory is not a destination structure. It is old wrapper
implementation detail and should die rather than be remapped file-by-file into
the new repos.

That means current CLI surfaces should be mapped by responsibility, not by
filename.

### Public `ax` surface

Commands that belong to Alexandria end users and their agents inside product
repos should converge into `ax`.

| Current command surface | Target direction |
|---|---|
| `alxndr lint` | `ax lint` |
| `alxndr grade` | `ax grade` |
| `alxndr dag` | `ax dag` |
| `alxndr health-check` | `ax health-check` |
| `alxndr scoreboard` | `ax scoreboard` |
| `alxndr scan` | `ax scan` |
| `alxndr retrieve` | `ax retrieve` |
| `alxndr version` | `ax version` |
| `alxndr update-check` | `ax update-check` |
| `alexandria-sync-issues` | `ax sync-issues` |
| `alexandria-tensions` | `ax tensions` |
| `alexandria-retrieve` | absorbed into `ax retrieve` |
| `alexandria-viewer` | `ax viewer` |

Notes:

- `alexandria-sync-issues` is part of the real plugin surface today through the
  `/alexandria:sync-tickets` skill, so it belongs with the product CLI rather
  than private maintainer tooling
- `alexandria-tensions` is part of Solomon's real triage workflow today, so it
  also belongs with the product CLI rather than private maintainer tooling
- `alexandria-initialize` should not survive as a standalone CLI surface; keep
  the deterministic engine, but move it behind the initialize skill/runtime
  flow instead of remapping it into `ax`

### Private maintainer tooling surface

Commands whose primary user is an Alexandria maintainer should stay private as
workspace/package commands inside the monorepo rather than becoming a second
installed CLI.

| Current command surface | Target direction |
|---|---|
| `alexandria-eval` | move into private workspace/package commands under the owning eval package |
| `alexandria-route` | move into private workspace/package commands under the owning eval/routing package |

Notes:

- `alexandria-route` currently reads capability requirements from skill
  frontmatter and resolves them through `config/model-routing.yaml`
- current real usage is routing inspection/audit plus eval-harness model
  resolution, not a normal product-maintenance flow
- unless a real shipped runtime path proves otherwise, it should stay private

## `packages/` Breakdown

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `packages/viewer/` | keep | cut as source; publish compiled viewer assets only | Viewer should build to compiled assets that are bundled with the product CLI and served by the CLI; do not sync the package source tree to public |

## Top-Level Files

| Current path | `GetAlexandria/alexandria-internal` | `GetAlexandria/alexandria` | Notes |
|---|---|---|---|
| `.gitignore` | keep | keep adapted public version | Repo-local hygiene in both repos |
| `.markdownlint-cli2.jsonc` | keep | cut | Maintainer linting config |
| `.prettierignore` | keep | cut | Maintainer tooling |
| `.prettierrc` | keep | cut | Maintainer tooling |
| `.tool-versions` | keep | cut by default | Maintainer/dev env pinning |
| `CHANGELOG.md` | keep | sync or mirror public release notes | Also reflected on `getalexandria.ai/updates` |
| `AGENTS.md` | add as symlink to `CLAUDE.md` | cut | Private maintainer repo should expose the same instructions through both filenames |
| `CLAUDE.md` | keep | cut | Internal maintainer instructions |
| `EVALS.md` | keep | cut | Private maintainer/eval workflow |
| `LICENSE` | keep | keep | Public-facing legal surface |
| `OPERATOR.md` | keep | cut | Internal operator docs |
| `README.md` | keep as the private maintainer README | cut | Private engineering repo README should stay maintainer-focused |
| `README.public.md` | add and keep as source of truth for public README | sync to public as `README.md` | Public repo README should be generated/synced from this file rather than hand-edited in two places |
| `RELEASING.md` | keep | cut | Maintainer release playbook |
| `VERSION` | keep | sync to public | Public version surface |
| `WORKFLOW.md` | keep | cut | Internal maintainer workflow |
| `bun.lock` | keep | cut | Public runtime should not depend on Bun or source install |
| `conductor.json` | keep | cut by default | Maintainer/internal workflow unless proven runtime-critical |
| `dist-include.txt` | move into the private deploy/release package or delete once replaced | cut | Packaging manifest belongs with deploy tooling, not as a stray top-level file |
| `eslint.config.js` | keep | cut | Maintainer lint tooling |
| `install.sh` | keep | keep if public repo remains a discovery/install surface | Also published via `getalexandria.ai`; should install built artifacts, not source |
| `package.json` | keep as workspace root manifest | cut | Private monorepo should use a real workspace root; public runtime should not ship source install metadata |
| `pnpm-workspace.yaml` | add and keep | cut | Private monorepo should be a real pnpm workspace |
| `setup` | keep, but likely redefined around binary install/layout | cut from final public structure unless explicitly needed for binary registration | Current setup flow is source/build-oriented |
| `tsconfig.json` | keep | cut | Public runtime should not ship source/build config |

## Working Rules For The Surgical Move

1. Do not copy `docs/` wholesale.
2. Do not copy `tests/`, `contributor-skills/`, `.github/`, or maintainer docs into the public repo wholesale.
3. Do not treat the public repo as a renamed clone of the current repo.
4. Default to private unless a path is clearly part of the shipped public/runtime surface.
5. If a path is still unresolved during the move, resolve the release contract first:
   - does the public repo carry binaries only, or a released payload plus minimal metadata?
6. Maintainer/eval tooling does not sync to public just because it currently has a wrapper binary.

## Paths Most Likely To Get Cut Entirely

- `.claude/`
- `.context/`
- `.eval-runs/`
- `.tmp/`
- `.var/`
- `node_modules/`
- `bin/`

## Paths Requiring The Most Care

- `.github/`
- `docs/`
- `packages/viewer/`
- `src/`
- `bin/`
- `config/`
- top-level install/build files: `install.sh`, `setup`, `package.json`, `bun.lock`, `tsconfig.json`
