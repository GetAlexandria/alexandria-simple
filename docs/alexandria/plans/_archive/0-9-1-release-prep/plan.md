## Goal

Prepare and ship Alexandria `0.9.1` as a focused patch release that:

- fixes the stale public install/discovery surface
- reconciles the internal installer with the newer public behavior
- exercises the repo-split release workflow from `alexandria-internal`

## Why This Release Exists

QA on a fresh machine found that the public GitHub repo still advertises the old
`sociotechnica.org` curl command even though the live `getalexandria.ai`
installer and downloads are already on `0.9.0`.

At the same time, the source-of-truth installer in `alexandria-internal` had
drifted behind the public installer behavior. A full public sync from internal
would have regressed support for legacy compatibility env vars.

This patch release fixes both sides through the normal release path.

## Scope

In scope:

- align internal release docs with the current Alexandria public surfaces
- preserve installer compatibility behavior in `install.sh`
- add installer tests for the compatibility paths
- bump `VERSION`, `package.json`, and plugin manifest to `0.9.1`
- add a `0.9.1` changelog entry
- validate locally with the relevant deterministic checks

Out of scope:

- redesigning the public README beyond the source-of-truth sync already defined
- changing the release workflow topology
- changing site content outside the normal release automation outputs

## Execution Plan

1. Check in the source-of-truth fixes already identified during QA.
2. Bump release metadata to `0.9.1` and document the patch in `CHANGELOG.md`.
3. Run the relevant local validation gates:
   - `bun test packages/ax/tests/install.test.ts`
   - `bun run check`
4. Open a release-prep PR against `main`.
5. After merge, tag `v0.9.1` and observe `.github/workflows/release.yml`.

## Acceptance Criteria

- The internal installer preserves the public compatibility behavior.
- The public repo sync source contains the correct `getalexandria.ai` install
  documentation.
- All release metadata files read `0.9.1`.
- Relevant local checks pass.
- The release workflow is ready to prove whether the required repo secrets are
  configured.
