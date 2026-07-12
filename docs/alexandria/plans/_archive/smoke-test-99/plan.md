# Plan: Factory Smoke Test (Issue #99)

## Goal

Validate the external-instance factory loop (symphony-ts + claude-code runner) against
this repository by completing a deliberately small, safe end-to-end pass: branch → PR →
CI pass → Devin review → merge.

## Scope

The change is intentionally minimal. The README currently states "Two Claude Code agents
maintain the library" and describes only Conan and Sam. The repo ships six agents:
conan, sam, nit, bridget, raven, and solomon. This is a real inaccuracy worth fixing and
a safe, reviewable change that exercises the full loop without touching any functional code.

## Changes

1. **`README.md`** — Update the "Two Claude Code agents" description to accurately reflect
   all six agents. Add brief descriptions for Nit, Bridget, Raven, and Solomon so new users
   understand the full agent roster.

## Testing

No QA scripts cover README prose. The CI `validate-plugin` job validates plugin structure
and runs the shell test suites (`test-update-check`, `test-setup`, `test-eval-runner`,
`test-dag`, `test-eval-cli`) — none of which are affected by this change. CI should pass
cleanly.

## Non-goals

- No agent or skill file changes.
- No configuration or template changes.
- No version bump (patch-level doc fix does not warrant a release).
