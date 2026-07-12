# Issue 438 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#438` — `[FEAT-075] Eliminate locale-noise from shipped CLI wrappers on shells without C.UTF-8`
- Goal: eliminate the user-visible shell-startup locale warning from the shipped Alexandria CLI wrappers under real macOS-like environments that inherit unsupported locale variables.

## Scope

- Update the shipped wrapper entrypoints so locale cleanup happens before shell startup.
- Replace the earlier fake-`bash` PATH regression with executable tests that reproduce the real inherited-locale failure mode.
- Update `docs/alexandria/cli-report.md` to describe the final wrapper convention accurately.

## Non-Goals

- Changing maintainer-only Bash scripts such as `setup`, `install.sh`, or `scripts/*`.
- Reworking tool logic behind the wrappers.
- Migrating more tools under `alxndr`.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Wrapper help regression | `bun test src/cli/main.test.ts src/tools/viewer.test.ts` | Confirms the public wrappers stay quiet under inherited unsupported locale variables |
| Manual binary probe | `env LC_ALL=C.UTF-8 LANG=C.UTF-8 LC_CTYPE=C.UTF-8 ./bin/alxndr --help` | Reproduces the real shipped failure mode on this host |
| Repo quality gate | `bun run check` | Covers shell formatting/lint plus TypeScript/docs consistency |

## Acceptance / Exit Criteria

1. `bin/alxndr --help` and `bin/alexandria-viewer --help` no longer emit the locale warning under an inherited `LC_ALL=C.UTF-8` / `LANG=C.UTF-8` / `LC_CTYPE=C.UTF-8` environment.
2. Compatibility wrappers inherit the same pre-shell locale fix.
3. The regression tests target the real inherited-locale scenario rather than only a fake `bash` binary on `PATH`.
4. `docs/alexandria/cli-report.md` reflects the actual shebang-level fix.
