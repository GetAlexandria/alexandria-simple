# Issue 178 Technical Plan

- Issue reference: [#178](https://github.com/sociotechnica-org/alexandria/issues/178)
- Goal: Create a stripped runtime tarball manifest and builder script that package the Claude Code plugin without shipping repo-only development material.
- Linked product plan: `docs/plans/plugin-distribution/plan.md` and `docs/plans/plugin-distribution/tickets/FEAT-001.md`

## Scope

- Add `dist-include.txt` as the checked-in runtime manifest for the release tarball.
- Add `scripts/build-tarball.sh` to stage the runtime payload, exclude dev-only files, and emit `alexandria-v{VERSION}.tar.gz`.
- Preserve product-facing prompt/runtime references that live outside `docs/wizard/`, specifically `docs/design/playbook.md`, so packaged agents and skills do not point at missing files.
- Add deterministic coverage for the tarball workflow: contents filtering, idempotent output, and extracted `./setup` execution from the packaged tree.
- Extend shell QA wiring so the new build script is formatted and linted by the repo's existing `bun run check` contract.

## Non-Goals

- CI release automation, hosted install artifacts, or `install.sh` work from later plugin-distribution tickets.
- Changes to plugin behavior, agent prompts, skill prompts, or wizard logic.
- Using `git archive` or `.gitattributes` as the primary packaging path in this slice; that is deferred to later distribution work.
- Restructuring the setup/bootstrap contract beyond what is needed to verify the packaged tarball installs cleanly.

## Linked Product-Plan Summary

- The upstream plugin-distribution plan defines FEAT-001 as the foundation for all later release and installer work.
- The runtime payload must preserve the Claude Code plugin contract (`.claude-plugin`, `agents/`, `skills/`, `setup`, wrappers, TypeScript sources, templates, config, and wizard runtime docs) while excluding repo-only material such as tests, plans, ADRs, design docs, eval assets, and co-located `*.test.ts`.
- Repo review surfaced one narrower runtime dependency: shipped agent/skill prompts also reference `docs/design/playbook.md`, so this slice needs a targeted exception instead of dropping the entire `docs/design/` subtree.
- The resulting tarball must be reproducible and must still support `./setup`, which compiles binaries from source after extraction.

## Current Gap

- The repo currently has no manifest that defines the release payload boundary.
- There is no tarball-builder script for local or CI packaging.
- Shell QA commands in `package.json` only cover the existing shell entrypoints, so a new `scripts/build-tarball.sh` would otherwise bypass `shellcheck` and `shfmt`.
- Existing tests validate `setup` and compiled CLI behavior from the full repo checkout, not from a stripped packaged archive.

## Architectural Boundaries

- Packaging logic belongs in a dedicated shell script under `scripts/` because this is release infrastructure, not a product CLI surface.
- The runtime boundary should be expressed declaratively in `dist-include.txt`, with the builder script responsible for copying that allowlist and then applying explicit exclusions for co-located dev files such as `src/*.test.ts`.
- The manifest should stay as small as possible, but it must win over broad directory exclusions when a shipped prompt explicitly instructs Claude Code to read a checked-in file at runtime.
- The tarball must preserve the current Claude Code plugin layout and Bun-on-install model from ADR 001 and the existing `setup` script; this slice should not introduce compiled release artifacts or an alternate install path.
- Verification should exercise the packaged artifact as a black-box install workflow rather than unit-testing copy helpers in isolation.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Distribution manifest | `dist-include.txt` | Defines the runtime allowlist that downstream release automation and installer work will package |
| Tarball build workflow | `scripts/build-tarball.sh` | Builds a stripped release tarball from the allowlist, applying stable exclusions and versioned naming |
| Shared runtime docs | `docs/design/playbook.md`, `docs/wizard/*` | Keeps product-facing prompts’ referenced runtime documents present in the packaged plugin |
| Deterministic packaging verification | `tests/build-tarball.test.ts` or `tests/setup.test.ts` | Adds black-box coverage for tarball contents, reproducibility, extraction, and packaged `./setup` execution |
| Repo shell QA contract | `package.json` | Includes the new shell script in `shellcheck` and `shfmt` coverage so `bun run check` remains authoritative |
| Issue plan | `docs/plans/178-dist-tarball/plan.md` | Checked-in repo-specific execution plan for the issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| None | No product agent or product skill behavior changes in this slice | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Tarball workflow | `bun test tests/build-tarball.test.ts` | Direct black-box coverage for manifest filtering, archive naming, reproducibility, and packaged setup execution |
| Setup regression coverage | `bun test tests/setup.test.ts` | Confirms the new packaging work does not drift from the existing install/compile contract |
| Repo-wide static checks | `bun run check` | Type, Markdown, and shell formatting/lint coverage for the new script, tests, and plan |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Distribution packaging workflow | Deterministic tests only | Add or expand deterministic coverage; no eval-harness work | `bun test tests/build-tarball.test.ts` |
| Product agents / product skills | Not behaviorally touched | No eval action | None |
| Contributor workflow docs | Maintainer-only guidance | No eval action | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The manifest could omit a runtime-critical file that is only loaded indirectly, producing a tarball that extracts but fails at runtime | Build the allowlist from observed runtime readers (`setup`, wrappers, `src/tools/*`, wizard docs) and verify the packaged tree by extracting it and running `./setup` in tests |
| Broad `docs/design/` exclusion could strip a file that shipped prompts explicitly reference, degrading Claude Code plugin behavior without breaking deterministic CLI tests | Inventory prompt references under `agents/` and `skills/`, keep the minimum runtime doc exception (`docs/design/playbook.md`), and assert its presence in the tarball test |
| The script could accidentally ship repo-only content because directory-level includes are too broad | Use an allowlist manifest plus explicit exclusion rules for `*.test.ts`, eval assets, plans, ADRs, design docs, and other non-runtime surfaces; assert absence in the tarball test |
| Repeated runs could produce different tarballs because of unstable staging paths, timestamps, or archive ordering | Build in a clean staging directory, normalize archive input order, and compare repeated runs in deterministic tests |
| The new shell script could drift outside the repo's enforced QA because `package.json` currently enumerates shell files manually | Update the shell lint/format command scopes in the same slice and keep the new script under those commands before relying on `bun run check` |

## Implementation Steps

1. Inventory the runtime payload required by the current plugin contract, including wizard runtime docs and source/build inputs needed by `./setup`.
2. Record and preserve the narrow `docs/design/playbook.md` runtime dependency discovered in shipped prompt references.
3. Create `dist-include.txt` as the reviewed allowlist for that payload.
4. Implement `scripts/build-tarball.sh` to read the manifest, stage files, apply explicit exclusions, and emit `alexandria-v{VERSION}.tar.gz`.
5. Update `package.json` shell lint/format commands so the new script is covered by `shellcheck` and `shfmt`.
6. Add a black-box Bun test that runs the tarball script, inspects archive contents, reruns the build to verify reproducibility, extracts the tarball, and runs packaged `./setup` with a test-controlled Bun shim.
7. Run targeted deterministic verification and perform a local diff review before PR handoff.

## Acceptance / Exit Criteria

1. `dist-include.txt` exists and clearly defines the runtime payload for FEAT-001.
2. `scripts/build-tarball.sh` emits `alexandria-v{VERSION}.tar.gz` from the current repo state without shipping excluded dev-only content.
3. The tarball includes the Claude Code plugin runtime surfaces required by `./setup` and the current wrappers, including wizard runtime docs, `docs/design/playbook.md`, and routing config.
4. Running the tarball build twice without source changes yields identical output in deterministic verification.
5. Extracting the tarball and running `./setup` succeeds in the test harness and preserves the existing compiled-binary install contract.
6. Relevant deterministic tests pass locally along with `bun run check`.
7. The issue branch has a PR against `main` after implementation, with the plan path and verification results recorded.

## Deferred Follow-Ups

1. `.gitattributes` / `git archive` support from the later plugin-distribution polish phase.
2. GitHub Actions release automation and hosted artifact publishing from FEAT-005.
3. The user-facing `install.sh` download flow from FEAT-003.
