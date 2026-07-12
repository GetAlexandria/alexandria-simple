#!/usr/bin/env sh
# bank.sh — bank a play's deployable package from the studio into the plugin.
#
# A play is authored in the studio (studio/plays/<slug>/: brief, prompts,
# workflow.fabro, audits, fixtures, derived renderings). The runtime runs a
# SEPARATE copy — the plugin payload packages/alexandria-plugin/workflows/<slug>/
# — which holds only the deployable package (workflow.fabro + prompts/) plus
# legs.json (hand-authored tracker presentation metadata, plugin-only). Nothing
# kept the two in sync: a studio prompt edit left the factory running the stale
# plugin copy, silently (playmaker-testing-streamline plan §1.1, §3.A).
#
# This closes that footgun. It copies the deployable package studio -> plugin,
# re-deriving and validating in one command so neither can be skipped:
#
#   1. refuse if the studio package carries a placeholder the runtime won't
#      substitute (single-`AX_` only — plan §3.B; mirror of the viewer gate)
#   2. re-derive the studio renderings (derive-views.sh: validates the workflow,
#      regenerates diagram.svg + story.md) so they can't fall behind the bank
#   3. show the diff banking will apply (workflow.fabro + prompts/ only)
#   4. copy workflow.fabro + prompts/ studio -> plugin (prompts mirrored exactly)
#   5. validate the banked plugin copy (fabro validate)
#   6. advisory: legs.json still covers the banked nodes (never aborts)
#
# legs.json is NOT banked — it is plugin-only authored metadata, excluded from
# the studio<->plugin equivalence the conformance gate asserts
# (bankConformance.test.ts, sibling of placeholderConformance).
#
# Usage:
#   studio/tools/bank.sh <studio-play-dir>           bank the play
#   studio/tools/bank.sh --check <studio-play-dir>   report drift only; copy
#                                                    nothing; exit 1 if the
#                                                    plugin differs from studio
#
# Requires: the `fabro` CLI (on PATH or at ~/.fabro/bin/fabro); python3 (via
# derive-views.sh). `rsync` is used if present, else cp.

set -eu

CHECK=0
while [ "$#" -gt 0 ]; do
	case "${1:-}" in
	--check)
		CHECK=1
		shift
		;;
	--modules)
		# Retired in the PMS/Alexandria boundary migration, Slice 1: module
		# packages are PMS machinery, validated in place under studio/plays/
		# by `pms run make-a-play:build` — they must not land in the
		# Alexandria plugin payload.
		echo "error: --modules is retired; module packages stay under studio/plays/ (see docs/alexandria/plans/pms-alexandria-boundary-migration/plan.md)" >&2
		exit 2
		;;
	*)
		break
		;;
	esac
done

if [ "$#" -ne 1 ]; then
	echo "usage: $0 [--check] <studio-play-dir>" >&2
	exit 2
fi

PLAY_DIR=${1%/}
SLUG=$(basename "$PLAY_DIR")
TOOLS_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH='' cd -- "$TOOLS_DIR/../.." && pwd)
PLUGIN_DIR="$REPO_ROOT/packages/alexandria-plugin/workflows/$SLUG"

STUDIO_WF="$PLAY_DIR/workflow.fabro"
STUDIO_PROMPTS="$PLAY_DIR/prompts"

# --- guards ---------------------------------------------------------------
if [ ! -d "$PLAY_DIR" ]; then
	echo "error: studio play dir not found: $PLAY_DIR" >&2
	exit 1
fi
if [ ! -f "$STUDIO_WF" ]; then
	echo "error: missing workflow.fabro: $STUDIO_WF" >&2
	exit 1
fi
if [ ! -d "$STUDIO_PROMPTS" ]; then
	echo "error: $SLUG has no prompts/ dir — only prompt-file plays are bankable here" >&2
	exit 1
fi
python3 "$TOOLS_DIR/check-workflow-edges.py" "$STUDIO_WF"

# --- resolve the fabro CLI (PATH first, then the standard install path) ---
if command -v fabro >/dev/null 2>&1; then
	FABRO=$(command -v fabro)
elif [ -x "$HOME/.fabro/bin/fabro" ]; then
	FABRO="$HOME/.fabro/bin/fabro"
else
	echo "error: fabro CLI not found on PATH or at ~/.fabro/bin/fabro" >&2
	exit 1
fi

# --- (1) refuse dead placeholders (single-`AX_` only) ---------------------
# Any __AX…__ token the runtime regex (__AX_[A-Z0-9_]+__) won't match ships
# literally — the node never receives its input. Mirrors orchestration.ts and
# the viewer's placeholderConformance gate, asserted here at the bank seam.
DEAD=$(grep -rohE '__AX[A-Za-z0-9_]*__' "$STUDIO_WF" "$STUDIO_PROMPTS" 2>/dev/null |
	grep -vxE '__AX_[A-Z0-9_]+__' | sort -u || true)
if [ -n "$DEAD" ]; then
	echo "error: $SLUG carries placeholders the runtime won't substitute:" >&2
	echo "$DEAD" | sed 's/^/  /' >&2
	echo "fix to single-\`AX_\` (see studio/plays/AUTHORING.md) before banking." >&2
	exit 1
fi

# --- diff the deployable package (workflow.fabro + prompts/ only) ----------
# legs.json and the studio's authoring files are never part of the equivalence.
deployable_diff() {
	rc=0
	if [ -f "$PLUGIN_DIR/workflow.fabro" ]; then
		diff -u "$PLUGIN_DIR/workflow.fabro" "$STUDIO_WF" || rc=1
	else
		echo "+ new play: $PLUGIN_DIR/workflow.fabro does not exist yet"
		rc=1
	fi
	if [ -d "$PLUGIN_DIR/prompts" ]; then
		diff -ru "$PLUGIN_DIR/prompts" "$STUDIO_PROMPTS" || rc=1
	else
		echo "+ new play: $PLUGIN_DIR/prompts does not exist yet"
		rc=1
	fi
	return $rc
}

# --- --check: report drift, copy nothing ----------------------------------
if [ "$CHECK" -eq 1 ]; then
	if deployable_diff; then
		echo "in sync: $SLUG studio == plugin (workflow.fabro + prompts/)"
		exit 0
	fi
	echo "DRIFT: $SLUG plugin differs from studio — run: $0 $PLAY_DIR" >&2
	exit 1
fi

# --- (2) re-derive the studio renderings (also validates the workflow) ----
"$TOOLS_DIR/derive-views.sh" "$PLAY_DIR"

# --- (3) preview the diff banking will apply ------------------------------
echo "--- banking $SLUG: studio -> plugin (workflow.fabro + prompts/) ---"
if deployable_diff; then
	echo "(plugin already matches studio — banking is a no-op)"
fi

# --- (4) copy the deployable package --------------------------------------
mkdir -p "$PLUGIN_DIR"
cp "$STUDIO_WF" "$PLUGIN_DIR/workflow.fabro"
# Mirror prompts/ exactly so a removed studio prompt is dropped from the plugin.
if command -v rsync >/dev/null 2>&1; then
	rsync -a --delete "$STUDIO_PROMPTS/" "$PLUGIN_DIR/prompts/"
else
	rm -rf "$PLUGIN_DIR/prompts"
	cp -R "$STUDIO_PROMPTS" "$PLUGIN_DIR/prompts"
fi

# --- (5) validate the banked copy -----------------------------------------
if ! "$FABRO" validate --no-upgrade-check "$PLUGIN_DIR/workflow.fabro"; then
	echo "error: banked workflow failed validation: $PLUGIN_DIR/workflow.fabro" >&2
	exit 1
fi

# --- (6) ADVISORY: legs.json still covers the banked nodes -----------------
# legs.json is authored tracker metadata keyed by nodeId; a bank that changes
# the graph can outrun it. Flag a leg pointing at a node the workflow no longer
# has — never abort (the runtime degrades to no-legs on mismatch).
LEGS="$PLUGIN_DIR/legs.json"
if [ -f "$LEGS" ]; then
	missing=""
	# nodeIds are word-safe identifiers; splitting the list on whitespace is
	# intentional, so this stays a for-loop rather than a while-read.
	# shellcheck disable=SC2013
	for leg in $(grep -oE '"nodeId"[[:space:]]*:[[:space:]]*"[^"]+"' "$LEGS" |
		sed -E 's/.*"([^"]+)"$/\1/'); do
		if ! grep -qE "^[[:space:]]*${leg}[[:space:]]*\[" "$PLUGIN_DIR/workflow.fabro"; then
			missing="$missing $leg"
		fi
	done
	if [ -n "$missing" ]; then
		echo "note: legs.json references nodes not in the banked workflow:$missing" >&2
		echo "      update $LEGS (plugin-only tracker metadata; runtime degrades meanwhile)." >&2
	fi
fi

echo "banked: $SLUG -> $PLUGIN_DIR (workflow.fabro + prompts/, validated)"
