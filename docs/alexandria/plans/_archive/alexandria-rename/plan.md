# Technical Plan: Rename Context Library to Alexandria

- Issue reference: none yet; repo-wide rename initiative
- Goal: rename the product, repository, package, plugin, runtime paths, and living documentation from `context-library` to `alexandria` without stranding existing installs or breaking the current release/update flow
- Linked product plan: none yet; this document is the repo-level technical plan for the rename

## Scope

- Rename the primary product/repo identifiers from `context-library` to `alexandria`
- Move `docs/context-library/` to `docs/alexandria/` with `git mv` and update the living documentation within it
- Rename package, plugin, marketplace, installer, setup, release, tarball, wrapper, and upgrade surfaces that currently expose the old name
- Update product skills, contributor skills, agent prompts, tests, fixtures, and eval cases that encode `docs/alexandria`, `bin/alexandria-*`, or `context-library` branding
- Rename the GitHub repository and update the hardcoded repository URLs and install/update references that depend on it
- Add an explicit compatibility layer for high-risk external contracts: legacy CLI names, legacy env vars, legacy install/state directories, legacy archive names, and legacy skill entrypoints where feasible

## Non-Goals

- Rewriting Git metadata, old branch names, or checked-in `.git` logs
- Rewording every generic use of the phrase "context library" when it refers to the concept, not the product brand
- Redesigning the product architecture, Alexandria taxonomy, or the knowledge model itself
- Moving the website download path off `sociotechnica.org/alexandria/`, which is already aligned
- Cleaning up every historical snapshot under `tests/evals/` if the snapshot is not part of an active assertion or eval baseline

## Current Gap

The repo is in a mixed-branding state already:

- Distribution hosting is already Alexandria-shaped: `install.sh`, `update-check`, the release workflow, and `RELEASING.md` point at `sociotechnica.org/alexandria/`
- The meta-architecture docs already include Alexandria-specific material such as [docs/design/alexandria.md](/Users/jessmartin/Documents/code/context-library/docs/design/alexandria.md)
- But the primary repo and runtime contracts still use the old name:
  - repository URL: `sociotechnica-org/context-library`
  - plugin and package names: `context-library`
  - install directories: `.claude/plugins/context-library`
  - state directory: `~/.context-library`
  - env vars: `CONTEXT_LIBRARY_*`
  - wrapper commands: `bin/context-library-*`
  - tarball names: `context-library-v{VERSION}.tar.gz`
  - living docs root: `docs/context-library/`

This means the rename is not a single search-and-replace. The repo has two different categories of text:

1. true product/runtime identifiers that should change to Alexandria
2. generic concept language describing a context library as a class of artifact, which should often stay as-is

Without an explicit naming policy and compatibility layer, the rename risks breaking installs, upgrades, release automation, eval fixtures, and user habits in one sweep.

## Architectural Boundaries

- Product naming rule:
  - rename explicit product identifiers, package/plugin names, repo names, file-system roots, commands, archive names, and install instructions to Alexandria
  - preserve generic "context library" language where it describes the artifact type rather than the product brand
- Compatibility rule:
  - user-facing runtime contracts do not hard-cut in the same release
  - old CLI names, old env vars, old install directories, old state directories, and old archive names need at least one compatibility release or alias period
- Docs rule:
  - move the directory with `git mv docs/context-library docs/alexandria`
  - update living docs, active plans, active templates, and active library cards in the same slice
  - treat frozen transcripts, logs, and purely historical artifacts as exceptions unless they participate in tests or eval comparisons
- Skill/agent rule:
  - product-facing skill names and examples must stay coherent with the renamed runtime
  - contributor-skill namespace changes are lower risk than product-surface changes; if the rename creates churn here, prioritize runtime/user compatibility first
- Release rule:
  - installer, update-check, tarball build, release workflow, and website payload naming must be changed together
  - GitHub repo rename cannot be treated as a separate clerical task because repo URLs are embedded in docs, manifests, install instructions, and release metadata

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Package + plugin identity | [package.json](/Users/jessmartin/Documents/code/context-library/package.json), [.claude-plugin/plugin.json](/Users/jessmartin/Documents/code/context-library/.claude-plugin/plugin.json), [.claude-plugin/marketplace.json](/Users/jessmartin/Documents/code/context-library/.claude-plugin/marketplace.json), [VERSION](/Users/jessmartin/Documents/code/context-library/VERSION), [CHANGELOG.md](/Users/jessmartin/Documents/code/context-library/CHANGELOG.md) | Package/plugin/marketplace identity changes from `context-library` to `alexandria`; install and registration instructions change with it |
| Runtime paths + env vars | [src/lib/plugin-paths.ts](/Users/jessmartin/Documents/code/context-library/src/lib/plugin-paths.ts), [setup](/Users/jessmartin/Documents/code/context-library/setup), [install.sh](/Users/jessmartin/Documents/code/context-library/install.sh), [bin/_alexandria-wrapper-lib.sh](/Users/jessmartin/Documents/code/context-library/bin/_alexandria-wrapper-lib.sh) | Default plugin root, state dir, env-var names, wrapper lib name, and migration behavior all shift to Alexandria-compatible paths |
| Public CLI contract | [bin](/Users/jessmartin/Documents/code/context-library/bin), [src/tools](/Users/jessmartin/Documents/code/context-library/src/tools), [scripts/build-tarball.sh](/Users/jessmartin/Documents/code/context-library/scripts/build-tarball.sh) | Primary CLI names and tarball/archive naming change to `alexandria-*`; old `context-library-*` names become aliases or deprecated shims |
| Living docs root | [docs/alexandria](/Users/jessmartin/Documents/code/context-library/docs/alexandria) | Canonical library root moves to `docs/alexandria/`; internal references, examples, and cards update to the new path |
| Product prompts | [agents](/Users/jessmartin/Documents/code/context-library/agents), [skills](/Users/jessmartin/Documents/code/context-library/skills), [templates](/Users/jessmartin/Documents/code/context-library/templates), [docs/wizard](/Users/jessmartin/Documents/code/context-library/docs/wizard) | Agents and skills stop instructing users to read/write `docs/alexandria/` or call `bin/alexandria-*`; prompts align with new names and any compatibility story |
| Contributor workflows | [contributor-skills](/Users/jessmartin/Documents/code/context-library/contributor-skills), [scripts/setup-dev](/Users/jessmartin/Documents/code/context-library/scripts/setup-dev), [WORKFLOW.md](/Users/jessmartin/Documents/code/context-library/WORKFLOW.md) | Maintainer slash-commands, namespace, and planning output examples move to Alexandria naming and the new docs root |
| Tests + eval fixtures | [tests](/Users/jessmartin/Documents/code/context-library/tests), `src/*.test.ts`, [tests/eval-cases](/Users/jessmartin/Documents/code/context-library/tests/eval-cases) | Deterministic tests, fixture paths, expected archive names, wrapper names, and eval expected outputs all change to new paths/contracts |
| Release + distribution | [.github/workflows/release.yml](/Users/jessmartin/Documents/code/context-library/.github/workflows/release.yml), [RELEASING.md](/Users/jessmartin/Documents/code/context-library/RELEASING.md), [README.md](/Users/jessmartin/Documents/code/context-library/README.md) | GitHub Release assets, website payload contents, installer behavior, and docs all change from `alexandria-v*` and `context-library` install targets to Alexandria equivalents |
| External repo + marketplace references | hardcoded `github.com/sociotechnica-org/alexandria` references across docs/config, GitHub repo settings, marketplace install commands in [install.sh](/Users/jessmartin/Documents/code/context-library/install.sh) | Clone URLs, repository metadata, and plugin-install identifiers move to the renamed repo and plugin identity |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `wizard`, `conan`, `sam`, `nit`, `bridget`, `solomon`, `raven` | Default library path and examples move from `docs/context-library/` to `docs/alexandria/` | README, CLAUDE, wizard docs, eval fixtures, deterministic tests, and library cards that mention the old root |
| `alexandria-upgrade` product skill | Rename to an Alexandria-branded upgrade flow; old entrypoint may need a compatibility trampoline if hosts do not support aliases | install/update-check docs, setup/install tests, release notes, marketplace docs |
| `release` product skill | Release instructions move to Alexandria command/archive/repo names | RELEASING, release workflow, release smoke instructions |
| `implementation-planning` and `ticket-writer` | Plan output examples and DAG command examples must point at `docs/alexandria/...` and final CLI names | eval cases, structural checks, README contributor workflow examples |
| contributor skills under `contributor-skills/` | Maintainer workflow namespace and examples may move from `alexandria-dev-*` to `alexandria-dev-*` | `scripts/setup-dev`, setup tests, README maintainer workflow section |
| shared prompt references | Any embedded examples of `bin/alexandria-*`, repo URLs, or `docs/alexandria/` need to align with the new primary contract | EVALS, WORKFLOW, active plans, prompt reference docs |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Lint, type-check, shell checks, markdown audit after the mass rename |
| Full deterministic suite | `bun test` | Covers setup, install, update-check, tool CLIs, wizard QA, release/update fixtures, and path-sensitive workflows |
| Tarball packaging | `./scripts/build-tarball.sh "$(mktemp -d)"` | Verifies the renamed archive root and file name are internally consistent |
| Setup smoke | `./setup --help` | Confirms the renamed setup surface and wrapper references still parse and print coherent help |
| Installer smoke | `./install.sh --help` | Confirms installer usage text, env vars, and archive naming are coherent before networked install testing |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `wizard` | Yes | Rerun because default library path, examples, and generated output references change | `bin/alexandria-eval run wizard/all` after the wrapper rename lands; use the legacy alias during transition if needed |
| `conan`, `sam`, `nit`, `bridget`, `raven`, `solomon` | Yes | Rerun all existing eval-backed product surfaces because prompt instructions and example paths change across the board | `bin/alexandria-eval run conan/all`, `sam/all`, `nit/all`, `bridget/all`, `raven/all`, `solomon/all` |
| `implementation-planning` + `ticket-writer` | Yes | Rerun because plan output roots and DAG examples change from `docs/alexandria` / `alxndr dag` to Alexandria equivalents | `bin/alexandria-eval run implementation-planning/all` and `ticket-writer/all` |
| `release` and upgrade workflow | Limited / no eval-harness coverage | Validate with deterministic tests and end-to-end workflow exercise; add a new eval only if the renamed upgrade skill remains a user-facing conversational surface with changed behavior | likely no new eval case required if the change stays mostly mechanical |
| contributor skills | No default eval requirement | Validate with deterministic tests plus real local workflow exercise only | no eval-harness work unless a contributor workflow becomes product-facing |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Existing users break because install dirs, state dirs, env vars, commands, or archive names disappear in one release | Ship compatibility aliases and fallback resolution first; keep old names readable for at least one release and emit deprecation messaging |
| A naive find/replace corrupts generic concept copy and library-card meaning | Use an explicit naming rubric: rename identifiers and brand references, but review generic "context library" prose manually in core docs and cards |
| `docs/alexandria` move leaves stale hardcoded paths in prompts, tests, fixtures, or docs | Do the `git mv` early in the slice, then run repo-wide `rg` audits for `docs/alexandria` until only intentional historical references remain |
| Old installers or update-check clients fail because asset names change from `alexandria-v*` to `alexandria-v*` | Publish both archive names for a compatibility window or teach installer/update-check to fall back across both names during the transition |
| GitHub repo rename invalidates hardcoded URLs, marketplace metadata, or release automation unexpectedly | Perform the repo rename only after the code and docs are ready; update all hardcoded URLs in the same slice and validate installer/release/update-check behavior immediately after |
| Eval and fixture churn obscures real regressions | Update deterministic fixtures and eval baselines intentionally, not mechanically; keep frozen historical snapshots untouched unless they are active assertions |
| Skill rename breaks user habits if slash-command aliases are unavailable | Keep deprecated trampoline skill files for product-facing renamed skills where host behavior allows it, and document the new command names in release notes |

## Implementation Steps

1. Approve this plan and create the execution issue/PR stack for the rename.
2. Write a short naming rubric in the implementation PR description:
   - brand/product/runtime identifier -> rename to Alexandria
   - generic concept language -> keep when appropriate
   - historical snapshot -> update only if it is part of an active assertion
3. Land the compatibility layer first in runtime code:
   - accept both old and new env vars
   - resolve both old and new state/plugin directories
   - decide whether migration is copy, move, or read-through fallback
4. Rename the primary runtime and packaging contracts:
   - plugin/package/marketplace name
   - wrapper-lib file and primary CLI names
   - tarball root and archive names
   - installer/setup default target paths
5. Keep legacy runtime aliases for at least one release:
   - `bin/alexandria-*` wrappers become thin shims to new Alexandria entrypoints
   - old env vars remain accepted
   - old archive names remain downloadable or detectable during the compatibility window
6. Rename product-facing skills and upgrade/release instructions where the old product name is part of the public interface.
7. Move the living docs root with history preservation:
   - `git mv docs/context-library docs/alexandria`
   - update all living docs under the moved directory to the new internal path and brand rules
8. Update agents, skills, templates, contributor skills, wizard docs, and maintainer docs so examples point at `docs/alexandria/`, the renamed repo, and final CLI names.
9. Update deterministic tests, fixtures, eval cases, and active structural checks to the new roots and command names.
10. Validate packaging and install/update behavior locally:
    - tarball build
    - setup help and install help
    - update-check behavior
    - compatibility behavior for legacy names
11. Run the full deterministic gate:
    - `bun run check`
    - `bun test`
12. Run the full affected eval sweep across all existing eval-backed product surfaces and check in new baselines where scores hold or improve.
13. Rename the GitHub repository from `sociotechnica-org/context-library` to `sociotechnica-org/alexandria`, then update any remaining hardcoded URLs and verify redirects are not being relied on as the canonical reference.
14. Validate the release chain end-to-end against the renamed repo and renamed archive contract, including the website payload at `sociotechnica.org/alexandria/`.
15. Open the PR, wait for CI and review to complete, then ship with explicit release notes explaining compatibility aliases and the eventual alias-removal timeline.

## Acceptance / Exit Criteria

1. The repo, plugin, package, and marketplace identity all use Alexandria as the primary product name.
2. `docs/alexandria/` exists as the canonical living library root, and `docs/alexandria/` no longer exists as the primary active docs tree.
3. Living docs, active skills, active agents, templates, tests, and fixtures reference `docs/alexandria/` and the renamed public runtime commands.
4. Installer, setup, update-check, and tarball flows all work with the renamed Alexandria contract.
5. Legacy `context-library` runtime contracts still function or migrate cleanly during the compatibility window.
6. The GitHub repo has been renamed and the hardcoded repo URLs in manifests/docs point at the new canonical repo.
7. `bun run check` and `bun test` pass.
8. The affected eval-backed product surfaces have been rerun and their baselines updated without regressions.
9. The implementation ships with explicit user-facing migration notes for old commands, dirs, env vars, and archive names.

## Deferred Follow-Ups

1. Remove deprecated `context-library` aliases after the compatibility window ends.
2. Sweep purely historical plan docs and frozen eval transcripts for cosmetic rename consistency only if the churn is worth it.
3. Decide whether contributor-skill namespace aliases are worth keeping once maintainers have moved to Alexandria naming.
4. Revisit whether any generic "context library" copy should be further reframed once the product rename has settled and the semantic distinction is clearer in the docs.
