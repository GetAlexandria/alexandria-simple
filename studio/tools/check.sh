#!/usr/bin/env sh
# check.sh — run every deterministic Studio data check in one shot.
#
# Studio data checks are NOT wired into the repo's `bun test` / markdownlint
# gates (both exclude `studio/`). This runner catches Board and catalog drift —
# run it before opening a PR that touches the Board model, its state file, the
# catalog, a play's risk-map, a sweep keystone story, or the Play Re-sync tool:
#
#   sh studio/tools/check.sh
#
# It validates board-state.json (JSON + the work-order card contract), compiles
# the Play Re-sync tool, syntax-checks the Board model, checks every per-play
# risk-map with the viewer parser, validates swept keystone stories, validates
# the library-workflows.v1 and library-threads.v1 emit contracts with the
# shipped catalog parser, and runs the data/model unit tests. Any failure exits
# non-zero.
set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
STUDIO_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$STUDIO_DIR"

run() {
	printf '\n>>> %s\n' "$*" >&2
	"$@"
}

run python3 -m json.tool plays/board-state.json >/dev/null
run python3 -m py_compile tools/play-resync.py
run node --check plays/board-model.js
run node tools/check-catalog.mjs
run node tools/check-board-state.mjs
run node tools/check-make-a-play-graph.mjs
run bun tools/check-keystone.ts --all-sweeps
run bun test tools/check-keystone.test.ts
run bun tools/check-risk-maps.mjs
run bun test tools/check-risk-maps.test.mjs
run bun tools/check-workflows.mjs
run bun test tools/check-workflows.test.mjs
run bun tools/check-threads.mjs
run bun test tools/check-threads.test.mjs
run bun tools/check-library-identity.mjs
run bun test tools/check-library-identity.test.mjs
run bun tools/check-search-prior.mjs
run bun test tools/check-search-prior.test.mjs
run node tools/check-machine-language.mjs docs/alexandria/library
run bun ../packages/ax/src/tools/library-catalog-story-lint.ts --project-root .. --library-root studio/library
run bun ../packages/ax/src/tools/library-catalog-story-lint.ts --project-root .. --library-root docs/alexandria/library
run node --test tools/board-model.test.mjs

printf '\nAll Studio data checks passed.\n'
