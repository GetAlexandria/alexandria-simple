#!/usr/bin/env sh
# check-placeholder-spelling.sh — fail on dead/malformed input placeholders in
# any play's deployable text (workflow.fabro + prompts/).
#
# The runtime substitutor only matches single-`AX_` tokens
# (__AX_[A-Z0-9_]+__ — `ax` src/domain/orchestration.ts). Any other __AX…__
# token — notably the dead `__AX2_…` spelling left over from the ax2 -> ax
# rename — ships LITERALLY: the node never receives its input, a silent miss
# that only surfaces at run time. The placeholder spelling rule is owned by
# studio/plays/AUTHORING.md ("External inputs — the placeholder is
# single-`AX_`"); this is its standalone, runtime-free lint — the local sibling
# of bank.sh's bank-time guard and the viewer's placeholderConformance gate.
#
# Usage:
#   studio/tools/check-placeholder-spelling.sh            # all studio plays
#   studio/tools/check-placeholder-spelling.sh <path>...  # specific files/dirs
#
# Exit: 0 = clean, 1 = a dead/malformed placeholder found, 2 = usage error.

set -eu

TOOLS_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH='' cd -- "$TOOLS_DIR/../.." && pwd)
PLAYS_DIR="$REPO_ROOT/studio/plays"

# Default scope: every play. Otherwise lint exactly the given files/dirs.
if [ "$#" -eq 0 ]; then
	set -- "$PLAYS_DIR"
fi

# The text the runtime actually substitutes: every workflow.fabro (covers
# inline-prompt plays) and every file under a prompts/ dir.
files=$(find "$@" -type f \( -name 'workflow.fabro' -o -path '*/prompts/*' \) 2>/dev/null | sort || true)

if [ -z "$files" ]; then
	echo "check-placeholder-spelling: no workflow.fabro / prompts/ found under: $*"
	exit 0
fi

count=$(printf '%s\n' "$files" | wc -l | tr -d ' ')

# Any __AX…__ token the runtime regex (__AX_[A-Z0-9_]+__) won't match is dead.
# Mirrors orchestration.ts, bank.sh, and the viewer's promptContract.ts.
report=$(printf '%s\n' "$files" | while IFS= read -r f; do
	[ -n "$f" ] || continue
	dead=$(grep -ohE '__AX[A-Za-z0-9_]*__' "$f" 2>/dev/null |
		grep -vxE '__AX_[A-Z0-9_]+__' | sort -u || true)
	if [ -n "$dead" ]; then
		printf 'DEAD PLACEHOLDER: %s\n' "$f"
		printf '%s\n' "$dead" | sed 's/^/  /'
	fi
done)

if [ -n "$report" ]; then
	printf '%s\n\n' "$report" >&2
	echo "Placeholders must be single-\`AX_\` (__AX_<NAME>__) — see studio/plays/AUTHORING.md." >&2
	echo "The dead \`__AX2_\` spelling never substitutes and ships literally." >&2
	exit 1
fi

echo "check-placeholder-spelling: OK — $count file(s) scanned, no dead placeholders."
